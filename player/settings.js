(() => {
  'use strict';
  const storage = {
    getItem(key) { try { return localStorage.getItem(key); } catch { return null; } },
    setItem(key,value) { try { localStorage.setItem(key,value); } catch {} },
    removeItem(key) { try { localStorage.removeItem(key); } catch {} }
  };
  function json(key,fallback,valid) {
    try { const value=JSON.parse(storage.getItem(key)); return valid(value)?value:fallback; } catch { return fallback; }
  }
  function number(key,fallback,min,max) {
    const raw=storage.getItem(key),value=Number(raw);
    return raw!==null&&raw.trim()!==''&&Number.isFinite(value)&&value>=min&&value<=max?value:fallback;
  }
  window.NovaPlayerSettings={storage,json,number};
})();
