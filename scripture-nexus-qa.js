(() => {
  "use strict";
  const topicExpansion=document.createElement('script');
  topicExpansion.src='scripture-nexus-topic-expansion.js?v=20260830a';
  topicExpansion.defer=true;
  document.head.appendChild(topicExpansion);

  const smart=document.createElement('script');
  smart.src='scripture-nexus-smart-search.js?v=20260830a';
  smart.defer=true;
  document.head.appendChild(smart);

  const core=document.createElement('script');
  core.src='scripture-nexus-qa-core.js?v=20260830c';
  core.defer=true;
  document.head.appendChild(core);

  const fresh=document.createElement('script');
  fresh.src='scripture-nexus-freshness.js?v=20260830a';
  fresh.defer=true;
  document.head.appendChild(fresh);
})();