(() => {
  "use strict";

  if (window.__astralisDarktideCatalogInstalled) return;
  window.__astralisDarktideCatalogInstalled = true;

  const additions = [
    {
      title: "Darktide Remix",
      period: "April 2026",
      label: "Remix",
      audio: "/Audio/mp3/Darktide Remix.mp3"
    },
    {
      title: "Darktide Alternate Mix",
      period: "April 2026",
      label: "Alt Mix",
      audio: "/Audio/mp3/Darktide Alternate mix.mp3"
    },
    {
      title: "Darktide Megamix",
      period: "April 2026",
      label: "Megamix",
      audio: "/Audio/Darktide-Megamix.mp3"
    }
  ];

  const player = new Audio();
  player.preload = "metadata";
  let activeButton = null;
  let activeSource = "";
  let query = "";
  let activePeriod = "all";

  function stopPlayback() {
    player.pause();
    player.currentTime = 0;
    if (activeButton) {
      activeButton.classList.remove("is-playing");
      activeButton.textContent = "▶";
      activeButton.setAttribute("aria-label", `Play ${activeButton.dataset.title}`);
    }
    activeButton = null;
    activeSource = "";
  }

  function playTrack(button, source) {
    if (activeSource === source && !player.paused) {
      stopPlayback();
      return;
    }

    stopPlayback();
    document.querySelectorAll("audio").forEach(audio => {
      if (audio !== player) audio.pause();
    });

    activeButton = button;
    activeSource = source;
    player.src = source;
    button.classList.add("is-playing");
    button.textContent = "❚❚";
    button.setAttribute("aria-label", `Pause ${button.dataset.title}`);

    player.play().catch(() => {
      stopPlayback();
    });
  }

  player.addEventListener("ended", stopPlayback);
  player.addEventListener("error", stopPlayback);

  function createRow(track) {
    const row = document.createElement("article");
    row.className = "song darktide-catalog-track";
    row.dataset.period = track.period;
    row.dataset.title = track.title.toLowerCase();
    row.innerHTML = `
      <button class="play" type="button" data-title="${track.title}" aria-label="Play ${track.title}">▶</button>
      <img src="/cover-16.jpg" alt="Darktide cover" loading="lazy" decoding="async">
      <div>
        <h4>${track.title}</h4>
        <small>Astralis Nova · ${track.period}</small>
      </div>
      <div class="duration">${track.label}</div>
      <div class="song-links">
        <a href="${encodeURI(track.audio)}" target="_blank" rel="noopener" aria-label="Open ${track.title} audio" title="Open audio">MP3</a>
      </div>`;

    row.querySelector(".play").addEventListener("click", event => {
      playTrack(event.currentTarget, track.audio);
    });

    return row;
  }

  function updateVisibility() {
    document.querySelectorAll(".darktide-catalog-track").forEach(row => {
      const matchesSearch = !query || row.dataset.title.includes(query);
      const matchesPeriod = activePeriod === "all" || row.dataset.period === activePeriod;
      row.hidden = !(matchesSearch && matchesPeriod);
    });
  }

  function updateCounts() {
    const allFilter = document.querySelector('.filter[data-filter="all"] b');
    const aprilFilter = document.querySelector('.filter[data-filter="April 2026"] b');
    const heading = document.querySelector(".catalog-head h2");

    if (allFilter) allFilter.textContent = "30";
    if (aprilFilter) aprilFilter.textContent = "14";
    if (heading) heading.innerHTML = 'ALL SONGS <small style="color:#8492a7">(30)</small>';
  }

  function updateGuestbookOptions() {
    const select = document.getElementById("guestFavorite");
    if (!select) return;
    additions.forEach(track => {
      if ([...select.options].some(option => option.value === track.title)) return;
      const option = document.createElement("option");
      option.value = track.title;
      option.textContent = track.title;
      select.appendChild(option);
    });
  }

  function installRows() {
    const list = document.getElementById("songList");
    if (!list) return false;

    additions.forEach(track => {
      if (list.querySelector(`[data-darktide-title="${track.title}"]`)) return;
      const row = createRow(track);
      row.dataset.darktideTitle = track.title;

      const originalDarktide = [...list.querySelectorAll(".song")].find(song =>
        song.querySelector("h4")?.textContent.trim().toLowerCase() === "darktide"
      );
      if (originalDarktide) originalDarktide.insertAdjacentElement("afterend", row);
      else list.appendChild(row);
    });

    updateCounts();
    updateGuestbookOptions();
    updateVisibility();
    return true;
  }

  function readActivePeriod() {
    const active = document.querySelector(".filter.active");
    activePeriod = active?.dataset.filter || "all";
  }

  function boot() {
    installRows();
    readActivePeriod();
    updateVisibility();

    const search = document.getElementById("search");
    search?.addEventListener("input", () => {
      query = search.value.trim().toLowerCase();
      queueMicrotask(() => {
        installRows();
        updateVisibility();
      });
    });

    document.querySelectorAll(".filter").forEach(filter => {
      filter.addEventListener("click", () => {
        activePeriod = filter.dataset.filter || "all";
        setTimeout(() => {
          installRows();
          updateVisibility();
        }, 0);
      });
    });

    const list = document.getElementById("songList");
    if (list) {
      let scheduled = false;
      const observer = new MutationObserver(() => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
          scheduled = false;
          installRows();
        });
      });
      observer.observe(list, { childList: true });
      setTimeout(() => observer.disconnect(), 20000);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
