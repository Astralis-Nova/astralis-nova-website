(() => {
  'use strict';
  // The craft and pyramid keep their own viewport flight paths.
  // Mobile navigation must not relocate them into a stationary scenery panel.
  const navigation = document.querySelector('.mobile-navigation');
  navigation?.addEventListener('click', event => { if (event.target.closest('a')) navigation.open = false; });
  navigation?.addEventListener('keydown', event => { if (event.key === 'Escape') { navigation.open=false; navigation.querySelector('summary').focus(); } });
})();
