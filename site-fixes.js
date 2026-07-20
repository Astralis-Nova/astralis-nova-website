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

  function addPlaybackNotice() {
    if (document.getElementById("crossDeviceMusicNotice")) return;
    const catalogHead = document.querySelector(".catalog-head");
    if (!catalogHead) return;

    const notice = document.createElement("div");
    notice.id = "crossDeviceMusicNotice";
    notice.setAttribute("role", "status");
    notice.innerHTML = "<strong>Listen here:</strong> Tap the ▶ beside any song. Phones and new computers require one tap before sound can begin.";
    notice.style.cssText = [
      "grid-column:1/-1",
      "width:100%",
      "margin:10px 0 2px",
      "padding:10px 12px",
      "border:1px solid rgba(85,168,255,.45)",
      "border-radius:10px",
      "background:rgba(8,24,43,.88)",
      "color:#dcecff",
      "font-size:.82rem",
      "line-height:1.45"
    ].join(";");

    catalogHead.style.flexWrap = "wrap";
    catalogHead.appendChild(notice);
  }

  function strengthenAudioPlayer() {
    const audio = document.getElementById("siteAudio");
    if (!audio) return;
    audio.preload = "metadata";
    audio.setAttribute("playsinline", "");
    audio.setAttribute("webkit-playsinline", "");

    audio.addEventListener("error", () => {
      const status = document.getElementById("musicStatus");
      if (status) status.textContent = "This song could not load. Refresh once, then tap ▶ again.";
    });
  }

  function repairEverything() {
    repairCatalogLinks();
    addPlaybackNotice();
    strengthenAudioPlayer();
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
