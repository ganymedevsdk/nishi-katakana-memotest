/* ============================================================
   NISHI KATAKANA MEMOTEST — Premium Game Logic
   Japanese-authentic sounds · Web Audio API
   Koto · Rin · Furin · Hyoshigi · Matsuri
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
  easy:   { pairs: 20, jp: '🌸 かんたん', es: 'Fácil' },
  normal: { pairs: 30, jp: '🏯 ふつう',   es: 'Intermedio' },
  hard:   { pairs: 46, jp: '🐉 むずかしい', es: 'Experto' },
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
    masterGain.gain.value = 0.85;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// Track and auto-cleanup audio sources to prevent memory leaks
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

// Cleanup audio context on page unload
window.addEventListener('beforeunload', () => {
  if (audioCtx) {
    activeSources.forEach(s => { try { s.stop(); s.disconnect(); } catch (_) {} });
    activeSources.clear();
    audioCtx.close();
    audioCtx = null;
  }
});

// Helper: create a simple reverb-like effect using feedback delay
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

// ---- FURIN (Wind chime) — ethereal glass harmonics ----
function playFurin() {
  if (!soundOn) return;
  try {
    const c = ctx();
    const now = c.currentTime;

    // Glass-like harmonics: high sine tones with slow decay
    const freqs = [2637, 3136, 3520, 4186]; // E7, G7, A7, C8
    freqs.forEach((f, i) => {
      const osc = c.createOscillator();
      const g = c.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.92, now + 1.5);

      const t0 = now + i * 0.06;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.06, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 1.6);

      osc.connect(g);
      addReverb(g, masterGain, c);
      trackSource(osc);

      osc.start(t0);
      osc.stop(t0 + 1.8);
    });
  } catch (_) {}
}

// ---- KOTO pluck — card flip sound ----
function playKoto() {
  if (!soundOn) return;
  try {
    const c = ctx();
    const now = c.currentTime;

    // Koto: sharp attack triangle wave + quick decay + subtle second harmonic
    const fundamental = 600 + Math.random() * 200; // slight variation each flip

    const osc1 = c.createOscillator();
    const osc2 = c.createOscillator();
    const g1 = c.createGain();
    const g2 = c.createGain();
    const filter = c.createBiquadFilter();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(fundamental, now);
    osc1.frequency.exponentialRampToValueAtTime(fundamental * 0.85, now + 0.18);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(fundamental * 2, now);

    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 2;

    // Sharp pluck envelope
    g1.gain.setValueAtTime(0, now);
    g1.gain.linearRampToValueAtTime(0.22, now + 0.003);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    g2.gain.setValueAtTime(0.08, now);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc1.connect(filter);
    filter.connect(g1);
    g1.connect(masterGain);

    osc2.connect(g2);
    g2.connect(masterGain);

    trackSource(osc1);
    trackSource(osc2);

    osc1.start(now);
    osc1.stop(now + 0.25);
    osc2.start(now);
    osc2.stop(now + 0.15);
  } catch (_) {}
}

// ---- RIN (Temple bell) — match sound ----
function playRin() {
  if (!soundOn) return;
  try {
    const c = ctx();
    const now = c.currentTime;

    // Buddhist bell: fundamental + multiple inharmonic partials with long sustain
    const partials = [
      { f: 880,  g: 0.14, dur: 2.0 }, // A5 fundamental
      { f: 1108, g: 0.10, dur: 1.8 }, // C#6
      { f: 1397, g: 0.07, dur: 1.5 }, // F6 (inharmonic partial — bell characteristic)
      { f: 1760, g: 0.05, dur: 1.3 }, // A6
      { f: 2217, g: 0.03, dur: 1.0 }, // C#7
      { f: 3520, g: 0.015, dur: 0.6 }, // shimmer
    ];

    partials.forEach(({ f, g: vol, dur }) => {
      const osc = c.createOscillator();
      const gain = c.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      // Slight vibrato for warmth
      osc.frequency.setValueAtTime(f, now + 0.3);
      osc.frequency.linearRampToValueAtTime(f * 0.999, now + 0.6);
      osc.frequency.linearRampToValueAtTime(f * 1.001, now + 0.9);
      osc.frequency.linearRampToValueAtTime(f, now + 1.2);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.008);
      gain.gain.setValueAtTime(vol * 0.95, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(gain);
      addReverb(gain, masterGain, c);
      trackSource(osc);

      osc.start(now);
      osc.stop(now + dur + 0.2);
    });
  } catch (_) {}
}

// ---- HYOSHIGI (Wooden clappers) — wrong match ----
function playHyoshigi() {
  if (!soundOn) return;
  try {
    const c = ctx();
    const now = c.currentTime;

    // Two sharp wood-block hits
    for (let i = 0; i < 2; i++) {
      const t = now + i * 0.12;

      const osc = c.createOscillator();
      const noise = c.createOscillator();
      const g1 = c.createGain();
      const g2 = c.createGain();
      const filter = c.createBiquadFilter();

      // Woody tone
      osc.type = 'square';
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.04);

      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 5;

      g1.gain.setValueAtTime(0, t);
      g1.gain.linearRampToValueAtTime(0.2, t + 0.002);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      // Noise component for wood texture
      noise.type = 'sawtooth';
      noise.frequency.value = 200 - i * 40;
      g2.gain.setValueAtTime(0.12, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(filter);
      filter.connect(g1);
      g1.connect(masterGain);
      noise.connect(g2);
      g2.connect(masterGain);

      trackSource(osc);
      trackSource(noise);

      osc.start(t);
      osc.stop(t + 0.1);
      noise.start(t);
      noise.stop(t + 0.05);
    }
  } catch (_) {}
}

// ---- MATSURI (Festival fanfare) — victory ----
function playMatsuri() {
  if (!soundOn) return;
  try {
    const c = ctx();
    const now = c.currentTime;

    // Opening taiko hits
    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.1;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80 + i * 15, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
      g.gain.setValueAtTime(0.25 + i * 0.03, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(g);
      g.connect(masterGain);
      trackSource(osc);
      osc.start(t);
      osc.stop(t + 0.15);
    }

    // Japanese pentatonic melody (miyako-bushi: C D♭ F G A♭)
    // Using a brighter register
    const melody = [
      { freq: 1046.5, time: 0.45, dur: 0.18 }, // C6
      { freq: 1108.7, time: 0.63, dur: 0.14 }, // Db6
      { freq: 1396.9, time: 0.78, dur: 0.18 }, // F6
      { freq: 1568.0, time: 0.98, dur: 0.22 }, // G6
      { freq: 1661.2, time: 1.22, dur: 0.20 }, // Ab6
      { freq: 2093.0, time: 1.45, dur: 0.35 }, // C7 (resolution)
      { freq: 1568.0, time: 1.82, dur: 0.30 }, // G6 (echo)
      { freq: 2093.0, time: 2.15, dur: 0.60 }, // C7 (final)
    ];

    melody.forEach(({ freq, time, dur }) => {
      const osc = c.createOscillator();
      const g = c.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const t = now + time;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.16, t + 0.01);
      g.gain.setValueAtTime(0.14, t + dur * 0.6);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(g);
      addReverb(g, masterGain, c);
      trackSource(osc);
      osc.start(t);
      osc.stop(t + dur + 0.3);
    });

    // Final furin shimmer
    setTimeout(() => playFurin(), 500);
  } catch (_) {}
}

// ==================== SAKURA PETALS ====================
function createSakuraPetals() {
  const field = document.getElementById('sakuraField');
  if (!field) return;
  field.innerHTML = '';

  const count = window.innerWidth < 500 ? 10 : 18;

  for (let i = 0; i < count; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.style.setProperty('--petal-size', `${12 + Math.random() * 14}px`);
    petal.style.setProperty('--fall-dur', `${7 + Math.random() * 8}s`);
    petal.style.setProperty('--fall-delay', `${Math.random() * 10}s`);
    petal.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 120}px`);
    petal.style.setProperty('--spin', `${200 + Math.random() * 400}deg`);
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.top = `-${10 + Math.random() * 30}px`;
    field.appendChild(petal);
  }
}

// ==================== CONFETTI (Sakura-style) ====================
function createSakuraConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const c2d = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Sakura-inspired colors
  const colors = ['#f0a0b8', '#d4708f', '#2a9d8f', '#c0451e', '#c9a96e', '#fce4ec', '#6b8db5'];
  const pieces = [];

  for (let i = 0; i < 140; i++) {
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
      // Some pieces are petal-shaped (round)
      isPetal: Math.random() > 0.5,
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

      if (p.isPetal) {
        // Petal shape
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

  const pool = ALL_KATAKANA.slice(0, cfg.pairs);
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
               src="assets/logo/logo nishi nihongo gakko.png"
               alt=""
               loading="lazy"
               draggable="false">
        </div>
        <div class="card-face card-front">
          <span class="card-kana">${card.kana}</span>
          <span class="card-romaji">${card.romaji}</span>
        </div>
      </div>`;

    // Staggered entrance animation (spring-animation inspired)
    div.style.opacity = '0';
    div.style.transform = 'scale(0.7) translateY(20px)';

    div.addEventListener('click', () => onCardClick(i));
    div.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onCardClick(i);
      }
    });

    el.grid.appendChild(div);

    // Stagger: each card enters with a slight delay, center-out pattern
    const cols = Math.floor(el.grid.offsetWidth / 90) || 5;
    const row = Math.floor(i / cols);
    const col = i % cols;
    const centerCol = (cols - 1) / 2;
    const centerRow = (Math.ceil(state.cards.length / cols) - 1) / 2;
    const dist = Math.sqrt((col - centerCol) ** 2 + (row - centerRow) ** 2);
    const delay = 30 + dist * 35;

    setTimeout(() => {
      div.style.transition = 'opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      div.style.opacity = '1';
      div.style.transform = 'scale(1) translateY(0)';
      // Clean up inline styles after entrance animation completes
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

  ctx(); // ensure audio unlocked
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
    // MATCH
    playRin();
    state.matched.add(cA.pairId);
    state.flipped = [];

    const elA = el.grid.children[a];
    const elB = el.grid.children[b];
    elA.classList.add('matched');
    elB.classList.add('matched');
    elA.setAttribute('aria-label', `${cA.kana} — ペア！`);
    elB.setAttribute('aria-label', `${cB.kana} — ペア！`);

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
  // Prevent scroll on space when focused on card
  if (e.key === ' ' && e.target.classList.contains('card')) {
    e.preventDefault();
  }
});

// Resize canvas
window.addEventListener('resize', () => {
  const cv = document.getElementById('confettiCanvas');
  if (cv) { cv.width = window.innerWidth; cv.height = window.innerHeight; }
});

// ==================== BOOT ====================
loadBest();
createSakuraPetals();
