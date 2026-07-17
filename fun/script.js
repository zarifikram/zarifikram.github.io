(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const randomBetween = (min, max) => Math.random() * (max - min) + min;
  const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

  const state = {
    audioContext: null,
    soundEnabled: false,
    dragLayer: 100,
    popupCount: 0,
    clauseCount: 0,
    evasions: 0,
    orchestraPlays: 0,
    lastNoiseAt: 0
  };

  const soundToggle = $('#sound-toggle');
  const popupLayer = $('#popup-layer');
  const popupTemplate = $('#popup-template');

  /* A tiny synthesizer: no audio file, no autoplay, no dignity. */
  function getAudioContext() {
    if (!state.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      state.audioContext = new AudioContext();
    }
    if (state.audioContext.state === 'suspended') {
      state.audioContext.resume().catch(() => {});
    }
    return state.audioContext;
  }

  function updateSoundButton() {
    if (!soundToggle) return;
    soundToggle.classList.toggle('is-on', state.soundEnabled);
    soundToggle.setAttribute('aria-pressed', String(state.soundEnabled));
    soundToggle.title = state.soundEnabled ? 'Mute the tiny synthesizer' : 'Wake the tiny synthesizer';
    soundToggle.innerHTML = state.soundEnabled
      ? '<span aria-hidden="true">♫</span> SOUND: SUSPICIOUS'
      : '<span aria-hidden="true">♫</span> SOUND: ASLEEP';
  }

  function setSound(enabled) {
    if (enabled && !getAudioContext()) {
      state.soundEnabled = false;
      if (soundToggle) soundToggle.textContent = 'SOUND: UNAVAILABLE';
      return;
    }
    state.soundEnabled = enabled;
    updateSoundButton();
  }

  function tone(frequency, delay = 0, duration = 0.08, type = 'square', volume = 0.025) {
    if (!state.soundEnabled) return;
    const context = getAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startsAt = context.currentTime + delay;
    const endsAt = startsAt + duration;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startsAt);
    oscillator.detune.setValueAtTime(randomBetween(-17, 17), startsAt);
    gain.gain.setValueAtTime(0.0001, startsAt);
    gain.gain.exponentialRampToValueAtTime(volume, startsAt + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, endsAt);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startsAt);
    oscillator.stop(endsAt + 0.02);
  }

  function playBlip(pitch = 440) {
    tone(pitch, 0, 0.045, 'square', 0.018);
    tone(pitch * 1.51, 0.035, 0.035, 'sine', 0.012);
  }

  function playGlitch() {
    const now = performance.now();
    if (now - state.lastNoiseAt < 420) return;
    state.lastNoiseAt = now;
    const base = randomBetween(70, 180);
    for (let index = 0; index < 5; index += 1) {
      tone(base * randomBetween(0.72, 3.8), index * 0.018, randomBetween(0.025, 0.09), index % 2 ? 'square' : 'sawtooth', 0.012);
    }
  }

  function playQuestionableNotes() {
    const notes = [261.63, 311.13, 369.99, 277.18, 466.16, 329.63, 196];
    notes.forEach((frequency, index) => {
      tone(frequency, index * 0.14, 0.19, index % 3 === 0 ? 'triangle' : 'square', 0.028);
    });
  }

  function playUnreliableOrchestra() {
    const latentScale = [110, 164.81, 246.94, 293.66, 220, 369.99, 277.18, 440, 123.47];
    latentScale.forEach((frequency, index) => {
      const offset = index * 0.105;
      tone(frequency, offset, 0.18, index % 2 ? 'sawtooth' : 'triangle', 0.021);
      if (index % 3 === 0) tone(frequency * 2.01, offset + 0.035, 0.09, 'square', 0.012);
    });
  }

  soundToggle?.addEventListener('click', () => {
    setSound(!state.soundEnabled);
    if (state.soundEnabled) playBlip(523.25);
  });

  /* Pop-ups are capped only because browsers, unlike terms, are mortal. */
  const popupCopy = {
    committee: {
      title: 'COMMITTEE_NOT_FOUND.DLL',
      message: 'Seven chairs have approved your request. None of the chairs contain people.'
    },
    victory: {
      title: 'IMPOSSIBLE CLICK RECORDED',
      message: 'You clicked the unclickable button. Your application for nothing has been escalated to nowhere.'
    },
    evasion: {
      title: 'MOUSE PROXIMITY VIOLATION',
      message: 'The button reports feeling perceived. Please look at a different rectangle.'
    },
    shuffle: {
      title: 'EVIDENCE REORGANIZED',
      message: 'Chronology has been removed for cleaning. Citations remain structurally anxious.'
    },
    authorship: {
      title: 'AUTHORSHIP VERIFICATION FAILED',
      message: 'The cat supplied stronger credentials and is now corresponding author.'
    },
    ikram: {
      title: 'IK-RAM_INSTALLATION_COMPLETE',
      message: '4096 MB acquired from a very convincing rectangle. The browser is now unreasonably personal.'
    },
    terms: {
      title: 'CONSENT NEARLY DETECTED',
      message: 'Additional clauses have been deployed between you and the alleged bottom.'
    },
    orchestra: {
      title: 'CONDUCTOR_LOST_THE_SCORE',
      message: 'The arrangement escaped its frame. Three notes are refusing supervision.'
    }
  };

  function spawnPopup(kind = 'committee') {
    if (!popupTemplate || !popupLayer) return;
    const copy = popupCopy[kind] || popupCopy.committee;
    const popup = popupTemplate.content.firstElementChild.cloneNode(true);
    const openPopups = $$('.spawned-window', popupLayer);

    if (openPopups.length >= 4) openPopups[0].remove();

    $('[data-popup-title]', popup).textContent = copy.title;
    $('[data-popup-message]', popup).textContent = copy.message;

    const estimatedWidth = Math.min(360, window.innerWidth - 40);
    const maxLeft = Math.max(20, window.innerWidth - estimatedWidth - 20);
    const maxTop = Math.max(30, window.innerHeight - 230);
    popup.style.left = `${randomBetween(20, maxLeft)}px`;
    popup.style.top = `${randomBetween(30, maxTop)}px`;
    popup.style.zIndex = String(100 + state.popupCount);
    state.popupCount += 1;

    $$('[data-close-popup]', popup).forEach((button) => {
      button.addEventListener('click', () => {
        playBlip(155.56);
        popup.remove();
      });
    });

    popupLayer.append(popup);
    installDraggable(popup);
    playGlitch();
  }

  $$('[data-popup]').forEach((trigger) => {
    trigger.addEventListener('click', () => spawnPopup(trigger.dataset.popup));
  });

  /* Draggable scraps preserve their rotation through individual transform properties. */
  function installDraggable(element) {
    if (!element || element.dataset.dragReady === 'true') return;
    element.dataset.dragReady = 'true';

    let activePointer = null;
    let startX = 0;
    let startY = 0;
    let originX = Number(element.dataset.dragX || 0);
    let originY = Number(element.dataset.dragY || 0);
    let nextX = originX;
    let nextY = originY;
    let moved = false;
    let suppressClick = false;

    element.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || activePointer !== null) return;
      const nestedControl = event.target.closest('a, button, input, textarea, select');
      const elementIsControl = element.matches('a, button');
      if (nestedControl && !(elementIsControl && nestedControl === element)) return;

      activePointer = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      originX = Number(element.dataset.dragX || 0);
      originY = Number(element.dataset.dragY || 0);
      nextX = originX;
      nextY = originY;
      moved = false;
      state.dragLayer += 1;
      element.style.zIndex = String(state.dragLayer);
      element.classList.add('is-dragging');
      element.setPointerCapture?.(activePointer);
    });

    element.addEventListener('pointermove', (event) => {
      if (event.pointerId !== activePointer) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      if (Math.hypot(deltaX, deltaY) > 5) moved = true;
      nextX = originX + deltaX;
      nextY = originY + deltaY;
      element.style.setProperty('--drag-x', `${nextX}px`);
      element.style.setProperty('--drag-y', `${nextY}px`);
    });

    const finishDrag = (event) => {
      if (event.pointerId !== activePointer) return;
      element.releasePointerCapture?.(activePointer);
      activePointer = null;
      element.classList.remove('is-dragging');
      element.dataset.dragX = String(nextX);
      element.dataset.dragY = String(nextY);
      suppressClick = moved;
      if (moved) playBlip(randomBetween(110, 240));
    };

    element.addEventListener('pointerup', finishDrag);
    element.addEventListener('pointercancel', finishDrag);
    element.addEventListener('click', (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressClick = false;
    }, true);
  }

  $$('.draggable, .draggable-card').forEach(installDraggable);

  /* Randomized enough to feel unstable, bounded enough to retain the biography. */
  function randomizeInitialLayout() {
    const narrow = window.matchMedia('(max-width: 760px)').matches;
    $$('.maze-link').forEach((link) => {
      const initialX = parseFloat(link.style.getPropertyValue('--x')) || 10;
      const initialY = parseFloat(link.style.getPropertyValue('--y')) || 10;
      const xJitter = narrow ? randomBetween(-2, 2) : randomBetween(-7, 7);
      const yJitter = narrow ? randomBetween(-2, 2) : randomBetween(-5, 5);
      link.style.setProperty('--x', `${clamp(initialX + xJitter, 1, narrow ? 63 : 84)}%`);
      link.style.setProperty('--y', `${clamp(initialY + yJitter, 2, 88)}%`);
      link.style.setProperty('--tilt', `${randomBetween(-11, 11).toFixed(2)}deg`);
    });

    $$('.paper-card').forEach((card) => {
      card.style.setProperty('--tilt', `${randomBetween(-4.2, 4.2).toFixed(2)}deg`);
      if (!narrow) {
        card.style.left = `${randomBetween(-16, 16).toFixed(0)}px`;
        card.style.top = `${randomBetween(-10, 10).toFixed(0)}px`;
      }
    });
  }

  randomizeInitialLayout();

  const paperCollage = $('#paper-collage');
  $('#shuffle-papers')?.addEventListener('click', () => {
    if (!paperCollage) return;
    const cards = $$('.paper-card', paperCollage);
    for (let index = cards.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [cards[index], cards[randomIndex]] = [cards[randomIndex], cards[index]];
    }
    cards.forEach((card) => {
      card.style.setProperty('--tilt', `${randomBetween(-7, 7).toFixed(2)}deg`);
      card.style.setProperty('--drag-x', '0px');
      card.style.setProperty('--drag-y', '0px');
      card.dataset.dragX = '0';
      card.dataset.dragY = '0';
      paperCollage.append(card);
    });
    spawnPopup('shuffle');
  });

  /* The no-click button uses local bounds, so it cannot flee under the footer. */
  const noClickArena = $('#no-click-arena');
  const noClickButton = $('#no-click-button');
  const evasionCounter = $('#evasion-counter');

  function moveNoClickButton() {
    if (!noClickArena || !noClickButton) return;
    const arena = noClickArena.getBoundingClientRect();
    const button = noClickButton.getBoundingClientRect();
    const halfWidth = button.width / 2;
    const halfHeight = button.height / 2;
    const centerX = randomBetween(halfWidth + 14, Math.max(halfWidth + 15, arena.width - halfWidth - 14));
    const centerY = randomBetween(halfHeight + 14, Math.max(halfHeight + 15, arena.height - halfHeight - 14));

    noClickButton.style.left = `${centerX}px`;
    noClickButton.style.top = `${centerY}px`;
    state.evasions += 1;
    if (evasionCounter) {
      const suffix = state.evasions > 9 ? ' / eligibility: evaporating' : '';
      evasionCounter.textContent = `Evasions: ${state.evasions}${suffix}`;
    }
    playBlip(randomBetween(180, 720));

    if (state.evasions === 6 || state.evasions === 15) spawnPopup('evasion');
  }

  noClickButton?.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'touch') moveNoClickButton();
  });

  noClickArena?.addEventListener('pointermove', (event) => {
    if (!noClickButton || event.pointerType === 'touch') return;
    const button = noClickButton.getBoundingClientRect();
    const distance = Math.hypot(
      event.clientX - (button.left + button.width / 2),
      event.clientY - (button.top + button.height / 2)
    );
    if (distance < 105) moveNoClickButton();
  });

  noClickButton?.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch') {
      event.preventDefault();
      moveNoClickButton();
    }
  });

  noClickButton?.addEventListener('click', () => spawnPopup('victory'));

  /* There is always another clause. */
  const termsScroll = $('#terms-scroll');
  const termsBody = $('#terms-body');
  const termsSentinel = $('#terms-sentinel');
  const termSubjects = [
    'the undersigned visitor',
    'any nearby algorithm',
    'the concept of Tuesday',
    'all latent representations of the visitor',
    'the cat acting as supervising counsel',
    'each unclicked hyperlink',
    'your least confident browser tab',
    'the Department of Perpetual Footnotes'
  ];
  const termVerbs = [
    'irrevocably lends',
    'temporarily denies having',
    'agrees to refrigerate',
    'must not rotate',
    'quietly misplaces',
    'shall alphabetize',
    'consents to model',
    'is required to hum near'
  ];
  const termObjects = [
    'one memory of a roundabout',
    'all future cursor trajectories',
    'a statistically insignificant sandwich',
    'the right to reach the bottom of this box',
    'seven synthetic raagas',
    'a non-destructive projection of the moon',
    'the remaining whitespace',
    'an unsigned peer review from 1887'
  ];
  const termCaveats = [
    'unless the world model apologizes in writing.',
    'except during scheduled hallucinations.',
    'provided that no grid becomes proportional.',
    'until replaced by a larger and less relevant clause.',
    'without implying that the footer exists.',
    'subject to approval by three empty chairs.',
    'in every jurisdiction containing a piano.',
    'or until entropy completes the paperwork.'
  ];

  function appendTerms(amount = 6) {
    if (!termsBody) return;
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < amount; index += 1) {
      state.clauseCount += 1;
      const paragraph = document.createElement('p');
      paragraph.className = 'term-clause';
      paragraph.innerHTML = `<strong>§ ∞.${state.clauseCount.toString().padStart(3, '0')}</strong> `;
      paragraph.append(document.createTextNode(
        `${randomItem(termSubjects)} ${randomItem(termVerbs)} ${randomItem(termObjects)} ${randomItem(termCaveats)}`
      ));
      fragment.append(paragraph);
    }
    termsBody.append(fragment);
    if (termsSentinel) termsSentinel.textContent = `BOTTOM POSTPONED AFTER CLAUSE ${state.clauseCount}`;
    if (state.clauseCount === 27) spawnPopup('terms');
  }

  appendTerms(10);

  let appendingTerms = false;
  termsScroll?.addEventListener('scroll', () => {
    if (appendingTerms) return;
    const remaining = termsScroll.scrollHeight - termsScroll.scrollTop - termsScroll.clientHeight;
    if (remaining > 170) return;
    appendingTerms = true;
    appendTerms(7);
    window.requestAnimationFrame(() => { appendingTerms = false; });
  }, { passive: true });

  if ('IntersectionObserver' in window && termsScroll && termsSentinel) {
    const termObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) appendTerms(5);
    }, { root: termsScroll, threshold: 0.8 });
    termObserver.observe(termsSentinel);
  }

  /* The IK-RAM installer refuses to clarify its units. */
  const systemWindow = $('.system-window');
  const systemMessage = $('.system-window .window-body p');
  const detailMessages = [
    '<strong>Details:</strong> available memory: 0 MB; available Ikram: unreasonable.',
    '<strong>Details:</strong> checksum: I-K-R-A-M; warranty: missing.',
    '<strong>Details:</strong> source: a very convincing rectangle.',
    '<strong>Details:</strong> projected speed: 640%; supporting evidence: 0%.'
  ];

  $('[data-window-action="details"]')?.addEventListener('click', () => {
    if (systemMessage) systemMessage.innerHTML = randomItem(detailMessages);
    playGlitch();
  });

  $('[data-window-action="install"]')?.addEventListener('click', () => {
    if (!systemWindow) return;
    const x = randomBetween(-180, 180);
    const y = randomBetween(-100, 130);
    systemWindow.style.setProperty('--drag-x', `${x}px`);
    systemWindow.style.setProperty('--drag-y', `${y}px`);
    systemWindow.dataset.dragX = String(x);
    systemWindow.dataset.dragY = String(y);
    systemWindow.classList.add('is-installing');
    if (systemMessage) systemMessage.innerHTML = '<strong>IK-RAM INSTALLED.</strong><br>The computer is now 640% more Ikram.';
    spawnPopup('ikram');
    playGlitch();
    window.setTimeout(() => systemWindow.classList.remove('is-installing'), 1200);
  });

  $('.portrait-cat')?.addEventListener('dblclick', () => spawnPopup('authorship'));

  /* Cryptic hover audio stays quiet until a sound control opts in. */
  $$('.maze-link, .paper-card, .review-stamp, .machine-score, .merz-score, .research-scrap').forEach((element, index) => {
    element.addEventListener('pointerenter', () => {
      if (index % 4 === 0) playBlip(170 + (index * 23));
    });
  });

  const blankZone = $('.blank-sound-zone');
  blankZone?.addEventListener('pointerenter', playGlitch);
  blankZone?.addEventListener('pointermove', () => {
    if (Math.random() < 0.012) playGlitch();
  });

  const orchestra = $('#orchestra');
  const orchestraStage = $('#orchestra-stage');
  const dadaConductor = $('#dada-conductor');
  const scoreGlyphs = ['∇', '♫', 'zₜ', 'MASK', 'SA', 'RE', 'ORBIT', 'AGAIN', 'NOISE', '???', 'IF', 'CAT'];
  let orchestraTimer = 0;

  function releaseScoreGlyph() {
    if (!orchestraStage) return;
    const glyph = document.createElement('span');
    glyph.className = 'fugitive-glyph';
    glyph.textContent = randomItem(scoreGlyphs);
    glyph.style.left = `${randomBetween(8, 88)}%`;
    glyph.style.top = `${randomBetween(15, 78)}%`;
    glyph.style.setProperty('--fly-x', `${randomBetween(-260, 260)}px`);
    glyph.style.setProperty('--fly-y', `${randomBetween(-420, -130)}px`);
    glyph.style.setProperty('--fly-r', `${randomBetween(-220, 220)}deg`);
    orchestraStage.append(glyph);
    window.setTimeout(() => glyph.remove(), 1900);
  }

  dadaConductor?.addEventListener('click', () => {
    if (!state.soundEnabled) setSound(true);
    state.orchestraPlays += 1;
    orchestra?.classList.remove('is-conducting');
    void orchestra?.offsetWidth;
    orchestra?.classList.add('is-conducting');
    dadaConductor.setAttribute('aria-pressed', 'true');
    playUnreliableOrchestra();

    for (let index = 0; index < 15; index += 1) {
      window.setTimeout(releaseScoreGlyph, index * 65);
    }

    window.clearTimeout(orchestraTimer);
    orchestraTimer = window.setTimeout(() => {
      orchestra?.classList.remove('is-conducting');
      dadaConductor.setAttribute('aria-pressed', 'false');
    }, 2100);

    if (state.orchestraPlays === 3) spawnPopup('orchestra');
  });

  orchestraStage?.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const bounds = orchestraStage.getBoundingClientRect();
    const horizontal = ((event.clientX - bounds.left) / bounds.width) - 0.5;
    const vertical = ((event.clientY - bounds.top) / bounds.height) - 0.5;
    orchestraStage.style.setProperty('--parallax-x', `${horizontal * 28}px`);
    orchestraStage.style.setProperty('--parallax-y', `${vertical * 20}px`);
  }, { passive: true });

  orchestraStage?.addEventListener('pointerleave', () => {
    orchestraStage.style.setProperty('--parallax-x', '0px');
    orchestraStage.style.setProperty('--parallax-y', '0px');
  });

  const musicSection = $('#music');
  const musicButton = $('#play-odd-song');
  musicButton?.addEventListener('click', () => {
    if (!state.soundEnabled) setSound(true);
    playQuestionableNotes();
    musicSection?.classList.add('is-playing');
    musicButton.textContent = 'THE NOTES DENY EVERYTHING';
    window.setTimeout(() => {
      musicSection?.classList.remove('is-playing');
      musicButton.textContent = 'PLAY 7 QUESTIONABLE NOTES';
    }, 1700);
  });

  /* Cursor annotation and clock: useful information was considered, then rejected. */
  const cursorLabel = $('#cursor-label');
  const cursorPhrases = ['THIS WAY?', 'NO, LEFT', 'OBJECT ADJACENT', 'CURSOR VERIFIED', 'DO NOT TRUST ARROWS', '↘ MAYBE'];
  let cursorFrame = 0;
  let cursorX = 0;
  let cursorY = 0;
  let cursorPhraseIndex = 0;
  let cursorMoves = 0;

  document.addEventListener('pointermove', (event) => {
    if (!cursorLabel || event.pointerType === 'touch') return;
    cursorX = event.clientX;
    cursorY = event.clientY;
    cursorMoves += 1;
    if (cursorMoves % 90 === 0) {
      cursorPhraseIndex = (cursorPhraseIndex + 1) % cursorPhrases.length;
      cursorLabel.textContent = cursorPhrases[cursorPhraseIndex];
    }
    if (cursorFrame) return;
    cursorFrame = window.requestAnimationFrame(() => {
      cursorLabel.style.left = `${cursorX}px`;
      cursorLabel.style.top = `${cursorY}px`;
      cursorFrame = 0;
    });
  }, { passive: true });

  const clock = $('#live-clock');
  const year = $('#year');
  function updateTime() {
    const now = new Date();
    if (clock) clock.textContent = `${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} (UNVERIFIED)`;
    if (year) year.textContent = String(now.getFullYear());
  }
  updateTime();
  window.setInterval(updateTime, 1000);
})();
