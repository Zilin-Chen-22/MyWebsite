(() => {
  const app = document.querySelector('#availability-calendar');
  if (!app) return;

  const monthHeading = document.querySelector('#calendar-month');
  const weekdays = document.querySelector('#calendar-weekdays');
  const grid = document.querySelector('#calendar-grid');
  const agenda = document.querySelector('#calendar-agenda-list');
  const status = document.querySelector('#calendar-sync-status');
  const prev = document.querySelector('#calendar-prev');
  const next = document.querySelector('#calendar-next');
  const today = document.querySelector('#calendar-today');

  const copy = {
    en: {
      busy: 'Busy', allDay: 'Busy all day', more: count => `+${count} more`,
      noBusy: 'No published busy times in this month.', unavailable: 'Calendar temporarily unavailable.',
      updated: date => `Availability updated ${date}`, dayBusy: count => `${count} busy ${count === 1 ? 'period' : 'periods'}`,
      previous: 'Previous month', next: 'Next month', today: 'Today'
    },
    zh: {
      busy: '忙碌', allDay: '全天忙碌', more: count => `还有 ${count} 项`,
      noBusy: '本月没有已公开的忙碌时段。', unavailable: '日历暂时无法加载。',
      updated: date => `忙闲信息更新于 ${date}`, dayBusy: count => `${count} 个忙碌时段`,
      previous: '上个月', next: '下个月', today: '今天'
    }
  };

  let data = null;
  let language = document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  let visibleMonth = monthStart(new Date());

  function monthStart(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
  function pad(value) { return String(value).padStart(2, '0'); }
  function keyFromParts(year, month, day) { return `${year}-${pad(month)}-${pad(day)}`; }
  function addDaysToKey(key, amount) {
    const [year, month, day] = key.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + amount));
    return keyFromParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  }
  function zonedParts(value) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: data?.timeZone || 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date(value));
    const result = {};
    parts.forEach(part => { if (part.type !== 'literal') result[part.type] = Number(part.value); });
    return result;
  }
  function eventDayKeys(event) {
    if (event.allDay) {
      const keys = [];
      for (let key = event.start; key < event.end; key = addDaysToKey(key, 1)) keys.push(key);
      return keys;
    }
    const start = zonedParts(event.start);
    const end = zonedParts(new Date(new Date(event.end).getTime() - 1));
    const keys = [];
    for (let key = keyFromParts(start.year, start.month, start.day), final = keyFromParts(end.year, end.month, end.day); key <= final; key = addDaysToKey(key, 1)) keys.push(key);
    return keys;
  }
  function eventsByDay() {
    const result = new Map();
    (data?.events || []).forEach(event => eventDayKeys(event).forEach(key => {
      if (!result.has(key)) result.set(key, []);
      result.get(key).push(event);
    }));
    result.forEach(events => events.sort((a, b) => a.start.localeCompare(b.start)));
    return result;
  }
  function formatTime(event) {
    if (event.allDay) return copy[language].allDay;
    const formatter = new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
      timeZone: data.timeZone, hour: '2-digit', minute: '2-digit', hour12: language !== 'zh'
    });
    return `${formatter.format(new Date(event.start))}–${formatter.format(new Date(event.end))}`;
  }
  function render() {
    if (!data) return;
    const locale = language === 'zh' ? 'zh-CN' : 'en-US';
    const labels = copy[language];
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const byDay = eventsByDay();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevious = new Date(year, month, 0).getDate();
    const currentParts = zonedParts(new Date());
    const todayKey = keyFromParts(currentParts.year, currentParts.month, currentParts.day);

    monthHeading.textContent = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(visibleMonth);
    prev.setAttribute('aria-label', labels.previous);
    next.setAttribute('aria-label', labels.next);
    today.textContent = labels.today;
    weekdays.replaceChildren(...Array.from({ length: 7 }, (_, index) => {
      const label = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, 0, 4 + index)));
      const span = document.createElement('span'); span.textContent = label; return span;
    }));

    const cells = [];
    for (let index = 0; index < 42; index += 1) {
      let cellYear = year, cellMonth = month + 1, day = index - firstWeekday + 1, outside = false;
      if (day < 1) { outside = true; cellMonth -= 1; if (cellMonth < 1) { cellMonth = 12; cellYear -= 1; } day = daysInPrevious + day; }
      else if (day > daysInMonth) { outside = true; day -= daysInMonth; cellMonth += 1; if (cellMonth > 12) { cellMonth = 1; cellYear += 1; } }
      const key = keyFromParts(cellYear, cellMonth, day);
      const events = byDay.get(key) || [];
      const cell = document.createElement('div');
      cell.className = `calendar-day${outside ? ' is-outside' : ''}${key === todayKey ? ' is-today' : ''}`;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `${key}, ${labels.dayBusy(events.length)}`);
      const number = document.createElement('span'); number.className = 'calendar-day-number'; number.textContent = String(day); cell.append(number);
      events.slice(0, 3).forEach(event => { const item = document.createElement('span'); item.className = 'calendar-busy-block'; item.textContent = formatTime(event); cell.append(item); });
      if (events.length > 3) { const more = document.createElement('span'); more.className = 'calendar-more'; more.textContent = labels.more(events.length - 3); cell.append(more); }
      cells.push(cell);
    }
    grid.replaceChildren(...cells);

    const monthPrefix = `${year}-${pad(month + 1)}-`;
    const monthEvents = [...byDay.entries()].filter(([key]) => key.startsWith(monthPrefix) && !key.startsWith(`${year}-${pad(month + 1)}-00`));
    if (!monthEvents.length) {
      const empty = document.createElement('p'); empty.className = 'calendar-empty'; empty.textContent = labels.noBusy; agenda.replaceChildren(empty);
      return;
    }
    agenda.replaceChildren(...monthEvents.map(([key, events]) => {
      const [entryYear, entryMonth, entryDay] = key.split('-').map(Number);
      const item = document.createElement('article'); item.className = 'calendar-agenda-item';
      const date = document.createElement('time'); date.dateTime = key;
      date.innerHTML = `<strong>${entryDay}</strong><span>${new Intl.DateTimeFormat(locale, { month: 'short', weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(entryYear, entryMonth - 1, entryDay)))}</span>`;
      const slots = document.createElement('div');
      events.forEach(event => { const slot = document.createElement('p'); slot.innerHTML = `<strong>${labels.busy}</strong><span>${formatTime(event)}</span>`; slots.append(slot); });
      item.append(date, slots); return item;
    }));
  }

  fetch('assets/data/calendar.json', { cache: 'no-store' })
    .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
    .then(calendarData => {
      data = calendarData;
      const updated = new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', { dateStyle: 'medium', timeZone: data.timeZone }).format(new Date(data.updatedAt));
      status.textContent = copy[language].updated(updated);
      app.setAttribute('aria-busy', 'false');
      render();
    })
    .catch(() => { status.textContent = copy[language].unavailable; app.setAttribute('aria-busy', 'false'); app.classList.add('has-error'); });

  prev.addEventListener('click', () => { visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1); render(); });
  next.addEventListener('click', () => { visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1); render(); });
  today.addEventListener('click', () => { visibleMonth = monthStart(new Date()); render(); });
  window.addEventListener('zilin-language-change', event => {
    language = event.detail.language === 'zh' ? 'zh' : 'en';
    if (data) {
      const updated = new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', { dateStyle: 'medium', timeZone: data.timeZone }).format(new Date(data.updatedAt));
      status.textContent = copy[language].updated(updated);
    }
    render();
  });
})();
