// ---- FLOATERS ----
const emojis = ['💸','🤑','💰','🪙','💵','🏦','🚔','🎰','🎲','🐔','🧅','🪤','📦','🔧','🧨','🪝','💎','🦜','🏚️','🚗','🤡','👮','📋','🧾','🍕','🎭','🐀','🧲','🪣','🦺'];
const floatersEl = document.getElementById('floaters');
for (let i = 0; i < 30; i++) {
  const el = document.createElement('div');
  el.className = 'floater';
  el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  el.style.left = Math.random() * 100 + '%';
  el.style.animationDuration = (8 + Math.random() * 14) + 's';
  el.style.animationDelay = (-Math.random() * 20) + 's';
  el.style.fontSize = (1 + Math.random() * 2) + 'rem';
  floatersEl.appendChild(el);
}

// ---- TITLE GLITCH ----
const titleEl = document.querySelector('.title-main');
titleEl.addEventListener('mouseenter', () => {
  titleEl.classList.remove('glitching');
  void titleEl.offsetWidth;
  titleEl.classList.add('glitching');
});
titleEl.addEventListener('animationend', () => {
  titleEl.classList.remove('glitching');
});

// ---- MODALS ----
function openModal(name) {
  document.getElementById('modal-' + name).classList.add('open');
}
function closeModal(name) {
  document.getElementById('modal-' + name).classList.remove('open');
}
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// ---- START GAME ----
function startGame() {
  // Dismiss the menu card
  const r = document.querySelector('.receipt');
  if (r) {
    r.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
    r.style.transform = 'rotate(-0.4deg) scale(0.9) translateY(-30px)';
    r.style.opacity = '0';
  }

  // Launch cinematic after menu exits
  setTimeout(() => {
    launchCinematic(() => {
      showGamePlaceholder();
    });
  }, 400);
}

function showGamePlaceholder() {
  const placeholder = document.createElement('div');
  placeholder.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:300',
    'background:var(--black)',
    'display:flex', 'align-items:center', 'justify-content:center',
    'flex-direction:column', 'gap:1.5rem'
  ].join(';');
  placeholder.innerHTML =
    '<div style="background:var(--paper);color:var(--ink);border:3px solid var(--ink);box-shadow:8px 8px 0 var(--yellow);padding:2.5rem 3rem;text-align:center;transform:rotate(-0.4deg);max-width:min(520px,90vw);">' +
      '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:3rem;text-shadow:3px 3px 0 var(--red)">TUESDAY, 7:43 AM</div>' +
      '<hr style="border:none;border-top:2px dashed rgba(26,18,0,0.3);margin:1rem 0">' +
      '<div style="font-family:\'Permanent Marker\',cursive;font-size:1.1rem;color:var(--red)">You wake up on the floor of your apartment.<br>Rent is due in 3 days. You have $0.00.</div>' +
      '<hr style="border:none;border-top:2px dashed rgba(26,18,0,0.3);margin:1rem 0">' +
      '<div style="font-family:\'VT323\',monospace;font-size:1rem;opacity:0.6;letter-spacing:0.1em">— GAME WORLD LOADING SOON —</div>' +
    '</div>' +
    '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:0.75rem;color:rgba(255,230,0,0.5);letter-spacing:0.15em;animation:blink 1s step-end infinite">[ THE ADVENTURE BEGINS HERE ]</div>';
  document.body.appendChild(placeholder);
}

// ---- QUIT ----
function openQuit() {
  document.getElementById('quit-overlay').classList.add('open');
}
function closeQuit() {
  document.getElementById('quit-overlay').classList.remove('open');
}
document.getElementById('quit-overlay').addEventListener('click', closeQuit);
document.addEventListener('keydown', () => {
  if (document.getElementById('quit-overlay').classList.contains('open')) {
    closeQuit();
  }
});