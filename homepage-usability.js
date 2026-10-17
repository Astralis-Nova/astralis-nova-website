(() => {
  'use strict';
  const shelf = document.createElement('div');
  shelf.id = 'homepage-scenery'; shelf.className = 'shell';
  shelf.setAttribute('role', 'group'); shelf.setAttribute('aria-label', 'Astralis Nova spacecraft and Pyramid of Thoughts');
  document.querySelector('.hero').after(shelf);
  const dock = () => {
    for (const id of ['astralis-starman-roadster','pyrHome','roamingStarship','astralisNovaExplorer']) {
      const node = document.getElementById(id);
      if (node && node.parentElement !== shelf) shelf.appendChild(node);
    }
  };
  dock();
  // Deferred character modules may append their ships later.
  const observer = new MutationObserver(dock);
  observer.observe(document.body, { childList:true });
  const navigation = document.querySelector('.mobile-navigation');
  navigation?.addEventListener('click', event => { if (event.target.closest('a')) navigation.open = false; });
  navigation?.addEventListener('keydown', event => { if (event.key === 'Escape') { navigation.open=false; navigation.querySelector('summary').focus(); } });
})();
