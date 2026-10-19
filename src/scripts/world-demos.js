(() => {
  const section = document.querySelector('.world-demos');
  const panel = document.getElementById('scene-player');
  const tabs = [...section.querySelectorAll('[role="tab"]')];
  const original = document.getElementById('scene-original');
  const swr = document.getElementById('scene-swr');
  const probe = document.getElementById('scene-probe');
  const videos = [original, swr, probe];
  const status = document.getElementById('scene-status');
  const toggle = document.getElementById('scene-toggle');
  let generation = 0, offset = 0, phase = 'loading', visible = false;
  let paused = false, elapsed = 0, last = 0, hoverTimer;
  const pending = new WeakSet();
  const running = () => visible && !document.hidden && !paused;
  const stop = () => videos.forEach(video => video.pause());

  function setPhase(value) {
    phase = value;
    elapsed = 0;
    panel.dataset.phase = value;
    const probing = ['reveal', 'probe', 'hold'].includes(value);
    section.querySelector('.scene-probe').setAttribute('aria-hidden', String(!probing));
    section.querySelector('.scene-observations').setAttribute('aria-hidden', String(probing));
    status.textContent = ({ loading: 'Loading scene…', modeling: 'World Modeling', reveal: 'World Probing', probe: 'World Probing', hold: 'World Probing', returning: 'World Modeling', error: 'Video unavailable. Select Replay to try again.' })[value];
  }

  function play(video) {
    if (!video.paused || video.ended || pending.has(video)) return;
    const token = generation;
    pending.add(video);
    video.play().then(() => {
      if (!running() || (video === probe ? phase !== 'probe' : phase !== 'modeling')) video.pause();
    }).catch(error => {
      if (token !== generation || error.name === 'AbortError') return;
      paused = true;
      toggle.textContent = 'Play';
      stop();
      status.textContent = 'Select Play to start the sequence.';
    }).finally(() => pending.delete(video));
  }

  function restart() {
    stop();
    videos.forEach(video => { video.currentTime = 0; });
    setPhase('modeling');
  }

  function ready(video, token) {
    return new Promise((resolve, reject) => {
      const clean = () => { video.removeEventListener('loadeddata', loaded); video.removeEventListener('error', failed); };
      const loaded = () => { clean(); resolve(); };
      const failed = () => { clean(); reject(new Error('Video load failed')); };
      if (token !== generation) return resolve();
      video.addEventListener('loadeddata', loaded, { once: true });
      video.addEventListener('error', failed, { once: true });
      video.load();
    });
  }

  async function select(tab, focus = false) {
    clearTimeout(hoverTimer);
    if (tab.getAttribute('aria-selected') === 'true' && phase !== 'loading' && phase !== 'error') {
      if (focus) tab.focus();
      return;
    }
    const token = ++generation;
    stop();
    tabs.forEach(item => {
      item.setAttribute('aria-selected', String(item === tab));
      item.tabIndex = item === tab ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', tab.id);
    if (focus) tab.focus();
    offset = tab.dataset.scene === 'cloth_399' ? 75 / 30 : 0;
    setPhase('loading');
    try {
      await Promise.all(videos.map((video, index) => {
        video.muted = true;
        video.preload = 'auto';
        video.src = `public/assets/videos/${tab.dataset.scene}/${['original', 'swr', 'probe'][index]}.mp4`;
        return ready(video, token);
      }));
      if (token === generation) restart();
    } catch {
      if (token === generation) { stop(); setPhase('error'); }
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') hoverTimer = setTimeout(() => select(tab), 220);
    });
    tab.addEventListener('pointerleave', () => clearTimeout(hoverTimer));
    tab.addEventListener('keydown', event => {
      const destination = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
      if (destination === undefined) return;
      event.preventDefault();
      select(tabs[destination], true);
    });
  });
  toggle.addEventListener('click', () => {
    paused = !paused;
    toggle.textContent = paused ? 'Play' : 'Pause';
    if (paused) stop();
  });
  document.getElementById('scene-replay').addEventListener('click', () => {
    paused = false;
    toggle.textContent = 'Pause';
    if (phase === 'error') select(tabs.find(tab => tab.getAttribute('aria-selected') === 'true'));
    else if (phase !== 'loading') restart();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) stop();
  }, { threshold: .15 }).observe(panel);

  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, .1) : 0;
    last = now;
    if (running()) {
      if (phase === 'modeling') {
        // The original is the master clock; cloth's reconstruction begins 75 frames later.
        const target = Math.max(0, original.currentTime - offset);
        if (original.readyState >= 3 && swr.readyState >= 3) {
          play(original);
          if (original.currentTime >= offset) {
            if (!swr.ended && !swr.seeking && Math.abs(swr.currentTime - target) > .12) swr.currentTime = Math.min(target, swr.duration);
            play(swr);
          }
        } else stop();
        if (original.ended && swr.ended) { stop(); setPhase('reveal'); }
      } else if (phase === 'reveal') {
        elapsed += dt;
        if (elapsed >= (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : .75)) setPhase('probe');
      } else if (phase === 'probe') {
        play(probe);
        if (probe.ended) setPhase('hold');
      } else if (phase === 'hold') {
        elapsed += dt;
        if (elapsed >= .9) setPhase('returning');
      } else if (phase === 'returning') {
        elapsed += dt;
        // Keep the observation at its final frame until the track returns to the observation/modeling pair.
        if (elapsed >= (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : .75)) restart();
      }
    }
    requestAnimationFrame(tick);
  }
  select(tabs[0]);
  requestAnimationFrame(tick);
})();
