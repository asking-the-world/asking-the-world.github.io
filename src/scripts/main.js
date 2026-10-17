const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const tabs = [...document.querySelectorAll('.ablation-tabs [role="tab"]')];

function animateBars(panel) {
  if (reducedMotion.matches) return;
  panel.querySelectorAll('.comparison-fill, .grounding-track i').forEach((bar, index) => {
    bar.getAnimations().forEach(animation => animation.cancel());
    bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
      duration: 650, delay: index * 55, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'
    });
  });
}

let hoverTimer;

function selectTab(tab, focus = false) {
  clearTimeout(hoverTimer);
  const changed = tab.getAttribute('aria-selected') !== 'true';
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
  if (focus || document.activeElement.closest('.ablation-panel[hidden]')) tab.focus({ preventScroll: true });
  if (changed) animateBars(document.getElementById(tab.getAttribute('aria-controls')));
}

tabs.forEach((tab, index) => {
  tab.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => selectTab(tab), 120);
    }
  });
  tab.addEventListener('pointerleave', () => clearTimeout(hoverTimer));
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    clearTimeout(hoverTimer);
    const destinations = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    selectTab(tabs[destinations[event.key]], true);
  });
});

// Figure 8 and Section 4.3. Preserve full reported precision rather than
// subtracting the rounded one-decimal values printed in the figure.
const backbones = [
  { dataset: 'CLEVRER', models: [ ['Gemini-3-Flash', 35.40, 82.30], ['Qwen3-VL-235B-A22B', 38.85, 76.32] ] },
  { dataset: 'ContPhy', models: [ ['Gemini-3-Flash', 47.08, 68.00], ['Qwen3-VL-235B-A22B', 45.23, 62.46] ] }
];
const comparisons = document.getElementById('backbone-comparisons');
backbones.forEach(({ dataset, models }) => {
  const group = document.createElement('section');
  group.className = 'backbone-dataset';
  group.innerHTML = `<h4>${dataset}</h4>`;
  models.forEach(([model, baseline, atw]) => {
    const row = document.createElement('div');
    row.className = 'backbone-row';
    row.innerHTML = `<div class="comparison-heading"><h5>${model}</h5><span aria-label="Accuracy gain: ${(atw - baseline).toFixed(2)} percentage points">+${(atw - baseline).toFixed(2)}</span></div>
      <div class="comparison-bar baseline" aria-label="Video-only VLM: ${baseline.toFixed(2)} percent"><div class="comparison-track"><span class="comparison-fill" style="width:${baseline}%"></span></div><span>${baseline.toFixed(2)}%</span></div>
      <div class="comparison-bar atw" aria-label="ATW: ${atw.toFixed(2)} percent"><div class="comparison-track"><span class="comparison-fill" style="width:${atw}%"></span></div><strong>${atw.toFixed(2)}%</strong></div>`;
    group.append(row);
  });
  comparisons.append(group);
});

let copyTimer;
document.getElementById('copy-citation').addEventListener('click', async () => {
  const status = document.getElementById('copy-status');
  const button = document.getElementById('copy-citation');
  clearTimeout(copyTimer);
  try {
    await navigator.clipboard.writeText(document.getElementById('bibtex').textContent);
    status.textContent = 'BibTeX copied to clipboard.';
    button.textContent = 'Copied';
  } catch {
    status.textContent = 'Select the citation and copy manually.';
    button.textContent = 'Copy failed';
  }
  copyTimer = setTimeout(() => {
    status.textContent = '';
    button.textContent = 'Copy';
  }, 2500);
});

// Show a scroll affordance only for tables that actually overflow.
const tableObserver = new ResizeObserver(entries => {
  entries.forEach(({ target }) => {
    const container = target.closest('.table-scroll');
    const hint = container.previousElementSibling.querySelector('.table-scroll-hint');
    hint.hidden = container.scrollWidth <= container.clientWidth + 1;
  });
});
document.querySelectorAll('.table-scroll').forEach(table => {
  tableObserver.observe(table);
  tableObserver.observe(table.querySelector('table'));
});

reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    document.querySelectorAll('.comparison-fill, .grounding-track i').forEach(bar => {
      bar.getAnimations().forEach(animation => animation.cancel());
    });
  }
});
