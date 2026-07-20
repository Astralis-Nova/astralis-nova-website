(() => {
  "use strict";

  const serviceLinks = (title) => {
    const query = encodeURIComponent(`Astralis Nova ${title}`);
    return {
      spotify: `https://open.spotify.com/search/${query}`,
      youtube: `https://www.youtube.com/results?search_query=${query}`,
      apple: `https://music.apple.com/us/search?term=${query}`,
      amazon: `https://music.amazon.com/search/${query}`,
    };
  };

  const encodeAudioPath = (path) =>
    `/${String(path || "")
      .split("/")
      .filter(Boolean)
      .map((part) => encodeURIComponent(part))
      .join("/")}`;

  function repairCatalogLinks() {
    document.querySelectorAll(".song").forEach((row) => {
      const title = row.querySelector("h4")?.textContent?.trim();
      if (!title) return;
      const links = serviceLinks(title);
      const spotify = row.querySelector("a.sp");
      const youtube = row.querySelector("a.yt");
      const apple = row.querySelector("a.ap");
      const amazon = row.querySelector("a.am");
      if (spotify) spotify.href = links.spotify;
      if (youtube) youtube.href = links.youtube;
      if (apple) apple.href = links.apple;
      if (amazon) amazon.href = links.amazon;
    });

    document.querySelectorAll(".feature-card").forEach((card) => {
      const title = card.querySelector("h4")?.textContent?.trim();
      if (title) card.href = serviceLinks(title).youtube;
    });
  }

  function addBiographyPortal() {
    if (document.getElementById("astralisBiographyPortal")) return;
    const aboutPanel = document.getElementById("about");
    if (!aboutPanel) return;

    const style = document.createElement("style");
    style.textContent = `
      .astralis-bio-portal{position:relative;display:flex;align-items:center;gap:13px;margin-top:16px;padding:14px 16px;border:1px solid rgba(100,184,255,.55);border-radius:16px;overflow:hidden;text-decoration:none;background:linear-gradient(110deg,rgba(12,35,65,.96),rgba(36,13,54,.92));box-shadow:0 12px 32px rgba(0,0,0,.32),0 0 22px rgba(61,151,255,.12);transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}
      .astralis-bio-portal:hover,.astralis-bio-portal:focus-visible{transform:translateY(-2px);border-color:#8fd5ff;box-shadow:0 16px 36px rgba(0,0,0,.38),0 0 28px rgba(76,168,255,.25)}
      .astralis-bio-comet{position:relative;flex:0 0 48px;width:48px;height:48px;display:grid;place-items:center;font-size:30px;filter:drop-shadow(0 0 10px rgba(115,206,255,.9));animation:astralisCometFloat 3.4s ease-in-out infinite}
      .astralis-bio-comet::before{content:"";position:absolute;width:70px;height:10px;right:29px;top:20px;border-radius:100%;background:linear-gradient(90deg,transparent,rgba(78,171,255,.18),rgba(181,230,255,.8));filter:blur(2px);transform:rotate(-12deg);transform-origin:right center}
      .astralis-bio-copy{position:relative;z-index:1;min-width:0}
      .astralis-bio-copy strong{display:block;color:#fff;font-size:.9rem;letter-spacing:.04em}
      .astralis-bio-copy small{display:block;margin-top:3px;color:#bcd1e7;line-height:1.35}
      .astralis-bio-star{margin-left:auto;color:#fff;font-size:18px;text-shadow:0 0 10px #78caff}
      @keyframes astralisCometFloat{0%,100%{transform:translate(0,0) rotate(-8deg)}50%{transform:translate(3px,-4px) rotate(-3deg)}}
      @media(prefers-reduced-motion:reduce){.astralis-bio-comet{animation:none}}
    `;
    document.head.appendChild(style);

    const link = document.createElement("a");
    link.id = "astralisBiographyPortal";
    link.className = "astralis-bio-portal";
    link.href = "/biography.html";
    link.setAttribute("aria-label", "Open the biography of Ramon Bivens and Astralis Nova");
    link.innerHTML = `
      <span class="astralis-bio-comet" aria-hidden="true">☄️</span>
      <span class="astralis-bio-copy">
        <strong>FOLLOW THE COMET</strong>
        <small>Enter the story of Ramon Bivens and Astralis Nova</small>
      </span>
      <span class="astralis-bio-star" aria-hidden="true">✦</span>`;
    aboutPanel.appendChild(link);
  }

  function addPlaybackPanel() {
    if (document.getElementById("crossDeviceMusicPanel")) return;
    const catalogHead = document.querySelector(".catalog-head");
    if (!catalogHead) return;

    const panel = document.createElement("div");
    panel.id = "crossDeviceMusicPanel";
    panel.style.cssText = [
      "width:100%",
      "margin:10px 0 4px",
      "padding:12px",
      "border:1px solid rgba(85,168,255,.55)",
      "border-radius:12px",
      "background:rgba(8,24,43,.92)",
      "color:#dcecff",
      "font-size:.84rem",
      "line-height:1.45"
    ].join(";");

    panel.innerHTML = `
      <strong>Website music player</strong>
      <div id="devicePlayerStatus" role="status" aria-live="polite" style="margin:4px 0 9px;color:#bcd7f5">
        Tap the ▶ beside a song. The player below will show the song and any loading error.
      </div>
      <audio id="deviceAudioPlayer" controls preload="metadata" playsinline style="display:block;width:100%;max-width:620px"></audio>
      <a id="deviceAudioDirectLink" href="#" target="_blank" rel="noopener" hidden style="display:inline-block;margin-top:8px;color:#8fd3ff;font-weight:800">
        Open this audio file directly
      </a>`;

    catalogHead.style.flexWrap = "wrap";
    catalogHead.appendChild(panel);
  }

  function installDirectPlayer() {
    const player = document.getElementById("deviceAudioPlayer");
    const status = document.getElementById("devicePlayerStatus");
    const directLink = document.getElementById("deviceAudioDirectLink");
    const songList = document.getElementById("songList");
    if (!player || !status || !directLink || !songList) return;

    player.volume = 0.8;
    let activeIndex = -1;

    const updateButtons = () => {
      document.querySelectorAll(".play[data-song-index]").forEach((button) => {
        const index = Number(button.dataset.songIndex);
        const active = index === activeIndex && !player.paused;
        button.textContent = active ? "❚❚" : "▶";
        button.classList.toggle("is-playing", active);
      });
    };

    const describeMediaError = () => {
      const code = player.error?.code;
      if (code === 1) return "Playback was stopped.";
      if (code === 2) return "The audio could not be downloaded from the website.";
      if (code === 3) return "This device could not decode the audio file.";
      if (code === 4) return "The audio file or format is not supported on this device.";
      return "The audio file could not be loaded.";
    };

    const playSong = (index) => {
      if (typeof songs === "undefined" || !songs[index]) {
        status.textContent = "The song list did not load. Refresh the page once.";
        return;
      }

      const song = songs[index];
      if (activeIndex === index && !player.paused) {
        player.pause();
        status.textContent = `Paused: ${song.title}`;
        updateButtons();
        return;
      }

      const audioUrl = new URL(encodeAudioPath(song.audio), window.location.origin).href;
      activeIndex = index;
      directLink.href = audioUrl;
      directLink.hidden = false;
      directLink.style.display = "inline-block";
      status.textContent = `Loading: ${song.title}`;

      if (player.src !== audioUrl) {
        player.src = audioUrl;
        player.load();
      }

      const playAttempt = player.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch((error) => {
          status.textContent = `Could not start ${song.title}: ${error?.message || "tap Play on the player below"}`;
          updateButtons();
        });
      }

      fetch(audioUrl, { method: "HEAD", cache: "no-store" })
        .then((response) => {
          if (!response.ok) {
            status.textContent = `The song file is not available online (HTTP ${response.status}).`;
            return;
          }
          const type = response.headers.get("content-type") || "unknown type";
          const size = Number(response.headers.get("content-length") || 0);
          if (!player.paused) return;
          const sizeText = size ? `, ${(size / 1024 / 1024).toFixed(1)} MB` : "";
          status.textContent = `Song found online (${type}${sizeText}). Tap Play on the player below.`;
        })
        .catch(() => {
          if (player.paused) status.textContent = "The browser could not verify the song file. Try the direct-audio link below.";
        });
    };

    songList.addEventListener(
      "click",
      (event) => {
        const button = event.target.closest(".play[data-song-index]");
        if (!button) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        playSong(Number(button.dataset.songIndex));
      },
      true
    );

    player.addEventListener("playing", () => {
      const song = typeof songs !== "undefined" ? songs[activeIndex] : null;
      status.textContent = song ? `Now playing: ${song.title}` : "Now playing";
      updateButtons();
    });

    player.addEventListener("pause", updateButtons);
    player.addEventListener("waiting", () => {
      const song = typeof songs !== "undefined" ? songs[activeIndex] : null;
      if (song) status.textContent = `Buffering: ${song.title}`;
    });
    player.addEventListener("error", () => {
      const song = typeof songs !== "undefined" ? songs[activeIndex] : null;
      status.textContent = `${song ? `${song.title}: ` : ""}${describeMediaError()} Use the direct-audio link below to test the file.`;
      updateButtons();
    });
  }

  function strengthenOriginalAudioPlayer() {
    const audio = document.getElementById("siteAudio");
    if (!audio) return;
    audio.preload = "metadata";
    audio.setAttribute("playsinline", "");
    audio.setAttribute("webkit-playsinline", "");
  }

  function repairEverything() {
    repairCatalogLinks();
    addBiographyPortal();
    addPlaybackPanel();
    installDirectPlayer();
    strengthenOriginalAudioPlayer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", repairEverything, { once: true });
  } else {
    repairEverything();
  }

  const songList = document.getElementById("songList");
  if (songList) {
    new MutationObserver(repairCatalogLinks).observe(songList, { childList: true, subtree: true });
  }
})();