# Requirements Document

## Introduction

A personal dashboard web app built with vanilla HTML, CSS, and JavaScript. It runs entirely in the browser with no backend, using Local Storage for persistence. The dashboard provides four core widgets: a time/date greeting, a focus (Pomodoro-style) timer, a to-do list, and a quick links panel.

## Glossary

- **Dashboard**: The single-page web application that hosts all widgets.
- **Greeting_Widget**: The UI component that displays the current time, date, and a time-based greeting message.
- **Timer**: The focus timer component that counts down from 25 minutes.
- **Task_List**: The UI component that manages the user's to-do items.
- **Task**: A single to-do item with a text label and a completion state.
- **Quick_Links**: The UI component that displays and manages user-defined shortcut links.
- **Link**: A saved shortcut consisting of a label and a URL.
- **Local_Storage**: The browser's `localStorage` API used for client-side data persistence.

---

## Requirements

### Requirement 1: Greeting Widget

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the dashboard, so that I have an at-a-glance overview of the moment.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM format, updated every minute.
2. THE Greeting_Widget SHALL display the current date in a human-readable format (e.g., "Monday, July 14, 2025").
3. WHEN the local time is between 05:00 and 11:59, THE Greeting_Widget SHALL display the message "Good Morning".
4. WHEN the local time is between 12:00 and 17:59, THE Greeting_Widget SHALL display the message "Good Afternoon".
5. WHEN the local time is between 18:00 and 21:59, THE Greeting_Widget SHALL display the message "Good Evening".
6. WHEN the local time is between 22:00 and 04:59, THE Greeting_Widget SHALL display the message "Good Night".

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with start, stop, and reset controls, so that I can manage focused work sessions.

#### Acceptance Criteria

1. THE Timer SHALL initialise with a countdown value of 25 minutes (1500 seconds).
2. WHEN the user activates the start control, THE Timer SHALL begin counting down in one-second intervals.
3. WHILE the Timer is counting down, THE Timer SHALL update the displayed time every second in MM:SS format.
4. WHEN the user activates the stop control, THE Timer SHALL pause the countdown and retain the current remaining time.
5. WHEN the user activates the reset control, THE Timer SHALL stop any active countdown and restore the displayed time to 25:00.
6. WHEN the countdown reaches 00:00, THE Timer SHALL stop automatically and notify the user with a browser alert or audio cue.
7. WHILE the Timer is counting down, THE Timer SHALL disable the start control to prevent duplicate intervals.

---

### Requirement 3: To-Do List

**User Story:** As a user, I want to add, edit, complete, and delete tasks, so that I can track what I need to accomplish.

#### Acceptance Criteria

1. WHEN the user submits a non-empty task label, THE Task_List SHALL add a new Task with a completion state of false.
2. IF the user submits an empty or whitespace-only task label, THEN THE Task_List SHALL reject the input and display an inline validation message.
3. WHEN the user activates the complete control on a Task, THE Task_List SHALL toggle the Task's completion state and apply a visual distinction (e.g., strikethrough) to completed tasks.
4. WHEN the user activates the edit control on a Task, THE Task_List SHALL present the Task's label in an editable field pre-filled with the current label.
5. WHEN the user confirms an edit with a non-empty label, THE Task_List SHALL update the Task's label to the new value.
6. IF the user confirms an edit with an empty or whitespace-only label, THEN THE Task_List SHALL reject the update and retain the original label.
7. WHEN the user activates the delete control on a Task, THE Task_List SHALL remove the Task from the list.
8. WHEN any Task is added, updated, or removed, THE Task_List SHALL persist the full task collection to Local_Storage.
9. WHEN the Dashboard loads, THE Task_List SHALL restore all previously saved tasks from Local_Storage.

---

### Requirement 4: Quick Links

**User Story:** As a user, I want to save and open favourite website shortcuts, so that I can navigate to frequently visited pages with one click.

#### Acceptance Criteria

1. WHEN the user submits a link label and a valid URL, THE Quick_Links SHALL add a new Link to the panel.
2. IF the user submits a missing label or an invalid URL, THEN THE Quick_Links SHALL reject the input and display an inline validation message.
3. WHEN the user activates a Link, THE Quick_Links SHALL open the corresponding URL in a new browser tab.
4. WHEN the user activates the delete control on a Link, THE Quick_Links SHALL remove the Link from the panel.
5. WHEN any Link is added or removed, THE Quick_Links SHALL persist the full link collection to Local_Storage.
6. WHEN the Dashboard loads, THE Quick_Links SHALL restore all previously saved links from Local_Storage.
