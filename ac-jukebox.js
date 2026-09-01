(() => {
  const audio = document.getElementById('acJukeboxAudio');
  const select = document.getElementById('acJukeboxTrack');
  if (!audio || !select) return;
  const status = document.getElementById('acJukeboxStatus');
  const now = document.getElementById('acJukeboxNow');
  const options = Array.from(select.options);
  let generation = 0;
  function loadTrack(index, play) {
    const ticket = ++generation;
    audio.pause();
    select.selectedIndex = (index + options.length) % options.length;
    const track = options[select.selectedIndex];
    audio.src = track.dataset.src;
    audio.load();
    now.textContent = track.textContent;
    status.textContent = play ? 'Loading…' : 'Ready when you are. Press play.';
    if (play) audio.play().catch(() => {
      if (ticket === generation) status.textContent = 'Playback did not start. Press play to retry, or choose another song.';
    });
  }
  select.addEventListener('change', () => loadTrack(select.selectedIndex, true));
  document.getElementById('acJukeboxPrevious').addEventListener('click', () => loadTrack(select.selectedIndex - 1, true));
  document.getElementById('acJukeboxNext').addEventListener('click', () => loadTrack(select.selectedIndex + 1, true));
  audio.addEventListener('playing', () => { status.textContent = 'Playing · Astralis Nova'; });
  audio.addEventListener('pause', () => { if (!audio.ended) status.textContent = 'Paused'; });
  audio.addEventListener('error', () => { status.textContent = 'This song could not load. Choose another song or try again shortly.'; });
  audio.addEventListener('ended', () => {
    if (select.selectedIndex < options.length - 1) loadTrack(select.selectedIndex + 1, true);
    else status.textContent = 'End of playlist. Thanks for listening.';
  });
  document.getElementById('acJukeboxShare').addEventListener('click', async () => {
    const url = new URL('/ac-worlds', location.origin);
    url.searchParams.set('track', select.value);
    url.hash = 'ac-jukebox';
    try {
      await navigator.clipboard.writeText(url.href);
      status.textContent = 'Song link copied.';
    } catch { status.textContent = 'Copy this song link: ' + url.href; }
  });
  document.getElementById('acJukeboxEnhanced').hidden = false;
  const requested = new URLSearchParams(location.search).get('track');
  const initial = options.findIndex(option => option.value === requested);
  loadTrack(initial < 0 ? 0 : initial, false);
})();
