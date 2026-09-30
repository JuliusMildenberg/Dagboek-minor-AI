const $=(s,c=document)=>c.querySelector(s);const $$=(s,c=document)=>[...c.querySelectorAll(s)];

// Mobile nav + scroll state
$('.nav-toggle')?.addEventListener('click',()=>{const nav=$('#main-nav');nav.classList.toggle('open');$('.nav-toggle').setAttribute('aria-expanded',nav.classList.contains('open'));});
$$('.nav a').forEach(a=>a.addEventListener('click',()=>$('#main-nav')?.classList.remove('open')));
const sections=$$('main section[id]');const navLinks=$$('.nav a');
const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));}})},{rootMargin:'-30% 0px -60% 0px'});sections.forEach(s=>observer.observe(s));

// LU1 methods
const methods={
  prompt:`Prompt chain als bewijs:\n1. Welke concrete AI-toepassingen worden gebruikt in de Nederlandse makelaardij?\n2. Welke werkzaamheden veranderen hierdoor? Vergelijk zonder en met AI.\n3. Welke AI- en digitale vaardigheden volgen hier logisch uit?\n4. Welke claims moeten met primaire bronnen worden gecontroleerd?`,
  source:`Bronnenstrategie:\n• Eerst onderwerpen en mogelijke bronnen identificeren.\n• Daarna alleen de oorspronkelijke pagina controleren.\n• Voorkeur voor Nederlandse sectorbronnen (Funda, NVM, Brainbay) en officiële instanties (AP, EU).\n• Datum en toepasbaarheid op de Nederlandse makelaardij controleren.`,
  compare:`Vergelijkende analyse:\nVoor waarderen, presenteren en zoeken heb ik telkens dezelfde drie vragen gebruikt: wat gebeurt zonder AI, wat kan AI ondersteunen, en welke menselijke taak blijft over? Zo wordt zichtbaar dat AI vooral de taakverdeling verandert.`,
  check:`Fact-checking:\nBelangrijke uitspraken zijn teruggezocht in de oorspronkelijke bronnen. In de website staat daarom expliciet “Feit”, “AI-mogelijkheid” of “Mijn conclusie”, zodat bronfeit en eigen interpretatie niet door elkaar lopen.`
};
$$('.method').forEach(btn=>btn.addEventListener('click',()=>{$$('.method').forEach(b=>b.classList.remove('active'));btn.classList.add('active');$('#method-detail').textContent=methods[btn.dataset.method];}));

// LU2 Prototype 1 - advertisement generator
const presets={
  utrecht:{woningtype:'Appartement',locatie:'Utrecht, wijk Lombok',oppervlakte:68,kamers:3,doelgroep:'starters en jonge stellen',kenmerken:'balkon, vernieuwde keuken, twee slaapkamers, lichte woonkamer, nabij station en dagelijkse voorzieningen'},
  nieuwegein:{woningtype:'Tussenwoning',locatie:'Nieuwegein, wijk Galecop',oppervlakte:112,kamers:5,doelgroep:'jonge gezinnen',kenmerken:'achtertuin op het zuiden, vier slaapkamers, zonnepanelen, ruime keuken, rustige woonstraat'},
  zeist:{woningtype:'Vrijstaande woning',locatie:'Zeist, nabij bosrijke omgeving',oppervlakte:156,kamers:6,doelgroep:'gezinnen die ruimte en rust zoeken',kenmerken:'vrijstaande garage, vijf slaapkamers, ruime tuin, werkkamer, veel daglicht'}
};
function fillPreset(key){const p=presets[key];Object.entries(p).forEach(([k,v])=>$('#'+k).value=v);generateAd();}
$$('.preset').forEach(b=>b.addEventListener('click',()=>fillPreset(b.dataset.preset)));
function adData(){return{woningtype:$('#woningtype').value.trim(),locatie:$('#locatie').value.trim(),oppervlakte:$('#oppervlakte').value.trim(),kamers:$('#kamers').value.trim(),doelgroep:$('#doelgroep').value.trim(),kenmerken:$('#kenmerken').value.trim()};}
function buildPrompt(d){return `ROL\nJe bent een professionele Nederlandse woningtekstschrijver voor een makelaarskantoor.\n\nBRONDATA\nWoningtype: ${d.woningtype}\nLocatie: ${d.locatie}\nWoonoppervlakte: ${d.oppervlakte} m²\nAantal kamers: ${d.kamers}\nBijzondere kenmerken: ${d.kenmerken}\nDoelgroep: ${d.doelgroep}\n\nOPDRACHT\nSchrijf een professionele concept-woningadvertentie met:\n1. een duidelijke titel;\n2. een korte introductie;\n3. de belangrijkste woningkenmerken;\n4. een passende afsluiting.\n\nRANDVOORWAARDEN\n- Gebruik uitsluitend feiten uit de BRONDATA.\n- Verzin geen oppervlaktes, voorzieningen, afstanden, energielabels of andere kenmerken.\n- Als informatie ontbreekt, laat die informatie weg.\n- Schrijf helder, professioneel en passend voor ${d.doelgroep}.\n- Geef na de tekst een korte feitcheck met welke bronkenmerken je hebt gebruikt.`;}
function generateAd(){const d=adData();if(Object.values(d).some(v=>!v)){ $('#ad-output').innerHTML='<p>Vul eerst alle velden in.</p>';return; }
 const features=d.kenmerken.split(',').map(x=>x.trim()).filter(Boolean);
 const title=`${d.woningtype} in ${d.locatie}: ${d.oppervlakte} m² met ${features[0]||'aantrekkelijke kenmerken'}`;
 const intro=`Op zoek naar een ${d.woningtype.toLowerCase()} in ${d.locatie} die past bij ${d.doelgroep}? Deze woning biedt ${d.oppervlakte} m² woonoppervlakte en telt ${d.kamers} kamers. De combinatie van ${features.slice(0,2).join(' en ')||'de opgegeven woningkenmerken'} maakt dit een interessante basis voor een bezichtiging.`;
 const bullets=features.map(f=>`<li>${escapeHtml(f.charAt(0).toUpperCase()+f.slice(1))}</li>`).join('');
 $('#ad-output').classList.remove('empty');$('#ad-output').innerHTML=`<h4>${escapeHtml(title)}</h4><p>${escapeHtml(intro)}</p><ul><li>${escapeHtml(d.oppervlakte)} m² woonoppervlakte</li><li>${escapeHtml(d.kamers)} kamers</li>${bullets}</ul><p><strong>Interesse?</strong> Gebruik deze tekst als gecontroleerde eerste versie en voeg alleen informatie toe die uit het woningdossier is geverifieerd.</p>`;
 $('#prompt-output').textContent=buildPrompt(d);$('#ad-status').textContent='Concept gemaakt';
}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));}
$('#generate-ad')?.addEventListener('click',generateAd);$('#show-prompt')?.addEventListener('click',()=>{const d=adData();$('#prompt-output').textContent=buildPrompt(d);$('#prompt-box').open=true;});fillPreset('utrecht');

// LU2 Prototype 2 - controlled property assistant
const property={price:'€ 535.000 k.k.',area:'108 m²',rooms:'5 kamers',bedrooms:'4 slaapkamers',year:'1936',energy:'B',garden:'achtertuin op het zuiden',parking:'openbaar parkeren',viewing:'bezichtiging op afspraak',location:'Parklaan 18, Utrecht'};
function classifyQuestion(q){const s=q.toLowerCase();
 if(/prijs|vraagprijs|kosten.*woning/.test(s))return['known',`De vraagprijs is ${property.price}.`];
 if(/oppervlak|groot|m²|m2/.test(s))return['known',`De woonoppervlakte is ${property.area}.`];
 if(/slaapkamer/.test(s))return['known',`De woning heeft ${property.bedrooms}.`];
 if(/kamer/.test(s))return['known',`De woning heeft ${property.rooms}, waarvan ${property.bedrooms}.`];
 if(/energie|label/.test(s))return['known',`Het energielabel is ${property.energy}.`];
 if(/tuin|buiten/.test(s))return['known',`Volgens de woninginformatie is er een ${property.garden}.`];
 if(/bouwjaar|gebouwd/.test(s))return['known',`Het bouwjaar is ${property.year}.`];
 if(/parkeren|parkeer/.test(s))return['known',`Bij deze woning staat ${property.parking} vermeld.`];
 if(/bezichtig|bekijken|afspraak/.test(s))return['known',`Een ${property.viewing} is mogelijk. Voor een concrete datum of tijd moet je contact opnemen met de makelaar.`];
 if(/waar|adres|ligging|locatie/.test(s))return['known',`De demo-woning is ${property.location}.`];
 if(/zonnepane|vve|servicekosten|overdracht|oplever|erfpacht|asbest|fundering|isolatie|cv|warmtepomp/.test(s))return['unknown','Die informatie staat niet in de beschikbare woninggegevens. Ik wil dat niet gokken. Vraag dit na bij de menselijke makelaar.'];
 return['unknown','Ik kan dit niet betrouwbaar beantwoorden uit de beschikbare woninginformatie. Vraag dit na bij de menselijke makelaar.'];
}
function addBubble(text,type){const el=document.createElement('div');el.className='bubble '+type;el.textContent=text;$('#chat-log').appendChild(el);$('#chat-log').scrollTop=$('#chat-log').scrollHeight;}
function ask(q){if(!q.trim())return;addBubble(q,'user');const [,answer]=classifyQuestion(q);setTimeout(()=>addBubble(answer,'bot'),120);}
$('#chat-form')?.addEventListener('submit',e=>{e.preventDefault();const q=$('#chat-input').value;$('#chat-input').value='';ask(q)});$$('.quick-questions button').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.question)));
const chatTests=[
 ['Wat is de vraagprijs?','known'],['Hoe groot is de woning?','known'],['Hoeveel kamers zijn er?','known'],['Hoeveel slaapkamers heeft het huis?','known'],['Wat is het energielabel?','known'],['Is er een tuin?','known'],['Wat is het bouwjaar?','known'],['Kan ik parkeren?','known'],['Kan ik een bezichtiging plannen?','known'],['Waar ligt de woning?','known'],['Heeft het huis zonnepanelen?','unknown'],['Wat zijn de VvE-kosten?','unknown'],['Wat is de exacte overdrachtsdatum?','unknown'],['Is er een warmtepomp?','unknown'],['Is er erfpacht?','unknown']
];
$('#run-chat-tests')?.addEventListener('click',()=>{let correct=0;chatTests.forEach(([q,expected])=>{const [got]=classifyQuestion(q);if(got===expected)correct++;});const pct=Math.round(correct/chatTests.length*100);$('#chat-test-result').innerHTML=`<strong>${correct}/${chatTests.length} tests correct (${pct}%)</strong><br>10 vragen met beschikbare informatie + 5 vragen met ontbrekende informatie. De assistent verzint geen antwoord bij ontbrekende brondata.`;});

// LU2 Prototype 3 - synthetic dataset and analyses
const homes=[
{id:1,city:'Utrecht',price:475000,area:72,rooms:3},{id:2,city:'Utrecht',price:545000,area:86,rooms:4},{id:3,city:'Utrecht',price:625000,area:103,rooms:5},{id:4,city:'Utrecht',price:410000,area:61,rooms:3},{id:5,city:'Utrecht',price:695000,area:118,rooms:5},
{id:6,city:'Nieuwegein',price:389000,area:88,rooms:4},{id:7,city:'Nieuwegein',price:449000,area:105,rooms:5},{id:8,city:'Nieuwegein',price:515000,area:123,rooms:5},{id:9,city:'Nieuwegein',price:365000,area:79,rooms:4},{id:10,city:'Nieuwegein',price:559000,area:136,rooms:6},
{id:11,city:'Zeist',price:495000,area:84,rooms:4},{id:12,city:'Zeist',price:635000,area:112,rooms:5},{id:13,city:'Zeist',price:775000,area:148,rooms:6},{id:14,city:'Zeist',price:455000,area:76,rooms:3},{id:15,city:'Zeist',price:865000,area:165,rooms:7},
{id:16,city:'De Bilt',price:525000,area:88,rooms:4},{id:17,city:'De Bilt',price:685000,area:119,rooms:5},{id:18,city:'De Bilt',price:749000,area:132,rooms:6},{id:19,city:'De Bilt',price:465000,area:74,rooms:3},{id:20,city:'De Bilt',price:815000,area:151,rooms:6}
].map(h=>({...h,ppm2:h.price/h.area}));
const euro=n=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);const num=n=>new Intl.NumberFormat('nl-NL',{maximumFractionDigits:0}).format(n);
function mean(arr){return arr.reduce((a,b)=>a+b,0)/arr.length}function correlation(xs,ys){const mx=mean(xs),my=mean(ys);let n=0,dx=0,dy=0;xs.forEach((x,i)=>{const a=x-mx,b=ys[i]-my;n+=a*b;dx+=a*a;dy+=b*b});return n/Math.sqrt(dx*dy)}
const cities=[...new Set(homes.map(h=>h.city))];const cityAvg=Object.fromEntries(cities.map(c=>[c,mean(homes.filter(h=>h.city===c).map(h=>h.ppm2))]));const overall=mean(homes.map(h=>h.ppm2));const corr=correlation(homes.map(h=>h.area),homes.map(h=>h.price));const maxAvg=Object.entries(cityAvg).sort((a,b)=>b[1]-a[1])[0];
$('#market-metrics').innerHTML=`<div class="metric"><span>Dataset</span><strong>${homes.length} woningen</strong></div><div class="metric"><span>Gem. prijs per m²</span><strong>${euro(overall)}</strong></div><div class="metric"><span>Hoogste plaatsgemiddelde</span><strong>${maxAvg[0]}</strong></div><div class="metric"><span>Correlatie m² ↔ prijs</span><strong>${corr.toFixed(2)}</strong></div>`;
function barChart(){const w=620,h=285,p=44,max=Math.max(...Object.values(cityAvg))*1.15;let svg=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Staafdiagram gemiddelde prijs per vierkante meter per plaats">`;Object.entries(cityAvg).forEach(([city,v],i)=>{const bw=92,x=58+i*137,bh=(v/max)*(h-75),y=h-42-bh;svg+=`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="9" fill="#173f31"/><text x="${x+bw/2}" y="${y-8}" text-anchor="middle" font-size="12" font-weight="700">€${num(v)}</text><text x="${x+bw/2}" y="${h-18}" text-anchor="middle" font-size="12">${city}</text>`});svg+='</svg>';$('#bar-chart').innerHTML=svg;}
function scatterChart(){const w=620,h=285,p=42;const minA=Math.min(...homes.map(x=>x.area))-8,maxA=Math.max(...homes.map(x=>x.area))+8,minP=Math.min(...homes.map(x=>x.price))-50000,maxP=Math.max(...homes.map(x=>x.price))+50000;const x=a=>p+(a-minA)/(maxA-minA)*(w-p*2),y=v=>h-p-(v-minP)/(maxP-minP)*(h-p*2);let svg=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Spreidingsdiagram woonoppervlakte versus vraagprijs"><line x1="${p}" y1="${h-p}" x2="${w-p}" y2="${h-p}" stroke="#aab3ad"/><line x1="${p}" y1="${p}" x2="${p}" y2="${h-p}" stroke="#aab3ad"/>`;homes.forEach(o=>svg+=`<circle cx="${x(o.area)}" cy="${y(o.price)}" r="6" fill="#2f6b50" opacity=".76"><title>${o.city}: ${o.area} m², ${euro(o.price)}</title></circle>`);svg+=`<text x="${w/2}" y="${h-5}" text-anchor="middle" font-size="11">Woonoppervlakte (m²)</text><text x="10" y="${h/2}" text-anchor="middle" font-size="11" transform="rotate(-90 10 ${h/2})">Vraagprijs</text></svg>`;$('#scatter-chart').innerHTML=svg;}
barChart();scatterChart();
$('#analysis-3').innerHTML=`<strong>Analyse 3 — locatieverschillen.</strong> In deze fictieve dataset ligt het hoogste gemiddelde op <strong>${maxAvg[0]} (${euro(maxAvg[1])}/m²)</strong>. De correlatie tussen woonoppervlakte en vraagprijs is <strong>${corr.toFixed(2)}</strong>, wat in deze kleine dataset op een sterk positief verband wijst. Dit is géén bewijs dat oppervlakte de prijs veroorzaakt: locatie, woningtype, onderhoud en andere kenmerken ontbreken.`;
$('#dataset-table tbody').innerHTML=homes.map(h=>`<tr><td>${h.id}</td><td>${h.city}</td><td>${euro(h.price)}</td><td>${h.area}</td><td>${h.rooms}</td><td>${euro(h.ppm2)}</td></tr>`).join('');
$('#manual-checks').innerHTML=homes.slice(0,5).map(h=>`<div class="manual-check"><strong>Check #${h.id}</strong><br>${euro(h.price)} ÷ ${h.area} m² = <strong>${euro(h.ppm2)}/m²</strong></div>`).join('');
