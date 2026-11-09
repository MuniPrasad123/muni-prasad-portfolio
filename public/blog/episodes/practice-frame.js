if (window.parent !== window) {
  function reportHeight() {
    const style = getComputedStyle(document.body);
    const height = document.body.getBoundingClientRect().height
      + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    window.parent.postMessage({ type: 'practice-height', height: Math.ceil(height) }, '*');
  }

  new ResizeObserver(reportHeight).observe(document.body);
  window.addEventListener('message', event => {
    if (event.source === window.parent && event.data === 'request-practice-height') reportHeight();
  });
}
