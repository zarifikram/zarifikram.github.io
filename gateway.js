(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const randomBetween = (minimum, maximum) => Math.random() * (maximum - minimum) + minimum;

  const desktop = $('#desktop');
  const windows = $$('[data-window]');
  const routeStatus = $('#route-status');
  const startButton = $('#start-button');
  const startMenu = $('#start-menu');
  const shutdownScreen = $('#shutdown-screen');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let topLayer = 100;
  let activeWindow = null;

  function bringToFront(windowElement) {
    if (!windowElement) return;
    topLayer += 1;
    windows.forEach((item) => item.classList.remove('is-active'));
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

  windows.forEach((windowElement) => {
    windowElement.addEventListener('pointerdown', () => bringToFront(windowElement));
    $$('[data-close]', windowElement).forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        closeWindow(windowElement);
      });
    });
  });

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

  windows.forEach(installWindowDrag);

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
    const movable = windows.filter((windowElement) => !windowElement.hasAttribute('data-persistent') && !windowElement.hidden);
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
    windows.forEach((windowElement) => {
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
})();
