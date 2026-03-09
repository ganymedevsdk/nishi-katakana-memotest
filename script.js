/* ============================================================
   NISHI KATAKANA MEMOTEST — Sumi-e Okami Premium Game Logic
   墨絵 · Ink Wash · Divine Brushwork · Zen Audio
   ============================================================ */

'use strict';

// ==================== KATAKANA DATA ====================
const ALL_KATAKANA = [
  { kana: 'ア', romaji: 'a' },   { kana: 'イ', romaji: 'i' },
  { kana: 'ウ', romaji: 'u' },   { kana: 'エ', romaji: 'e' },
  { kana: 'オ', romaji: 'o' },   { kana: 'カ', romaji: 'ka' },
  { kana: 'キ', romaji: 'ki' },  { kana: 'ク', romaji: 'ku' },
  { kana: 'ケ', romaji: 'ke' },  { kana: 'コ', romaji: 'ko' },
  { kana: 'サ', romaji: 'sa' },  { kana: 'シ', romaji: 'shi' },
  { kana: 'ス', romaji: 'su' },  { kana: 'セ', romaji: 'se' },
  { kana: 'ソ', romaji: 'so' },  { kana: 'タ', romaji: 'ta' },
  { kana: 'チ', romaji: 'chi' }, { kana: 'ツ', romaji: 'tsu' },
  { kana: 'テ', romaji: 'te' },  { kana: 'ト', romaji: 'to' },
  { kana: 'ナ', romaji: 'na' },  { kana: 'ニ', romaji: 'ni' },
  { kana: 'ヌ', romaji: 'nu' },  { kana: 'ネ', romaji: 'ne' },
  { kana: 'ノ', romaji: 'no' },  { kana: 'ハ', romaji: 'ha' },
  { kana: 'ヒ', romaji: 'hi' },  { kana: 'フ', romaji: 'fu' },
  { kana: 'ヘ', romaji: 'he' },  { kana: 'ホ', romaji: 'ho' },
  { kana: 'マ', romaji: 'ma' },  { kana: 'ミ', romaji: 'mi' },
  { kana: 'ム', romaji: 'mu' },  { kana: 'メ', romaji: 'me' },
  { kana: 'モ', romaji: 'mo' },  { kana: 'ヤ', romaji: 'ya' },
  { kana: 'ユ', romaji: 'yu' },  { kana: 'ヨ', romaji: 'yo' },
  { kana: 'ラ', romaji: 'ra' },  { kana: 'リ', romaji: 'ri' },
  { kana: 'ル', romaji: 'ru' },  { kana: 'レ', romaji: 're' },
  { kana: 'ロ', romaji: 'ro' },  { kana: 'ワ', romaji: 'wa' },
  { kana: 'ヲ', romaji: 'wo' },  { kana: 'ン', romaji: 'n' },
];

// ==================== DIFFICULTY ====================
const DIFFICULTIES = {
  easy:   { pairs: 12, jp: '🌸 かんたん', es: 'Fácil' },
  normal: { pairs: 18, jp: '🏯 ふつう',   es: 'Intermedio' },
  hard:   { pairs: 23, jp: '🐉 むずかしい', es: 'Experto' },
};

// ==================== AUDIO ENGINE ====================
let audioCtx = null;
let masterGain = null;
let soundOn = true;
const MAX_CONCURRENT_SOUNDS = 12;
const activeSources = new Set();

function ctx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function trackSource(source) {
  if (activeSources.size >= MAX_CONCURRENT_SOUNDS) {
    const oldest = activeSources.values().next().value;
    try { oldest.stop(); } catch (_) {}
    activeSources.delete(oldest);
  }
  activeSources.add(source);
  source.onended = () => {
    try { source.disconnect(); } catch (_) {}
    activeSources.delete(source);
  };
}

window.addEventListener('beforeunload', () => {
  if (audioCtx) {
    activeSources.forEach(s => { try { s.stop(); s.disconnect(); } catch (_) {} });
    activeSources.clear();
    audioCtx.close();
    audioCtx = null;
  }
});

function addReverb(node, dest, c) {
  const dry = c.createGain();
  const wet = c.createGain();
  const delay = c.createDelay();
  const feedback = c.createGain();

  dry.gain.value = 0.7;
  wet.gain.value = 0.3;
  delay.delayTime.value = 0.08;
  feedback.gain.value = 0.25;

  node.connect(dry);
  dry.connect(dest);
  node.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wet);
  wet.connect(dest);
}

// ---- Furin (Wind chime) ----
function playFurin() {
  if (!soundOn) return;
  try {
    const c = ctx();
    const now = c.currentTime;
    const freqs = [2093, 2637, 3136, 3520, 4192];
    freqs.forEach((f, i) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.88, now + 2.2);
      const t0 = now + i * 0.08;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.04, t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 2.4);
      osc.connect(g);
      addReverb(g, masterGain, c);
      trackSource(osc);
      osc.start(t0);
      osc.stop(t0 + 2.6);
    });
  } catch (_) {}
}

// ---- Paper flip / Koto ----
function playKoto() {
  if (!soundOn) return;
  try {
    const c = ctx();
    const now = c.currentTime;
    const fundamental = 520 + Math.random() * 150;
    const osc1 = c.createOscillator();
    const osc2 = c.createOscillator();
    const g1 = c.createGain();
    const g2 = c.createGain();
    const filter = c.createBiquadFilter();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(fundamental, now);
    osc1.frequency.exponentialRampToValueAtTime(fundamental * 0.75, now + 0.25);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(fundamental * 1.5, now);
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 1.2;
    g1.gain.setValueAtTime(0, now);
    g1.gain.linearRampToValueAtTime(0.14, now + 0.008);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    g2.gain.setValueAtTime(0.04, now);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc1.connect(filter);
    filter.connect(g1);
    g1.connect(masterGain);
    osc2.connect(g2);
    g2.connect(masterGain);
    trackSource(osc1);
    trackSource(osc2);
    osc1.start(now);
    osc1.stop(now + 0.32);
    osc2.start(now);
    osc2.stop(now + 0.22);
  } catch (_) {}
}

// ---- Rin (Celestial bell) ----
function playRin() {
  if (!soundOn) return;
  try {
    const c = ctx();
    const now = c.currentTime;
    const partials = [
      { f: 880,  g: 0.10, dur: 2.8 },
      { f: 1108, g: 0.07, dur: 2.5 },
      { f: 1397, g: 0.05, dur: 2.2 },
      { f: 1760, g: 0.035, dur: 1.8 },
      { f: 2217, g: 0.02, dur: 1.4 },
      { f: 3520, g: 0.008, dur: 1.0 },
    ];
    partials.forEach(({ f, g: vol, dur }) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.setValueAtTime(f, now + 0.5);
      osc.frequency.linearRampToValueAtTime(f * 0.997, now + 1.0);
      osc.frequency.linearRampToValueAtTime(f * 1.002, now + 1.5);
      osc.frequency.linearRampToValueAtTime(f, now + 2.0);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.015);
      gain.gain.setValueAtTime(vol * 0.92, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(gain);
      addReverb(gain, masterGain, c);
      trackSource(osc);
      osc.start(now);
      osc.stop(now + dur + 0.3);
    });
  } catch (_) {}
}

// ---- Hyoshigi (wood tap) ----
function playHyoshigi() {
  if (!soundOn) return;
  try {
    const c = ctx();
    const now = c.currentTime;
    for (let i = 0; i < 2; i++) {
      const t = now + i * 0.15;
      const osc = c.createOscillator();
      const noise = c.createOscillator();
      const g1 = c.createGain();
      const g2 = c.createGain();
      const filter = c.createBiquadFilter();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.06);
      filter.type = 'lowpass';
      filter.frequency.value = 600;
      filter.Q.value = 1;
      g1.gain.setValueAtTime(0, t);
      g1.gain.linearRampToValueAtTime(0.12, t + 0.005);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      noise.type = 'sine';
      noise.frequency.value = 180 - i * 30;
      g2.gain.setValueAtTime(0.05, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(filter);
      filter.connect(g1);
      g1.connect(masterGain);
      noise.connect(g2);
      g2.connect(masterGain);
      trackSource(osc);
      trackSource(noise);
      osc.start(t);
      osc.stop(t + 0.15);
      noise.start(t);
      noise.stop(t + 0.08);
    }
  } catch (_) {}
}

// ---- Matsuri (victory fanfare) ----
function playMatsuri() {
  if (!soundOn) return;
  try {
    const c = ctx();
    const now = c.currentTime;
    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.12;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(65 + i * 12, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.15);
      g.gain.setValueAtTime(0.15 + i * 0.02, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(g);
      g.connect(masterGain);
      trackSource(osc);
      osc.start(t);
      osc.stop(t + 0.22);
    }
    const melody = [
      { freq: 1046.5, time: 0.55, dur: 0.22 },
      { freq: 1108.7, time: 0.75, dur: 0.18 },
      { freq: 1396.9, time: 0.92, dur: 0.22 },
      { freq: 1568.0, time: 1.12, dur: 0.26 },
      { freq: 1661.2, time: 1.38, dur: 0.24 },
      { freq: 2093.0, time: 1.65, dur: 0.45 },
      { freq: 1568.0, time: 2.10, dur: 0.35 },
      { freq: 2093.0, time: 2.50, dur: 0.75 },
    ];
    melody.forEach(({ freq, time, dur }) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + time;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.015);
      g.gain.setValueAtTime(0.10, t + dur * 0.6);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(g);
      addReverb(g, masterGain, c);
      trackSource(osc);
      osc.start(t);
      osc.stop(t + dur + 0.4);
    });
    setTimeout(() => playFurin(), 600);
  } catch (_) {}
}

// ==================== SAKURA PETALS ====================
function createSakuraPetals() {
  const field = document.getElementById('sakuraField');
  if (!field) return;
  field.innerHTML = '';
  const count = window.innerWidth < 500 ? 8 : 14;
  for (let i = 0; i < count; i++) {
    const flower = document.createElement('div');
    flower.className = 'sakura-flower';
    flower.style.setProperty('--petal-size', `${22 + Math.random() * 14}px`);
    flower.style.setProperty('--fall-dur', `${10 + Math.random() * 10}s`);
    flower.style.setProperty('--fall-delay', `${Math.random() * 12}s`);
    flower.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 140}px`);
    flower.style.setProperty('--spin', `${250 + Math.random() * 450}deg`);
    flower.style.left = `${Math.random() * 100}%`;
    flower.style.top = `-${15 + Math.random() * 40}px`;
    for (let p = 0; p < 4; p++) {
      const petal = document.createElement('span');
      petal.className = 'petal';
      flower.appendChild(petal);
    }
    const center = document.createElement('span');
    center.className = 'center';
    flower.appendChild(center);
    field.appendChild(flower);
  }
}

// ==================== INK SPLASH EFFECT (Okami divine brush) ====================
function createInkSplash(element) {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  // Main splash
  const splash = document.createElement('div');
  splash.className = 'ink-splash';
  splash.style.left = cx + 'px';
  splash.style.top = cy + 'px';
  splash.style.transform = 'translate(-50%, -50%)';
  document.body.appendChild(splash);
  setTimeout(() => splash.remove(), 800);

  // Secondary smaller splashes (ink droplets flying out)
  for (let i = 0; i < 3; i++) {
    const droplet = document.createElement('div');
    droplet.className = 'ink-splash';
    const angle = (Math.PI * 2 / 3) * i + Math.random() * 0.5;
    const dist = 20 + Math.random() * 30;
    droplet.style.left = (cx + Math.cos(angle) * dist) + 'px';
    droplet.style.top = (cy + Math.sin(angle) * dist) + 'px';
    droplet.style.transform = 'translate(-50%, -50%) scale(0.5)';
    droplet.style.animationDelay = (0.05 + i * 0.05) + 's';
    document.body.appendChild(droplet);
    setTimeout(() => droplet.remove(), 900);
  }
}

// ==================== FLOWING INK PARTICLES (Okami atmosphere) ====================
let inkParticles = [];

function createInkParticles() {
  // Remove existing
  inkParticles.forEach(p => p.remove());
  inkParticles = [];

  const count = window.innerWidth < 600 ? 6 : 12;
  const gameScreen = document.getElementById('gameScreen');
  if (!gameScreen) return;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'ink-particle';
    particle.style.left = (Math.random() * 100) + '%';
    particle.style.top = (20 + Math.random() * 60) + '%';
    particle.style.setProperty('--ink-dur', (6 + Math.random() * 8) + 's');
    particle.style.setProperty('--ink-delay', (Math.random() * 5) + 's');
    particle.style.setProperty('--ink-dx', (40 + Math.random() * 80) + 'px');
    particle.style.setProperty('--ink-dy', (-50 - Math.random() * 100) + 'px');
    particle.style.setProperty('--ink-dx2', (80 + Math.random() * 120) + 'px');
    particle.style.setProperty('--ink-dy2', (-100 - Math.random() * 150) + 'px');
    particle.style.width = (2 + Math.random() * 3) + 'px';
    particle.style.height = (2 + Math.random() * 3) + 'px';
    gameScreen.appendChild(particle);
    inkParticles.push(particle);
  }
}

function removeInkParticles() {
  inkParticles.forEach(p => p.remove());
  inkParticles = [];
}

// ==================== INK CANVAS (brush stroke on match) ====================
let inkCanvasCtx = null;

function initInkCanvas() {
  const canvas = document.getElementById('inkCanvas');
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  inkCanvasCtx = canvas.getContext('2d');
}

function drawInkBrushStroke(x, y) {
  if (!inkCanvasCtx) initInkCanvas();
  if (!inkCanvasCtx) return;

  const c = inkCanvasCtx;
  const canvas = c.canvas;

  // Sumi ink brush stroke — Okami style divine line
  const points = [];
  const length = 60 + Math.random() * 40;
  const angle = Math.random() * Math.PI * 2;
  const steps = 12;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = x + Math.cos(angle) * length * (t - 0.5) + (Math.random() - 0.5) * 8;
    const py = y + Math.sin(angle) * length * (t - 0.5) + (Math.random() - 0.5) * 8;
    const width = Math.sin(t * Math.PI) * (3 + Math.random() * 2);
    points.push({ x: px, y: py, w: width });
  }

  // Draw the brush stroke
  c.save();
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.strokeStyle = 'rgba(42, 157, 143, 0.25)';
  c.globalCompositeOperation = 'source-over';

  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    c.beginPath();
    c.lineWidth = (p0.w + p1.w) / 2;
    c.moveTo(p0.x, p0.y);
    c.lineTo(p1.x, p1.y);
    c.stroke();
  }

  // Add ink droplets at the end
  const last = points[points.length - 1];
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.fillStyle = `rgba(42, 157, 143, ${0.1 + Math.random() * 0.15})`;
    c.arc(
      last.x + (Math.random() - 0.5) * 15,
      last.y + (Math.random() - 0.5) * 15,
      1 + Math.random() * 2,
      0, Math.PI * 2
    );
    c.fill();
  }

  c.restore();

  // Fade out the stroke
  setTimeout(() => {
    fadeInkCanvas();
  }, 1500);
}

function fadeInkCanvas() {
  if (!inkCanvasCtx) return;
  const c = inkCanvasCtx;
  const canvas = c.canvas;
  let opacity = 1;

  function fade() {
    opacity -= 0.05;
    if (opacity <= 0) {
      c.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    c.save();
    c.globalCompositeOperation = 'destination-out';
    c.fillStyle = `rgba(0, 0, 0, 0.05)`;
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.restore();
    requestAnimationFrame(fade);
  }
  fade();
}

// ==================== CONFETTI (Sakura + Ink style) ====================
function createSakuraConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const c2d = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#f0a0b8', '#d4708f', '#2a9d8f', '#c0451e', '#c9a96e', '#fce4ec', '#6b8db5', '#1e1a16'];
  const pieces = [];

  for (let i = 0; i < 120; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: -15 - Math.random() * 120,
      w: 4 + Math.random() * 10,
      h: 3 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 1.5 + Math.random() * 3.5,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.25,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.04 + Math.random() * 0.08,
      isPetal: Math.random() > 0.4,
      isInk: Math.random() > 0.8,
    });
  }

  let raf;
  function draw() {
    c2d.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    pieces.forEach(p => {
      if (p.y > canvas.height + 30) return;
      alive = true;
      p.y += p.speed;
      p.x += Math.sin(p.wobble) * 1.2;
      p.wobble += p.wobbleSpeed;
      p.angle += p.spin;

      c2d.save();
      c2d.translate(p.x, p.y);
      c2d.rotate(p.angle);
      c2d.fillStyle = p.color;

      if (p.isInk) {
        // Ink splatter dot
        c2d.beginPath();
        c2d.arc(0, 0, p.w * 0.4, 0, Math.PI * 2);
        c2d.fill();
        // Ink drip
        c2d.beginPath();
        c2d.moveTo(0, p.w * 0.4);
        c2d.lineTo(-1, p.w * 1.2);
        c2d.lineTo(1, p.w * 1.2);
        c2d.fill();
      } else if (p.isPetal) {
        c2d.beginPath();
        c2d.moveTo(0, -p.h);
        c2d.quadraticCurveTo(p.w, -p.h * 0.5, 0, p.h);
        c2d.quadraticCurveTo(-p.w, -p.h * 0.5, 0, -p.h);
        c2d.fill();
      } else {
        c2d.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }

      c2d.restore();
    });

    if (alive) {
      raf = requestAnimationFrame(draw);
    }
  }

  draw();
  setTimeout(() => {
    cancelAnimationFrame(raf);
    c2d.clearRect(0, 0, canvas.width, canvas.height);
  }, 6000);
}

// ==================== GAME STATE ====================
const state = {
  difficulty: 'easy',
  cards: [],
  flipped: [],
  matched: new Set(),
  moves: 0,
  startTime: null,
  timerInterval: null,
  isLocked: false,
  bestScores: {},
};

// ==================== DOM ====================
const screens = {
  splash:  document.getElementById('splashScreen'),
  game:    document.getElementById('gameScreen'),
  victory: document.getElementById('victoryScreen'),
};

const el = {
  grid:         document.getElementById('cardsGrid'),
  timer:        document.getElementById('timer'),
  moves:        document.getElementById('moves'),
  pairsFound:   document.getElementById('pairsFound'),
  pairsTotal:   document.getElementById('pairsTotal'),
  diffPill:     document.getElementById('difficultyPill'),
  bestDisplay:  document.getElementById('bestDisplay'),
  finalTime:    document.getElementById('finalTime'),
  finalMoves:   document.getElementById('finalMoves'),
  finalPairs:   document.getElementById('finalPairs'),
  bestMsg:      document.getElementById('victoryBestMsg'),
  btnSound:     document.getElementById('btnSound'),
  btnBack:      document.getElementById('btnBack'),
  btnPlayAgain: document.getElementById('btnPlayAgain'),
  btnMenu:      document.getElementById('btnMenu'),
};

// ==================== SCREEN MANAGEMENT ====================
function showScreen(name) {
  Object.entries(screens).forEach(([k, scr]) => {
    const active = k === name;
    scr.classList.toggle('hidden', !active);
    scr.setAttribute('aria-hidden', String(!active));
  });

  if (name === 'game') {
    createInkParticles();
    initInkCanvas();
  } else {
    removeInkParticles();
  }
}

// ==================== GAME INIT ====================
function startGame(diff) {
  state.difficulty = diff;
  const cfg = DIFFICULTIES[diff];

  clearInterval(state.timerInterval);
  state.cards = [];
  state.flipped = [];
  state.matched = new Set();
  state.moves = 0;
  state.startTime = null;
  state.isLocked = false;

  el.pairsTotal.textContent = cfg.pairs;
  el.pairsFound.textContent = '0';
  el.moves.textContent = '0';
  el.timer.textContent = '00:00';
  el.diffPill.textContent = cfg.jp;
  updateBestDisplay();

  const shuffledAll = shuffle([...ALL_KATAKANA]);
  const pool = shuffledAll.slice(0, cfg.pairs);
  state.cards = shuffle(
    pool.flatMap((item, pid) => [
      { ...item, pairId: pid, uid: `${pid}a` },
      { ...item, pairId: pid, uid: `${pid}b` },
    ])
  );

  renderCards();
  showScreen('game');
  setTimeout(() => playFurin(), 280);
}

// ==================== RENDER ====================
function renderCards() {
  el.grid.innerHTML = '';

  state.cards.forEach((card, i) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.setAttribute('role', 'listitem');
    div.setAttribute('tabindex', '0');
    div.setAttribute('aria-label', `Tarjeta ${i + 1}`);
    div.dataset.idx = i;

    div.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back">
          <img class="card-back-logo"
               src="assets/logo/nishi-logo.png"
               alt=""
               loading="lazy"
               draggable="false">
        </div>
        <div class="card-face card-front">
          <span class="card-kana">${card.kana}</span>
          <span class="card-romaji">${card.romaji}</span>
        </div>
      </div>`;

    // Staggered entrance
    div.style.opacity = '0';
    div.style.transform = 'scale(0.6) translateY(20px)';

    div.addEventListener('click', () => onCardClick(i));
    div.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onCardClick(i);
      }
    });

    el.grid.appendChild(div);

    // Center-out stagger pattern
    const cols = Math.floor(el.grid.offsetWidth / 75) || 5;
    const row = Math.floor(i / cols);
    const col = i % cols;
    const centerCol = (cols - 1) / 2;
    const centerRow = (Math.ceil(state.cards.length / cols) - 1) / 2;
    const dist = Math.sqrt((col - centerCol) ** 2 + (row - centerRow) ** 2);
    const delay = 30 + dist * 35;

    setTimeout(() => {
      div.style.transition = 'opacity 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      div.style.opacity = '1';
      div.style.transform = 'scale(1) translateY(0)';
      setTimeout(() => {
        div.style.transition = '';
        div.style.opacity = '';
        div.style.transform = '';
      }, 550);
    }, delay);
  });
}

// ==================== CARD CLICK ====================
function onCardClick(i) {
  if (state.isLocked) return;
  if (state.matched.has(state.cards[i].pairId)) return;
  if (state.flipped.includes(i)) return;

  if (!state.startTime) {
    state.startTime = Date.now();
    state.timerInterval = setInterval(tickTimer, 200);
  }

  ctx();
  flipCard(i, true);
  playKoto();

  state.flipped.push(i);

  if (state.flipped.length === 2) {
    state.moves++;
    el.moves.textContent = state.moves;
    evaluate();
  }
}

function flipCard(i, up) {
  const cardEl = el.grid.children[i];
  if (!cardEl) return;
  cardEl.classList.toggle('flipped', up);
  const c = state.cards[i];
  cardEl.setAttribute('aria-label', up ? `${c.kana} (${c.romaji})` : `Tarjeta ${i + 1}`);
}

// ==================== EVALUATE PAIR ====================
function evaluate() {
  const [a, b] = state.flipped;
  const cA = state.cards[a];
  const cB = state.cards[b];

  if (cA.pairId === cB.pairId) {
    // MATCH — Okami divine moment
    playRin();
    state.matched.add(cA.pairId);
    state.flipped = [];

    const elA = el.grid.children[a];
    const elB = el.grid.children[b];
    elA.classList.add('matched');
    elB.classList.add('matched');
    elA.setAttribute('aria-label', `${cA.kana} — ペア！`);
    elB.setAttribute('aria-label', `${cB.kana} — ペア！`);

    // Ink splash effects
    createInkSplash(elA);
    createInkSplash(elB);

    // Ink brush stroke on canvas
    const rectA = elA.getBoundingClientRect();
    const rectB = elB.getBoundingClientRect();
    const midX = (rectA.left + rectA.width / 2 + rectB.left + rectB.width / 2) / 2;
    const midY = (rectA.top + rectA.height / 2 + rectB.top + rectB.height / 2) / 2;
    drawInkBrushStroke(midX, midY);

    el.pairsFound.textContent = state.matched.size;

    if (state.matched.size === DIFFICULTIES[state.difficulty].pairs) {
      clearInterval(state.timerInterval);
      setTimeout(showVictory, 700);
    }
  } else {
    // WRONG
    playHyoshigi();
    state.isLocked = true;

    const elA = el.grid.children[a];
    const elB = el.grid.children[b];
    elA.classList.add('wrong');
    elB.classList.add('wrong');

    setTimeout(() => {
      elA.classList.remove('wrong');
      elB.classList.remove('wrong');
      flipCard(a, false);
      flipCard(b, false);
      state.flipped = [];
      state.isLocked = false;
    }, 950);
  }
}

// ==================== TIMER ====================
function tickTimer() {
  if (!state.startTime) return;
  el.timer.textContent = fmtTime(Date.now() - state.startTime);
}

function fmtTime(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// ==================== BEST SCORES ====================
function updateBestDisplay() {
  const b = state.bestScores[state.difficulty];
  el.bestDisplay.textContent = b ? fmtTime(b.time) : '—';
}

function loadBest() {
  try {
    const s = localStorage.getItem('nishi-katakana-best');
    if (s) state.bestScores = JSON.parse(s);
  } catch (_) {}
}

function saveBest() {
  try {
    localStorage.setItem('nishi-katakana-best', JSON.stringify(state.bestScores));
  } catch (_) {}
}

// ==================== VICTORY ====================
function showVictory() {
  playMatsuri();
  createSakuraConfetti();

  const elapsed = Date.now() - state.startTime;

  el.finalTime.textContent = fmtTime(elapsed);
  el.finalMoves.textContent = state.moves;
  el.finalPairs.textContent = state.matched.size;

  const key = state.difficulty;
  const prev = state.bestScores[key];
  if (!prev || elapsed < prev.time) {
    state.bestScores[key] = { time: elapsed, moves: state.moves };
    saveBest();
    el.bestMsg.textContent = prev
      ? '🏆 しんきろく！ ¡Nuevo récord!'
      : '🏆 はじめてクリア！ ¡Primera vez!';
  } else {
    el.bestMsg.textContent = `きろく: ${fmtTime(prev.time)}  (${prev.moves} て)`;
  }

  updateBestDisplay();
  showScreen('victory');
}

// ==================== UTILITIES ====================
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ==================== EVENT LISTENERS ====================

// Difficulty buttons
document.querySelectorAll('.btn-level').forEach(btn => {
  btn.addEventListener('click', () => startGame(btn.dataset.difficulty));
});

// Sound toggle
el.btnSound.addEventListener('click', () => {
  soundOn = !soundOn;
  el.btnSound.classList.toggle('muted', !soundOn);
  el.btnSound.setAttribute('aria-label', soundOn ? 'おと ON / Sonido' : 'おと OFF / Silencio');
  if (soundOn) ctx();
});

// Back to menu
el.btnBack.addEventListener('click', () => {
  clearInterval(state.timerInterval);
  showScreen('splash');
  playFurin();
});

// Play again
el.btnPlayAgain.addEventListener('click', () => startGame(state.difficulty));

// Menu from victory
el.btnMenu.addEventListener('click', () => {
  showScreen('splash');
  playFurin();
});

// Keyboard: Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!screens.victory.classList.contains('hidden')) {
      showScreen('splash');
      playFurin();
    } else if (!screens.game.classList.contains('hidden')) {
      clearInterval(state.timerInterval);
      showScreen('splash');
    }
  }
  if (e.key === ' ' && e.target.classList.contains('card')) {
    e.preventDefault();
  }
});

// Resize handling
window.addEventListener('resize', () => {
  const cv = document.getElementById('confettiCanvas');
  if (cv) { cv.width = window.innerWidth; cv.height = window.innerHeight; }
  const inkCv = document.getElementById('inkCanvas');
  if (inkCv) { inkCv.width = window.innerWidth; inkCv.height = window.innerHeight; }
});

// Orientation change — refresh ink particles
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    if (!screens.game.classList.contains('hidden')) {
      createInkParticles();
      initInkCanvas();
    }
  }, 300);
});

// ==================== BOOT ====================
loadBest();
createSakuraPetals();
