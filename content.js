const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getSettings = () => new Promise(resolve => {
    const defaults = {
        w1Start: '08:00', w1End: '12:00',
        bStart: '12:00', bEnd: '13:00',
        w2Start: '13:00', w2End: '17:00',
        maxDays: 5,
        fillUntilToday: false,
        projectName: '',
        autoSave: false
    };
    chrome.storage.local.get(defaults, resolve);
});

const humanType = async (element, text) => {
    if (!element) return;

    element.focus();
    window.getSelection().selectAllChildren(element);

    for (const char of text) {
        document.execCommand('insertText', false, char);
        await sleep(80);
    }
};

const setReactInputValue = async (input, value) => {
    input.focus();
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(input, value);

    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
};

const fillTime = async (form, periodIndex, boundary, hours, minutes) => {
    const group = form.querySelector(`[data-test-id="periods.${periodIndex}.${boundary}"]`);
    if (!group) return;

    const hourSpan = group.querySelector('[aria-label="hours"]');
    const minuteSpan = group.querySelector('[aria-label="minutes"]');

    await humanType(hourSpan, hours);
    await humanType(minuteSpan, minutes);
};

const selectProject = async (form, periodIndex, projectName) => {
    if (!projectName) return;

    const triggerBtn = form.querySelector(`input[name="periods.${periodIndex}.comment"]`)
        ?.parentElement
        ?.parentElement
        ?.querySelector('[data-test-id="time-period-row-project-picker-trigger"]');

    if (!triggerBtn) {
        console.warn(`Could not find project dropdown for period ${periodIndex}`);
        return;
    }

    triggerBtn.click();
    await sleep(300);
    const searchInput = document.querySelector('[data-test-id="time-period-row-project-picker-search-input"] input');

    if (!searchInput) {
        console.warn('Could not find the project search input.');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        return;
    }

    await setReactInputValue(searchInput, projectName);
    await sleep(400);

    const options = Array.from(document.querySelectorAll('div[role="option"]'));
    const exactMatch = options.find(opt => opt.innerText.trim().toLowerCase() === projectName.toLowerCase());

    if (exactMatch) {
        exactMatch.click();
    } else if (options.length > 0) {
        options[0].click();
    } else {
        console.warn(`No project found matching: ${projectName}`);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    }

    await sleep(200);
};

const fillPeriods = async (row, settings) => {
    const form = row.querySelector('#time-entry-form');
    if (!form) return;

    const existingRows = form.querySelectorAll('[data-test-id="timeEntryRow"]');
    if (existingRows.length === 2) {
        const addWorkBtn = form.querySelector('[data-test-id="timecard-add-work"]');
        if (addWorkBtn) {
            addWorkBtn.click();
            await sleep(300);
        }
    }

    const parse = (timeStr) => timeStr.split(':');

    // Period 0: Work 1
    const [w1Sh, w1Sm] = parse(settings.w1Start);
    const [w1Eh, w1Em] = parse(settings.w1End);
    await fillTime(form, 0, 'start', w1Sh, w1Sm);
    await fillTime(form, 0, 'end', w1Eh, w1Em);
    await selectProject(form, 0, settings.projectName);

    // Period 1: Break
    const [bSh, bSm] = parse(settings.bStart);
    const [bEh, bEm] = parse(settings.bEnd);
    await fillTime(form, 1, 'start', bSh, bSm);
    await fillTime(form, 1, 'end', bEh, bEm);

    // Period 2: Work 2
    const [w2Sh, w2Sm] = parse(settings.w2Start);
    const [w2Eh, w2Em] = parse(settings.w2End);
    await fillTime(form, 2, 'start', w2Sh, w2Sm);
    await fillTime(form, 2, 'end', w2Eh, w2Em);
    await selectProject(form, 2, settings.projectName);

    if (settings.autoSave) {
        const saveBtn = form.querySelector('[data-test-id="timecard-save-button"]');
        if (saveBtn) {
            saveBtn.click();
            await sleep(500);
        }
    } else {
        document.body.click();
    }
};

const runAutoFill = async () => {
    const btn = document.getElementById('auto-fill-btn');
    if (btn) btn.innerText = '🤖 Auto-Filling... Please wait';

    const settings = await getSettings();
    let daysFilled = 0;

    // Find today's index to stop the loop securely (handles weekends/holidays)
    const todayReal = new Date();
    todayReal.setHours(0, 0, 0, 0);

    const validRows = document.querySelectorAll(
        '[data-test-id="timesheet-timecard"][data-is-weekend="false"][data-is-holiday="false"][data-is-off-day="false"]'
    );

    for (const row of validRows) {
        // Condition 1: Standard maxDays limit (if 'until today' is unchecked)
        if (!settings.fillUntilToday && daysFilled >= settings.maxDays) {
            console.log("Max days limit reached. Stopping.");
            break;
        }

        // Condition 2: "Until Today" strict date comparison
        if (settings.fillUntilToday) {
            const timeEl = row.querySelector('time[datetime]');
            if (timeEl) {
                const rowDate = new Date(timeEl.getAttribute('datetime'));
                const visibleDay = parseInt(timeEl.innerText, 10);

                if (rowDate.getDate() !== visibleDay) {
                    rowDate.setDate(rowDate.getDate() + 1);

                    if (rowDate.getDate() !== visibleDay) {
                        rowDate.setDate(rowDate.getDate() - 2);
                    }
                }

                rowDate.setHours(0, 0, 0, 0);

                if (rowDate > todayReal) {
                    console.log("Reached a future date. Stopping auto-fill.");
                    break;
                }
            }
        }

        const trackedArea = row.querySelector('[data-test-id="tracked-vs-target-area"]');
        if (trackedArea && !trackedArea.innerText.trim().startsWith('0h')) continue;

        if (row.getAttribute('aria-expanded') === 'false') {
            row.click();
            await sleep(500);
        }

        await fillPeriods(row, settings);

        daysFilled++;
        await sleep(200);
    }

    if (btn) btn.innerText = '🤖 Auto-Fill Empty Days';
    alert(`Auto-fill complete! Pre-filled ${daysFilled} day(s). Please review and save manually.`);
};

function injectButton() {
    if (document.getElementById('auto-fill-btn')) return;

    const allButtons = Array.from(document.querySelectorAll('button'));
    const requestTimeOffBtn = allButtons.find(btn => btn.innerText.trim() === 'Request time off');
    if (!requestTimeOffBtn) return;

    const container = requestTimeOffBtn.parentElement;

    const btn = document.createElement('button');
    btn.id = 'auto-fill-btn';
    btn.innerText = 'Auto-Fill Empty Days';
    btn.style.cssText = `
        margin-right: 12px; 
        padding: 0 16px; 
        background: #2160ff; 
        color: white; 
        border: none; 
        border-radius: 6px; 
        cursor: pointer; 
        font-weight: 600; 
        font-size: 14px;
        height: 32px; 
        display: flex; 
        align-items: center; 
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        transition: background-color 0.2s;
    `;

    btn.addEventListener('click', runAutoFill);

    container.insertBefore(btn, requestTimeOffBtn);
}

// Observe the DOM for changes (necessary for SPAs where the header might load dynamically)
const observer = new MutationObserver(injectButton);
observer.observe(document.body, { childList: true, subtree: true });