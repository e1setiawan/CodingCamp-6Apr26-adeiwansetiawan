// Personal Dashboard — app logic

// ── Toast notifications ───────────────────────────────────────────────────────

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
  container.appendChild(toast);
  const remove = () => {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };
  setTimeout(remove, duration);
}

// ── Confetti ──────────────────────────────────────────────────────────────────

function launchConfetti() {
  let canvas, ctx;
  try {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); return; }
  } catch (e) {
    if (canvas) canvas.remove();
    return;
  }
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    r: Math.random() * 7 + 4,
    d: Math.random() * 80 + 20,
    color: `hsl(${Math.random() * 360},80%,60%)`,
    tilt: Math.random() * 10 - 5,
    tiltAngle: 0,
    tiltSpeed: Math.random() * 0.1 + 0.05,
  }));
  let frame;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.tiltAngle += p.tiltSpeed;
      p.y += (Math.cos(p.d) + 2);
      p.x += Math.sin(p.tiltAngle) * 1.5;
      p.tilt = Math.sin(p.tiltAngle) * 12;
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });
    if (pieces.some((p) => p.y < canvas.height + 20)) {
      frame = requestAnimationFrame(draw);
    } else {
      canvas.remove();
    }
  };
  draw();
  setTimeout(() => { cancelAnimationFrame(frame); canvas.remove(); }, 4000);
}

// ── Theme ─────────────────────────────────────────────────────────────────────

const Theme = {
  init() {
    const saved = localStorage.getItem('theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      Theme._updateIcon(btn);
      btn.addEventListener('click', () => Theme.toggle());
    }
    // Accent colour
    const savedAccent = localStorage.getItem('accentColor');
    if (savedAccent) Theme._applyAccent(savedAccent);
    const picker = document.getElementById('accent-picker');
    if (picker) {
      if (savedAccent) picker.value = savedAccent;
      picker.addEventListener('input', (e) => {
        Theme._applyAccent(e.target.value);
        localStorage.setItem('accentColor', e.target.value);
      });
    }
  },
  toggle() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    const btn = document.getElementById('theme-toggle');
    if (btn) Theme._updateIcon(btn);
  },
  _updateIcon(btn) {
    btn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  },
  _applyAccent(hex) {
    // Convert hex to r,g,b for CSS custom property
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // Darken by ~15% for hover
    const darken = (v) => Math.max(0, Math.round(v * 0.85));
    const hoverHex = '#' + [r, g, b].map(darken).map((v) => v.toString(16).padStart(2, '0')).join('');
    document.documentElement.style.setProperty('--accent', hex);
    document.documentElement.style.setProperty('--accent-hover', hoverHex);
    document.documentElement.style.setProperty('--accent-rgb', `${r},${g},${b}`);
  },
};

// ── Quotes ────────────────────────────────────────────────────────────────────

const QUOTES = [
  'The secret of getting ahead is getting started.',
  'Focus on being productive instead of busy.',
  'Done is better than perfect.',
  'Small steps every day lead to big results.',
  'Your only limit is your mind.',
  'Work hard in silence, let success make the noise.',
  'Believe you can and you\'re halfway there.',
  'It always seems impossible until it\'s done.',
];

function getDailyQuote() {
  const idx = new Date().getDate() % QUOTES.length;
  return QUOTES[idx];
}

// ── Greeting Widget ───────────────────────────────────────────────────────────

function getGreeting(hour) {
  if (hour >= 5 && hour <= 11) return 'Good Morning';
  if (hour >= 12 && hour <= 17) return 'Good Afternoon';
  if (hour >= 18 && hour <= 21) return 'Good Evening';
  return 'Good Night';
}

function formatTime(date) {
  const h = date.getHours();
  const hh = String(h % 12 || 12).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${hh}:${mm}:${ss} ${ampm}`;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function updateGreeting() {
  const now = new Date();
  document.getElementById('greeting-time').textContent = formatTime(now);
  const dateText = document.getElementById('greeting-date-text');
  if (dateText) dateText.textContent = formatDate(now);
  const name = localStorage.getItem('userName');
  const base = getGreeting(now.getHours());
  document.getElementById('greeting-message').textContent = name ? `${base}, ${name}!` : base;
}

const Greeting = {
  init() {
    updateGreeting();
    setInterval(updateGreeting, 1000);

    const quoteEl = document.getElementById('greeting-quote');
    if (quoteEl) quoteEl.textContent = `"${getDailyQuote()}"`;

    const nameInput = document.getElementById('name-input');
    const saved = localStorage.getItem('userName');
    if (nameInput && saved) nameInput.value = saved;

    const form = document.getElementById('name-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = nameInput ? nameInput.value.trim() : '';
        if (val) {
          localStorage.setItem('userName', val);
          showToast(`Welcome, ${val}!`, 'success');
        } else {
          localStorage.removeItem('userName');
        }
        updateGreeting();
      });
    }

    Greeting._loadLocation();
  },

  _loadLocation() {
    const wrap = document.getElementById('greeting-location-wrap');
    const locText = document.getElementById('greeting-location-text');
    if (!wrap || !locText) return;

    const setLocation = (location) => {
      locText.textContent = location;
      wrap.hidden = false;
      localStorage.setItem('userLocation', location);
    };

    // Show cached value immediately
    const cached = localStorage.getItem('userLocation');
    if (cached) setLocation(cached);

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          .then((r) => r.json())
          .then((data) => {
            const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
            const country = data.address.country || '';
            const location = [city, country].filter(Boolean).join(', ');
            if (location) setLocation(location);
          })
          .catch(() => {});
      },
      () => {}
    );
  },
};

// ── Focus Timer ───────────────────────────────────────────────────────────────

let timerSeconds = 1500;
let timerDuration = 1500; // total for current preset
let timerInterval = null;

const RING_CIRCUMFERENCE = 2 * Math.PI * 52; // r=52 → ~326.7

function renderTimer() {
  const display = document.getElementById('timer-display');
  if (display) display.textContent = Timer.format(timerSeconds);

  // Ring
  const ring = document.getElementById('timer-ring-fill');
  if (ring) {
    const pct = timerDuration > 0 ? timerSeconds / timerDuration : 1;
    ring.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - pct);
    ring.classList.toggle('urgent', pct <= 0.1);
  }

  // Bar
  const bar = document.getElementById('timer-bar');
  if (bar) {
    const pct = timerDuration > 0 ? (timerSeconds / timerDuration) * 100 : 100;
    bar.style.width = `${pct}%`;
    bar.classList.toggle('urgent', pct <= 10);
  }
}

const Timer = {
  format(seconds) {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  },

  tick() {
    if (timerSeconds > 0) {
      timerSeconds -= 1;
      renderTimer();
      if (timerSeconds === 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        const btn = document.getElementById('timer-start');
        if (btn) btn.disabled = false;
        showToast('⏰ Time is up! Great work!', 'success', 5000);
        launchConfetti();
      }
    }
  },

  start() {
    if (timerInterval !== null) return;
    const btn = document.getElementById('timer-start');
    if (btn) btn.disabled = true;
    timerInterval = setInterval(() => Timer.tick(), 1000);
  },

  stop() {
    clearInterval(timerInterval);
    timerInterval = null;
    const btn = document.getElementById('timer-start');
    if (btn) btn.disabled = false;
  },

  reset() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerSeconds = timerDuration;
    const btn = document.getElementById('timer-start');
    if (btn) btn.disabled = false;
    renderTimer();
  },

  setPreset(seconds) {
    Timer.stop();
    timerDuration = seconds;
    timerSeconds = seconds;
    renderTimer();
    // Update active preset button
    document.querySelectorAll('.btn-preset').forEach((b) => {
      b.classList.toggle('active', Number(b.dataset.seconds) === seconds);
    });
  },

  init() {
    renderTimer();
    document.getElementById('timer-start').addEventListener('click', () => Timer.start());
    document.getElementById('timer-stop').addEventListener('click', () => Timer.stop());
    document.getElementById('timer-reset').addEventListener('click', () => Timer.reset());
    document.querySelectorAll('.btn-preset').forEach((btn) => {
      btn.addEventListener('click', () => Timer.setPreset(Number(btn.dataset.seconds)));
    });
  },
};

// ── To-Do List ────────────────────────────────────────────────────────────────

let tasks = [];

function validate(label) {
  return typeof label === 'string' && label.trim().length > 0;
}

function updateTodoBadge() {
  const badge = document.getElementById('todo-badge');
  if (!badge) return;
  const done = tasks.filter((t) => t.completed).length;
  badge.textContent = tasks.length ? `${done} / ${tasks.length} done` : '';
}

function updateTodoEmpty() {
  const empty = document.getElementById('todo-empty');
  if (empty) empty.hidden = tasks.length > 0;
}

const TodoList = {
  init() {
    tasks = TodoList.load();
    TodoList.render();

    const form = document.getElementById('todo-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('todo-input');
        const errorEl = document.getElementById('todo-error');
        const label = input ? input.value : '';

        if (!validate(label)) {
          if (errorEl) errorEl.textContent = 'Task label cannot be empty.';
          return;
        }
        const trimmed = label.trim().toLowerCase();
        const isDuplicate = tasks.some((t) => t.label.toLowerCase() === trimmed);
        if (isDuplicate) {
          if (errorEl) errorEl.textContent = 'A task with that name already exists.';
          return;
        }
        if (errorEl) errorEl.textContent = '';
        TodoList.addTask(label.trim());
        if (input) input.value = '';
      });
    }

    // Keyboard shortcut: "/" focuses task input
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        const input = document.getElementById('todo-input');
        if (input) { input.focus(); input.select(); }
      }
    });
  },

  addTask(label) {
    const task = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString(),
      label: label.trim(),
      completed: false,
    };
    tasks.push(task);
    TodoList.save();
    TodoList.render();
  },

  save() {
    try { localStorage.setItem('tasks', JSON.stringify(tasks)); }
    catch (e) { console.warn('Failed to save tasks:', e); }
  },

  load() {
    try {
      const raw = localStorage.getItem('tasks');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Failed to load tasks:', e);
      return [];
    }
  },

  toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      TodoList.save();
      TodoList.render();
    }
  },

  editTask(id, label) {
    if (!validate(label)) return;
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.label = label.trim();
      TodoList.save();
      TodoList.render();
    }
  },

  deleteTask(id) {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      tasks.splice(idx, 1);
      TodoList.save();
      TodoList.render();
    }
  },

  render() {
    const list = document.getElementById('todo-list');
    if (!list) return;
    list.innerHTML = '';
    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.dataset.id = task.id;
      li.dataset.index = index;
      if (task.completed) li.classList.add('completed');

      // Drag-and-drop
      li.draggable = true;
      li.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', task.id);
        li.classList.add('dragging');
      });
      li.addEventListener('dragend', () => li.classList.remove('dragging'));
      li.addEventListener('dragover', (e) => { e.preventDefault(); li.classList.add('drag-over'); });
      li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
      li.addEventListener('drop', (e) => {
        e.preventDefault();
        li.classList.remove('drag-over');
        const fromId = e.dataTransfer.getData('text/plain');
        const fromIdx = tasks.findIndex((t) => t.id === fromId);
        const toIdx = index;
        if (fromIdx !== -1 && fromIdx !== toIdx) {
          const [moved] = tasks.splice(fromIdx, 1);
          tasks.splice(toIdx, 0, moved);
          TodoList.save();
          TodoList.render();
        }
      });

      const completeBtn = document.createElement('button');
      completeBtn.type = 'button';
      completeBtn.className = 'btn-ghost';
      completeBtn.setAttribute('aria-label', task.completed ? 'Mark incomplete' : 'Mark complete');
      completeBtn.textContent = task.completed ? '✓' : '○';
      completeBtn.addEventListener('click', () => TodoList.toggleTask(task.id));

      const labelSpan = document.createElement('span');
      labelSpan.className = 'task-label';
      labelSpan.textContent = task.label;

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn-ghost';
      editBtn.setAttribute('aria-label', 'Edit task');
      editBtn.textContent = '✎';
      editBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'task-edit-input';
        input.value = task.label;
        input.setAttribute('aria-label', 'Edit task label');

        const confirmBtn = document.createElement('button');
        confirmBtn.type = 'button';
        confirmBtn.className = 'btn-ghost';
        confirmBtn.setAttribute('aria-label', 'Confirm edit');
        confirmBtn.textContent = '✔';

        const confirm = () => {
          const trimmed = input.value.trim();
          if (trimmed) { TodoList.editTask(task.id, trimmed); }
          else { TodoList.render(); }
        };
        confirmBtn.addEventListener('click', confirm);
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') confirm();
          if (e.key === 'Escape') TodoList.render();
        });
        li.replaceChild(input, labelSpan);
        li.replaceChild(confirmBtn, editBtn);
        input.focus();
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn-danger';
      deleteBtn.setAttribute('aria-label', 'Delete task');
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', () => TodoList.deleteTask(task.id));

      li.appendChild(completeBtn);
      li.appendChild(labelSpan);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    });

    updateTodoBadge();
    updateTodoEmpty();
  },
};

// ── Quick Links ───────────────────────────────────────────────────────────────

let links = [];

function validateUrl(url) {
  try { new URL(url); return true; }
  catch (e) { return false; }
}

function updateLinksEmpty() {
  const empty = document.getElementById('links-empty');
  if (empty) empty.hidden = links.length > 0;
}

function updateLinksBadge() {
  const badge = document.getElementById('links-badge');
  if (!badge) return;
  badge.textContent = links.length ? `${links.length} saved` : '';
}

const QuickLinks = {
  init() {
    links = QuickLinks.load();
    QuickLinks.render();

    const form = document.getElementById('links-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const labelInput = document.getElementById('links-label-input');
        const urlInput = document.getElementById('links-url-input');
        const errorEl = document.getElementById('links-error');
        const label = labelInput ? labelInput.value : '';
        const url = urlInput ? urlInput.value : '';

        if (!validate(label)) {
          if (errorEl) errorEl.textContent = 'Link label cannot be empty.';
          return;
        }
        if (!validateUrl(url)) {
          if (errorEl) errorEl.textContent = 'Please enter a valid URL.';
          return;
        }
        if (errorEl) errorEl.textContent = '';
        QuickLinks.addLink(label.trim(), url.trim());
        if (labelInput) labelInput.value = '';
        if (urlInput) urlInput.value = '';
      });
    }
  },

  addLink(label, url) {
    const link = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString(),
      label: label.trim(),
      url: url.trim(),
    };
    links.push(link);
    QuickLinks.save();
    QuickLinks.render();
  },

  deleteLink(id) {
    const idx = links.findIndex((l) => l.id === id);
    if (idx !== -1) {
      links.splice(idx, 1);
      QuickLinks.save();
      QuickLinks.render();
    }
  },

  save() {
    try { localStorage.setItem('links', JSON.stringify(links)); }
    catch (e) { console.warn('Failed to save links:', e); }
  },

  load() {
    try {
      const raw = localStorage.getItem('links');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Failed to load links:', e);
      return [];
    }
  },

  render() {
    const panel = document.getElementById('links-panel');
    if (!panel) return;
    panel.innerHTML = '';
    links.forEach((link) => {
      const item = document.createElement('div');
      item.className = 'link-item';

      const anchor = document.createElement('a');
      anchor.href = link.url;
      anchor.textContent = link.label;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.setAttribute('aria-label', `Open ${link.label}`);

      // Copy URL button
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'btn-copy';
      copyBtn.setAttribute('aria-label', 'Copy URL');
      copyBtn.textContent = '⎘';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(link.url).then(() => {
          showToast('URL copied to clipboard!', 'success', 2000);
        }).catch(() => {
          showToast('Could not copy URL', 'error', 2000);
        });
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn-danger';
      deleteBtn.setAttribute('aria-label', 'Delete link');
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', () => QuickLinks.deleteLink(link.id));

      item.appendChild(anchor);
      item.appendChild(copyBtn);
      item.appendChild(deleteBtn);
      panel.appendChild(item);
    });

    updateLinksEmpty();
    updateLinksBadge();
  },
};

// ── Init ──────────────────────────────────────────────────────────────────────

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    Theme.init();
    Greeting.init();
    Timer.init();
    TodoList.init();
    QuickLinks.init();
  });
}

// ── Exports (for testing in Node/Vitest) ──────────────────────────────────────

if (typeof module !== 'undefined') {
  module.exports = {
    getGreeting, formatTime, formatDate, Timer,
    getTimerSeconds: () => timerSeconds,
    setTimerSeconds: (v) => { timerSeconds = v; },
    getTimerInterval: () => timerInterval,
    setTimerInterval: (v) => { timerInterval = v; },
    validate,
    TodoList,
    getTasks: () => tasks,
    setTasks: (v) => { tasks = v; },
    validateUrl,
    QuickLinks,
    getLinks: () => links,
    setLinks: (v) => { links = v; },
  };
}
