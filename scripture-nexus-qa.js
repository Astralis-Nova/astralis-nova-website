(() => {
  "use strict";

  const style = document.createElement("style");
  style.textContent = `
    body{
      background-color:#020611 !important;
      background-image:url('scripture-nexus-bg-cosmic.svg') !important;
      background-position:center top !important;
      background-size:cover !important;
      background-repeat:no-repeat !important;
      background-attachment:fixed !important;
    }
    body:before{
      background:linear-gradient(
        180deg,
        rgba(2,6,17,.16),
        rgba(2,6,17,.42) 46%,
        rgba(2,6,17,.72)
      ) !important;
    }
    @media(max-width:620px){body{background-attachment:scroll !important;}}
  `;
  document.head.appendChild(style);

  const core = document.createElement("script");
  core.src = "scripture-nexus-qa-core.js?v=20260829-cosmic-bg";
  core.async = false;
  document.head.appendChild(core);
})();
