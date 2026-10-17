(() => {
  // Main-paper Figure 4; exact per-question values from Appendix Table 4.
  const cases = {
    billiards: { folder: 'billiards_02', name: 'Billiards', task: 'Counterfactual reasoning', values: [20, 35, 85] },
    ball: { folder: 'bouncy_ball_04', name: 'Bouncing ball', task: 'Predictive reasoning', values: [60, 45, 70] },
    car: { folder: 'toy_cars', name: 'Toy car', task: 'Predictive reasoning', values: [20, 50, 60] }
  };
  const section = document.getElementById('real-world');
  const panel = document.getElementById('real-panel');
  const tabs = [...section.querySelectorAll('[role="tab"]')];
  const bars = [...section.querySelectorAll('.real-bar-track i')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let hoverTimer;
  function animate() {
    bars.forEach((bar, index) => {
      bar.getAnimations().forEach(animation => animation.cancel());
      if (!reduced.matches) bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
        duration: 800, delay: index * 80, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'
      });
    });
  }
  function select(tab, focus = false) {
    clearTimeout(hoverTimer);
    if (focus) tab.focus();
    if (tab.getAttribute('aria-selected') === 'true') return;
    tabs.forEach(item => {
      item.setAttribute('aria-selected', String(item === tab));
      item.tabIndex = item === tab ? 0 : -1;
    });
    const entry = cases[tab.dataset.case];
    panel.setAttribute('aria-labelledby', tab.id);
    section.querySelector('.real-papers').setAttribute('aria-label', `${entry.name} videos`);
    section.querySelector('.real-chart').setAttribute('aria-label', `${entry.name} per-question accuracy`);
    section.querySelector('#real-task').textContent = entry.task;
    section.querySelectorAll('.real-value').forEach((value, index) => value.textContent = `${entry.values[index].toFixed(2)}%`);
    bars.forEach((bar, index) => bar.style.width = `${entry.values[index]}%`);
    animate();
    loadVideos(entry);
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('pointerenter', event => {
      clearTimeout(hoverTimer);
      if (event.pointerType === 'mouse') hoverTimer = setTimeout(() => select(tab), 180);
    });
    tab.addEventListener('pointerleave', () => clearTimeout(hoverTimer));
    tab.addEventListener('keydown', event => {
      const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[next], true);
    });
  });
  reduced.addEventListener('change', () => { if (reduced.matches) bars.forEach(bar => bar.getAnimations().forEach(animation => animation.cancel())); });
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { animate(); observer.disconnect(); }
  }, { threshold: .25 });
  observer.observe(panel);
  const videos = [document.getElementById('real-original-video'), document.getElementById('real-swr-video')];
  const videoStatus = document.getElementById('real-video-status');
  const videoToggle = document.getElementById('real-video-toggle');
  const pending = new WeakSet();
  let visible = false, paused = false, loaded = false, failed = false, revision = 0;
  let hold = 0, lastTick = 0;
  const stopVideos = () => videos.forEach(video => video.pause());
  const canPlay = () => visible && !document.hidden && !paused && loaded && !failed;

  function loadVideos(entry) {
    revision++;
    stopVideos();
    loaded = false;
    failed = false;
    hold = 0;
    videoStatus.textContent = 'Loading videos…';
    videoToggle.textContent = paused ? 'Play' : 'Pause';
    videos.forEach((video, index) => {
      video.muted = true;
      video.preload = 'auto';
      video.src = `public/assets/videos/${entry.folder}/${index ? 'swr' : 'original'}.mp4`;
      video.load();
    });
  }
  videos.forEach(video => {
    video.addEventListener('loadeddata', () => {
      if (videos.every(item => item.readyState >= 2)) {
        loaded = true;
        videoStatus.textContent = '';
      }
    });
    video.addEventListener('error', () => {
      failed = true;
      stopVideos();
      videoStatus.textContent = 'Unable to load videos.';
      videoToggle.textContent = 'Retry';
    });
  });
  function playVideo(video) {
    if (!video.paused || video.ended || pending.has(video)) return;
    const token = revision;
    pending.add(video);
    video.play().then(() => { if (!canPlay()) video.pause(); }).catch(error => {
      if (token !== revision || error.name === 'AbortError') return;
      paused = true;
      stopVideos();
      videoToggle.textContent = 'Play';
      videoStatus.textContent = 'Select Play to start the videos.';
    }).finally(() => pending.delete(video));
  }
  videoToggle.addEventListener('click', () => {
    if (failed) {
      paused = false;
      loadVideos(cases[tabs.find(tab => tab.getAttribute('aria-selected') === 'true').dataset.case]);
    } else paused = !paused;
    videoToggle.textContent = paused ? 'Play' : 'Pause';
    if (paused) stopVideos();
    else if (loaded) videoStatus.textContent = '';
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopVideos(); });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) stopVideos();
  }, { threshold: .2 }).observe(section.querySelector('.real-media'));
  function tick(now) {
    const dt = lastTick ? Math.min((now - lastTick) / 1000, .1) : 0;
    lastTick = now;
    if (canPlay()) {
      const [original, world] = videos;
      if (videos.every(video => video.ended)) {
        hold += dt;
        if (hold >= .5) {
          videos.forEach(video => { video.currentTime = 0; });
          hold = 0;
        }
      } else if (videos.every(video => video.readyState >= 3)) {
        if (!world.ended && !world.seeking && Math.abs(world.currentTime - original.currentTime) > .1) world.currentTime = original.currentTime;
        videos.forEach(playVideo);
      } else stopVideos();
    }
    requestAnimationFrame(tick);
  }
  loadVideos(cases.billiards);
  requestAnimationFrame(tick);
})();
