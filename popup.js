const defaultSettings = {
    w1Start: '08:00', w1End: '12:00',
    bStart: '12:00', bEnd: '13:00',
    w2Start: '13:00', w2End: '17:00',
    maxDays: 5,
    fillUntilToday: false,
    projectName: '',
    autoSave: false
};

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(defaultSettings, (settings) => {
        document.getElementById('w1-start').value = settings.w1Start;
        document.getElementById('w1-end').value = settings.w1End;
        document.getElementById('b-start').value = settings.bStart;
        document.getElementById('b-end').value = settings.bEnd;
        document.getElementById('w2-start').value = settings.w2Start;
        document.getElementById('w2-end').value = settings.w2End;
        document.getElementById('max-days').value = settings.maxDays;

        const maxDaysInput = document.getElementById('max-days');
        const untilTodayCb = document.getElementById('fill-until-today');
        const autoSaveCb = document.getElementById('auto-save');

        maxDaysInput.value = settings.maxDays;
        untilTodayCb.checked = settings.fillUntilToday;
        autoSaveCb.checked = settings.autoSave;
        maxDaysInput.disabled = settings.fillUntilToday;

        untilTodayCb.addEventListener('change', (e) => {
            maxDaysInput.disabled = e.target.checked;
        });

        document.getElementById('project-name').value = settings.projectName;
    });
});

document.getElementById('save-btn').addEventListener('click', () => {
    const settings = {
        w1Start: document.getElementById('w1-start').value,
        w1End: document.getElementById('w1-end').value,
        bStart: document.getElementById('b-start').value,
        bEnd: document.getElementById('b-end').value,
        w2Start: document.getElementById('w2-start').value,
        w2End: document.getElementById('w2-end').value,
        maxDays: parseInt(document.getElementById('max-days').value, 10) || 5,
        fillUntilToday: document.getElementById('fill-until-today').checked,
        projectName: document.getElementById('project-name').value.trim(),
        autoSave: document.getElementById('auto-save').checked
    };

    chrome.storage.local.set(settings, () => {
        const btn = document.getElementById('save-btn');
        btn.innerText = 'Saved!';
        btn.style.background = '#28a745';

        setTimeout(() => {
            btn.innerText = 'Save Settings';
            btn.style.background = '#2160ff';
        }, 1500);
    });
});