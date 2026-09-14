#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const WINDOWS_TIME_ZONES = {
  'China Standard Time': 'Asia/Shanghai',
  'Eastern Standard Time': 'America/New_York',
  UTC: 'UTC'
};

function unfoldCalendar(text) {
  return text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '').split(/\r?\n/);
}

function parseLine(line) {
  const separator = line.indexOf(':');
  if (separator < 0) return null;
  const head = line.slice(0, separator).split(';');
  const params = {};
  head.slice(1).forEach(item => {
    const [key, ...value] = item.split('=');
    params[key.toUpperCase()] = value.join('=');
  });
  return { name: head[0].toUpperCase(), params, value: line.slice(separator + 1) };
}

function zonedTimeToUtc(parts, timeZone) {
  const desired = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour || 0, parts.minute || 0, parts.second || 0);
  let guess = desired;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).formatToParts(new Date(guess));
    const values = {};
    formatted.forEach(part => { if (part.type !== 'literal') values[part.type] = Number(part.value); });
    const represented = Date.UTC(values.year, values.month - 1, values.day, values.hour, values.minute, values.second);
    guess += desired - represented;
  }
  return new Date(guess);
}

function parseDateProperty(property, fallbackTimeZone = 'Asia/Shanghai') {
  const value = property.value.trim();
  const allDay = property.params.VALUE === 'DATE' || /^\d{8}$/.test(value);
  if (allDay) return { allDay: true, value: `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}` };
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (!match) throw new Error(`Unsupported calendar date: ${value}`);
  const parts = { year: +match[1], month: +match[2], day: +match[3], hour: +match[4], minute: +match[5], second: +match[6] };
  const sourceZone = WINDOWS_TIME_ZONES[property.params.TZID] || property.params.TZID || fallbackTimeZone;
  const date = match[7] === 'Z' ? new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)) : zonedTimeToUtc(parts, sourceZone);
  return { allDay: false, value: date.toISOString(), timeZone: sourceZone };
}

function addDays(value, amount) {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString();
}

function addCalendarDays(value, amount) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function parseRule(value) {
  return Object.fromEntries(value.split(';').map(part => { const [key, ...rest] = part.split('='); return [key, rest.join('=')]; }));
}

function expandEvent(event, now) {
  if (!event.rule) return [{ start: event.start.value, end: event.end.value, allDay: event.start.allDay }];
  const rule = parseRule(event.rule);
  if (!['DAILY', 'WEEKLY'].includes(rule.FREQ)) return [{ start: event.start.value, end: event.end.value, allDay: event.start.allDay }];
  const intervalDays = (rule.FREQ === 'WEEKLY' ? 7 : 1) * Number(rule.INTERVAL || 1);
  if (event.start.allDay) {
    const until = rule.UNTIL ? `${rule.UNTIL.slice(0, 4)}-${rule.UNTIL.slice(4, 6)}-${rule.UNTIL.slice(6, 8)}` : addCalendarDays(now.toISOString().slice(0, 10), 400);
    const count = Number(rule.COUNT || 1000);
    const result = [];
    let start = event.start.value;
    let end = event.end.value;
    for (let index = 0; index < count && start <= until && index < 1000; index += 1) {
      result.push({ start, end, allDay: true });
      start = addCalendarDays(start, intervalDays);
      end = addCalendarDays(end, intervalDays);
    }
    return result;
  }
  const until = rule.UNTIL ? parseDateProperty({ value: rule.UNTIL, params: {} }, event.start.timeZone).value : addDays(now.toISOString(), 400);
  const count = Number(rule.COUNT || 1000);
  const result = [];
  let start = event.start.value;
  let end = event.end.value;
  for (let index = 0; index < count && start <= until && index < 1000; index += 1) {
    result.push({ start, end, allDay: false });
    start = addDays(start, intervalDays);
    end = addDays(end, intervalDays);
  }
  return result;
}

function buildCalendarData(text, now = new Date()) {
  const lines = unfoldCalendar(text);
  const calendarZoneLine = lines.map(parseLine).find(item => item?.name === 'TZID');
  const timeZone = WINDOWS_TIME_ZONES[calendarZoneLine?.value] || calendarZoneLine?.value || 'Asia/Shanghai';
  const rawEvents = [];
  let current = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { current = {}; continue; }
    if (line === 'END:VEVENT') { if (current) rawEvents.push(current); current = null; continue; }
    if (!current) continue;
    const property = parseLine(line);
    if (!property) continue;
    if (property.name === 'DTSTART') current.start = parseDateProperty(property, timeZone);
    else if (property.name === 'DTEND') current.end = parseDateProperty(property, timeZone);
    else if (property.name === 'RRULE') current.rule = property.value;
    else if (property.name === 'STATUS') current.status = property.value;
    else if (property.name === 'TRANSP') current.transparency = property.value;
  }

  const windowStart = new Date(now);
  const windowEnd = new Date(now); windowEnd.setUTCDate(windowEnd.getUTCDate() + 400);
  const events = rawEvents
    .filter(event => event.start && event.end && event.status !== 'CANCELLED' && event.transparency !== 'TRANSPARENT')
    .flatMap(event => expandEvent(event, now))
    .filter(event => {
      const start = event.allDay ? new Date(`${event.start}T00:00:00Z`) : new Date(event.start);
      const end = event.allDay ? new Date(`${event.end}T00:00:00Z`) : new Date(event.end);
      return end >= windowStart && start <= windowEnd;
    })
    .sort((a, b) => a.start.localeCompare(b.start));

  return { version: 1, timeZone, updatedAt: now.toISOString(), events };
}

function main() {
  const args = process.argv.slice(2);
  const input = args[args.indexOf('--input') + 1];
  const output = args[args.indexOf('--output') + 1];
  if (!input || !output) throw new Error('Usage: node scripts/build-calendar-data.cjs --input calendar.ics --output assets/data/calendar.json');
  const data = buildCalendarData(fs.readFileSync(input, 'utf8'));
  let previous = null;
  try { previous = JSON.parse(fs.readFileSync(output, 'utf8')); } catch {}
  if (previous && previous.timeZone === data.timeZone && JSON.stringify(previous.events) === JSON.stringify(data.events)) return;
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(data, null, 2)}\n`);
}

if (require.main === module) main();
module.exports = { buildCalendarData, parseDateProperty, unfoldCalendar };
