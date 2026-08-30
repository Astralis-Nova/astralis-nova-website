(() => {
  "use strict";
  const core=document.createElement('script');
  core.src='scripture-nexus-qa-core.js?v=20260829b';
  core.defer=true;
  document.head.appendChild(core);

  const fresh=document.createElement('script');
  fresh.src='scripture-nexus-freshness.js?v=20260830a';
  fresh.defer=true;
  document.head.appendChild(fresh);
})();