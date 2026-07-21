(() => {
  "use strict";

  const isConquestPage = /\/conquest(?:\.html)?\/?$/i.test(window.location.pathname);
  if (!isConquestPage) return;

  function addStyles() {
    if (document.getElementById("conquestMediaStyles")) return;
    const style = document.createElement("style");
    style.id = "conquestMediaStyles";
    style.textContent = `
      .conquest-media-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:18px}
      .conquest-media-head h2{margin:0 0 7px!important}
      .conquest-media-head p{max-width:790px}
      .conquest-media-signal{display:inline-flex;align-items:center;gap:8px;padding:7px 11px;border:1px solid rgba(66,221,164,.38);border-radius:999px;background:rgba(12,60,47,.45);color:#9af2cf;font-size:.72rem;font-weight:900;letter-spacing:.06em;text-transform:uppercase}
      .conquest-media-signal::before{content:"";width:8px;height:8px;border-radius:50%;background:#42e0a5;box-shadow:0 0 12px #42e0a5}
      .conquest-media-columns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:18px}
      .conquest-media-group{padding:16px;border:1px solid rgba(95,148,214,.35);border-radius:15px;background:rgba(3,11,23,.55)}
      .conquest-media-group h3{margin:0 0 6px;font-size:1rem}
      .conquest-media-group>p{font-size:.83rem!important;line-height:1.5!important;margin:0 0 13px!important}
      .conquest-media-links{display:grid;gap:9px}
      .conquest-media-link{display:flex;align-items:center;gap:11px;padding:11px;border:1px solid rgba(91,142,205,.32);border-radius:12px;background:rgba(7,19,36,.72);text-decoration:none;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
      .conquest-media-link:hover,.conquest-media-link:focus-visible{transform:translateY(-2px);border-color:#70c7ff;box-shadow:0 11px 23px rgba(0,0,0,.25)}
      .conquest-media-icon{flex:0 0 37px;width:37px;height:37px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#267fe6,#8147d7);font-size:.78rem;font-weight:900}
      .conquest-media-link.wiki .conquest-media-icon{background:linear-gradient(135deg,#f2a14e,#be4f80)}
      .conquest-media-link.reddit .conquest-media-icon{background:linear-gradient(135deg,#ff7437,#c73535)}
      .conquest-media-link.signal .conquest-media-icon{background:linear-gradient(135deg,#36d39a,#2079a0)}
      .conquest-media-link strong{display:block;font-size:.86rem}
      .conquest-media-link small{display:block;margin-top:2px;color:#aebfd3;font-size:.72rem;line-height:1.35}
      .conquest-voices{margin-top:18px;padding:17px;border:1px solid rgba(255,193,94,.33);border-radius:14px;background:linear-gradient(145deg,rgba(43,28,8,.50),rgba(12,19,34,.70))}
      .conquest-voices h3{margin:0 0 10px}
      .conquest-voices-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px}
      .conquest-voice{padding:12px;border-radius:11px;border:1px solid rgba(255,205,116,.24);background:rgba(7,13,24,.58);color:#c4d0df;font-size:.8rem;line-height:1.5}
      .conquest-voice strong{display:block;color:#fff;margin-bottom:4px}
      .conquest-media-note{margin-top:15px;color:#9fb1c8!important;font-size:.78rem!important}
      @media(max-width:900px){.conquest-media-columns,.conquest-voices-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function mediaLink({ href, icon, title, description, kind = "signal" }) {
    return `
      <a class="conquest-media-link ${kind}" href="${href}" target="_blank" rel="noopener noreferrer">
        <span class="conquest-media-icon" aria-hidden="true">${icon}</span>
        <span><strong>${title}</strong><small>${description}</small></span>
      </a>`;
  }

  function addMediaRelay() {
    if (document.getElementById("conquest-media-relay")) return;
    const grid = document.querySelector(".content .grid");
    if (!grid) return;

    const article = document.createElement("article");
    article.className = "card wide";
    article.id = "conquest-media-relay";
    article.innerHTML = `
      <div class="conquest-media-head">
        <div>
          <p class="eyebrow">CONQUEST MEDIA RELAY</p>
          <h2>Custom Content, Community Reports & Outside Signals</h2>
          <p>The dedicated AC Conquest Fandom wiki documents server-specific systems and updates. These portals also collect Reddit discussions, public status tools, videos, and community destinations so travelers can compare official information with player experiences.</p>
        </div>
        <span class="conquest-media-signal">Signals located</span>
      </div>

      <div class="conquest-media-columns">
        <section class="conquest-media-group">
          <h3>📜 AC Conquest Fandom</h3>
          <p>The server-specific archive. This is the important wiki for Conquest additions rather than ordinary retail-era AC information.</p>
          <div class="conquest-media-links">
            ${mediaLink({href:"https://conquestac.fandom.com/wiki/Conquest_Custom_Content",icon:"CC",title:"Conquest Custom Content",description:"Patch history, custom dungeons, summons, systems, rewards, and current additions.",kind:"wiki"})}
            ${mediaLink({href:"https://conquestac.fandom.com/wiki/New_Player_Guide",icon:"NEW",title:"New Player Guide",description:"Starting route, banking commands, treasure maps, navigation, and repeatable activities.",kind:"wiki"})}
            ${mediaLink({href:"https://conquestac.fandom.com/wiki/Custom_Bosses_/_World_Bosses",icon:"B",title:"Custom & World Bosses",description:"Rumors and clues for Conquest bosses, rare encounters, and hidden threats.",kind:"wiki"})}
            ${mediaLink({href:"https://conquestac.fandom.com/wiki/Brand_New_Marketplace",icon:"MP",title:"Brand New Marketplace",description:"Floor-by-floor guide to vendors, portals, services, rewards, and trade facilities.",kind:"wiki"})}
            ${mediaLink({href:"https://conquestac.fandom.com/wiki/Category:Media",icon:"▶",title:"Conquest Media Category",description:"Wiki image and video collections plus trending Conquest guide pages.",kind:"wiki"})}
          </div>
        </section>

        <section class="conquest-media-group">
          <h3>👽 Reddit Field Reports</h3>
          <p>Public discussion from r/AsheronsCall. These are player viewpoints, not official server instructions.</p>
          <div class="conquest-media-links">
            ${mediaLink({href:"https://www.reddit.com/r/AsheronsCall/comments/1t18fz7/conquest_launched_in_february_250_active_players/",icon:"R",title:"Conquest Launch & Quest Post",description:"Server overview covering one-account play, crafting, progression, events, and custom content.",kind:"reddit"})}
            ${mediaLink({href:"https://www.reddit.com/r/AsheronsCall/comments/1sxl25q/which_server_is_better_infiniteleaftide_conquest/",icon:"R",title:"Server Comparison Discussion",description:"Players compare Conquest with Infinite Leaftide, DragonMoon, Eversong, and other worlds.",kind:"reddit"})}
            ${mediaLink({href:"https://www.reddit.com/r/AsheronsCall/comments/1urawff/looking_for_a_server/",icon:"R",title:"Recent Critical Viewpoint",description:"A player explains why Conquest's EOR structure and enlightenment progression were not their preference.",kind:"reddit"})}
            ${mediaLink({href:"https://www.reddit.com/r/AsheronsCall/search/?q=Conquest&restrict_sr=1&sort=new",icon:"🔎",title:"Search Reddit for Conquest",description:"Open the newest Conquest mentions inside the Asheron's Call subreddit.",kind:"reddit"})}
          </div>
        </section>

        <section class="conquest-media-group">
          <h3>📡 Other Media Outlets</h3>
          <p>Live population, uptime, community chat, and broader video discovery.</p>
          <div class="conquest-media-links">
            ${mediaLink({href:"https://www.youtube.com/results?search_query=Conquest+Asheron%27s+Call",icon:"YT",title:"YouTube Search",description:"Search for Conquest gameplay, guides, event footage, and player uploads."})}
            ${mediaLink({href:"https://treestats.net/Conquest",icon:"TS",title:"TreeStats Conquest",description:"Public character tracking, population, server description, and connection information."})}
            ${mediaLink({href:"https://servers.treestats.net/statuses/Conquest",icon:"UP",title:"Live Uptime Monitor",description:"Recent checks, response time, and server availability history."})}
            ${mediaLink({href:"https://discord.gg/Gsadhhv72S",icon:"D",title:"Conquest Discord",description:"The final authority for current patches, events, downloads, rules, and support."})}
          </div>
        </section>
      </div>

      <div class="conquest-voices">
        <h3>Community Signal Summary</h3>
        <div class="conquest-voices-grid">
          <div class="conquest-voice"><strong>What attracts players</strong>One-account play, active administrators, deeper crafting, regular events, updated quest rewards, and custom end-game progression are repeatedly highlighted.</div>
          <div class="conquest-voice"><strong>What to understand first</strong>Conquest builds on End of Retail rather than replacing it. Its custom systems, enlightenment progression, and balance choices may feel substantially different from another custom server.</div>
          <div class="conquest-voice"><strong>Best source order</strong>Use Discord and the Conquest Fandom wiki for current rules and content. Use Reddit, TreeStats, and videos to sample community experiences and activity.</div>
        </div>
      </div>

      <p class="conquest-media-note">No clearly maintained, dedicated Conquest Facebook page or official YouTube channel was located in the public search results. The YouTube and Reddit search portals remain useful for discovering new community posts as they appear.</p>`;

    grid.appendChild(article);
  }

  function boot() {
    addStyles();
    addMediaRelay();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();