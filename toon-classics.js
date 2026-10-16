(() => {
"use strict";
const scene=document.getElementById("classicToonScene");
const fleet=document.getElementById("classicToonFleet");
const dialog=document.getElementById("classicToonDialog");
if(!scene||!fleet||!dialog)return;
const svg=(label,inner)=>`<svg xmlns="http://www.w3.org/2000/svg" class="classic-figure" viewBox="0 0 240 270" role="img" aria-label="${label}">${inner}</svg>`;
const ink='#21202a',paper='#fffdf1';
const characters=[
{
id:"felix",name:"Felix the Cat",era:"1920s silent-cartoon era",source:"Early Felix silent cartoons, 1919–1920s",lane:"68%",speed:"23s",delay:"-9s",width:"108px",
action:"Runs after an escaping star, swishing his curly tail.",
art:svg("Hand-drawn 1920s-style black cat with expressive tail",`
<g class="classic-character">
<g class="classic-tail"><path d="M162 186Q225 187 218 146Q215 126 201 130Q189 138 205 150" fill="none" stroke="#17171f" stroke-width="17" stroke-linecap="round"/></g>
<g class="classic-leg-a"><path d="M97 200L76 240Q53 234 44 251Q49 264 78 259L117 218Z" fill="#17171f" stroke="#0b1018" stroke-width="5"/></g>
<g class="classic-leg-b"><path d="M143 202L165 243Q184 239 197 251Q197 267 166 263L122 217Z" fill="#17171f" stroke="#0b1018" stroke-width="5"/></g>
<path d="M78 148Q54 164 65 216Q79 245 123 234Q168 232 175 201Q174 155 148 142Z" fill="#17171f" stroke="#0b1018" stroke-width="5"/>
<g class="classic-arm-a"><path d="M81 171Q54 161 34 197Q34 215 49 210L93 198Z" fill="#17171f" stroke="#0b1018" stroke-width="5"/></g>
<g class="classic-arm-b"><path d="M155 169Q184 182 187 204Q183 221 165 213L141 194Z" fill="#17171f" stroke="#0b1018" stroke-width="5"/></g>
<g class="classic-head"><path d="M61 85L52 18L107 53Q134 41 156 55L193 24L176 91Q195 138 168 162Q136 190 91 175Q48 154 61 85Z" fill="#17171f" stroke="#090a12" stroke-width="6"/>
<path d="M80 56L68 36L82 62M164 53L179 38L171 65" stroke="#d5cfd1" stroke-width="3" fill="none"/>
<ellipse cx="104" cy="113" rx="20" ry="35" fill="#fffdf6"/><ellipse cx="142" cy="113" rx="20" ry="35" fill="#fffdf6"/>
<ellipse cx="111" cy="119" rx="6.5" ry="13" fill="#11131c"/><ellipse cx="136" cy="121" rx="6.5" ry="13" fill="#11131c"/>
<ellipse cx="121" cy="158" rx="36" ry="21" fill="#fffdf6"/><path d="M114 145L125 138L132 145L125 153Z" fill="#18181e"/>
<path d="M97 158Q122 174 145 155" fill="none" stroke="#17171f" stroke-width="4" stroke-linecap="round"/>
<path d="M91 150L56 145M92 157L52 164M148 150L182 143M149 157L187 163" stroke="#d3d1d6" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>
</g>`)
},
{
id:"oswald",name:"Oswald the Lucky Rabbit",era:"1927 silent-cartoon appearance",source:"Trolley Troubles (1927)",lane:"72%",speed:"20s",delay:"-3s",width:"119px",
action:"Hops over the moonflowers while his long ears flap.",
art:svg("1927-style black lucky rabbit with long floppy ears",`
<g class="classic-character">
<g class="classic-ears"><path d="M94 91Q32 8 52 7Q76 -4 118 78Z" fill="#1a1920" stroke="#11111a" stroke-width="5"/>
<path d="M138 85Q146 -11 174 7Q196 24 159 97Z" fill="#1a1920" stroke="#11111a" stroke-width="5"/>
<path d="M91 65L65 28M153 65Q167 24 172 21" fill="none" stroke="#c6bfc2" stroke-width="4" stroke-linecap="round"/></g>
<g class="classic-leg-a"><path d="M100 209L82 247Q67 244 58 255Q62 268 93 264L123 218Z" fill="#1a1920" stroke="#080b13" stroke-width="5"/></g>
<g class="classic-leg-b"><path d="M145 209L163 244Q191 243 196 258Q191 268 159 261L123 218Z" fill="#1a1920" stroke="#080b13" stroke-width="5"/></g>
<path d="M87 158Q67 168 71 208Q78 241 129 240Q173 240 175 199Q172 160 153 155Z" fill="#17171e" stroke="#080d13" stroke-width="5"/>
<path d="M89 205Q127 218 169 203L161 235Q128 248 94 231Z" fill="#f3eee3" stroke="#101019" stroke-width="4"/>
<g class="classic-arm-a"><path d="M86 166Q55 169 45 201Q41 220 56 223Q70 209 94 199Z" fill="#17171e" stroke="#080d13" stroke-width="5"/></g>
<g class="classic-arm-b"><path d="M158 166Q197 157 209 178Q211 189 196 192L167 196Z" fill="#17171e" stroke="#080d13" stroke-width="5"/></g>
<g class="classic-head"><path d="M65 112Q68 76 123 73Q177 71 185 115Q191 155 160 177Q125 195 85 171Q60 150 65 112Z" fill="#16161e" stroke="#0d1018" stroke-width="6"/>
<ellipse cx="105" cy="121" rx="21" ry="30" fill="#fffcf3"/><ellipse cx="146" cy="121" rx="20" ry="30" fill="#fffcf3"/>
<ellipse cx="113" cy="124" rx="6.5" ry="11" fill="#191820"/><ellipse cx="137" cy="124" rx="6.5" ry="11" fill="#191820"/>
<ellipse cx="126" cy="157" rx="41" ry="24" fill="#fffcf3"/><ellipse cx="126" cy="143" rx="12" ry="8" fill="#191820"/>
<path d="M125 152Q121 174 102 164M126 152Q132 175 148 163" stroke="#191820" stroke-width="3.8" fill="none" stroke-linecap="round"/></g>
</g>`)
},
{
id:"mickey1928",name:"Mickey (1928)",era:"Steamboat Willie-era version",source:"Steamboat Willie (1928)",lane:"76%",speed:"26s",delay:"-18s",width:"102px",
action:"Runs across the hills with a bouncy rubber-hose stride.",
art:svg("Hand-drawn 1928 black-and-white Mickey without later white gloves",`
<g class="classic-character">
<path d="M151 185Q207 194 193 224" stroke="#212029" stroke-width="8" fill="none" stroke-linecap="round"/>
<g class="classic-leg-a"><path d="M100 206Q84 226 77 244L50 249Q39 264 72 264Q103 264 111 241L125 215Z" fill="#1c1a22" stroke="#11121b" stroke-width="5"/></g>
<g class="classic-leg-b"><path d="M142 206Q158 225 164 243Q194 241 203 258Q195 266 167 263Q135 254 124 215Z" fill="#1c1a22" stroke="#11121b" stroke-width="5"/></g>
<g class="classic-arm-a"><path d="M86 164Q54 171 39 199Q32 217 47 219Q59 217 65 199L96 186Z" fill="#1c1a22" stroke="#11121b" stroke-width="5"/></g>
<g class="classic-arm-b"><path d="M156 164Q186 182 186 205Q188 221 176 222Q162 221 160 201L145 187Z" fill="#1c1a22" stroke="#11121b" stroke-width="5"/></g>
<path d="M95 161Q77 179 87 214Q122 234 165 211Q176 182 151 158Z" fill="#24212a" stroke="#11121b" stroke-width="5"/>
<path d="M89 196Q126 207 169 194L163 220Q126 231 88 215Z" fill="#e9e7dd" stroke="#191821" stroke-width="5"/>
<ellipse cx="109" cy="209" rx="7" ry="9" fill="#202027"/><ellipse cx="149" cy="210" rx="7" ry="9" fill="#202027"/>
<g class="classic-head"><circle cx="55" cy="73" r="37" fill="#1c1b21" stroke="#11121b" stroke-width="5"/><circle cx="184" cy="70" r="37" fill="#1c1b21" stroke="#11121b" stroke-width="5"/>
<path d="M68 94Q68 50 120 47Q171 49 175 101Q183 132 150 158Q116 174 86 149Q64 126 68 94Z" fill="#1a1a21" stroke="#11121b" stroke-width="5"/>
<path d="M88 100Q86 74 102 74Q118 74 117 104Q120 73 138 75Q155 78 149 131Q123 143 101 131Z" fill="#fffdf5"/>
<ellipse cx="106" cy="109" rx="6" ry="13" fill="#191820"/><ellipse cx="135" cy="109" rx="6" ry="13" fill="#191820"/>
<path d="M77 124Q104 108 120 128Q141 112 164 127Q173 143 146 153Q121 162 99 156Q80 154 77 124Z" fill="#f8f4e9"/>
<ellipse cx="120" cy="130" rx="16" ry="11" fill="#1d1b24"/>
<path d="M101 146Q124 162 148 143" stroke="#302729" stroke-width="4" fill="none" stroke-linecap="round"/></g>
</g>`)
},
{
id:"minnie1928",name:"Minnie (1928)",era:"Steamboat Willie-era version",source:"Steamboat Willie (1928)",lane:"62%",speed:"30s",delay:"-10s",width:"105px",
action:"Dances among the clouds, her old-fashioned flower hat bobbing.",
art:svg("Hand-drawn Minnie 1928 with flower hat, without later polka-dot bow",`
<g class="classic-character">
<g class="classic-leg-a"><path d="M103 218Q73 242 70 253Q46 250 47 261Q66 273 90 264L121 224Z" fill="#1c1a21" stroke="#11121b" stroke-width="5"/></g>
<g class="classic-leg-b"><path d="M145 216Q158 239 172 254Q196 246 203 260Q188 273 164 265L130 225Z" fill="#1c1a21" stroke="#11121b" stroke-width="5"/></g>
<g class="classic-arm-a"><path d="M90 165Q57 170 48 194Q35 200 43 213Q56 225 70 204L100 187Z" fill="#1e1c23" stroke="#11121b" stroke-width="5"/></g>
<g class="classic-arm-b"><path d="M153 165Q184 145 196 125Q208 121 210 139Q207 157 171 192Z" fill="#1e1c23" stroke="#11121b" stroke-width="5"/></g>
<path d="M95 160Q75 176 88 193L75 225Q110 251 174 225L155 192Q167 173 149 158Z" fill="#e6e1d7" stroke="#181821" stroke-width="5"/>
<path d="M85 211Q120 232 166 210" stroke="#353039" stroke-width="4.5" fill="none"/>
<g class="classic-head"><circle cx="56" cy="73" r="37" fill="#1b1a20" stroke="#11121b" stroke-width="5"/><circle cx="184" cy="70" r="37" fill="#1b1a20" stroke="#11121b" stroke-width="5"/>
<path d="M69 94Q74 49 120 47Q174 46 177 104Q181 142 144 159Q112 172 84 150Q63 128 69 94Z" fill="#1b1921" stroke="#11121b" stroke-width="5"/>
<path d="M87 101Q85 75 102 76Q119 74 118 105Q120 74 140 75Q154 79 150 109L147 131Q120 141 101 131Z" fill="#fffdf2"/>
<ellipse cx="106" cy="109" rx="6" ry="13" fill="#181820"/><ellipse cx="136" cy="109" rx="6" ry="13" fill="#181820"/>
<path d="M79 124Q102 112 119 127Q141 113 165 127Q171 144 147 154Q121 162 99 156Q81 153 79 124Z" fill="#f8f4e7"/>
<ellipse cx="120" cy="131" rx="15" ry="10" fill="#191821"/>
<path d="M101 146Q125 160 145 145" stroke="#30272d" stroke-width="4" fill="none"/>
<circle cx="119" cy="38" r="13" fill="#fcf9ed" stroke="#181821" stroke-width="3"/>
<g fill="#fcf9ed" stroke="#181821" stroke-width="3"><ellipse cx="119" cy="20" rx="8" ry="11"/><ellipse cx="137" cy="37" rx="11" ry="8"/><ellipse cx="119" cy="54" rx="8" ry="11"/><ellipse cx="101" cy="38" rx="11" ry="8"/></g>
<circle cx="119" cy="38" r="6" fill="#24212a"/></g>
</g>`)
},
{
id:"popeye1929",name:"Popeye (1929)",era:"Thimble Theatre comic strip",source:"Thimble Theatre, January 17, 1929",lane:"64%",speed:"32s",delay:"-21s",width:"112px",
action:"Struts with oversized forearms and a classic sailor's pipe.",
art:svg("Hand-drawn 1929 comic-strip-era sailor Popeye with cap and squint",`
<g class="classic-character">
<g class="classic-leg-a"><path d="M86 194L77 244Q47 241 44 254Q40 268 73 265L112 253L116 204Z" fill="#33343b" stroke="#10141b" stroke-width="5"/></g>
<g class="classic-leg-b"><path d="M124 198L147 247Q179 243 187 259Q183 269 150 266L112 241Z" fill="#33343b" stroke="#10141b" stroke-width="5"/></g>
<path d="M75 134Q91 112 116 116Q149 116 160 145L144 215Q108 231 73 212Z" fill="#414451" stroke="#191820" stroke-width="5"/>
<path d="M75 143L107 170L144 143" stroke="#eee9dd" stroke-width="12" fill="none"/><path d="M93 155L108 177L120 155" fill="#eae6dd" stroke="#151a23" stroke-width="2.5"/>
<g class="classic-arm-a"><path d="M72 140Q43 126 32 160Q20 192 47 197Q66 196 81 178L85 154Z" fill="#e9d5b9" stroke="#1b1920" stroke-width="5"/><path d="M34 175l19-4M36 183q8 9 17-1" fill="none" stroke="#51493e" stroke-width="3"/></g>
<g class="classic-arm-b"><path d="M152 137Q181 125 194 146Q217 143 218 165Q216 184 195 188Q173 199 157 180Z" fill="#ead6b7" stroke="#1e1d21" stroke-width="5"/><path d="M183 169q8-17 24-12M186 183q15-5 19-19" stroke="#4e4949" stroke-width="3" fill="none"/><path d="M182 152l5 13-6 8-8-8Z" fill="#45596a"/></g>
<g class="classic-head"><path d="M81 103Q69 82 79 58Q87 36 110 41Q139 37 146 70Q153 104 131 128Q101 141 81 103Z" fill="#e9d4bd" stroke="#25222a" stroke-width="5"/>
<path d="M78 51Q71 31 89 24Q112 15 142 33L154 43L143 55Q113 39 78 51Z" fill="#f9f3e7" stroke="#27232a" stroke-width="4.5"/>
<path d="M77 50L152 44" stroke="#27232a" stroke-width="4"/>
<path d="M91 81Q99 76 110 83" stroke="#281f21" stroke-width="5" fill="none"/>
<ellipse cx="124" cy="84" rx="5" ry="9" fill="#25202a"/>
<path d="M134 93Q157 91 154 103Q143 114 126 110" fill="#e9d4bd" stroke="#25222a" stroke-width="4"/>
<path d="M105 109q13 10 24 2" stroke="#352a2a" stroke-width="4" fill="none"/>
<path d="M142 100L174 95L178 90" fill="none" stroke="#55504b" stroke-width="5" stroke-linecap="round"/>
</g></g>`)
},
{
id:"gertie",name:"Gertie the Dinosaur",era:"1914 animation",source:"Gertie the Dinosaur (1914)",lane:"74%",speed:"41s",delay:"-18s",width:"152px",
action:"Lumbers across the landscape, cheerfully bobbing her neck.",
art:svg("Hand-drawn friendly 1914 Gertie long-neck dinosaur",`
<g class="classic-character">
<g class="classic-tail"><path d="M82 178Q23 175 7 226Q29 209 92 213" fill="#949f94" stroke="#424747" stroke-width="5"/></g>
<g class="classic-leg-a"><path d="M72 204L66 254Q55 262 91 262L114 220Z" fill="#9da99e" stroke="#3d4640" stroke-width="5"/></g>
<g class="classic-leg-b"><path d="M148 204L150 254Q163 268 190 259L170 210Z" fill="#9aa79b" stroke="#3d4640" stroke-width="5"/></g>
<ellipse cx="116" cy="190" rx="89" ry="56" fill="#b4bfb0" stroke="#3b4441" stroke-width="5"/>
<ellipse cx="114" cy="202" rx="64" ry="38" fill="#e2e2d6" opacity=".6"/>
<g class="classic-head"><path d="M164 177Q160 106 171 73Q183 36 203 44Q220 55 211 80L198 188Z" fill="#acb9ad" stroke="#39443e" stroke-width="5"/>
<path d="M181 59Q179 19 204 18Q230 21 226 50L231 71Q218 83 194 76Z" fill="#adbcaf" stroke="#39443e" stroke-width="5"/>
<path d="M192 66Q222 59 237 73Q226 89 205 83" fill="#cdd8c5" stroke="#414844" stroke-width="3.5"/>
<circle cx="214" cy="43" r="6" fill="#2b3035"/><circle cx="216" cy="40" r="2" fill="white"/>
<circle cx="222" cy="61" r="2" fill="#444a41"/>
<path d="M201 79Q215 88 234 79" fill="none" stroke="#545a52" stroke-width="3"/></g>
<g class="classic-arm-a"><path d="M70 206L69 245Q73 254 90 250L89 217" fill="#afb9ae" stroke="#434b45" stroke-width="5"/></g>
<g class="classic-arm-b"><path d="M130 212L135 253Q146 262 164 253L156 211" fill="#afb9ae" stroke="#434b45" stroke-width="5"/></g>
</g>`)
}
];
const animationCss=[
'.an-vintage-toon{display:inline-grid;place-items:center;width:min(100%,280px);aspect-ratio:1;background:transparent}',
'.an-vintage-toon svg{width:100%;height:auto;overflow:visible}',
'.an-vintage-toon .classic-character{animation:vt-bob 1.2s ease-in-out infinite}',
'.an-vintage-toon .classic-leg-a,.an-vintage-toon .classic-leg-b,.an-vintage-toon .classic-arm-a,.an-vintage-toon .classic-arm-b,.an-vintage-toon .classic-tail,.an-vintage-toon .classic-head,.an-vintage-toon .classic-ears{transform-box:fill-box;transform-origin:50% 5%}',
'.an-vintage-toon .classic-leg-a,.an-vintage-toon .classic-arm-b{animation:vt-stride .63s ease-in-out infinite alternate}',
'.an-vintage-toon .classic-leg-b,.an-vintage-toon .classic-arm-a{animation:vt-stride .63s ease-in-out infinite alternate-reverse}',
'.an-vintage-toon .classic-tail,.an-vintage-toon .classic-ears,.an-vintage-toon .classic-head{animation:vt-wiggle 1.1s ease-in-out infinite alternate}',
'@keyframes vt-bob{0%,100%{transform:translateY(4px)}50%{transform:translateY(-10px)}}',
'@keyframes vt-stride{from{transform:rotate(-16deg)}to{transform:rotate(17deg)}}',
'@keyframes vt-wiggle{from{transform:rotate(-5deg)}to{transform:rotate(6deg)}}',
'@media(prefers-reduced-motion:reduce){.an-vintage-toon *{animation:none!important}}'
].join('\n');
const wrap=r=>'<div class="an-vintage-toon" data-classic="'+r.id+'">'+r.art+'</div>';
function source(r){
return '<!-- Astralis Nova original SVG animation based on '+r.source+'. US public-domain-era interpretation. Independent, not studio-endorsed. -->\n'+
'<!-- This original vector drawing and code are dedicated to CC0 1.0. Character trademarks and modern designs are not licensed. -->\n'+
'<style>\n'+animationCss+'\n</style>\n'+wrap(r);
}
const style=document.createElement('style');
style.id='classicToonsCSS';
style.textContent=animationCss+`
.classic-scene{position:relative;isolation:isolate;overflow:hidden;height:500px;border:2px solid #eac6ff99;border-radius:25px;
background:radial-gradient(ellipse at 76% 19%,#fff1ba 0,#ffcca6 10%,transparent 18%),linear-gradient(180deg,#363a90,#6f66ae 40%,#eca9af 80%,#f6cfab);
box-shadow:inset 0 -30px 80px #613b8e88,0 14px 55px #06031c9c}
.classic-scene:before{content:"";position:absolute;z-index:1;left:-10%;bottom:-46%;width:120%;height:89%;border-radius:50% 50% 0 0;background:radial-gradient(ellipse at 50% 3%,#d5f7b0 0,#82d999 35%,#467c83 80%);box-shadow:0 -9px 25px #c2f9b999}
.classic-scene .classic-cloud{position:absolute;top:17%;left:22%;width:120px;height:35px;border-radius:80px;background:#fff9f0a8;box-shadow:35px -18px 0 -3px #fff9f0c0,65px 0 0 -4px #fff9f0c0;animation:classicCloud 13s ease-in-out infinite alternate}
.classic-scene .classic-cloud.two{left:72%;top:39%;scale:.7;animation-delay:-5s}
.classic-stars{position:absolute;z-index:2;left:13%;top:12%;font-size:25px;color:#fff7bb;text-shadow:0 0 12px #fff;animation:classicTwinkle 3s ease-in-out infinite alternate}
.classic-stars.two{left:85%;top:25%;animation-delay:-1s}
.classic-planet-tree{position:absolute;z-index:3;bottom:12%;left:7%;font-size:75px;filter:drop-shadow(0 6px 4px #434b6c66)}
.classic-planet-tree.two{left:auto;right:9%;bottom:16%;font-size:62px}
.classic-planet-pond{position:absolute;z-index:3;left:39%;bottom:7%;width:27%;height:7%;border-radius:50%;background:radial-gradient(ellipse,#ebfff9,#68bed1 70%);box-shadow:0 0 15px #fff8}
.classic-planet-prompt{position:absolute;z-index:9;top:16px;left:16px;padding:9px 13px;border:1px solid #f7efefa6;border-radius:12px;background:#171b45c9;font-size:.8rem;font-weight:850;color:#fff}
.classic-fleet{position:absolute;z-index:7;inset:0;pointer-events:none}
.classic-traveler{position:absolute;z-index:8;top:var(--lane);left:-165px;width:var(--width);padding:0;border:0;display:grid;place-items:center;
background:none;color:#fff;font:inherit;cursor:pointer;pointer-events:auto;filter:drop-shadow(0 4px 6px #2a264861);animation:classicTravel var(--speed) linear infinite;animation-delay:var(--delay)}
.classic-traveler .an-vintage-toon{width:100%;transition:scale .2s}
.classic-traveler .classic-name{white-space:nowrap;padding:4px 8px;border-radius:100px;background:#191c42dd;border:1px solid #e6f8fb9c;font-weight:850;font-size:11px}
.classic-traveler:hover,.classic-traveler:focus-visible{animation-play-state:paused;z-index:11;filter:drop-shadow(0 0 12px #ffffd5)}
.classic-traveler:hover .an-vintage-toon,.classic-traveler:focus-visible .an-vintage-toon{scale:1.14}
.classic-traveler:focus-visible{outline:3px solid #7fffe2;outline-offset:3px;border-radius:15px}
.classic-notice{color:#d6d6ec;line-height:1.7;font-size:.87rem;margin:15px 0}
.classic-notice a{color:#a9f9ea}
.classic-popup{box-sizing:border-box;max-width:min(760px,calc(100vw - 18px));width:100%;max-height:92dvh;overflow:auto;
border:2px solid #cbb0ec;border-radius:23px;background:linear-gradient(145deg,#2b2658,#11152e);color:white;padding:clamp(14px,3vw,28px);box-shadow:0 24px 90px #000c}
.classic-popup::backdrop{background:#040518df;backdrop-filter:blur(6px)}
.classic-popup-close{float:right;background:#191d3f;color:#fff;border:1px solid #9dabd1;border-radius:24px;padding:7px 12px}
.classic-popup h3{font-size:clamp(1.3rem,3vw,1.9rem);margin:12px 0}
.classic-popup p{color:#d8d8ed;line-height:1.55}
.classic-popup-top{display:grid;grid-template-columns:minmax(130px,200px) 1fr;gap:16px;align-items:center}
.classic-popup-preview{background:radial-gradient(circle,#7774a8,#1d204b);min-height:210px;border-radius:15px;display:grid;place-items:center}
.classic-popup-preview .an-vintage-toon{width:min(100%,180px)}
.classic-code{width:100%;box-sizing:border-box;min-height:150px;border:1px solid #a3abd8;border-radius:13px;padding:12px;resize:vertical;background:#0c1027;color:#cbf8f4;font:12px/1.45 ui-monospace,monospace}
.classic-copy-btn{border:0;background:#a0f5da;color:#0f2831;border-radius:30px;padding:12px 19px;font-weight:900;margin-top:12px}
.classic-copy-status{color:#a8ffe6!important;min-height:1.2rem}
@keyframes classicTravel{from{left:-165px}to{left:calc(100% + 165px)}}
@keyframes classicCloud{to{translate:40px 0}}
@keyframes classicTwinkle{to{opacity:.4;scale:.84}}
@media(max-width:700px){.classic-scene{height:430px;border-radius:16px}.classic-traveler{width:min(var(--width),94px)}
.classic-traveler[data-toon="gertie"]{width:116px}.classic-planet-tree{font-size:47px}.classic-planet-tree.two{font-size:38px}
.classic-planet-prompt{max-width:79%;font-size:.73rem}.classic-popup-top{grid-template-columns:1fr}
.classic-popup-preview{min-height:155px}.classic-popup-preview .an-vintage-toon{width:135px}}
@media(prefers-reduced-motion:reduce){.classic-cloud,.classic-stars,.classic-traveler{animation:none!important}
.classic-traveler{left:var(--still-x)!important}}
`;
document.head.appendChild(style);
scene.insertAdjacentHTML('afterbegin',`<div class="classic-cloud" aria-hidden="true"></div><div class="classic-cloud two" aria-hidden="true"></div>
<span class="classic-stars" aria-hidden="true">✦</span><span class="classic-stars two" aria-hidden="true">✧</span>
<span class="classic-planet-tree" aria-hidden="true">🌳</span><span class="classic-planet-tree two" aria-hidden="true">🌳</span>
<span class="classic-planet-pond" aria-hidden="true"></span>
<div class="classic-planet-prompt">✦ Tap a moving toon to get its code</div>`);
const preview=dialog.querySelector('#classicToonPreview');
const title=dialog.querySelector('#classicToonTitle');
const desc=dialog.querySelector('#classicToonDescription');
const cite=dialog.querySelector('#classicToonSource');
const field=dialog.querySelector('#classicToonCode');
const copyStatus=dialog.querySelector('#classicCopyStatus');
let selected=characters[0];
function open(character){
selected=character;
title.textContent=character.name+' • '+character.era;
desc.textContent=character.action;
cite.textContent='Historical source: '+character.source+'. Only pre-1931 traits; no studio affiliation.';
preview.innerHTML=wrap(character);
field.value=source(character);
copyStatus.textContent='';
if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');
}
characters.forEach((character,index)=>{
const button=document.createElement('button');
button.type='button';button.className='classic-traveler';button.dataset.toon=character.id;
button.setAttribute('aria-label','Open '+character.name+' animation and copy code');
for(const [key,val] of Object.entries({'--speed':character.speed,'--delay':character.delay,'--lane':character.lane,'--width':character.width,'--still-x':(6+index*14)+'%'}))button.style.setProperty(key,val);
button.innerHTML=wrap(character)+'<span class="classic-name">'+character.name+'</span>';
button.addEventListener('click',()=>open(character));
fleet.appendChild(button);
});
const close=()=>{if(dialog.close)dialog.close();else dialog.removeAttribute('open')};
dialog.querySelector('#classicCloseButton').addEventListener('click',close);
dialog.addEventListener('click',event=>{if(event.target===dialog)close()});
dialog.querySelector('#classicCopyButton').addEventListener('click',async()=>{
try{
if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(field.value)}
else{field.focus();field.select();if(!document.execCommand('copy'))throw Error('clipboard')}
copyStatus.textContent='✓ Copied '+selected.name+'! Paste into your website’s Custom HTML/Embed block.';
}catch(_){field.focus();field.select();copyStatus.textContent='Highlight and copy the code manually.';}
});
})();
