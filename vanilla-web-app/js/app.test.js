import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
const { getGreeting, formatTime, formatDate, Timer, validate, TodoList, getTasks, setTasks } = require('./app.js');

// ── Property 1 ───────────────────────────────────────────────────────────────
// Feature: vanilla-web-app, Property 1: getGreeting(hour) returns the correct greeting for every hour in [0,23]
describe('getGreeting', () => {
  it('returns exactly one of the four valid greetings for any hour', () => {
    const valid = ['Good Morning', 'Good Afternoon', 'Good Evening', 'Good Night'];
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
        const result = getGreeting(hour);
        expect(valid).toContain(result);
      }),
      { numRuns: 100 }
    );
  });

  it('maps each hour to the correct greeting range', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
        const result = getGreeting(hour);
        if (hour >= 5 && hour <= 11) expect(result).toBe('Good Morning');
        else if (hour >= 12 && hour <= 17) expect(result).toBe('Good Afternoon');
        else if (hour >= 18 && hour <= 21) expect(result).toBe('Good Evening');
        else expect(result).toBe('Good Night');
      }),
      { numRuns: 100 }
    );
  });
});

// ── Property 2 ───────────────────────────────────────────────────────────────
// Feature: vanilla-web-app, Property 2: formatTime(date) returns a string matching HH:MM:SS AM/PM for any Date
describe('formatTime', () => {
  it('always returns a string matching HH:MM:SS AM/PM pattern', () => {
    fc.assert(
      fc.property(fc.date().filter((d) => !isNaN(d.getTime())), (date) => {
        const result = formatTime(date);
        expect(result).toMatch(/^\d{2}:\d{2}:\d{2} (AM|PM)$/);
        const [hh, mm, rest] = result.split(':');
        const ss = rest.split(' ')[0];
        expect(Number(hh)).toBeGreaterThanOrEqual(1);
        expect(Number(hh)).toBeLessThanOrEqual(12);
        expect(Number(mm)).toBeGreaterThanOrEqual(0);
        expect(Number(mm)).toBeLessThanOrEqual(59);
        expect(Number(ss)).toBeGreaterThanOrEqual(0);
        expect(Number(ss)).toBeLessThanOrEqual(59);
      }),
      { numRuns: 100 }
    );
  });
});

// ── Property 3 ───────────────────────────────────────────────────────────────
// Feature: vanilla-web-app, Property 3: formatDate(date) contains full weekday, month, numeric day, and 4-digit year
describe('formatDate', () => {
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  it('contains a full weekday name, full month name, numeric day, and 4-digit year', () => {
    // Constrain to dates with 4-digit years (1000–9999) as the spec example implies
    const modernDate = fc.date({ min: new Date('1000-01-01'), max: new Date('9999-12-31') })
      .filter((d) => !isNaN(d.getTime()));
    fc.assert(
      fc.property(modernDate, (date) => {
        const result = formatDate(date);
        const weekday = WEEKDAYS[date.getDay()];
        const month = MONTHS[date.getMonth()];
        const day = String(date.getDate());
        const year = String(date.getFullYear());

        expect(result).toContain(weekday);
        expect(result).toContain(month);
        expect(result).toContain(day);
        expect(result).toMatch(/\d{4}/);
        expect(result).toContain(year);
      }),
      { numRuns: 100 }
    );
  });
});

// ── Property 4 ───────────────────────────────────────────────────────────────
// Feature: vanilla-web-app, Property 4: Timer.format(seconds) returns a valid MM:SS string for any seconds in [0, 1500]
// Validates: Requirements 2.3
describe('Timer.format', () => {
  it('always returns a string matching MM:SS pattern with zero-padded two-digit numbers', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1500 }), (seconds) => {
        const result = Timer.format(seconds);
        expect(result).toMatch(/^\d{2}:\d{2}$/);
        const [mm, ss] = result.split(':').map(Number);
        expect(mm).toBeGreaterThanOrEqual(0);
        expect(mm).toBeLessThanOrEqual(25);
        expect(ss).toBeGreaterThanOrEqual(0);
        expect(ss).toBeLessThanOrEqual(59);
      }),
      { numRuns: 100 }
    );
  });
});

// ── Property 5 ───────────────────────────────────────────────────────────────
// Feature: vanilla-web-app, Property 5: Timer.tick() decrements remaining time by exactly 1 second
// Validates: Requirements 2.2
describe('Timer.tick', () => {
  it('decrements timerSeconds by exactly 1 for any value > 0', () => {
    const { getTimerSeconds, setTimerSeconds } = require('./app.js');
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1500 }), (seconds) => {
        setTimerSeconds(seconds);
        Timer.tick();
        expect(getTimerSeconds()).toBe(seconds - 1);
      }),
      { numRuns: 100 }
    );
  });
});

// ── Property 6 ───────────────────────────────────────────────────────────────
// Feature: vanilla-web-app, Property 6: Timer.stop() leaves remaining time unchanged
// Validates: Requirements 2.4
describe('Timer.stop', () => {
  it('preserves timerSeconds for any timer state', () => {
    const { getTimerSeconds, setTimerSeconds } = require('./app.js');
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1500 }), (seconds) => {
        setTimerSeconds(seconds);
        Timer.stop();
        expect(getTimerSeconds()).toBe(seconds);
      }),
      { numRuns: 100 }
    );
  });
});

// ── Unit test: timer completion (Req 2.6) ────────────────────────────────────
describe('Timer completion', () => {
  const { setTimerSeconds, getTimerSeconds, getTimerInterval } = require('./app.js');

  it('Timer reaching 00:00 shows toast, clears interval, and re-enables start button', () => {
    document.body.innerHTML = `
      <div id="toast-container"></div>
      <button id="timer-start"></button>
      <button id="timer-stop"></button>
      <button id="timer-reset"></button>
      <p id="timer-display"></p>
    `;

    setTimerSeconds(1);
    Timer.start();
    // Manually tick once — should reach 0
    Timer.tick();

    expect(getTimerSeconds()).toBe(0);
    expect(getTimerInterval()).toBeNull();
    expect(document.getElementById('timer-start').disabled).toBe(false);
    // Toast should have been added to the container
    const toasts = document.querySelectorAll('#toast-container .toast');
    expect(toasts.length).toBeGreaterThan(0);

    Timer.stop(); // cleanup just in case
  });
});

// ── Unit tests: start/stop/reset controls ────────────────────────────────────
describe('Timer controls', () => {
  const { setTimerSeconds, getTimerSeconds } = require('./app.js');

  it('reset restores timerSeconds to 1500', () => {
    setTimerSeconds(300);
    Timer.reset();
    expect(getTimerSeconds()).toBe(1500);
  });

  it('start disables the start button while running', () => {
    // jsdom provides a minimal DOM; set up a fake button
    document.body.innerHTML = `
      <button id="timer-start"></button>
      <button id="timer-stop"></button>
      <button id="timer-reset"></button>
      <p id="timer-display"></p>
    `;
    Timer.reset(); // ensure clean state
    Timer.start();
    expect(document.getElementById('timer-start').disabled).toBe(true);
    Timer.stop(); // clean up interval
  });

  it('stop re-enables the start button', () => {
    document.body.innerHTML = `
      <button id="timer-start"></button>
      <button id="timer-stop"></button>
      <button id="timer-reset"></button>
      <p id="timer-display"></p>
    `;
    Timer.reset();
    Timer.start();
    Timer.stop();
    expect(document.getElementById('timer-start').disabled).toBe(false);
  });
});

// ── Property 7 ───────────────────────────────────────────────────────────────
// Feature: vanilla-web-app, Property 7: validate() rejects whitespace-only strings
// Validates: Requirements 3.2
describe('validate', () => {
  it('rejects any whitespace-only string (spaces, tabs, newlines)', () => {
    fc.assert(
      fc.property(fc.string({ unit: fc.constantFrom(' ', '\t', '\n') }), (s) => {
        expect(validate(s)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});

// ── Property 8 ───────────────────────────────────────────────────────────────
// Feature: vanilla-web-app, Property 8: addTask() with valid label grows the list by 1 with completed=false
// Validates: Requirements 3.1
describe('TodoList.addTask', () => {
  beforeEach(() => {
    setTasks([]);
  });

  it('grows the task list by exactly 1 and sets completed=false for any valid label', () => {
    fc.assert(
      fc.property(fc.string().filter((s) => s.trim().length > 0), (label) => {
        const before = getTasks().length;
        TodoList.addTask(label);
        const after = getTasks();
        expect(after.length).toBe(before + 1);
        const added = after[after.length - 1];
        expect(added.completed).toBe(false);
        expect(added.label).toBe(label.trim());
        // reset for next iteration
        setTasks([]);
      }),
      { numRuns: 100 }
    );
  });
});

// ── Unit test: add form validation ───────────────────────────────────────────
describe('todo add form', () => {
  beforeEach(() => {
    localStorage.clear();
    setTasks([]);
    document.body.innerHTML = `
      <form id="todo-form" novalidate>
        <input type="text" id="todo-input" />
        <button type="submit">Add</button>
        <p id="todo-error" class="validation-msg"></p>
      </form>
      <ul id="todo-list"></ul>
    `;
    TodoList.init();
  });

  it('rejects empty input and shows a validation message', () => {
    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-input');
    const errorEl = document.getElementById('todo-error');

    input.value = '   ';
    form.dispatchEvent(new Event('submit'));

    expect(errorEl.textContent).not.toBe('');
    expect(getTasks().length).toBe(0);
  });

  it('adds a task and clears the input when label is valid', () => {
    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-input');
    const errorEl = document.getElementById('todo-error');

    input.value = 'Buy milk';
    form.dispatchEvent(new Event('submit'));

    expect(errorEl.textContent).toBe('');
    expect(getTasks().length).toBe(1);
    expect(getTasks()[0].label).toBe('Buy milk');
    expect(input.value).toBe('');
  });
});

// ── Property 9 ───────────────────────────────────────────────────────────────
// Feature: vanilla-web-app, Property 9: toggleTask() is an involution
// Validates: Requirements 3.3
describe('TodoList.toggleTask', () => {
  beforeEach(() => {
    setTasks([]);
    document.body.innerHTML = '<ul id="todo-list"></ul>';
  });

  it('double-toggle restores original completed state for any initial state', () => {
    fc.assert(
      fc.property(fc.boolean(), (initialCompleted) => {
        const task = { id: '1', label: 'test', completed: initialCompleted };
        setTasks([task]);
        TodoList.toggleTask('1');
        TodoList.toggleTask('1');
        expect(getTasks()[0].completed).toBe(initialCompleted);
      }),
      { numRuns: 100 }
    );
  });

  it('single toggle flips the completed flag', () => {
    setTasks([{ id: 'a', label: 'task', completed: false }]);
    TodoList.toggleTask('a');
    expect(getTasks()[0].completed).toBe(true);
    TodoList.toggleTask('a');
    expect(getTasks()[0].completed).toBe(false);
  });

  it('applies completed class to the rendered row when task is completed', () => {
    document.body.innerHTML = '<ul id="todo-list"></ul>';
    setTasks([{ id: 'b', label: 'task', completed: false }]);
    TodoList.render();
    TodoList.toggleTask('b');
    const li = document.querySelector('#todo-list li');
    expect(li.classList.contains('completed')).toBe(true);
  });
});

// ── Property 11 ──────────────────────────────────────────────────────────────
// Feature: vanilla-web-app, Property 11: deleteTask() removes only the target task
// Validates: Requirements 3.7
describe('TodoList.deleteTask', () => {
  beforeEach(() => {
    setTasks([]);
    document.body.innerHTML = '<ul id="todo-list"></ul>';
  });

  it('removes the target task and leaves all others unchanged', () => {
    const taskArbitrary = fc.record({
      id: fc.uuid(),
      label: fc.string().filter((s) => s.trim().length > 0),
      completed: fc.boolean(),
    });
    fc.assert(
      fc.property(
        fc.array(taskArbitrary, { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 0, max: 9 }),
        (taskList, rawIdx) => {
          const idx = rawIdx % taskList.length;
          const targetId = taskList[idx].id;
          setTasks([...taskList]);
          TodoList.deleteTask(targetId);
          const remaining = getTasks();
          expect(remaining.find((t) => t.id === targetId)).toBeUndefined();
          expect(remaining.length).toBe(taskList.length - 1);
          // all other tasks still present
          taskList.forEach((t) => {
            if (t.id !== targetId) {
              expect(remaining.find((r) => r.id === t.id)).toBeDefined();
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 10 ──────────────────────────────────────────────────────────────
// Feature: vanilla-web-app, Property 10: editTask() updates label for any valid non-empty input
// Validates: Requirements 3.5
describe('TodoList.editTask', () => {
  beforeEach(() => {
    setTasks([]);
    document.body.innerHTML = '<ul id="todo-list"></ul>';
  });

  it('updates the task label to the trimmed new value for any valid label', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => s.trim().length > 0),
        fc.string().filter((s) => s.trim().length > 0),
        (original, newLabel) => {
          setTasks([{ id: 'x', label: original.trim(), completed: false }]);
          TodoList.editTask('x', newLabel);
          expect(getTasks()[0].label).toBe(newLabel.trim());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('retains the original label when an empty/whitespace-only label is confirmed (Req 3.6)', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => s.trim().length > 0),
        fc.string({ unit: fc.constantFrom(' ', '\t', '\n') }),
        (original, whitespace) => {
          const trimmed = original.trim();
          setTasks([{ id: 'y', label: trimmed, completed: false }]);
          TodoList.editTask('y', whitespace);
          expect(getTasks()[0].label).toBe(trimmed);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 12 ──────────────────────────────────────────────────────────────
// Feature: vanilla-web-app, Property 12: Task persistence round-trip
// Validates: Requirements 3.8, 3.9
describe('TodoList save/load round-trip', () => {
  beforeEach(() => {
    localStorage.clear();
    setTasks([]);
  });

  it('save() + load() deserializes to a structurally equal array for any task list', () => {
    const taskArbitrary = fc.record({
      id: fc.uuid(),
      label: fc.string().filter((s) => s.trim().length > 0),
      completed: fc.boolean(),
    });
    fc.assert(
      fc.property(fc.array(taskArbitrary), (taskList) => {
        setTasks([...taskList]);
        TodoList.save();
        const loaded = TodoList.load();
        expect(loaded).toEqual(taskList);
      }),
      { numRuns: 100 }
    );
  });
});

// ── Unit test: inline edit UI (Req 3.4) ──────────────────────────────────────
describe('inline edit UI', () => {
  beforeEach(() => {
    setTasks([]);
    document.body.innerHTML = '<ul id="todo-list"></ul>';
  });

  it('clicking edit button replaces label span with a pre-filled input (Req 3.4)', () => {
    setTasks([{ id: 'e1', label: 'My Task', completed: false }]);
    TodoList.render();

    const editBtn = document.querySelector('[aria-label="Edit task"]');
    editBtn.click();

    const input = document.querySelector('.task-edit-input');
    expect(input).not.toBeNull();
    expect(input.value).toBe('My Task');
    // label span should be gone
    expect(document.querySelector('.task-label')).toBeNull();
  });

  it('confirming edit with valid label updates the task label', () => {
    setTasks([{ id: 'e2', label: 'Old Label', completed: false }]);
    TodoList.render();

    document.querySelector('[aria-label="Edit task"]').click();
    const input = document.querySelector('.task-edit-input');
    input.value = 'New Label';
    document.querySelector('[aria-label="Confirm edit"]').click();

    expect(getTasks()[0].label).toBe('New Label');
  });

  it('confirming edit with empty label retains original label (Req 3.6)', () => {
    setTasks([{ id: 'e3', label: 'Keep Me', completed: false }]);
    TodoList.render();

    document.querySelector('[aria-label="Edit task"]').click();
    const input = document.querySelector('.task-edit-input');
    input.value = '   ';
    document.querySelector('[aria-label="Confirm edit"]').click();

    expect(getTasks()[0].label).toBe('Keep Me');
  });
});

// ── Property 13 ──────────────────────────────────────────────────────────────
// Feature: vanilla-web-app, Property 13: addLink() rejects invalid inputs (empty label or bad URL)
// Validates: Requirements 4.2
describe('QuickLinks.validateUrl', () => {
  const { validateUrl, QuickLinks, getLinks, setLinks } = require('./app.js');

  beforeEach(() => {
    setLinks([]);
    document.body.innerHTML = '<div id="links-panel"></div>';
  });

  it('rejects any string that is not a valid URL', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        let isValid = true;
        try { new URL(s); } catch { isValid = false; }
        expect(validateUrl(s)).toBe(isValid);
      }),
      { numRuns: 100 }
    );
  });

  it('addLink() does not grow the list when label is empty', () => {
    // Calling addLink with empty label — validate() will reject it inside the form handler,
    // but addLink() itself trusts the caller; test via the form submit path
    document.body.innerHTML = `
      <form id="links-form" novalidate>
        <input type="text" id="links-label-input" />
        <input type="url" id="links-url-input" />
        <button type="submit">Add</button>
        <p id="links-error"></p>
      </form>
      <div id="links-panel"></div>
    `;
    setLinks([]);
    QuickLinks.init();

    const form = document.getElementById('links-form');
    document.getElementById('links-label-input').value = '';
    document.getElementById('links-url-input').value = 'https://example.com';
    form.dispatchEvent(new Event('submit'));

    expect(getLinks().length).toBe(0);
    expect(document.getElementById('links-error').textContent).not.toBe('');
  });

  it('addLink() does not grow the list when URL is invalid', () => {
    document.body.innerHTML = `
      <form id="links-form" novalidate>
        <input type="text" id="links-label-input" />
        <input type="url" id="links-url-input" />
        <button type="submit">Add</button>
        <p id="links-error"></p>
      </form>
      <div id="links-panel"></div>
    `;
    setLinks([]);
    QuickLinks.init();

    const form = document.getElementById('links-form');
    document.getElementById('links-label-input').value = 'My Link';
    document.getElementById('links-url-input').value = 'not-a-url';
    form.dispatchEvent(new Event('submit'));

    expect(getLinks().length).toBe(0);
    expect(document.getElementById('links-error').textContent).not.toBe('');
  });
});

// ── Property 14 ──────────────────────────────────────────────────────────────
// Feature: vanilla-web-app, Property 14: addLink() with valid label+URL grows the panel by 1
// Validates: Requirements 4.1
describe('QuickLinks.addLink', () => {
  const { QuickLinks, getLinks, setLinks } = require('./app.js');

  beforeEach(() => {
    setLinks([]);
    document.body.innerHTML = '<div id="links-panel"></div>';
  });

  it('grows the links list by exactly 1 with correct label and url for any valid input', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => s.trim().length > 0),
        fc.webUrl(),
        (label, url) => {
          setLinks([]);
          const before = getLinks().length;
          QuickLinks.addLink(label, url);
          const after = getLinks();
          expect(after.length).toBe(before + 1);
          const added = after[after.length - 1];
          expect(added.label).toBe(label.trim());
          expect(added.url).toBe(url.trim());
          setLinks([]);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 15 ──────────────────────────────────────────────────────────────
// Feature: vanilla-web-app, Property 15: deleteLink() removes only the target link
// Validates: Requirements 4.4
describe('QuickLinks.deleteLink', () => {
  const { QuickLinks, getLinks, setLinks } = require('./app.js');

  beforeEach(() => {
    setLinks([]);
    document.body.innerHTML = '<div id="links-panel"></div>';
  });

  it('removes the target link and leaves all others unchanged', () => {
    const linkArbitrary = fc.record({
      id: fc.uuid(),
      label: fc.string().filter((s) => s.trim().length > 0),
      url: fc.webUrl(),
    });
    fc.assert(
      fc.property(
        fc.array(linkArbitrary, { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 0, max: 9 }),
        (linkList, rawIdx) => {
          const idx = rawIdx % linkList.length;
          const targetId = linkList[idx].id;
          setLinks([...linkList]);
          QuickLinks.deleteLink(targetId);
          const remaining = getLinks();
          expect(remaining.find((l) => l.id === targetId)).toBeUndefined();
          expect(remaining.length).toBe(linkList.length - 1);
          linkList.forEach((l) => {
            if (l.id !== targetId) {
              expect(remaining.find((r) => r.id === l.id)).toBeDefined();
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Unit test: link open in new tab (Req 4.3) ─────────────────────────────────
describe('QuickLinks render — open in new tab', () => {
  const { QuickLinks, setLinks } = require('./app.js');

  beforeEach(() => {
    setLinks([]);
    document.body.innerHTML = '<div id="links-panel"></div>';
  });

  it('renders each link as an <a> with target="_blank" and rel="noopener noreferrer"', () => {
    setLinks([{ id: '1', label: 'Example', url: 'https://example.com' }]);
    QuickLinks.render();
    const anchor = document.querySelector('#links-panel a');
    expect(anchor).not.toBeNull();
    expect(anchor.href).toBe('https://example.com/');
    expect(anchor.target).toBe('_blank');
    expect(anchor.rel).toBe('noopener noreferrer');
  });

  it('delete button removes the link from the panel', () => {
    const { getLinks } = require('./app.js');
    setLinks([
      { id: 'a', label: 'Link A', url: 'https://a.com' },
      { id: 'b', label: 'Link B', url: 'https://b.com' },
    ]);
    QuickLinks.render();
    const deleteButtons = document.querySelectorAll('#links-panel .btn-danger');
    expect(deleteButtons.length).toBe(2);
    // Click delete on first link
    deleteButtons[0].click();
    expect(getLinks().length).toBe(1);
    expect(getLinks()[0].id).toBe('b');
  });
});

// ── Property 16 ──────────────────────────────────────────────────────────────
// Feature: vanilla-web-app, Property 16: Link persistence round-trip
// Validates: Requirements 4.5, 4.6
describe('QuickLinks save/load round-trip', () => {
  const { QuickLinks, getLinks, setLinks } = require('./app.js');

  beforeEach(() => {
    localStorage.clear();
    setLinks([]);
    document.body.innerHTML = '<div id="links-panel"></div>';
  });

  it('save() + load() deserializes to a structurally equal array for any link list', () => {
    const linkArbitrary = fc.record({
      id: fc.uuid(),
      label: fc.string().filter((s) => s.trim().length > 0),
      url: fc.webUrl(),
    });
    fc.assert(
      fc.property(fc.array(linkArbitrary), (linkList) => {
        setLinks([...linkList]);
        QuickLinks.save();
        const loaded = QuickLinks.load();
        expect(loaded).toEqual(linkList);
      }),
      { numRuns: 100 }
    );
  });

  it('QuickLinks.init() after save() restores the exact links list', () => {
    const linkArbitrary = fc.record({
      id: fc.uuid(),
      label: fc.string().filter((s) => s.trim().length > 0),
      url: fc.webUrl(),
    });
    fc.assert(
      fc.property(fc.array(linkArbitrary), (linkList) => {
        // Simulate a prior session: save the list
        setLinks([...linkList]);
        QuickLinks.save();
        // Reset in-memory state (simulate page reload)
        setLinks([]);
        // init() should restore from localStorage
        QuickLinks.init();
        expect(getLinks()).toEqual(linkList);
        // cleanup for next iteration
        localStorage.clear();
        setLinks([]);
      }),
      { numRuns: 100 }
    );
  });
});
