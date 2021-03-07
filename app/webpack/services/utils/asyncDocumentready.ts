const asyncDocumentReady = (callback: Function) => {
  if (document.readyState !== 'loading') {
    callback();
    return;
  }
  document.addEventListener('DOMContentLoaded', () => { callback(); });
}

export default asyncDocumentReady;
