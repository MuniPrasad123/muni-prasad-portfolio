if (window.parent !== window) {
  // Include children's outer margins in the body measurement, including when
  // the lab shrinks. Using document.scrollHeight would retain the iframe's
  // previous viewport height and leave the original empty space in place.
  document.body.style.display = 'flow-root';
  let previousHeight = 0;
  let scheduled = false;
  function reportHeight() {
    scheduled = false;
    const style = getComputedStyle(document.body);
    const height = Math.ceil(document.body.getBoundingClientRect().height
      + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0));
    if (height === previousHeight) return;
    previousHeight = height;
    window.parent.postMessage({ type: 'practice-height', height }, '*');
  }
  function scheduleReport() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(reportHeight);
  }
  new ResizeObserver(scheduleReport).observe(document.body);
  window.addEventListener('resize', scheduleReport);
  window.addEventListener('load', scheduleReport);
  document.fonts.ready.then(scheduleReport);
  window.addEventListener('message', event => {
    if (event.source === window.parent && event.data === 'request-practice-height') {
      previousHeight = 0;
      scheduleReport();
    }
  });
  scheduleReport();
}
