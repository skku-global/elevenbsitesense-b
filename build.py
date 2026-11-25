#!/usr/bin/env python3
"""Builds the Stratum site. Edit the CONFIG and CONTENT below, run `python3 build.py`, upload the output."""
import os, json, html as H
OUT = os.path.dirname(os.path.abspath(__file__)) + "/public"
SITE = "https://elevenbsitesense.com"
BRAND, LEGAL, RC = "Eleven B Site Sense", "ELEVEN B SITE-SENSE NIGERIA LIMITED", "7650068"
PHONES = [("08034456275", "2348034456275"), ("08072791980", "2348072791980"), ("08124025129", "2348124025129")]
PHONE, WA, EMAIL = PHONES[0][0], PHONES[0][1], "info@elevenbsitesense.com"
ADDR = "4th Floor, Lister Building, Ring Road, Ibadan, Oyo State"
FORM = "https://formspree.io/f/YOUR_FORM_ID"  # <- replace (or use any form service)

STEPS = [("Site visit or video call", "We look at your plot, measure, and listen to what you want."),
         ("Written quote and drawings", "A fixed price and a timeline in writing, before any work starts."),
         ("Build with weekly updates", "Photos and short videos every week, sent to your phone."),
         ("Handover", "A walk-through, a snag list fixed, and a named person to call afterwards.")]

# slug: (nav title, h1, meta description, intro, includes, faqs, related)
S = {
"swimming-pool-construction": ("Swimming pool construction", "Swimming pool construction in Nigeria",
  "Concrete swimming pool design and construction in Nigeria for homes, hotels and estates. Fixed-price quotes and weekly photo updates for clients abroad.",
  "We design and build concrete swimming pools from excavation to the first fill, including plumbing, filtration, tiling and the paving around the pool. One team handles the whole job, so you deal with one person.",
  ["Site survey and pool design", "Excavation and reinforced concrete shell", "Plumbing, pumps and filtration", "Waterproofing, tiling and coping", "Surrounding deck in interlock or stamped paving", "Lighting, first fill and handover test"],
  [("How long does it take to build a pool?", "A typical home pool takes about 8 to 14 weeks, depending on size, soil and finish. You get a written timeline with your quote."),
   ("How much does a swimming pool cost?", "It depends on size, depth, finish and equipment. We give a fixed written quote after a site visit or a call with your measurements, so you know the price before work starts."),
   ("Can I manage the build from abroad?", "Yes. We send weekly photo and video updates and tie payments to finished stages. Our Build from abroad page explains the full process.")],
  ["residential-swimming-pools", "commercial-swimming-pools", "pool-renovation-and-repair"]),
"residential-swimming-pools": ("Residential swimming pools", "Residential swimming pools for homes and estates",
  "Custom swimming pools for private homes and estates in Nigeria: plunge pools, family pools and lap pools, built and finished by one team.",
  "A home pool should fit your compound, your family and your budget. We design the size and shape around your plot, then build and finish it, including the area around it.",
  ["Pool sizes and shapes to suit your plot", "Plunge pools and shallow areas for children", "Built-in steps and seating", "Pool-side paving, tiling and lighting"],
  [("Can you build a pool in a small compound?", "Often yes. A plunge pool or narrow lap pool fits many compounds. We check space and soil first."),
   ("Which pool finish lasts longest?", "Mosaic or porcelain tile lasts well and cleans easily. We show you samples before you choose.")],
  ["swimming-pool-construction", "interlock-paving", "tiling"]),
"commercial-swimming-pools": ("Commercial swimming pools", "Commercial swimming pools for hotels and estates",
  "Commercial swimming pool construction in Nigeria for hotels, estates, schools and gyms: larger pools, heavy-use filtration and safe surfaces.",
  "Shared pools work harder than home pools. We size the shell, filtration and surfaces for daily use, and we plan the schedule to keep disruption low.",
  ["Larger shells with proper depth profiles", "Filtration sized for heavy use", "Anti-slip tiling and safety rails", "Phased schedules to limit disruption"],
  [("Do you build to safety standards?", "We follow safe depth markings, anti-slip surfaces and fencing practice, and we confirm local requirements for your site before we build.")],
  ["swimming-pool-construction", "general-building-contracting", "tiling"]),
"pool-renovation-and-repair": ("Pool renovation and repair", "Swimming pool renovation and repair",
  "Swimming pool renovation in Nigeria: leak repair, re-tiling, new pumps and filters, and new decking for pools that have seen better days.",
  "If your pool leaks, looks tired or has failing equipment, we inspect it first and tell you honestly whether repair or rebuild costs less.",
  ["Leak detection and repair", "Re-tiling and re-plastering", "Pump and filter replacement", "New coping and surrounding paving"],
  [("Can an old pool be saved?", "In most cases yes. We inspect the shell first and tell you if repair or rebuild makes more sense.")],
  ["swimming-pool-construction", "tiling", "interlock-paving"]),
"general-building-contracting": ("General building contracting", "General building contracting in Nigeria",
  "General building contractor in Nigeria for houses, duplexes, apartments and commercial buildings. Itemised quotes and weekly site reports.",
  "We build houses, duplexes, apartment blocks and small commercial buildings from your architect’s drawings or ours, with itemised costs and regular site reports.",
  ["Foundations and structure", "Blockwork, roofing and finishing", "Drawings and a bill of quantities", "Site supervision with weekly reports"],
  [("Can you build from my architect’s drawings?", "Yes. We price from your drawings, or prepare them for you if you don’t have any."),
   ("Do I get an itemised cost?", "Yes. You receive a bill of quantities, so you can see where the money goes.")],
  ["interlock-paving", "tiling", "painting"]),
"pop-ceiling-installation": ("P.O.P. ceiling installation", "P.O.P. ceiling installation",
  "P.O.P. ceiling design and installation in Nigeria: plain, stepped and cove ceilings with hidden lighting, finished smooth for paint.",
  "A good ceiling changes how a room feels. We install plain, stepped and cove P.O.P. ceilings with space for hidden lighting, finished smooth and ready for paint.",
  ["Plain, stepped and cove designs", "Hidden lighting channels", "Smooth finish ready for paint", "Repairs to existing ceilings"],
  [("How long does a ceiling take?", "A living room usually takes one to three days, depending on the design. We confirm the time in your quote.")],
  ["painting", "artwork-and-interior-design", "general-building-contracting"]),
"artwork-and-interior-design": ("Artwork and interior design", "Artwork and interior design",
  "Interior design and artwork for homes and offices in Nigeria, including remote design for clients abroad.",
  "We plan the layout, choose furniture and lighting, and place artwork so rooms feel designed, not just filled. We also work remotely for clients abroad.",
  ["Space planning and mood boards", "Furniture and lighting selection", "Curtains, rugs and soft furnishing", "Artwork sourcing and hanging"],
  [("Can you design my home remotely?", "Yes. We work from your floor plan, share boards online and agree choices on video calls.")],
  ["pop-ceiling-installation", "painting", "tiling"]),
"tiling": ("Tiling", "Tiling for floors, walls and pool areas",
  "Professional tiling in Nigeria for floors, walls, bathrooms, kitchens and pool areas, laid level and grouted neatly.",
  "Tiles only look good when they are laid level. We tile floors, walls, bathrooms, kitchens and pool areas, with aligned joints and tidy grout.",
  ["Floor and wall tiling", "Bathrooms and kitchens", "Anti-slip outdoor and pool tiling", "Large-format porcelain tiles"],
  [("Which tile should I choose for outdoors?", "Choose an anti-slip tile rated for outdoor use. We bring samples and explain the options.")],
  ["swimming-pool-construction", "interlock-paving", "painting"]),
"interlock-paving": ("Interlock paving", "Interlock paving for driveways and compounds",
  "Interlock paving in Nigeria for driveways, walkways and compounds: compacted base, proper drainage and neat patterns.",
  "Paving lasts when the base is right. We prepare and compact the ground, set the falls for drainage, and lay interlock in the pattern and colour you choose.",
  ["Base preparation and compaction", "Drainage falls", "Colours and patterns", "Kerbs and edging"],
  [("Can interlock take the weight of cars?", "Yes, when the base is compacted properly. That is where we spend the most care.")],
  ["imported-stamped-interlock", "general-building-contracting", "swimming-pool-construction"]),
"imported-stamped-interlock": ("Imported stamped interlock", "Imported stamped interlock paving",
  "Imported stamped interlock paving in Nigeria for entrances, walkways and pool decks, with stone and wood-look textures.",
  "Imported stamped interlock has textured surfaces that suit entrances, walkways and pool decks. We supply and lay it, then seal it.",
  ["Imported stamped pavers in several patterns", "Entrances, walkways and pool decks", "Slip-resistant surfaces", "Sealing for colour and stain protection"],
  [("What is the difference from normal interlock?", "Stamped interlock has a textured, patterned surface for feature areas. Standard interlock suits everyday driveways.")],
  ["interlock-paving", "swimming-pool-construction", "tiling"]),
"painting": ("Painting", "Interior and exterior painting",
  "Painting services in Nigeria: interior and exterior, with proper surface preparation, primer and clean finish.",
  "Good paint starts with good preparation. We repair and prime surfaces, then apply clean finish coats inside and out.",
  ["Surface repair and preparation", "Primer and finish coats", "Interior and exterior painting", "Weather-resistant exterior finishes"],
  [("How many coats do you apply?", "Usually one primer coat and two finish coats.")],
  ["pop-ceiling-installation", "general-building-contracting", "artwork-and-interior-design"]),
}
POOL = ["swimming-pool-construction", "residential-swimming-pools", "commercial-swimming-pools", "pool-renovation-and-repair"]
OTHER = [k for k in S if k not in POOL]

CSS = """:root{--bg:#F4F5F2;--paper:#fff;--ink:#16201E;--mute:#4F5A55;--teal:#086B77;--deep:#06323A;--line:#D3D6D0;--f:'Instrument Sans',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;--d:'Big Shoulders Display','Arial Narrow',Impact,sans-serif}
*{box-sizing:border-box;margin:0}body{background:var(--bg);color:var(--ink);font:400 18px/1.6 var(--f)}
a{color:var(--teal)}:focus-visible{outline:3px solid var(--teal);outline-offset:3px}
.w{max-width:1120px;margin:0 auto;padding:0 24px}
header{background:var(--paper);border-bottom:1px solid var(--line)}header .w{display:flex;flex-wrap:wrap;gap:12px 28px;align-items:center;justify-content:space-between;padding-top:14px;padding-bottom:14px}
.logo{font:900 28px var(--d);letter-spacing:.04em;color:var(--ink);text-decoration:none}
nav{display:flex;flex-wrap:wrap;gap:6px 24px;font-size:16px}nav a{color:var(--ink);text-decoration:none;padding:6px 0}nav a:hover,nav a[aria-current]{color:var(--teal);text-decoration:underline;text-underline-offset:6px}
.btn{display:inline-block;background:var(--teal);color:#fff;padding:13px 24px;border-radius:4px;font-weight:600;text-decoration:none}.btn:hover{background:var(--deep)}
.btn.o{background:none;color:var(--ink);border:1px solid var(--ink)}.btn.o:hover{background:var(--ink);color:#fff}
h1,h2,h3{font-family:var(--d);text-transform:uppercase;line-height:1;letter-spacing:.01em}
h1{font-size:clamp(44px,7vw,84px);font-weight:900;max-width:16ch}h2{font-size:clamp(30px,4vw,44px);font-weight:800;margin-bottom:18px}h3{font-size:26px;font-weight:700;margin-bottom:8px}
.hero{background:var(--deep);color:#fff;padding:clamp(48px,8vw,96px) 0;background-image:repeating-linear-gradient(172deg,rgba(255,255,255,.05) 0 2px,transparent 2px 26px)}
.hero p{max-width:56ch;margin:22px 0 30px;font-size:20px;color:#D8E6E8}.hero .btn.o{color:#fff;border-color:#fff}.hero .btn.o:hover{background:#fff;color:var(--deep)}
.hero .btn:not(.o){background:#fff;color:var(--deep)}.hero .btn:not(.o):hover{background:#CDE7EA}
.row{display:flex;flex-wrap:wrap;gap:14px}
section{padding:clamp(40px,6vw,72px) 0}section.alt{background:var(--paper);border-block:1px solid var(--line)}
.crumb{font-size:15px;color:#C5D8DB;margin-bottom:20px}.crumb a{color:#fff}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px}
.card{background:var(--paper);border:1px solid var(--line);border-radius:6px;padding:24px;display:block;text-decoration:none;color:var(--ink)}
.card:hover{border-color:var(--teal)}.card p{color:var(--mute);font-size:16px}.card span{color:var(--teal);font-weight:600;font-size:16px}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,5vw,64px)}@media(max-width:800px){.cols{grid-template-columns:1fr}}
.tick{list-style:none;padding:0}.tick li{padding:11px 0 11px 30px;border-bottom:1px solid var(--line);position:relative}.tick li:before{content:"";position:absolute;left:4px;top:19px;width:12px;height:7px;border:solid var(--teal);border-width:0 0 3px 3px;transform:rotate(-45deg)}
.steps{counter-reset:s;list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px}
.steps li{counter-increment:s;border-top:3px solid var(--teal);padding-top:14px}.steps li:before{content:"Step " counter(s);display:block;font-size:14px;color:var(--mute)}.steps b{display:block;font-size:19px}.steps span{color:var(--mute);font-size:16px}
details{border-bottom:1px solid var(--line);padding:16px 0}summary{cursor:pointer;font-weight:600;font-size:19px}details p{margin-top:10px;color:var(--mute);max-width:64ch}
.ph{aspect-ratio:4/3;border:1px dashed var(--teal);border-radius:6px;display:grid;place-items:center;text-align:center;color:var(--mute);font-size:15px;padding:20px;background:repeating-linear-gradient(135deg,transparent 0 12px,rgba(8,107,119,.06) 12px 24px)}
.cta{background:var(--deep);color:#fff;text-align:center}.cta p{max-width:50ch;margin:0 auto 26px;color:#D8E6E8}.cta .btn{background:#fff;color:var(--deep)}.cta .btn.o{background:none;color:#fff;border-color:#fff}.cta .row{justify-content:center}
form{display:grid;gap:16px;max-width:560px}label{font-weight:600;font-size:16px;display:grid;gap:6px}input,select,textarea{font:inherit;padding:12px;border:1px solid #8E9893;border-radius:4px;background:#fff;color:var(--ink)}
footer{background:#0B1513;color:#B9C4BF;padding:48px 0 90px;font-size:16px}footer a{color:#fff}footer .grid{grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}footer h3{color:#fff;font-size:20px}footer li{list-style:none;padding:3px 0}footer ul{padding:0}
.wa{position:fixed;right:18px;bottom:18px;background:#1E7A43;color:#fff;padding:13px 20px;border-radius:40px;font-weight:600;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.25)}
@media(prefers-color-scheme:dark){:root{--bg:#121917;--paper:#1A2320;--ink:#E7EBE8;--mute:#A4B0AA;--line:#2D3834;--teal:#4CC3D0}.btn{color:#06232A}.btn:hover{background:#9BE0E8;color:#06232A}.btn.o{color:var(--ink)}.btn.o:hover{color:#06232A;background:var(--ink)}.hero,.cta{background:#0A1F23}.hero .btn:not(.o){background:#fff;color:#0A1F23}footer{background:#0A100E}input,select,textarea{background:#0F1513;color:var(--ink);border-color:#586660}}
@media(prefers-reduced-motion:no-preference){.card{transition:border-color .2s}}
"""

PART = {"swimming-pool-construction": "p2", "residential-swimming-pools": "p2", "commercial-swimming-pools": "p2", "pool-renovation-and-repair": "p2", "general-building-contracting": "p1", "pop-ceiling-installation": "p3", "artwork-and-interior-design": "p4", "tiling": "p5", "interlock-paving": "p6", "imported-stamped-interlock": "p7", "painting": "p8"}
CSS += """
.stage{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:clamp(24px,5vw,72px);padding:clamp(32px,5vw,64px) 0}
.stage h1{font-size:clamp(46px,6vw,88px);max-width:14ch}.stage .lede{max-width:46ch;margin:22px 0 28px;color:var(--mute);font-size:20px}
.plate{background:var(--paper);border:1px solid var(--line);padding:16px;color:var(--ink);align-self:start}.stage .plate{position:sticky;top:16px}
.plate svg{width:100%;height:auto;display:block}.cap{display:flex;justify-content:space-between;gap:12px;border-top:1px solid var(--line);margin-top:10px;padding-top:10px;font-size:14px;color:var(--mute)}.cap b{color:var(--ink)}
.rp{margin-top:10px;width:100%;cursor:pointer;background:none;color:var(--ink);border:1px solid var(--line);padding:9px;font:600 14px var(--f);border-radius:4px}.rp:hover{border-color:var(--teal);color:var(--teal)}
.sl{list-style:none;padding:0;margin-top:34px;border-top:1px solid var(--ink)}.sl a{display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding:13px 0 11px;border-bottom:1px solid var(--line);text-decoration:none;color:var(--ink)}
.sl b{font:700 clamp(24px,2.8vw,34px)/1.1 var(--d);text-transform:uppercase;letter-spacing:.02em;transition:transform .2s,color .2s}.sl small{color:var(--mute);font-size:14px;text-align:right}
.sl a:hover b,.sl a:focus-visible b{color:var(--teal);transform:translateX(8px)}.sl li.main a{padding:20px 0 18px}.sl li.main b{font-size:clamp(32px,3.8vw,48px);color:var(--teal)}
.part{transition:opacity .3s}.act .part{opacity:.15}.act .part.on{opacity:1}.part.on .hl{stroke:var(--teal)}
.hero.two .w{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:clamp(24px,5vw,64px);align-items:center}
@media(max-width:860px){.stage,.hero.two .w{grid-template-columns:1fr}.stage .plate{position:static;order:-1}}
.wave{animation:w 4s linear infinite}@keyframes w{to{transform:translateX(-24px)}}
.go .draw{animation:in .7s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:var(--t,0s)}
.go .sx,.go .sy,.go .sd{transform-box:fill-box;animation-delay:var(--t,0s)}
.go .sx{transform-origin:50% 50%;animation:sx .7s cubic-bezier(.3,.7,.2,1) backwards}.go .sy{transform-origin:50% 100%;animation:sy 1.3s cubic-bezier(.4,.1,.2,1) backwards}.go .sd{transform-origin:50% 0;animation:sy 1.1s cubic-bezier(.4,.1,.2,1) backwards}
.go .sx,.go .sy,.go .sd{animation-delay:var(--t,0s)}
@keyframes in{from{opacity:0;transform:translateY(14px)}}@keyframes sx{from{transform:scaleX(0)}}@keyframes sy{from{transform:scaleY(0)}}
.go .crane{animation:cr .7s 5.4s forwards}@keyframes cr{to{opacity:0;transform:translateY(-10px)}}
.go .hook{animation:tr 5.4s ease-in-out backwards}@keyframes tr{0%{transform:translate(0,0)}30%{transform:translate(-150px,0)}60%{transform:translate(-150px,0)}100%{transform:translate(-70px,0)}}
@media(prefers-reduced-motion:reduce){.go *{animation:none!important}.wave{animation:none}.crane{display:none}}
"""
JS = """(function(){var f=document.getElementById('enq');if(!f)return;var m=f.querySelector('.msg');f.addEventListener('submit',function(e){e.preventDefault();if(!f.checkValidity()){f.reportValidity();return}m.textContent='Sending...';var b={};['name','email','phone','service','message'].forEach(function(k){b[k]=f.elements[k].value});
fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json','Idempotency-Key':crypto.randomUUID()},body:JSON.stringify(b)}).then(function(r){return r.json().then(function(j){return{r:r,j:j}})}).then(function(x){if(x.r.ok&&x.j.ok===true){f.reset();m.textContent='Thank you. We have your enquiry and will reply soon.'}else m.textContent=x.j.fieldErrors?Object.values(x.j.fieldErrors).join(' '):'We could not send your enquiry. Please call or WhatsApp us.'}).catch(function(){m.textContent='We could not send your enquiry. Please call or WhatsApp us.'})})})();
(function(){var s=document.querySelector('.stage svg');if(!s)return;var cn=document.querySelector('.stage .cn'),cl=document.querySelector('.stage .cl'),T=[];
function hi(a){T.forEach(clearTimeout);s.classList.add('act');s.querySelectorAll('.part').forEach(function(p){p.classList.toggle('on',p.dataset.p===a.dataset.p)});cn.innerHTML='<b>'+a.dataset.n+'</b>';cl.textContent=a.dataset.l}
document.querySelectorAll('.sl a').forEach(function(a){a.addEventListener('mouseenter',function(){hi(a)});a.addEventListener('focus',function(){hi(a)})});
var st=[[0,'Excavating the site'],[.9,'Pouring the footing'],[1.3,'Raising the columns'],[2.6,'Casting the slabs'],[3.4,'Floors and paving'],[4.2,'Ceilings and interiors'],[4.8,'Painting'],[5.7,'Handed over. Hover a service.']];
function play(){T.forEach(clearTimeout);T=[];s.classList.remove('go','act');s.querySelectorAll('.part.on').forEach(function(p){p.classList.remove('on')});void s.getBoundingClientRect();s.classList.add('go');
st.forEach(function(x,i){T.push(setTimeout(function(){cn.innerHTML='<b>'+x[1]+'</b>';cl.textContent=i<st.length-1?'Stage '+(i+1)+' of '+(st.length-1):''},x[0]*1000))})}
window.playBuild=play;var r=document.querySelector('.rp');if(r)r.addEventListener('click',play);play()})();"""
def drawing(active=None, anim=False, name=""):
    on = lambda n: " on" if active == n else ""
    wv = "t12 0" * 22
    crane = ('<g class="crane" opacity=".7"><rect x="532" y="34" width="9" height="204" fill="url(#lat)"/><path d="M250 38H556M250 30H556M250 30V38M532 30l4.5-14 4.5 14"/><rect x="544" y="38" width="10" height="14" fill="currentColor"/><g class="hook"><path d="M500 38V78"/><rect x="486" y="78" width="30" height="7" fill="currentColor"/></g></g>') if anim else ""
    svg = f'''<svg class="dwg{" act" if active else ""}{" go" if anim else ""}" viewBox="0 0 560 380" role="img" aria-label="Cross-section of a building and swimming pool{", highlighting " + name if name else ""}"><defs>
<pattern id="brick" width="12" height="8" patternUnits="userSpaceOnUse"><path d="M0 4h12M6 0v4M0 4v4" stroke="currentColor" fill="none"/></pattern><pattern id="stamp" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M5 0l5 5-5 5-5-5z" stroke="currentColor" fill="none"/></pattern>
<pattern id="tile" width="8" height="7" patternUnits="userSpaceOnUse"><path d="M0 0h8M0 0v7" stroke="currentColor" fill="none"/></pattern><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v6" stroke="currentColor"/></pattern>
<pattern id="lat" width="10" height="14" patternUnits="userSpaceOnUse"><path d="M0 0l10 14M10 0L0 14" stroke="currentColor" stroke-width=".8" fill="none"/></pattern><clipPath id="pc"><path d="M14 250V336L100 344H236V250Z"/></clipPath></defs>
<g stroke="currentColor" fill="none" stroke-width="1.5"><path d="M0 250H560" stroke-width="2"/><rect x="240" y="252" width="320" height="20" fill="url(#hatch)" opacity=".3" stroke="none"/>{crane}
<g class="part{on("p2")}" data-p="p2"><path class="hl sd" style="--t:.1s" d="M14 250V336L100 344H236V250Z" fill="var(--teal)" fill-opacity=".22"/><g class="draw" style="--t:1.3s" clip-path="url(#pc)"><path class="wave" d="M0 264q6-6 12 0{wv}" stroke="var(--teal)"/><path class="wave" d="M0 284q6-6 12 0{wv}" stroke="var(--teal)" opacity=".5"/></g><path class="hl" d="M14 272h22v14h22v14h22" stroke-width="1"/><rect x="8" y="246" width="12" height="5" fill="currentColor"/><rect x="230" y="246" width="12" height="5" fill="currentColor"/></g>
<g class="part{on("p1")}" data-p="p1"><rect class="sx" style="--t:.9s" x="254" y="258" width="226" height="12" fill="currentColor"/><rect class="sy" style="--t:1.2s" x="262" y="100" width="8" height="158" fill="currentColor"/><rect class="sy" style="--t:1.5s" x="362" y="100" width="8" height="158" fill="currentColor"/><rect class="sy" style="--t:1.8s" x="462" y="100" width="8" height="158" fill="currentColor"/><rect class="sx" style="--t:2.6s" x="262" y="172" width="208" height="8" fill="currentColor"/><rect class="sx" style="--t:3s" x="256" y="92" width="220" height="8" fill="currentColor"/></g>
<g class="part draw{on("p5")}" data-p="p5" style="--t:3.4s"><rect class="hl" x="270" y="242" width="190" height="8" fill="url(#tile)"/><path class="hl" d="M270 242h190"/></g>
<g class="part draw{on("p6")}" data-p="p6" style="--t:3.7s"><rect class="hl" x="480" y="242" width="44" height="8" fill="url(#brick)"/><rect class="hl" x="480" y="242" width="44" height="8"/></g>
<g class="part draw{on("p7")}" data-p="p7" style="--t:3.9s"><rect class="hl" x="526" y="238" width="32" height="12" fill="url(#stamp)"/><rect class="hl" x="526" y="238" width="32" height="12"/></g>
<g class="part draw{on("p3")}" data-p="p3" style="--t:4.2s"><path class="hl" d="M270 100h184v10h-12v8H282v-8h-12z" fill="var(--paper)"/><path class="hl" d="M292 112h140" stroke-dasharray="3 3"/></g>
<g class="part draw{on("p4")}" data-p="p4" style="--t:4.5s"><rect class="hl" x="290" y="128" width="50" height="38" fill="var(--paper)"/><path class="hl" d="M296 160l14-20 10 12 8-8 8 16z" fill="var(--teal)" fill-opacity=".35"/><circle class="hl" cx="328" cy="138" r="4"/><path class="hl" d="M386 250v-30h30v30M380 220h42M440 118v16"/><circle class="hl" cx="440" cy="142" r="8"/></g>
<g class="part draw{on("p8")}" data-p="p8" style="--t:4.8s"><rect class="hl" x="470" y="100" width="8" height="150" fill="var(--teal)" fill-opacity=".35"/><rect class="hl" x="484" y="130" width="30" height="12" fill="var(--paper)"/><path class="hl" d="M514 136h8v20h-22v8M500 164v20"/></g></g>
<g fill="currentColor" font-size="11" font-family="Instrument Sans,sans-serif" opacity=".65"><text x="248" y="98" text-anchor="end">+8.40</text><text x="248" y="176" text-anchor="end">+4.20</text><text x="248" y="238" text-anchor="end">±0.00</text><text x="120" y="320" text-anchor="middle" fill="var(--teal)" opacity="1">pool, 3.4 m deep</text><text x="14" y="372">Section A–A, not to scale</text></g></svg>'''
    cap = f'<div class="cap"><span class="cn"><b>{name or "Hover a service"}</b></span><span class="cl">{"Highlighted in the building" if name else ""}</span></div>'
    return svg + cap + ('<button class="rp" type="button">Replay the build</button>' if anim else "")

import shutil
def imgs(k):
    src = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images", k)
    if not os.path.isdir(src): return []
    fs = sorted(f for f in os.listdir(src) if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")))
    os.makedirs(f"{OUT}/images/{k}", exist_ok=True)
    for f in fs: shutil.copy(os.path.join(src, f), f"{OUT}/images/{k}/{f}")
    return [f"/images/{k}/{f}" for f in fs]
GAL = {k: {"t": v[0], "d": v[3], "i": v[4][:4], "u": f"/{k}/", "s": imgs(k), "n": 6 if k in POOL else 4, "h": 190 if k in POOL else (30 + 40 * list(S).index(k)) % 360} for k, v in S.items()}
GAL["work"] = {"t": "Our work", "s": imgs("work"), "n": 8, "h": 195}
GJ = json.dumps(GAL, ensure_ascii=False).replace("</", "<\\/")
MODAL = '<div class="gm" id="gm" hidden><div class="gm-bg"></div><div class="gm-panel" role="dialog" aria-modal="true" aria-labelledby="gm-t" tabindex="-1"><div class="gm-h"><div><small>Service gallery</small><h2 id="gm-t"></h2></div><button class="gm-x" type="button" aria-label="Close gallery">&times;</button></div><div class="gm-b"><div class="gm-s"></div><div class="gm-i"></div></div></div></div>'
CSS += """
.sv{position:relative;aspect-ratio:16/10;background:#0b1d20;overflow:hidden}.sv:focus-visible{outline-offset:-3px}
.gs{position:absolute;inset:0;opacity:0;transform:scale(1.04);transition:opacity 1s ease,transform 1.6s ease}.gs.on{opacity:1;transform:none}
.gs img,.ph2{width:100%;height:100%;object-fit:cover;display:block}
.ph2{display:grid;place-items:center;text-align:center;color:rgba(255,255,255,.9);font-size:16px;line-height:1.4;background:linear-gradient(135deg,hsl(var(--h) 40% 38%),hsl(calc(var(--h) + 35) 36% 18%))}.ph2 small{opacity:.7;font-size:13px}
.ct{position:absolute;top:14px;right:14px;background:rgba(255,255,255,.92);color:#222;font-size:13px;padding:4px 10px;letter-spacing:.06em}
.bp,.bn{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:64px;border:0;background:rgba(255,255,255,.9);color:#222;font-size:30px;cursor:pointer}.bp{left:0}.bn{right:0}.bp:hover,.bn:hover{background:#fff}
.dots{position:absolute;bottom:12px;left:0;right:0;display:flex;gap:6px;justify-content:center;pointer-events:none}.dots i{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.5);transition:background .4s}.dots i.on{background:#fff}
.th{display:flex;gap:8px;overflow-x:auto;padding:10px 0 4px;scroll-behavior:smooth}.th button{flex:0 0 88px;aspect-ratio:4/3;padding:0;border:2px solid transparent;background:none;cursor:pointer;opacity:.65;transition:opacity .4s,border-color .4s}.th button.on{border-color:var(--teal);opacity:1}
.gm{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px}.gm[hidden]{display:none}
.gm-bg{position:absolute;inset:0;background:rgba(4,18,20,.78);opacity:0;transition:opacity .7s ease}
.gm-panel{position:relative;width:min(1120px,100%);max-height:calc(100dvh - 40px);overflow:auto;background:var(--paper);color:var(--ink);opacity:0;transform:translateY(48px) scale(.93);transition:opacity .7s cubic-bezier(.5,0,.75,0),transform .8s cubic-bezier(.5,0,.75,0)}.gm-panel:focus{outline:none}
.gm.open .gm-bg{opacity:1;transition-duration:1s}.gm.open .gm-panel{opacity:1;transform:none;transition:opacity 1s cubic-bezier(.16,1,.3,1) .1s,transform 1.1s cubic-bezier(.16,1,.3,1) .1s}
.gm-h{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px 28px;border-bottom:1px solid var(--line)}.gm-h small{color:var(--teal);font-weight:600;font-size:14px}.gm-h h2{margin:2px 0 0;font-size:clamp(28px,4vw,40px)}
.gm-x{width:46px;height:46px;border:1px solid var(--line);background:none;color:var(--ink);font-size:28px;line-height:1;cursor:pointer}.gm-x:hover{border-color:var(--teal);color:var(--teal)}
.gm-b{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)}.gm-s{padding:0 0 12px}.gm-s .th{padding:10px 12px 0}
.gm-i{padding:28px;display:grid;align-content:start;gap:18px}.gm-i>*{opacity:0;transform:translateY(16px);transition:opacity .6s,transform .8s}.gm.open .gm-i>*{opacity:1;transform:none;transition-delay:.6s}.gm.open .gm-i>:nth-child(2){transition-delay:.75s}.gm.open .gm-i>:nth-child(3){transition-delay:.9s}
.gm-l{font-size:19px}.card.f{background:var(--deep);border-color:var(--deep);color:#fff}.card.f p{color:#C9DADC}.card.f span{color:#fff}.card.f:hover{border-color:#4CC3D0}
@media(max-width:860px){.gm-b{grid-template-columns:1fr}.gm{padding:0}.gm-panel{max-height:100dvh;min-height:100dvh}}
@media(prefers-reduced-motion:reduce){.gm *,.gs{transition-duration:.01s!important;transition-delay:0s!important}}
"""
JS += """
(function(){var gd=document.getElementById('gdata');if(!gd)return;var D=JSON.parse(gd.textContent);
function L(u){return window.PV?(u==='/'?'#home':'#'+u.split('/').join('')):u}
function ph(d,n,t){return '<div class="ph2" style="--h:'+((d.h+n*23)%360)+'">'+(t?'':'<span>Project photo '+(n+1)+'<br><small>Replace with a real image</small></span>')+'</div>'}
function pic(d,n,t){return d.s[n]?'<img src="'+d.s[n]+'" alt="'+d.t+' photo '+(n+1)+'" loading="lazy">':ph(d,n,t)}
function slider(host,d){var N=d.s.length||d.n,i=0,k,h='<div class="sv" tabindex="0" role="group" aria-roledescription="carousel" aria-label="'+d.t+' photos">';
for(k=0;k<N;k++)h+='<div class="gs'+(k?'':' on')+'">'+pic(d,k)+'</div>';
h+='<span class="ct"></span><button type="button" class="bp" aria-label="Previous photo">&#8249;</button><button type="button" class="bn" aria-label="Next photo">&#8250;</button><div class="dots">';
for(k=0;k<N;k++)h+='<i></i>';h+='</div></div><div class="th">';
for(k=0;k<N;k++)h+='<button type="button" aria-label="Show photo '+(k+1)+'">'+pic(d,k,1)+'</button>';
host.innerHTML=h+'</div>';
var gs=host.querySelectorAll('.gs'),dt=host.querySelectorAll('.dots i'),tb=host.querySelectorAll('.th button'),ct=host.querySelector('.ct'),th=host.querySelector('.th'),sv=host.querySelector('.sv');
function show(n){i=(n+N)%N;for(var k=0;k<N;k++){var o=k===i;gs[k].classList.toggle('on',o);dt[k].classList.toggle('on',o);tb[k].classList.toggle('on',o)}ct.textContent=(i+1)+' / '+N;th.scrollLeft=tb[i].offsetLeft-th.clientWidth/2+tb[i].clientWidth/2}
host.querySelector('.bp').onclick=function(){show(i-1)};host.querySelector('.bn').onclick=function(){show(i+1)};
tb.forEach(function(b,k){b.onclick=function(){show(k)}});
var x0=null;sv.addEventListener('pointerdown',function(e){x0=e.clientX});sv.addEventListener('pointerup',function(e){if(x0!==null&&Math.abs(e.clientX-x0)>40)show(i+(e.clientX<x0?1:-1));x0=null});
host.go=function(n){show(i+n)};show(0);return host}
var w=document.getElementById('work');if(w&&D.work)slider(w,D.work);
var gm=document.getElementById('gm'),pn=gm.querySelector('.gm-panel'),last=null,cur=null,busy=0;
function open(k,from){var d=D[k];if(!d||busy)return;last=from||document.activeElement;gm.querySelector('#gm-t').textContent=d.t;cur=slider(gm.querySelector('.gm-s'),d);
gm.querySelector('.gm-i').innerHTML='<p class="gm-l">'+d.d+'</p><ul class="tick">'+d.i.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul><div class="row"><a class="btn" href="'+L('/contact/')+'">Enquire about this service</a><a class="btn o" href="'+L(d.u)+'">Full service page</a></div>';
gm.hidden=false;void gm.offsetWidth;gm.classList.add('open');document.documentElement.style.overflow='hidden';setTimeout(function(){pn.focus()},150)}
function close(){if(!gm.classList.contains('open'))return;gm.classList.remove('open');busy=1;setTimeout(function(){gm.hidden=true;busy=0;document.documentElement.style.overflow='';if(last&&last.focus)last.focus()},900)}
gm.addEventListener('click',function(e){if(e.target===gm||e.target.classList.contains('gm-bg')||e.target.closest('.gm-x')||e.target.closest('.gm-i a'))close()});
document.addEventListener('click',function(e){var a=e.target.closest('[data-g]');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;e.preventDefault();open(a.dataset.g,a)});
document.addEventListener('keydown',function(e){if(!gm.classList.contains('open'))return;if(e.key==='Escape')close();else if(e.key==='ArrowRight')cur.go(1);else if(e.key==='ArrowLeft')cur.go(-1);else if(e.key==='Tab'){var f=pn.querySelectorAll('a[href],button,[tabindex="0"]'),a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}})})();"""
def nav(cur):
    items = [("/swimming-pool-construction/", "Swimming pools"), ("/services/", "Other services"), ("/build-from-abroad/", "Build from abroad"), ("/contact/", "Contact")]
    return "".join(f'<a href="{u}"{" aria-current=page" if u == cur else ""}>{t}</a>' for u, t in items)

def page(path, title, desc, main, ld, hero=None):
    url = SITE + path
    ldj = "".join(f'<script type="application/ld+json">{json.dumps(x)}</script>' for x in ld)
    foot_pool = "".join(f'<li><a href="/{k}/">{S[k][0]}</a></li>' for k in POOL)
    foot_oth = "".join(f'<li><a href="/{k}/">{S[k][0]}</a></li>' for k in OTHER)
    return f"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{H.escape(title)}</title><meta name="description" content="{H.escape(desc)}"><link rel="canonical" href="{url}">
<meta property="og:title" content="{H.escape(title)}"><meta property="og:description" content="{H.escape(desc)}"><meta property="og:url" content="{url}"><meta property="og:type" content="website"><meta property="og:image" content="{SITE}/og.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Instrument+Sans:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css">{ldj}</head><body>
<header><div class="w"><a class="logo" href="/">{BRAND.upper()}</a><nav aria-label="Main">{nav(path)}</nav><a class="btn" href="/contact/">Get a free quote</a></div></header>
<main>{main}</main>
<footer><div class="w"><div class="grid"><div><h3>{BRAND}</h3><p>We build it better. Swimming pools and building works in Nigeria, managed for clients at home and abroad.</p><p>{ADDR}<br>{"<br>".join(f'<a href="tel:+{i}">{n}</a>' for n, i in PHONES)}<br><a href="mailto:{EMAIL}">{EMAIL}</a></p><p>{LEGAL}<br>RC {RC}</p></div>
<div><h3>Swimming pools</h3><ul>{foot_pool}</ul></div><div><h3>Other services</h3><ul>{foot_oth}</ul></div><div><h3>Company</h3><ul><li><a href="/build-from-abroad/">Build from abroad</a></li><li><a href="/contact/">Contact</a></li></ul></div></div></div></footer>
{MODAL}<script type="application/json" id="gdata">{GJ}</script>
<a class="wa" href="https://wa.me/{WA}">WhatsApp us</a><script src="/app.js"></script></body></html>"""

def write(path, content):
    d = OUT + path
    os.makedirs(d, exist_ok=True)
    open(d + "index.html", "w", encoding="utf-8").write(content)

def hero(h1, p, crumbs, btns=True, side=""):
    c = " / ".join(f'<a href="{u}">{t}</a>' for u, t in crumbs[:-1] + []) + (" / " if len(crumbs) > 1 else "") + crumbs[-1][1]
    b = '<div class="row"><a class="btn" href="/contact/">Get a free quote</a><a class="btn o" href="/build-from-abroad/">Building from abroad?</a></div>' if btns else ""
    return f'<div class="hero{" two" if side else ""}"><div class="w"><div><div class="crumb">{c}</div><h1>{h1}</h1><p>{p}</p>{b}</div>{side}</div></div>'

def bc(items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": SITE + u} for i, (u, n) in enumerate(items)]}

def faq_ld(f):
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in f]}

def faq_html(f):
    return "".join(f"<details><summary>{H.escape(q)}</summary><p>{H.escape(a)}</p></details>" for q, a in f)

def steps_html():
    return '<ol class="steps">' + "".join(f"<li><b>{a}</b><span>{b}</span></li>" for a, b in STEPS) + "</ol>"

def cta(h="Tell us what you want to build"):
    return f'<section class="cta"><div class="w"><h2>{h}</h2><p>Send your plot size, location and ideas. You get a reply within one working day, in your time zone.</p><div class="row"><a class="btn" href="/contact/">Get a free quote</a><a class="btn o" href="https://wa.me/{WA}">Chat on WhatsApp</a></div></div></section>'

# Service pages
for k, (nm, h1, desc, intro, inc, faqs, rel) in S.items():
    path = f"/{k}/"
    crumbs = [("/", "Home")] + ([("/swimming-pool-construction/", "Swimming pools")] if k in POOL and k != POOL[0] else [("/services/", "Services")] if k not in POOL else []) + [(path, nm)]
    kids = ""
    if k == POOL[0]:
        kids = '<section class="alt"><div class="w"><h2>Types of pool we build</h2><div class="grid">' + "".join(f'<a class="card" href="/{c}/" data-g="{c}"><h3>{S[c][0]}</h3><p>{S[c][3].split(".")[0]}.</p><span>View gallery</span></a>' for c in POOL[1:]) + "</div></div></section>"
    relh = "".join(f'<a class="card" href="/{r}/" data-g="{r}"><h3>{S[r][0]}</h3><p>{S[r][3].split(".")[0]}.</p><span>View gallery</span></a>' for r in rel)
    main = hero(h1, intro, crumbs, True, '<aside class="plate">' + drawing(PART[k], False, nm) + '</aside>') + f"""<section><div class="w cols"><div><h2>What’s included</h2><ul class="tick">{''.join(f'<li>{H.escape(i)}</li>' for i in inc)}</ul></div>
<div class="ph" role="img" aria-label="Add a project photo of {H.escape(nm.lower())}">Add a real project photo here<br>(name the file {k}.jpg and write a clear alt text)</div></div></section>{kids}
<section class="alt"><div class="w"><h2>How the work goes</h2>{steps_html()}</div></section>
<section><div class="w"><h2>Common questions</h2>{faq_html(faqs)}</div></section>
<section class="alt"><div class="w"><h2>Related services</h2><div class="grid">{relh}</div></div></section>{cta()}"""
    ld = [bc([(u, n) for u, n in crumbs]), faq_ld(faqs), {"@context": "https://schema.org", "@type": "Service", "name": h1, "description": desc, "areaServed": "Nigeria", "provider": {"@type": "GeneralContractor", "name": BRAND, "url": SITE}}]
    write(path, page(path, f"{h1} | {BRAND}", desc, main, ld))

# Home
pool_cards = "".join(f'<a class="card f" href="/{k}/" data-g="{k}"><h3>{S[k][0]}</h3><p>{S[k][3].split(".")[0]}.</p><span>View gallery</span></a>' for k in POOL)
oth = "".join(f'<a class="card" href="/{k}/" data-g="{k}"><h3>{S[k][0]}</h3><p>{S[k][3].split(".")[0]}.</p><span>View gallery</span></a>' for k in OTHER)
LV = {"swimming-pool-construction": "Our main work", "general-building-contracting": "Structure", "pop-ceiling-installation": "+8.40", "artwork-and-interior-design": "+4.20", "tiling": "±0.00", "interlock-paving": "Exterior", "imported-stamped-interlock": "Exterior", "painting": "Facade"}
rows = "".join(f'<li{" class=main" if k == POOL[0] else ""}><a href="/{k}/" data-g="{k}" data-p="{PART[k]}" data-n="{S[k][0]}" data-l="{LV[k]}"><b>{S[k][0]}</b><small>{LV[k]}</small></a></li>' for k in [POOL[0]] + OTHER)
home = f'<div class="w"><div class="stage"><div><h1>Swimming pools in Nigeria, from foundation to finish</h1><p class="lede">We build swimming pools from the first dig to the first swim, then pave, tile and finish everything around them. Based in Ibadan, building for clients in Nigeria and abroad.</p><div class="row"><a class="btn" href="/contact/">Get a free quote</a><a class="btn o" href="/build-from-abroad/">Building from abroad?</a></div><ul class="sl">{rows}</ul></div><aside class="plate">{drawing(None, True)}</aside></div></div>' + f"""
<section><div class="w cols"><div><h2>Our work</h2><p style="margin-bottom:22px">Browse recent work, or open any service to see photos of that service. Every page below has its own gallery.</p><a class="btn" href="/contact/">Plan your pool</a></div><div id="work"></div></div></section>
<section class="alt"><div class="w"><h2>Swimming pools</h2><p style="max-width:60ch;margin-bottom:26px">Pools are our main work. Whatever the size, you get one team, one price in writing and regular updates.</p><div class="grid">{pool_cards}</div></div></section>
<section><div class="w"><h2>Other services</h2><div class="grid">{oth}</div></div></section>
<section class="alt"><div class="w cols"><div><h2>Living abroad? Build with confidence.</h2><p style="margin-bottom:22px">Many of our clients live outside Nigeria. We send weekly photos and videos, tie payments to finished stages, and are on WhatsApp in your time zone.</p><a class="btn" href="/build-from-abroad/">See how it works</a></div><div class="ph" role="img" aria-label="Add a photo of a recent pool project">Add a real project photo here</div></div></section>
<section><div class="w"><h2>How a project works</h2>{steps_html()}</div></section>{cta()}"""
org = {"@context": "https://schema.org", "@type": "GeneralContractor", "name": BRAND, "legalName": LEGAL, "url": SITE, "telephone": PHONE, "email": EMAIL, "areaServed": "Nigeria", "address": {"@type": "PostalAddress", "streetAddress": "4th Floor, Lister Building, Ring Road", "addressLocality": "Ibadan", "addressRegion": "Oyo State", "addressCountry": "NG"}}
write("/", page("/", f"Swimming Pool Construction in Nigeria | {BRAND}", "Swimming pool construction and building works in Nigeria. One team for the pool, paving, tiling and finishing, with weekly updates for clients abroad.", home, [org]))

# Services hub
sv = hero("Our services", "Swimming pools first, plus everything needed to build and finish the rest of your property.", [("/", "Home"), ("/services/", "Services")], False) + '<section><div class="w"><h2>Swimming pools</h2><div class="grid">' + pool_cards + '</div></div></section><section class="alt"><div class="w"><h2>Other services</h2><div class="grid">' + oth + "</div></div></section>" + cta()
write("/services/", page("/services/", f"Pool Construction & Building Services | {BRAND}", "Swimming pool construction, general building, P.O.P. ceilings, tiling, interlock paving, interior design and painting in Nigeria.", sv, [bc([("/", "Home"), ("/services/", "Services")])]))

# Abroad
ab_items = [("Weekly photo and video report", "Every week you get dated photos and a short walkthrough video of the site."), ("Payments tied to stages", "You pay when a stage is finished and you have seen it, not in advance for work that hasn’t happened."), ("A named site manager", "One person you can message, who knows your project."), ("Written quote and timeline", "The price, the stages and the dates are in writing before we start."), ("Receipts and documents", "Material and payment records are shared with you in one folder."), ("Calls in your time zone", "We schedule video calls to suit where you live.")]
abf = [("Can you start without me visiting Nigeria?", "Yes. We can survey from your measurements and photos, or meet a family member or representative on site, then agree everything on video."),
       ("How do I pay from abroad?", "We accept bank transfer and agree the payment schedule in writing. You pay stage by stage as work is completed."),
       ("What if I want to change something during the build?", "Tell us on WhatsApp. We confirm any change and its cost in writing before we do it.")]
ab = hero("Build in Nigeria while you live abroad", "Clear updates, clear prices and payments that follow the work. This is how we manage projects for clients overseas.", [("/", "Home"), ("/build-from-abroad/", "Build from abroad")]) + f'<section><div class="w"><h2>What you can expect</h2><div class="grid">{"".join(f"<div class=card><h3>{a}</h3><p>{b}</p></div>" for a,b in ab_items)}</div></div></section><section class="alt"><div class="w"><h2>How a project works</h2>{steps_html()}</div></section><section><div class="w"><h2>Common questions</h2>{faq_html(abf)}</div></section>' + cta("Start your project from anywhere")
write("/build-from-abroad/", page("/build-from-abroad/", f"Build in Nigeria From Abroad | {BRAND}", "How we build swimming pools and homes in Nigeria for clients living abroad: weekly video updates, staged payments and a named site manager.", ab, [bc([("/", "Home"), ("/build-from-abroad/", "Build from abroad")]), faq_ld(abf)]))

# Contact
opts = "".join(f'<option value="{k}">{S[k][0]}</option>' for k in [POOL[0]] + OTHER) + '<option value="not-sure">Multiple services / not sure yet</option>'
ct = hero("Get a free quote", "Tell us what you want to build and where. We reply within one working day.", [("/", "Home"), ("/contact/", "Contact")], False) + f"""<section><div class="w cols"><form id="enq" novalidate><label>Your name<input name="name" required minlength="2" autocomplete="name"></label><label>Email<input type="email" name="email" required autocomplete="email"></label><label>Phone or WhatsApp (with country code if abroad)<input name="phone" autocomplete="tel"></label><label>Service<select name="service">{opts}</select></label><label>Project details (at least 20 characters)<textarea name="message" required minlength="20" rows="5" placeholder="Location of the plot, size, and what you have in mind"></textarea></label><button class="btn" type="submit">Send enquiry</button><p class="msg" role="status" aria-live="polite"></p></form>
<div><h2>Or reach us directly</h2><ul class="tick">{"".join(f'<li><a href="https://wa.me/{i}">WhatsApp or call {n}</a></li>' for n, i in PHONES)}<li><a href="mailto:{EMAIL}">{EMAIL}</a></li><li>{ADDR}</li></ul></div></div></section>"""
write("/contact/", page("/contact/", f"Contact & Free Quote | {BRAND}", "Request a free quote for a swimming pool or building project in Nigeria. We reply within one working day.", ct, [bc([("/", "Home"), ("/contact/", "Contact")])]))

# Static files
open(OUT + "/style.css", "w").write(CSS)
urls = ["/"] + ["/services/", "/build-from-abroad/", "/contact/"] + [f"/{k}/" for k in S]
open(OUT + "/sitemap.xml", "w").write('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "".join(f"<url><loc>{SITE}{u}</loc></url>" for u in urls) + "</urlset>")
open(OUT + "/app.js", "w").write(JS)
open(OUT + "/robots.txt", "w").write(f"User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n")
print(len(urls), "pages written to", OUT)
