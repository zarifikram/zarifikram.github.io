(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const randomBetween = (minimum, maximum) => Math.random() * (maximum - minimum) + minimum;

  const desktop = $('#desktop');
  const getWindows = () => $$('[data-window]');
  const routeStatus = $('#route-status');
  const startButton = $('#start-button');
  const startMenu = $('#start-menu');
  const shutdownScreen = $('#shutdown-screen');
  const adwareTemplate = $('#adware-template');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let topLayer = 100;
  let activeWindow = null;

  function bringToFront(windowElement) {
    if (!windowElement) return;
    topLayer += 1;
    getWindows().forEach((item) => item.classList.remove('is-active'));
    windowElement.hidden = false;
    windowElement.classList.remove('is-active');
    void windowElement.offsetWidth;
    windowElement.classList.add('is-active');
    windowElement.style.zIndex = String(topLayer);
    activeWindow = windowElement;
  }

  function closeWindow(windowElement) {
    if (!windowElement || windowElement.hasAttribute('data-persistent')) return;
    windowElement.hidden = true;
    windowElement.classList.remove('is-active');
    if (activeWindow === windowElement) activeWindow = null;
  }

  function openWindow(id) {
    const windowElement = document.getElementById(id);
    if (!windowElement) return;
    windowElement.hidden = false;
    bringToFront(windowElement);
  }

  $$('[data-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      openWindow(trigger.dataset.open);
      closeStartMenu();
    });
  });

  function installWindowDrag(windowElement) {
    const handle = $('[data-drag-handle]', windowElement);
    if (!handle) return;

    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;
    let nextX = 0;
    let nextY = 0;

    handle.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.target.closest('button')) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      originX = Number(windowElement.dataset.dragX || 0);
      originY = Number(windowElement.dataset.dragY || 0);
      nextX = originX;
      nextY = originY;
      windowElement.classList.add('is-dragging');
      bringToFront(windowElement);
      handle.setPointerCapture?.(pointerId);
      event.preventDefault();
    });

    handle.addEventListener('pointermove', (event) => {
      if (event.pointerId !== pointerId) return;
      nextX = originX + event.clientX - startX;
      nextY = originY + event.clientY - startY;
      windowElement.style.setProperty('--drag-x', `${nextX}px`);
      windowElement.style.setProperty('--drag-y', `${nextY}px`);
    });

    const finishDrag = (event) => {
      if (event.pointerId !== pointerId) return;
      handle.releasePointerCapture?.(pointerId);
      pointerId = null;
      windowElement.classList.remove('is-dragging');
      windowElement.dataset.dragX = String(nextX);
      windowElement.dataset.dragY = String(nextY);
    };

    handle.addEventListener('pointerup', finishDrag);
    handle.addEventListener('pointercancel', finishDrag);
  }

  function registerWindow(windowElement) {
    if (!windowElement || windowElement.dataset.windowReady === 'true') return;
    windowElement.dataset.windowReady = 'true';
    windowElement.addEventListener('pointerdown', () => bringToFront(windowElement));
    $$('[data-close]', windowElement).forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        closeWindow(windowElement);
      });
    });
    installWindowDrag(windowElement);
  }

  getWindows().forEach(registerWindow);

  function closeStartMenu() {
    if (!startMenu || !startButton) return;
    startMenu.hidden = true;
    startButton.classList.remove('is-open');
    startButton.setAttribute('aria-expanded', 'false');
  }

  startButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    const willOpen = startMenu.hidden;
    startMenu.hidden = !willOpen;
    startButton.classList.toggle('is-open', willOpen);
    startButton.setAttribute('aria-expanded', String(willOpen));
  });

  startMenu?.addEventListener('click', (event) => event.stopPropagation());
  document.addEventListener('click', closeStartMenu);

  function shuffleDesktop() {
    const movable = getWindows().filter((windowElement) => !windowElement.hasAttribute('data-persistent') && !windowElement.hidden);
    movable.forEach((windowElement, index) => {
      const bounds = windowElement.getBoundingClientRect();
      const desiredLeft = randomBetween(8, Math.max(9, window.innerWidth - bounds.width - 8));
      const desiredTop = randomBetween(60, Math.max(61, window.innerHeight - bounds.height - 55));
      const deltaX = Number(windowElement.dataset.dragX || 0) + desiredLeft - bounds.left;
      const deltaY = Number(windowElement.dataset.dragY || 0) + desiredTop - bounds.top;
      windowElement.dataset.dragX = String(deltaX);
      windowElement.dataset.dragY = String(deltaY);
      windowElement.style.setProperty('--drag-x', `${deltaX}px`);
      windowElement.style.setProperty('--drag-y', `${deltaY}px`);
      windowElement.style.zIndex = String(150 + index);
    });
    topLayer = Math.max(topLayer, 170);
    if (routeStatus) routeStatus.textContent = 'Desktop organization successfully damaged';
  }

  $('#shuffle-desktop')?.addEventListener('click', shuffleDesktop);

  const adwarePayloads = [
    {
      theme: 'danger',
      title: 'IK-RAM_SECURITY_CENTER',
      kicker: 'CRITICAL MEMORY WARNING',
      headline: 'YOUR PC HAS ONLY 0 MB OF IK-RAM',
      copy: 'Ordinary RAM cannot run researcher.exe and tenor.dll at the same time.',
      action: 'DOWNLOAD MORE IK-RAM',
      target: 'ikram-window'
    },
    {
      theme: 'music',
      title: 'FREE_TENOR_TOOLBAR.EXE',
      kicker: 'ONE-CLICK VOCAL OPTIMIZATION',
      headline: 'ADD 7 SUSPICIOUS OCTAVES NOW',
      copy: 'Includes automatic vibrato, academic reverb, and a toolbar nobody requested.',
      action: 'INSTALL HIGH C',
      target: 'identity-window'
    },
    {
      theme: 'world',
      title: 'WORLD_MODEL_DEFENDER_95',
      kicker: '1 SEVERE THREAT DETECTED',
      headline: 'REALITY.EXE IS OUTSIDE THE LATENT SPACE',
      copy: 'Quarantine the real world before it contaminates your predictions.',
      action: 'MODEL IT ANYWAY',
      target: 'error-window'
    },
    {
      theme: 'prize',
      title: 'CONGRATULATIONS_RESEARCHER!!!',
      kicker: 'YOU ARE VISITOR 0x5A_RIF',
      headline: 'YOU WON 3 FREE CITATIONS',
      copy: 'Claim before Reviewer #2 wakes up. Impact factor and causality not included.',
      action: 'CLAIM FAKE IMPACT'
    },
    {
      theme: 'cat',
      title: 'CAT-CHA_VERIFICATION',
      kicker: 'ARE YOU A WORLD MODEL?',
      headline: 'SELECT EVERY SQUARE CONTAINING SUPERVISION',
      copy: 'There is only one square. The cat is already corresponding author.',
      action: 'I AM NOT LATENT',
      target: 'supervisor-window'
    },
    {
      theme: 'ram',
      title: 'ACADEMIC_SPEED_BOOSTER',
      kicker: 'DOWNLOAD COMPLETE-ISH',
      headline: 'IK-RAM IS NOW 640% MORE IKRAM',
      copy: 'Possible side effects: roundabouts, masked priors, and singing during backpropagation.',
      action: 'MORE MORE RAM',
      target: 'ikram-window'
    }
  ];

  let adwareCount = 0;

  function spawnAdware(payload = adwarePayloads[adwareCount % adwarePayloads.length]) {
    if (!desktop || !adwareTemplate) return null;
    const existing = $$('.adware-window', desktop);
    if (existing.length >= 7) existing[0].remove();

    adwareCount += 1;
    const popup = adwareTemplate.content.firstElementChild.cloneNode(true);
    const title = $('[data-adware-title]', popup);
    const titleId = `adware-title-${adwareCount}`;
    popup.id = `adware-${adwareCount}`;
    popup.dataset.adwareTheme = payload.theme;
    popup.setAttribute('aria-labelledby', titleId);
    popup.style.setProperty('--ad-tilt', `${randomBetween(-3.2, 3.2).toFixed(1)}deg`);
    title.id = titleId;
    title.textContent = payload.title;
    $('[data-adware-kicker]', popup).textContent = payload.kicker;
    $('[data-adware-headline]', popup).textContent = payload.headline;
    $('[data-adware-copy]', popup).textContent = payload.copy;

    const action = $('[data-adware-action]', popup);
    const meter = $('.adware-meter', popup);
    action.textContent = payload.action;
    action.addEventListener('click', (event) => {
      event.stopPropagation();
      meter.classList.add('is-complete');
      action.textContent = 'TOO LATE — INSTALLED';
      action.disabled = true;
      if (routeStatus) routeStatus.textContent = 'Harmless nonsense successfully installed';
      window.setTimeout(() => {
        if (payload.target) openWindow(payload.target);
        spawnAdware();
      }, reducedMotion.matches ? 0 : 260);
    });

    desktop.append(popup);
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;
    const maxLeft = Math.max(8, window.innerWidth - popupWidth - 8);
    const maxTop = Math.max(58, window.innerHeight - popupHeight - 52);
    popup.style.left = `${randomBetween(8, maxLeft)}px`;
    popup.style.top = `${randomBetween(58, maxTop)}px`;
    registerWindow(popup);
    bringToFront(popup);
    return popup;
  }

  function spawnAdwareSwarm(amount = 4) {
    const popupTotal = reducedMotion.matches ? Math.min(amount, 2) : amount;
    for (let index = 0; index < popupTotal; index += 1) {
      window.setTimeout(() => spawnAdware(), reducedMotion.matches ? 0 : index * 115);
    }
  }

  $$('[data-malware-swarm]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const ikramWindow = $('#ikram-window');
      const readout = $('#ikram-readout');
      openWindow('ikram-window');
      ikramWindow?.classList.remove('is-installed', 'is-installing');
      void ikramWindow?.offsetWidth;
      ikramWindow?.classList.add('is-installing');
      if (readout) readout.textContent = 'Downloading personality modules from a very convincing rectangle...';
      if (routeStatus) routeStatus.textContent = 'Downloading 4096 MB of IK-RAM from the definitely-real internet';
      spawnAdwareSwarm();
      window.setTimeout(() => {
        ikramWindow?.classList.remove('is-installing');
        ikramWindow?.classList.add('is-installed');
        if (readout) readout.textContent = '4096 MB installed. Computer now 640% more Ikram.';
      }, reducedMotion.matches ? 0 : 1180);
      closeStartMenu();
    });
  });

  $('[data-decline-ikram]')?.addEventListener('click', () => {
    window.setTimeout(() => spawnAdware(adwarePayloads[0]), reducedMotion.matches ? 0 : 120);
  });

  const routeLinks = $$('a[href="./fun/"], a[href="./me/"]');
  routeLinks.forEach((link) => {
    const kind = link.getAttribute('href').includes('fun') ? 'fun' : 'sensible';

    link.addEventListener('pointerenter', () => {
      if (routeStatus) {
        routeStatus.textContent = kind === 'fun'
          ? 'Warning: layout stability 3%'
          : 'Document appears professionally aligned';
      }
    });

    link.addEventListener('pointerleave', () => {
      if (routeStatus) routeStatus.textContent = 'Waiting for user confusion';
    });

    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || reducedMotion.matches) return;
      event.preventDefault();
      document.body.classList.add('is-routing', `route-${kind}`);
      bringToFront($('#route-window'));
      if (routeStatus) routeStatus.textContent = kind === 'fun' ? 'Executing FUN.EXE...' : 'Opening SENSIBLE.DOC...';
      window.setTimeout(() => window.location.assign(link.href), 520);
    });
  });

  function updateClock() {
    const now = new Date();
    const compact = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const detailed = now.toLocaleString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    if ($('#toolbar-clock')) $('#toolbar-clock').textContent = compact;
    if ($('#task-clock')) $('#task-clock').textContent = compact;
    if ($('#clock-body')) $('#clock-body').textContent = detailed;
  }

  updateClock();
  window.setInterval(updateClock, 1000);

  $('#shutdown-button')?.addEventListener('click', () => {
    closeStartMenu();
    if (shutdownScreen) shutdownScreen.hidden = false;
  });

  $('#restart-button')?.addEventListener('click', () => {
    if (shutdownScreen) shutdownScreen.hidden = true;
    openWindow('selected-window');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (startMenu && !startMenu.hidden) {
      closeStartMenu();
      return;
    }
    if (activeWindow) closeWindow(activeWindow);
  });

  window.addEventListener('resize', () => {
    getWindows().forEach((windowElement) => {
      const bounds = windowElement.getBoundingClientRect();
      if (bounds.left > window.innerWidth - 35 || bounds.top > window.innerHeight - 35) {
        windowElement.dataset.dragX = '0';
        windowElement.dataset.dragY = '0';
        windowElement.style.setProperty('--drag-x', '0px');
        windowElement.style.setProperty('--drag-y', '0px');
      }
    });
  }, { passive: true });

  if (desktop) {
    desktop.addEventListener('dblclick', (event) => {
      if (event.target !== desktop) return;
      openWindow('error-window');
    });
  }

  window.setTimeout(() => bringToFront($('#selected-window')), 260);
  if (window.innerWidth > 510) {
    window.setTimeout(() => openWindow('ikram-window'), reducedMotion.matches ? 0 : 650);
  }
  if (window.innerWidth > 900 && !reducedMotion.matches) {
    window.setTimeout(() => spawnAdware(adwarePayloads[2]), 1050);
  }
})();
