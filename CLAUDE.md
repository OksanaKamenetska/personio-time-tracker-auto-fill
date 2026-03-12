# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Chrome browser extension (Manifest V3) that auto-fills time tracking entries in the Personio attendance system at `https://<company>.personio.com/attendance*`.

## No Build System

This is plain JavaScript — no package.json, no bundler, no tests, no linter. Load it as an unpacked extension in Chrome (`chrome://extensions/` → "Load unpacked").

## Architecture

Three components working together:

```
popup.html / popup.js  →  Chrome Storage API  →  content.js (injected into Personio)
```

- **popup.html/popup.js** — Settings UI. Saves configuration (time slots, project name, fill mode) to `chrome.storage.local`.
- **content.js** — The automation engine. Injected at `document_idle` on Personio attendance pages. Injects an "Auto-Fill Empty Days" button via `injectButton()` using a `MutationObserver` to survive SPA navigation.

## Core Logic in content.js

`runAutoFill()` iterates timesheet rows (skipping weekends, holidays, already-filled rows), calls `fillPeriods()` for each empty day. Two fill modes:
- **maxDays mode** — fills up to N days
- **until today mode** — fills until reaching today's date

`fillPeriods()` fills three time periods (work1, break, work2) and calls `selectProject()` for work periods.

`setReactInputValue()` fires synthetic React events (`input` + `change`) to correctly update React-controlled form fields. `humanType()` types character-by-character with 80ms delays.

## DOM Selectors

All selectors use `data-test-id` attributes (more stable than class names):
- `timesheet-timecard` — row elements
- `periods.${index}.${boundary}` — time input groups
- `tracked-vs-target-area` — hours display (used to detect filled rows)
- `time-period-row-project-picker-trigger` / `time-period-row-project-picker-search-input` — project dropdown
- `timecard-add-work` — add third work period button
- `timecard-save-button` — save form