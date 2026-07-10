// store.jsx — habit data model, persistence, seeding, streak math
// Exposes window.HabitStore

const STORAGE_KEY = 'habit_tracker_v1';

// ── color palette (harmonious, oklch-derived) ──────────────────
const PALETTE = {
  ocean: { bg: '#E5EEF4', tint: '#1F6F8B', solid: '#2E7D9A' },
  clay:  { bg: '#F4E9E3', tint: '#A85638', solid: '#C2674A' },
  sage:  { bg: '#E7EEE6', tint: '#4C7A4E', solid: '#5C8C5E' },
  plum:  { bg: '#EFE7F0', tint: '#7A4E80', solid: '#915E97' },
  amber: { bg: '#F6EEDD', tint: '#9A7320', solid: '#BB8E2E' },
};
const COLOR_KEYS = Object.keys(PALETTE);

// ── date helpers ───────────────────────────────────────────────
function keyOf(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function todayKey() { return keyOf(new Date()); }

// ── seed ───────────────────────────────────────────────────────
function buildHistory(prob, currentStreak) {
  // returns { 'YYYY-MM-DD': true } for last 70 days
  const h = {};
  const today = new Date();
  // ensure a clean current streak ending today
  for (let i = 0; i < currentStreak; i++) h[keyOf(addDays(today, -i))] = true;
  // probabilistic older history
  for (let i = currentStreak; i < 70; i++) {
    if (Math.random() < prob) h[keyOf(addDays(today, -i))] = true;
  }
  return h;
}

function seed() {
  return [
    { id: 'h1', name: 'Drink water',        color: 'ocean', goal: '8 glasses',  freq: 'daily', history: buildHistory(0.82, 12) },
    { id: 'h2', name: 'Read',               color: 'clay',  goal: '20 minutes', freq: 'daily', history: buildHistory(0.7, 5) },
    { id: 'h3', name: 'Morning workout',    color: 'sage',  goal: '30 minutes', freq: 'daily', history: buildHistory(0.6, 0) },
    { id: 'h4', name: 'Meditate',           color: 'plum',  goal: '10 minutes', freq: 'daily', history: buildHistory(0.75, 8) },
    { id: 'h5', name: 'Lights out by 11',   color: 'amber', goal: 'Bedtime',    freq: 'daily', history: buildHistory(0.5, 2) },
  ];
}

// ── persistence ────────────────────────────────────────────────
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const seeded = seed();
  save(seeded);
  return seeded;
}
function save(habits) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(habits)); } catch (e) {}
}

// ── derived stats ──────────────────────────────────────────────
function currentStreak(habit) {
  let n = 0;
  const today = new Date();
  // count today if done, otherwise start from yesterday
  let start = habit.history[todayKey()] ? 0 : 1;
  for (let i = start; i < 400; i++) {
    if (habit.history[keyOf(addDays(today, -i))]) n++;
    else break;
  }
  return n;
}
function bestStreak(habit) {
  const keys = Object.keys(habit.history).filter(k => habit.history[k]).sort();
  let best = 0, run = 0, prev = null;
  for (const k of keys) {
    const d = new Date(k + 'T00:00:00');
    if (prev && (d - prev) === 86400000) run++;
    else run = 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}
function completionRate(habit, days = 30) {
  let done = 0;
  const today = new Date();
  for (let i = 0; i < days; i++) {
    if (habit.history[keyOf(addDays(today, -i))]) done++;
  }
  return Math.round((done / days) * 100);
}
function lastNDays(habit, n) {
  // returns array oldest→newest of {key, label, dow, done, isToday}
  const today = new Date();
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = addDays(today, -i);
    const k = keyOf(d);
    out.push({
      key: k,
      date: d,
      dow: d.getDay(),
      day: d.getDate(),
      done: !!habit.history[k],
      isToday: i === 0,
    });
  }
  return out;
}

window.HabitStore = {
  PALETTE, COLOR_KEYS,
  keyOf, addDays, todayKey,
  load, save, seed,
  currentStreak, bestStreak, completionRate, lastNDays,
};
