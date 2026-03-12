# Personio Time Tracker Auto-Fill

A Chrome extension that auto-fills your Personio attendance timesheet with a configurable daily schedule.

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select this repository folder.

The extension icon will appear in your toolbar when you visit your company's Personio attendance page (e.g., `https://<company>.personio.com/attendance`).

## Configuration

Click the extension icon to open the settings popup:

| Setting | Description |
|---|---|
| Work Slot 1 | Start and end time of your morning work block |
| Break | Start and end time of your lunch break |
| Work Slot 2 | Start and end time of your afternoon work block |
| Default Project | Project name to auto-select (must match the dropdown exactly, e.g. `4+1`) |
| Fill all empty days until today | Fills every empty weekday from the start of the month up to today |
| Max days | Limit how many days to fill (used when "until today" is unchecked) |
| Auto-Save | Automatically saves each filled day without manual confirmation |

Default schedule: **08:00–12:00**, break **12:00–13:00**, **13:00–17:00**.

## Usage

1. Navigate to the Personio attendance page.
2. Click the **Auto-Fill Empty Days** button that appears next to "Request time off".
3. The extension fills only days with **zero tracked hours**, skipping weekends, public holidays, and days already filled.
4. An alert reports how many days were filled when done.

## Notes

- The extension only runs on `https://*.personio.com/attendance*`.
- If Auto-Save is off, each day's form is left open — you can review before saving manually.
- The project picker search is case-sensitive; the name must match exactly.