# Implementation Plan: Personal Dashboard Web App

## Overview

Build a single-page personal dashboard using vanilla HTML, CSS, and JavaScript. All state is persisted to `localStorage`. The app is structured as one HTML file, one CSS file (`css/style.css`), and one JS file (`js/app.js`).

## Tasks

- [x] 1. Set up project structure and HTML skeleton
  - Create `index.html` with semantic layout sections for each widget: greeting, timer, to-do list, and quick links
  - Link `css/style.css` and `js/app.js`
  - Add placeholder markup for all four widget containers
  - _Requirements: 1, 2, 3, 4_

- [x] 2. Implement base styles
  - Create `css/style.css` with a responsive grid or flexbox layout for the four widgets
  - Style widget cards, typography, buttons, and form inputs
  - Add a visual distinction style for completed tasks (e.g., strikethrough + muted colour)
  - _Requirements: 3.3_

- [x] 3. Implement the Greeting Widget
  - [x] 3.1 Display current time and date
    - In `js/app.js`, write a `updateGreeting()` function that reads `new Date()` and renders the time in HH:MM format and the date in a human-readable format
    - Call `updateGreeting()` on load and schedule it with `setInterval` every 60 seconds
    - _Requirements: 1.1, 1.2_
  - [x] 3.2 Implement time-based greeting message
    - Extend `updateGreeting()` to derive the greeting string from the current hour: "Good Morning" (05–11), "Good Afternoon" (12–17), "Good Evening" (18–21), "Good Night" (22–04)
    - _Requirements: 1.3, 1.4, 1.5, 1.6_

- [x] 4. Implement the Focus Timer
  - [x] 4.1 Render timer UI and initialise state
    - Add `timerSeconds = 1500`, `timerInterval = null` variables in `js/app.js`
    - Write a `renderTimer()` function that formats remaining seconds as MM:SS and updates the display
    - Call `renderTimer()` on load
    - _Requirements: 2.1, 2.3_
  - [x] 4.2 Implement start, stop, and reset controls
    - Wire the start button: set interval calling `tick()` each second, disable start button while running
    - Wire the stop button: clear the interval, retain current time
    - Wire the reset button: clear interval, reset `timerSeconds` to 1500, call `renderTimer()`
    - _Requirements: 2.2, 2.4, 2.5, 2.7_
  - [x] 4.3 Handle timer completion
    - In `tick()`, when `timerSeconds` reaches 0, clear the interval and trigger `alert()` or play an audio cue
    - _Requirements: 2.6_

- [x] 5. Implement the To-Do List
  - [x] 5.1 Add task input and rendering
    - Write `addTask(label)` that creates a task object `{ id, label, done: false }` and appends it to a `tasks` array
    - Write `renderTasks()` that clears and re-renders the task list from the array
    - Wire the add form: on submit, trim input, reject empty with an inline validation message, otherwise call `addTask()` then `renderTasks()`
    - _Requirements: 3.1, 3.2_
  - [x] 5.2 Implement complete and delete controls
    - In each rendered task row, wire the complete toggle to flip `task.done` and call `renderTasks()`
    - Wire the delete button to splice the task from the array and call `renderTasks()`
    - Apply strikethrough styling to rows where `task.done === true`
    - _Requirements: 3.3, 3.7_
  - [x] 5.3 Implement inline edit
    - Wire the edit button to replace the task label with a pre-filled `<input>` and a confirm button
    - On confirm, trim the value; if non-empty update `task.label`, if empty retain original label, then call `renderTasks()`
    - _Requirements: 3.4, 3.5, 3.6_
  - [x] 5.4 Persist tasks to localStorage
    - Write `saveTasks()` that serialises the `tasks` array to `localStorage`
    - Call `saveTasks()` after every add, update, or delete
    - On page load, read from `localStorage` and populate `tasks` before the first `renderTasks()` call
    - _Requirements: 3.8, 3.9_

- [x] 6. Checkpoint — verify greeting, timer, and to-do list
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Quick Links
  - [x] 7.1 Add link input and rendering
    - Write `addLink(label, url)` that creates a link object `{ id, label, url }` and appends it to a `links` array
    - Write `renderLinks()` that clears and re-renders the links panel
    - Wire the add form: on submit, validate that label is non-empty and URL is a valid URL (use `new URL()` for validation); display an inline validation message on failure, otherwise call `addLink()` then `renderLinks()`
    - _Requirements: 4.1, 4.2_
  - [x] 7.2 Implement open and delete controls
    - Render each link as an `<a>` with `target="_blank"` and `rel="noopener noreferrer"`
    - Wire the delete button to splice the link from the array and call `renderLinks()`
    - _Requirements: 4.3, 4.4_
  - [x] 7.3 Persist links to localStorage
    - Write `saveLinks()` that serialises the `links` array to `localStorage`
    - Call `saveLinks()` after every add or delete
    - On page load, read from `localStorage` and populate `links` before the first `renderLinks()` call
    - _Requirements: 4.5, 4.6_

- [x] 8. Final checkpoint — full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All logic lives in `js/app.js`; all styles live in `css/style.css`
- No frameworks, no build tools, no backend
- `localStorage` keys: `dashboard_tasks` and `dashboard_links`
