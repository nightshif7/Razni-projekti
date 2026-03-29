import { useState, useCallback, useRef } from "react";

// ─── QUESTION GENERATORS ──────────────────────────────────────────────────────
const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function makeWrongAnswers(correct, count = 3, spread = 5) {
  const wrongs = new Set();
  let attempts = 0;
  while (wrongs.size < count && attempts < 100) {
    attempts++;
    const delta = r(1, spread) * (Math.random() > 0.5 ? 1 : -1);
    const v = correct + delta;
    if (v !== correct && v >= 0 && v <= 9999) wrongs.add(v);
  }
  // Fallback: if not enough, add sequential
  let fallback = correct + spread + 1;
  while (wrongs.size < count) { wrongs.add(fallback++); }
  return [...wrongs];
}

function shuffleAnswers(correct, wrongs) {
  const all = [{ v: String(correct), correct: true }, ...wrongs.map(w => ({ v: String(w), correct: false }))];
  const shuffled = shuffle(all);
  return { answers: shuffled.map(a => a.v), correctIdx: shuffled.findIndex(a => a.correct) };
}

// ─── SVG OBJECT COMPONENTS ───────────────────────────────────────────────────
const SVGObj = {
  jabuka: ({size=34}) => (
    <svg width={size} height={size} viewBox="0 0 34 34">
      <ellipse cx="17" cy="22" rx="13" ry="11" fill="#FF6B6B"/>
      <ellipse cx="17" cy="22" rx="13" ry="11" fill="url(#agl)" opacity="0.3"/>
      <path d="M17 11 Q22 5 27 7" stroke="#2ed573" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M17 11 Q14 6 11 9" stroke="#8B5E3C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="11" cy="18" rx="3.5" ry="4.5" fill="rgba(255,255,255,0.28)" transform="rotate(-15,11,18)"/>
      <defs><linearGradient id="agl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="white"/><stop offset="1" stopColor="transparent"/></linearGradient></defs>
    </svg>
  ),
  zvijezda: ({size=34}) => (
    <svg width={size} height={size} viewBox="0 0 34 34">
      <polygon points="17,3 20.5,13 31,13 22.5,19.5 25.5,29.5 17,23.5 8.5,29.5 11.5,19.5 3,13 13.5,13" fill="#FECA57" stroke="#FF9F43" strokeWidth="1"/>
      <polygon points="17,3 20.5,13 31,13 22.5,19.5 25.5,29.5 17,23.5 8.5,29.5 11.5,19.5 3,13 13.5,13" fill="url(#sgl)" opacity="0.4"/>
      <defs><linearGradient id="sgl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="white"/><stop offset="1" stopColor="transparent"/></linearGradient></defs>
    </svg>
  ),
  krug: ({size=34}) => (
    <svg width={size} height={size} viewBox="0 0 34 34">
      <circle cx="17" cy="17" r="14" fill="#54A0FF"/>
      <circle cx="17" cy="17" r="14" fill="url(#cgl)" opacity="0.35"/>
      <circle cx="11" cy="11" r="4" fill="rgba(255,255,255,0.35)"/>
      <defs><linearGradient id="cgl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="white"/><stop offset="1" stopColor="transparent"/></linearGradient></defs>
    </svg>
  ),
  kvadrat: ({size=34}) => (
    <svg width={size} height={size} viewBox="0 0 34 34">
      <rect x="4" y="4" width="26" height="26" rx="6" fill="#2ed573"/>
      <rect x="4" y="4" width="26" height="26" rx="6" fill="url(#qgl)" opacity="0.35"/>
      <rect x="8" y="8" width="7" height="7" rx="2.5" fill="rgba(255,255,255,0.3)"/>
      <defs><linearGradient id="qgl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="white"/><stop offset="1" stopColor="transparent"/></linearGradient></defs>
    </svg>
  ),
  srce: ({size=34}) => (
    <svg width={size} height={size} viewBox="0 0 34 34">
      <path d="M17 29 C17 29 4 20 4 11.5 C4 7.5 7.5 4 12 4 C14.5 4 16.5 5.5 17 7.5 C17.5 5.5 19.5 4 22 4 C26.5 4 30 7.5 30 11.5 C30 20 17 29 17 29Z" fill="#FF6B6B"/>
      <ellipse cx="11" cy="10.5" rx="3.5" ry="2.5" fill="rgba(255,255,255,0.35)" transform="rotate(-20,11,10.5)"/>
    </svg>
  ),
  auto: ({size=34}) => (
    <svg width={size} height={size} viewBox="0 0 38 30">
      <rect x="2" y="14" width="34" height="12" rx="4" fill="#54A0FF"/>
      <path d="M7 14 L11 5 L27 5 L31 14Z" fill="#74b9ff"/>
      <circle cx="10" cy="27" r="4" fill="#2C3E50"/><circle cx="10" cy="27" r="2" fill="#636e72"/>
      <circle cx="28" cy="27" r="4" fill="#2C3E50"/><circle cx="28" cy="27" r="2" fill="#636e72"/>
      <rect x="13" y="7" width="6" height="5" rx="1.5" fill="rgba(255,255,255,0.85)"/>
      <rect x="21" y="7" width="5" height="5" rx="1.5" fill="rgba(255,255,255,0.85)"/>
      <rect x="3" y="18" width="6" height="3" rx="1.5" fill="#FECA57" opacity="0.8"/>
      <rect x="29" y="18" width="6" height="3" rx="1.5" fill="#FF6B6B" opacity="0.8"/>
    </svg>
  ),
  balon: ({size=34}) => (
    <svg width={size} height={size} viewBox="0 0 34 38">
      <ellipse cx="17" cy="15" rx="12" ry="13" fill="#FF9F43"/>
      <ellipse cx="17" cy="15" rx="12" ry="13" fill="url(#bgl)" opacity="0.4"/>
      <ellipse cx="11" cy="9" rx="4" ry="5" fill="rgba(255,255,255,0.35)" transform="rotate(-15,11,9)"/>
      <path d="M17 28 Q17 33 17 36" stroke="#FF9F43" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <defs><linearGradient id="bgl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="white"/><stop offset="1" stopColor="transparent"/></linearGradient></defs>
    </svg>
  ),
};
const OBJ_KEYS = Object.keys(SVGObj);
const OBJ_GEN = {
  jabuka:"jabuka", zvijezda:"zvijezda", krug:"krugova",
  kvadrat:"kvadrata", srce:"srca", auto:"auta", balon:"balona",
};

// ─── VISUAL QUESTION GENERATOR ───────────────────────────────────────────────
const VISUAL_TOPICS = new Set(["1_zbrajanje","1_oduzimanje","1_brojevi20",
  "2_zbrajanje100","2_brojevi100"]);

function generateVisualQ(grade) {
  const maxSum = grade === 1 ? 10 : 18;
  const maxSide = Math.min(grade === 1 ? 5 : 8, maxSum - 1);
  const obj = OBJ_KEYS[r(0, OBJ_KEYS.length - 1)];
  const noun = OBJ_GEN[obj];
  const isAdd = Math.random() > 0.35;
  if (isAdd) {
    const left = r(1, maxSide);
    const right = r(1, Math.min(maxSide, maxSum - left));
    return {
      type:"visual", operation:"+", obj,
      leftCount:left, rightCount:right, answer:left+right,
      q:`Koliko ${noun} ima ukupno?`,
      hint:`Zbroji: ${left} + ${right} = ?`,
      edu:`➕ ${left} + ${right} = ${left+right}. Zbroji obje grupe zajedno!`,
    };
  } else {
    const total = r(2, maxSum);
    const remove = r(1, Math.min(total - 1, maxSide));
    return {
      type:"visual", operation:"-", obj,
      leftCount:total, rightCount:remove, answer:total-remove,
      q:`${remove} ${noun} odlazi. Koliko ostaje?`,
      hint:`${total} - ${remove} = ?`,
      edu:`➖ ${total} - ${remove} = ${total-remove}. Oduzmi koliko odlazi!`,
    };
  }
}

// ─── CURRICULUM GENERATORS ───────────────────────────────────────────────────
// Every generator returns: { q, answers, correct, hint, edu }
const GENERATORS = {

  // ── 1. RAZRED ──────────────────────────────────────────────────────────────
  "1_brojevi20": () => {
    const t = r(0,9);
    const tpl = [
      () => { const a=r(1,18);
        const {answers,correctIdx}=shuffleAnswers(a+1,[a,a+2,a-1].filter(x=>x>=0&&x<=20));
        return {q:`Koji broj dolazi POSLIJE broja ${a}?`,correct:correctIdx,answers,
          hint:`Broji naprijed: ..., ${a}, ___`,
          edu:`🔢 Na brojevnoj crti svaki sljedeći broj je veći za 1. Poslije ${a} dolazi ${a+1}.`}; },
      () => { const a=r(1,9),b=r(1,9-a); const res=a+b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,3));
        return {q:`Koliko je ${a} + ${b}?`,correct:correctIdx,answers,
          hint:`Zamisli ${a} jabuka pa dodaj još ${b}.`,
          edu:`➕ Zbrajanje = spajanje dviju skupina. Trik: dopuni do 10 pa dodaj ostatak. ${a}+${b}=${res}.`}; },
      () => { const a=r(11,19),b=r(1,a-1);
        return {q:`Koji je broj VEĆI: ${a} ili ${b}?`,correct:0,answers:[String(a),String(b),"Isti su","Ne znam"],
          hint:`${a} je dalje desno na brojevnoj crti!`,
          edu:`📏 Na brojevnoj crti: što je broj više desno, to je VEĆI. ${a} > ${b} jer je ${a} dalje od nule.`}; },
      () => { const d=r(1,1),u=r(0,9); const res=d*10+u;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,3));
        return {q:`Koliko je 10 + ${u}?`,correct:correctIdx,answers,
          hint:`10 + ${u}: jedna desetica i ${u} jedinica.`,
          edu:`🔟 Broj 10 je jedna desetica. 10+${u} = ${res}. Npr. 10+5=15, 10+7=17.`}; },
      () => { const start=r(1,14),gap=r(1,3);
        return {q:`Koji broj nedostaje? ${start}, ${start+gap}, __, ${start+gap*3}`,
          correct:1,answers:[String(start+gap*2+1),String(start+gap*2),String(start-1),String(start+gap*3+1)],
          hint:`Razlika između svaka dva broja je ${gap}!`,
          edu:`🔢 Niz brojeva: svaki broj raste za isti iznos (ovdje +${gap}). Pronađi uzorak pa popuni prazninu.`}; },
      () => { const a=r(2,9),b=r(2,9);
        return {q:`Marica ima ${a} jabuka, a Ivica ${b}. Koliko jabuka imaju ukupno?`,
          correct:0,answers:[String(a+b),String(a*b),String(Math.abs(a-b)),String(a+b+1)],
          hint:`"Ukupno" znači ZBROJITI: ${a} + ${b}`,
          edu:`➕ Ključna riječ "ukupno" uvijek znači zbrajanje! Zbroji sve zajedno: ${a}+${b}=${a+b}.`}; },
      () => { const tot=r(5,15),gone=r(1,tot-1); const res=tot-gone;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,2));
        return {q:`U košari je ${tot} jabuka. Mama uzme ${gone}. Koliko ostane?`,correct:correctIdx,answers,
          hint:`"Uzme" znači ODUZETI: ${tot} - ${gone}`,
          edu:`➖ Ključna riječ "uzme", "pojede", "ode" uvijek znači oduzimanje! ${tot}-${gone}=${res}.`}; },
      () => { const a=r(10,18),b=r(1,a-10+1);
        const res=a-b; const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,2));
        return {q:`${a} - ${b} = ?`,correct:correctIdx,answers,
          hint:`Oduzmi: ${a}-${b}. Idi korak po korak!`,
          edu:`➖ Oduzimanje s brojevima do 20: trik je oduzeti do 10 pa nastaviti. ${a}-${b}=${res}.`}; },
      () => { const a=r(1,9);
        return {q:`Koji je broj MANJI: ${a} ili ${a+r(1,5)}?`,
          correct:0,answers:[String(a),String(a+r(1,5)),"Isti su","Ne znam"],
          hint:`Manji broj je bliže nuli na brojevnoj crti.`,
          edu:`📏 Manji broj = bliže nuli. Veći broj = dalje od nule. ${a} < ${a+1} jer je ${a} bliže nuli.`}; },
      () => { const a=r(1,8),b=r(1,8),c=r(1,4); const res=a+b+c;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,3));
        return {q:`${a} + ${b} + ${c} = ?`,correct:correctIdx,answers,
          hint:`Najprije zbroji prva dva: ${a}+${b}=${a+b}, pa dodaj ${c}.`,
          edu:`➕ Tri broja zbrajamo redom: najprije prva dva pa treći. Ili pronađi par koji daje 10!`}; },
    ];
    return tpl[r(0,tpl.length-1)]();
  },

  "1_zbrajanje": () => {
    const names = [["Ana","Marko"],["Luka","Sara"],["Petra","Ivan"],["Maja","Tomo"],["Iva","Filip"]];
    const [n1,n2] = names[r(0,names.length-1)];
    const fruits = ["jabuka","krušaka","šljiva","trešanja","naranči"];
    const fruit = fruits[r(0,fruits.length-1)];
    const tpl = [
      () => { const a=r(1,9),b=r(1,9); const res=a+b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,3));
        return {q:`${a} + ${b} = ?`,correct:correctIdx,answers,
          hint:`Dopuni ${Math.max(a,b)} do 10: treba još ${10-Math.max(a,b)}.`,
          edu:`➕ Trik za zbrajanje: veći broj dopuni do 10, ostatak dodaj. ${Math.max(a,b)}+${10-Math.max(a,b)}=10, pa +${Math.min(a,b)-(10-Math.max(a,b))>0?Math.min(a,b)-(10-Math.max(a,b)):0}.`}; },
      () => { const a=r(2,9); const res=a*2;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,2));
        return {q:`${a} + ${a} = ?`,correct:correctIdx,answers,
          hint:`Isti broj dva puta — to je dvaput ${a}!`,
          edu:`➕ Zbrajanje istog broja = udvostručavanje. ${a}+${a}=${res}. Ovo je i osnova množenja!`}; },
      () => { const a=r(3,8),b=r(3,8); const res=a+b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,3));
        return {q:`${n1} ima ${a} ${fruit}, ${n2} ima ${b} ${fruit}. Koliko ${fruit} imaju zajedno?`,correct:correctIdx,answers,
          hint:`Zajedno = zbrojiti: ${a} + ${b}`,
          edu:`➕ "Zajedno", "ukupno", "sve skupa" = ZBRAJANJE. Uvijek spajamo dvije skupine u jednu.`}; },
      () => { const a=r(5,9),b=r(1,5); const res=a+b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,2));
        return {q:`U autobusu je ${a} putnika. Na stanici uđe još ${b}. Koliko putnika ima sada?`,correct:correctIdx,answers,
          hint:`"Uđe još" = dodaj = zbrojiti: ${a}+${b}`,
          edu:`➕ "Uđe", "dođe još", "donese" = zbrajamo! Bilo je ${a}, dodali smo ${b}, sada je ${res}.`}; },
      () => { const a=r(4,8),b=r(2,5); const res=a+b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,2));
        return {q:`Na livadi pase ${a} krava i ${b} ovaca. Koliko životinja ima ukupno?`,correct:correctIdx,answers,
          hint:`Krave + ovce = ukupno: ${a}+${b}`,
          edu:`➕ Kada pitamo "koliko ukupno" trebamo zbrojiti sve vrste zajedno: ${a}+${b}=${res}.`}; },
      () => { const a=r(6,9),b=r(1,4); const res=a+b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,2));
        return {q:`${a} + ${b} = ?`,correct:correctIdx,answers,
          hint:`${a} treba još ${10-a} do 10. Od ${b} uzmi ${10-a}, ostaje ${b-(10-a)}.`,
          edu:`➕ Prelaz kroz 10: ${a}+${10-a}=10, pa ${10}+${b-(10-a)}=${res}. Korak po korak!`}; },
    ];
    return tpl[r(0,tpl.length-1)]();
  },

  "1_oduzimanje": () => {
    const tpl = [
      () => { const a=r(10,20),b=r(1,a-1); const res=a-b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,3));
        return {q:`${a} - ${b} = ?`,correct:correctIdx,answers,
          hint:`${a}-${b}: najprije oduzmi do 10, pa ostatak.`,
          edu:`➖ Trik: ${a}-${a-10}=10, pa još -${b-(a-10)}. Ili broji unatrag ${b} koraka od ${a}.`}; },
      () => { const tot=r(8,15),gone=r(1,tot-1); const res=tot-gone;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,2));
        return {q:`Na grani sjedi ${tot} ptica. ${gone} odlete. Koliko ostane?`,correct:correctIdx,answers,
          hint:`"Odlete" = oduzeti: ${tot} - ${gone}`,
          edu:`➖ "Odlete", "pobjegne", "izgubi" = oduzimanje. Ostalo = početni broj − onaj koji je otišao.`}; },
      () => { const a=r(12,20),b=r(3,8); const res=a-b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,2));
        return {q:`Imam ${a} kuna. Potrošim ${b} kune. Koliko mi ostane?`,correct:correctIdx,answers,
          hint:`"Potrošim" = oduzeti: ${a} - ${b}`,
          edu:`➖ Potrošiti novac = oduzimanje. Imali smo ${a}, potrošili ${b}, ostalo je ${res}.`}; },
      () => { const tot=r(10,18),gone=r(2,6); const res=tot-gone;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,2));
        return {q:`U vrećici je ${tot} bombona. Pojedem ${gone}. Koliko ostane?`,correct:correctIdx,answers,
          hint:`Pojedem = oduzimam: ${tot}-${gone}`,
          edu:`➖ Oduzimanje = uzimamo dio od cjeline. Cjelina: ${tot}, uzeto: ${gone}, ostalo: ${res}.`}; },
      () => { const a=r(15,20),b=r(6,a-1); const res=a-b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,2));
        return {q:`${a} - ${b} = ?`,correct:correctIdx,answers,
          hint:`${a}-${b}: idi do 10 (oduzmi ${a-10}), pa još ${b-(a-10)}.`,
          edu:`➖ Prelaz kroz 10: ${a}-${a-10}=10, pa 10-${b-(a-10)}=${res}. Uvijek je lakše proći kroz 10!`}; },
      () => { const tot=r(14,20),gone=r(4,9); const res=tot-gone;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,2));
        return {q:`Knjiga ima ${tot} stranica. Pročitam ${gone}. Koliko stranica ostaje?`,correct:correctIdx,answers,
          hint:`Ostaje = ukupno − pročitano: ${tot}−${gone}`,
          edu:`➖ "Koliko ostaje?" = oduzimanje. Ukupno minus potrošeno/pročitano/pojede = ostatak.`}; },
    ];
    return tpl[r(0,tpl.length-1)]();
  },

  "1_oblici": () => {
    const qs = [
      {q:"Koliko stranica ima trokut?",answers:["4","2","3","5"],correct:2,hint:"Tri-kut → TRI!",edu:"🔷 TROKUT: 3 stranice, 3 kuta. 'Tri' je u samom imenu! Npr. trokut izgleda kao šator."},
      {q:"Koji lik NEMA kutova?",answers:["Kvadrat","Trokut","Krug","Pravokutnik"],correct:2,hint:"Okrugao lik — nema oštrih uglova.",edu:"🔵 KRUG: nema stranica ni kutova, savršeno je okrugao. Npr. kotač, sunce, novčić."},
      {q:"Koliko stranica ima kvadrat?",answers:["3","5","6","4"],correct:3,hint:"Kvadrat = 4 jednake stranice!",edu:"🟦 KVADRAT: 4 jednake stranice i 4 prava kuta. Svaki kut je 90°. Npr. šahovsko polje."},
      {q:"Koji lik izgleda kao kotač?",answers:["Trokut","Krug","Kvadrat","Pravokutnik"],correct:1,hint:"Okruglo i bez kutova...",edu:"🔵 KRUG je jedini lik bez kutova i ravnih stranica. Kotač, tanjur i sunce su krugovi."},
      {q:"Pravokutnik ima koliko stranica?",answers:["3","5","4","6"],correct:2,hint:"Pravokutnik izgleda kao vrata ili prozor!",edu:"🟩 PRAVOKUTNIK: 4 stranice (2 dulje, 2 kraće) i 4 prava kuta. Razlika od kvadrata: stranice nisu jednake."},
      {q:"Koji lik ima 3 kuta?",answers:["Krug","Kvadrat","Trokut","Pravokutnik"],correct:2,hint:"Tri-kut → 3 kuta!",edu:"🔺 TROKUT ima točno 3 kuta i 3 stranice. Može biti šiljast, tup ili pravokutan."},
      {q:"Kvadrat i pravokutnik — koja je razlika?",answers:["Kvadrat ima 3 stranice","U kvadratu su sve stranice jednako duge","Pravokutnik nema kutova","Nema razlike"],correct:1,hint:"Kvadrat = SVE stranice jednake!",edu:"🟦🟩 Kvadrat: sve 4 stranice jednako duge. Pravokutnik: 2 dulje + 2 kraće. Svaki kvadrat je pravokutnik, ali ne obrnuto!"},
      {q:"Koliko kutova ima trokut?",answers:["2","4","3","5"],correct:2,hint:"Tri-KUT → koliko kutova?",edu:"🔺 TROKUT: uvijek 3 kuta (otuda ime!) i 3 stranice. Zbroj svih kutova trokuta je uvijek 180°."},
      {q:"Koji lik izgleda kao pizza cijela (okrugla)?",answers:["Kvadrat","Pravokutnik","Trokut","Krug"],correct:3,hint:"Okrugla pizza = koji lik?",edu:"🔵 Pizza je krug! A jedan komad pizze izgleda kao... TROKUT! 🍕"},
      {q:"Koliko oštrih kutova ima krug?",answers:["4","2","1","0"],correct:3,hint:"Krug je okrugao — ima li kutova?",edu:"🔵 Krug nema ni jednog kuta ni jedne ravne stranice. Zato se savršeno kotrlja!"},
    ];
    return qs[r(0,qs.length-1)];
  },

  // ── 2. RAZRED ──────────────────────────────────────────────────────────────
  "2_brojevi100": () => {
    const tpl = [
      () => { const d=r(1,9);
        const {answers,correctIdx}=shuffleAnswers(d,[d+1,d+2,d-1].filter(x=>x>0&&x!==d));
        return {q:`Koliko desetica ima broj ${d*10}?`,correct:correctIdx,answers,
          hint:`${d*10} = ${d} desetica i 0 jedinica`,
          edu:`💯 Desetica = 10 jedinica. Broj ${d*10} sastoji se od ${d} desetice/desetica. Kao ${d} torbi s 10 bombona.`}; },
      () => { const d=r(1,9),u=r(1,9); const res=d*10+u;
        const {answers,correctIdx}=shuffleAnswers(res,[res+1,res-1,res+10].filter(x=>x>0&&x<=99&&x!==res));
        return {q:`Koji je broj: ${d} desetica i ${u} jedinica?`,correct:correctIdx,answers,
          hint:`${d} desetica = ${d*10}, dodaj ${u} jedinica`,
          edu:`💯 Broj gradimo: desetice × 10 + jedinice. ${d}×10=${d*10}, pa +${u} = ${res}. Npr. 4 desetice i 7 = 47.`}; },
      () => { const a=r(11,49);
        const {answers,correctIdx}=shuffleAnswers(a+1,[a-1,a+3,a+4]);
        return {q:`Koji broj je između ${a} i ${a+2}?`,correct:correctIdx,answers,
          hint:`${a}, ___, ${a+2} — koji broj dolazi između?`,
          edu:`🔢 Između dva uzastopna broja uvijek je točno jedan broj. Između ${a} i ${a+2} je ${a+1}.`}; },
      () => { const a=r(1,4)*10,maxB=Math.floor((90-a)/10),b=r(1,Math.max(1,maxB))*10; const res=a+b;
        const {answers,correctIdx}=shuffleAnswers(res,[res+10,res-10,res+20].filter(x=>x>0&&x<=99&&x!==res));
        return {q:`Koliko je ${a} + ${b}?`,correct:correctIdx,answers,
          hint:`Zbroji desetice: ${a/10} + ${b/10} = ${res/10} desetica`,
          edu:`💯 Zbrajanje desetica: brojevi koji završavaju na 0 zbrajamo po deseticama. ${a/10}+${b/10}=${res/10} desetica = ${res}.`}; },
      () => { const a=r(11,88),b=r(1,Math.min(9,99-a)); const res=a+b;
        const {answers,correctIdx}=shuffleAnswers(res,[res+1,res-1,res+2].filter(x=>x>0&&x<=99&&x!==res));
        return {q:`Koliko je ${a} + ${b}?`,correct:correctIdx,answers,
          hint:`Zbroji jedinice: ${a%10}+${b}=${(a%10)+b}, pa pazi na prenos!`,
          edu:`💯 Zbrajanje: najprije jedinice (${a%10}+${b}), pa desetice. Ako jedinice prelaze 9, prenosiš 1 u desetice.`}; },
      () => { const a=r(10,89),b=r(a+1,Math.min(a+20,99));
        return {q:`Koji je veći: ${a} ili ${b}?`,correct:1,answers:[String(a),String(b),"Isti","Ne znam"],
          hint:`Usporedi prvu (lijevu) znamenku: ${Math.floor(a/10)} ili ${Math.floor(b/10)}?`,
          edu:`💯 Uspoređivanje: gledaj znamenku po znamenku s lijeva. Veća prva znamenka = veći broj. Ako su iste, gledaj drugu.`}; },
      () => { const a=r(20,80),b=r(1,a-1); const res=a-b;
        const {answers,correctIdx}=shuffleAnswers(res,[res+1,res-1,res+10].filter(x=>x>0&&x!==res));
        return {q:`${a} - ${b} = ?`,correct:correctIdx,answers,
          hint:`Oduzmi: ${a}-${b}. Pazi na prenos!`,
          edu:`💯 Oduzimanje dvoznamenkastih: kreni od jedinica (${a%10}-${b%10}). Ako ne možeš, posudi deseticu!`}; },
      () => { const shop=r(20,60),price=r(5,shop-5); const rest=shop-price;
        const {answers,correctIdx}=shuffleAnswers(rest,[rest+1,rest-1,rest+5].filter(x=>x>0&&x!==rest));
        return {q:`Imam ${shop} kuna. Kupim igračku za ${price} kuna. Koliko mi ostane?`,correct:correctIdx,answers,
          hint:`Ostalo = imao − potrošio: ${shop}−${price}`,
          edu:`💯 Tekstualni zadatak: "ostane" = oduzimanje. Imao sam ${shop}, potrošio ${price}, ostalo ${rest}.`}; },
    ];
    return tpl[r(0,tpl.length-1)]();
  },

  "2_mnozenje": () => {
    const tpl = [
      () => { const a=r(2,10),b=r(2,10); const res=a*b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,6));
        return {q:`${a} × ${b} = ?`,correct:correctIdx,answers,
          hint:`Broji po ${a}: ${Array.from({length:Math.min(b,5)},(_,i)=>a*(i+1)).join(", ")}${b>5?"…":""}`,
          edu:`✖️ ${a}×${b} = ${res}. Provjeri: ${b}×${a} = ${res} isto (komutativnost).`}; },
      () => { const a=r(2,10),b=r(2,9); const res=a*b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,6));
        return {q:`U ${b} košara je po ${a} jabuke. Koliko jabuka ukupno?`,correct:correctIdx,answers,
          hint:`${b} × ${a} = ?`,
          edu:`✖️ Jednake grupe = množenje. ${b} košara × ${a} jabuke = ${res} ukupno.`}; },
      () => { const a=r(2,10),b=r(2,9); const res=a*b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,6));
        return {q:`${b} djece dobije po ${a} bombone. Koliko bombona ukupno?`,correct:correctIdx,answers,
          hint:`${b} djece × ${a} bombona = ?`,
          edu:`✖️ "Po ${a} za svako od ${b}" = množenje! ${b}×${a}=${res}.`}; },
      () => { const a=r(6,10),b=r(2,9); const res=a*b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,7));
        return {q:`${a} × ${b} = ?`,correct:correctIdx,answers,
          hint:`Razdijeli: (${a-5})×${b} + 5×${b} = ${(a-5)*b} + ${5*b} = ${res}`,
          edu:`✖️ Trik za veće tablice: razdijeli na lakše dijelove. ${a}×${b} = ${a-5}×${b} + 5×${b} = ${(a-5)*b}+${5*b} = ${res}.`}; },
      () => { const a=r(2,10); const res=a*10;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,10));
        return {q:`${a} × 10 = ?`,correct:correctIdx,answers,
          hint:`Množenje s 10: dodaj nulu iza broja!`,
          edu:`✖️ Trik za ×10: samo dodaj nulu! ${a}×10=${res}.`}; },
      () => { const a=r(2,10),b=r(2,10); const res=a*b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,6));
        return {q:`Učionica ima ${a} reda s po ${b} klupa. Koliko klupa ukupno?`,correct:correctIdx,answers,
          hint:`Redovi × klupe: ${a}×${b}`,
          edu:`✖️ Redovi × stupci = množenje! ${a}×${b}=${res} klupa.`}; },
    ];
    return tpl[r(0,tpl.length-1)]();
  },

  "2_dijeljenje": () => {
    const tpl = [
      () => { const b=r(2,10),res=r(2,9); const a=b*res;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,4));
        return {q:`${a} ÷ ${b} = ?`,correct:correctIdx,answers,
          hint:`Koji broj × ${b} = ${a}?`,
          edu:`➗ Dijeljenje i množenje su suprotnosti. ${a}÷${b}=${res} jer ${res}×${b}=${a}.`}; },
      () => { const b=r(2,10),res=r(2,8); const a=b*res;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,4));
        return {q:`${a} bombona podijeli jednako na ${b} djece. Koliko svako dobije?`,correct:correctIdx,answers,
          hint:`${a} ÷ ${b} = ?`,
          edu:`➗ Jednaka raspodjela = dijeljenje. ${a}÷${b}=${res} bombona svako.`}; },
      () => { const b=r(2,10),res=r(2,8); const a=b*res;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,4));
        return {q:`${a} jabuka slažemo u košare po ${b}. Koliko košara trebamo?`,correct:correctIdx,answers,
          hint:`${a} ÷ ${b} = ?`,
          edu:`➗ Koliko grupa možemo napraviti? ${a}÷${b}=${res} košara.`}; },
      () => { const b=r(2,10),res=r(2,9); const a=b*res;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,4));
        return {q:`${a} ÷ ${b} = ?`,correct:correctIdx,answers,
          hint:`Dijeljenje je obrnuto od množenja: ${b} × ? = ${a}`,
          edu:`➗ Veza: ako ${res}×${b}=${a}, onda ${a}÷${b}=${res}. Uvijek provjeri množenjem!`}; },
      () => { const b=r(2,10),res=r(2,8); const a=b*res;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,4));
        return {q:`Mama reže ${a} kolačića u komade po ${b}. Koliko komada dobije?`,correct:correctIdx,answers,
          hint:`${a} ÷ ${b} = ?`,
          edu:`➗ ${a}÷${b}=${res}. Provjeri: ${res}×${b}=${a} ✓`}; },
    ];
    return tpl[r(0,tpl.length-1)]();
  },

  "2_mjerenje": () => {
    const tpl = [
      {q:"Koliko centimetara ima 1 metar?",answers:["10","1000","100","50"],correct:2,
        hint:"1 m = ___ cm",edu:"📏 1 metar (m) = 100 centimetara (cm). Ravnalo u školi je obično 30 cm, a metar je kao 3 i trećina takvih ravnala."},
      {q:"Što je teže: 1 kilogram ili 500 grama?",answers:["500 grama","1 kilogram","Isto","Ne znam"],correct:1,
        hint:"1 kg = 1000 grama",edu:"⚖️ 1 kilogram (kg) = 1000 grama (g). 500 g je pola kilograma. Npr. pakiranje šećera obično je 1 kg."},
      {q:"Koliko minuta ima 1 sat?",answers:["30","100","60","24"],correct:2,
        hint:"Minutna kazaljka napravi jedan pun krug za 60 minuta",edu:"🕐 1 sat = 60 minuta. Kratka kazaljka = sati, duga = minute. Kada duga kazaljka obiđe krug = prošao je 1 sat."},
      {q:"Koliko sati ima jedan dan?",answers:["12","48","24","60"],correct:2,
        hint:"Dan ima noć i dan — svaki po 12 sati",edu:"🌅 1 dan = 24 sata (12 prijepodne + 12 poslijepodne). Sat je kratica 'h' (od latinskog 'hora')."},
      () => { const h=r(1,10),add=r(1,5); const res=h+add;
        return {q:`Ako je sada ${h}:00, koliko će biti za ${add} sata?`,
          answers:[String(res-1),String(res+1),String(res),String(res+2)],correct:2,
          hint:`${h} + ${add} = ?`,
          edu:`🕐 Zbrajamo sate kao obične brojeve (do 24). ${h}+${add}=${res}. Ako prijeđe 24, oduzimamo 24 (novi dan).`}; },
      () => { const cm=r(101,190); const leftcm=cm-100;
        return {q:`${cm} cm je jednako koliko metara i centimetara?`,
          answers:[`2 m ${leftcm} cm`,`1 m ${leftcm} cm`,`1 m ${leftcm+10} cm`,`0 m ${cm} cm`],correct:1,
          hint:`${cm} cm = 100 cm + ${leftcm} cm = 1 m + ${leftcm} cm`,
          edu:`📏 Pretvaranje: 100 cm = 1 m. ${cm}cm = 1m + ${leftcm}cm. Kao što je 150 lipa = 1 kuna + 50 lipa.`}; },
      () => { const kg=r(1,5),g=r(100,900); const tot=kg*1000+g;
        return {q:`${kg} kg i ${g} g je ukupno koliko grama?`,
          answers:[String(tot+100),String(tot),String(tot-100),String(tot+10)],correct:1,
          hint:`${kg} kg = ${kg*1000} g, pa dodaj ${g} g`,
          edu:`⚖️ Pretvaranje kg u g: pomnoži s 1000. ${kg}kg = ${kg*1000}g. Pa ${kg*1000}+${g}=${tot}g ukupno.`}; },
    ];
    const t=tpl[r(0,tpl.length-1)];
    return typeof t==="function"?t():t;
  },

  // ── 3. RAZRED ──────────────────────────────────────────────────────────────
  "3_brojevi1000": () => {
    const tpl = [
      () => { const s=r(1,9);
        const {answers,correctIdx}=shuffleAnswers(s,[s*10,s+1,s-1||1]);
        return {q:`Koliko stotica ima broj ${s*100}?`,correct:correctIdx,answers,
          hint:`${s*100} = ${s} stotica i 0 desetica i 0 jedinica`,
          edu:`🔢 Stotica = 100 jedinica = 10 desetica. ${s*100} ima ${s} stotica. Kao ${s} kutija s 100 predmeta.`}; },
      () => { const s=r(1,9),d=r(0,9),u=r(0,9); const res=s*100+d*10+u;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,15));
        return {q:`Koji je broj: ${s} stotica, ${d} desetica, ${u} jedinica?`,correct:correctIdx,answers,
          hint:`${s}×100 + ${d}×10 + ${u} = ?`,
          edu:`🔢 Troznamenkasti broj: stotice (×100) + desetice (×10) + jedinice. Npr. 357 = 300+50+7.`}; },
      () => { const s=r(1,8),d=r(1,9),u=r(1,9); const res=s*100+d*10+u;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,15));
        return {q:`Koliko je ${s*100} + ${d*10} + ${u}?`,correct:correctIdx,answers,
          hint:`Zbroji stotice, desetice i jedinice: ${s*100}+${d*10}+${u}`,
          edu:`🔢 Rastavljanje broja: ${res} = ${s*100} (stotice) + ${d*10} (desetice) + ${u} (jedinice). Koristi to za lakše računanje.`}; },
      () => { const a=r(100,850),diff=r(10,100); const b=a+diff;
        return {q:`Koji je veći: ${a} ili ${b}?`,correct:1,answers:[String(a),String(b),"Isti","Ne znam"],
          hint:`Usporedi prvu znamenku: ${Math.floor(a/100)} ili ${Math.floor(b/100)}?`,
          edu:`🔢 Uspoređivanje troznamenkastih: gledaj stotice, pa desetice, pa jedinice. Veća prva znamenka = veći broj.`}; },
      () => { const a=r(1,4)*100,b=r(1,4)*100; const res=a+b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,50));
        return {q:`Koliko je ${a} + ${b}?`,correct:correctIdx,answers,
          hint:`${a/100} stotica + ${b/100} stotica = ${res/100} stotica`,
          edu:`🔢 Zbrajanje stotica: ${a}+${b}=${res}. Kao zbrajanje desetica, samo 10× veće.`}; },
      () => { const ppl=r(200,800),more=r(50,200); const res=ppl+more;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,30));
        return {q:`U gradu živi ${ppl} ljudi. Doseli se još ${more}. Koliko ih ima sada?`,correct:correctIdx,answers,
          hint:`"Doseli još" = zbrojiti: ${ppl}+${more}`,
          edu:`🔢 Tekstualni zadatak s velikim brojevima: isti principi! "Doseli se" = zbrajamo. ${ppl}+${more}=${res}.`}; },
      () => { const start=r(300,900),sub=r(50,200); const res=start-sub;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,30));
        return {q:`Knjižnica ima ${start} knjiga. Posudi se ${sub} knjiga. Koliko ostaje?`,correct:correctIdx,answers,
          hint:`Posudi = oduzeti: ${start}-${sub}`,
          edu:`🔢 "Posudi", "proda", "izgubi" = oduzimamo. Ostalo = početak − oduzeto: ${start}-${sub}=${res}.`}; },
    ];
    return tpl[r(0,tpl.length-1)]();
  },

  "3_mnozenje_pisano": () => {
    const tpl = [
      () => { const b=r(2,4),a=r(11,49); const res=a*b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,8));
        return {q:`${a} × ${b} = ?`,correct:correctIdx,answers,
          hint:`Najprije jedinice (${a%10}×${b}=${(a%10)*b}), pa desetice (${Math.floor(a/10)*10}×${b}=${Math.floor(a/10)*b*10})`,
          edu:`📝 Pisano množenje s lijeva: ${a}×${b} → ${b}×${a%10}=${(a%10)*b} (jedinice) + ${b}×${Math.floor(a/10)*10}=${Math.floor(a/10)*b*10} (desetice) = ${res}.`}; },
      () => { const b=r(2,3),a=r(21,49); const res=a*b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,8));
        return {q:`Škola ima ${b} razreda s po ${a} učenika. Koliko učenika ima škola?`,correct:correctIdx,answers,
          hint:`${b} × ${a} = ?`,
          edu:`📝 "Po ${a} u svakom od ${b}" = množenje. ${b}×${a}=${res}. Pisano: ${b}×${a%10}=${b*(a%10)}, ${b}×${Math.floor(a/10)*10}=${b*Math.floor(a/10)*10}.`}; },
      () => { const b=r(2,4),a=r(12,45); const res=a*b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,8));
        return {q:`Autobus napravi ${b} putovanja, svaki put preveze ${a} putnika. Koliko ukupno?`,correct:correctIdx,answers,
          hint:`${b} putovanja × ${a} putnika = ?`,
          edu:`📝 Jednaka putovanja = množenje! ${b}×${a}=${res}. Svaki put isti broj, množimo!`}; },
      () => { const b=r(2,4),a=r(11,39); const res=a*b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,8));
        return {q:`${a} × ${b} = ?`,correct:correctIdx,answers,
          hint:`Rastavi ${a} = ${Math.floor(a/10)*10} + ${a%10}, pa pomnoži svaki dio.`,
          edu:`📝 Distributivnost: ${a}×${b} = ${Math.floor(a/10)*10}×${b} + ${a%10}×${b} = ${Math.floor(a/10)*b*10} + ${(a%10)*b} = ${res}.`}; },
    ];
    return tpl[r(0,tpl.length-1)]();
  },

  "3_razlomci": () => {
    const tpl = [
      () => { const tot=r(2,20)*2; const half=tot/2;
        const {answers,correctIdx}=shuffleAnswers(half,makeWrongAnswers(half,3,3).filter(x=>x>0));
        return {q:`½ od ${tot} je?`,correct:correctIdx,answers,
          hint:`Podijeli ${tot} na 2 jednaka dijela: ${tot}÷2`,
          edu:`🍕 ½ = polovina = jedan od dva jednaka dijela. Da nađeš ½, dijeli s 2: ${tot}÷2=${half}.`}; },
      () => { const tot=r(1,6)*4; const quarter=tot/4;
        const {answers,correctIdx}=shuffleAnswers(quarter,makeWrongAnswers(quarter,3,2).filter(x=>x>0));
        return {q:`¼ od ${tot} je?`,correct:correctIdx,answers,
          hint:`Podijeli ${tot} na 4 jednaka dijela: ${tot}÷4`,
          edu:`🍕 ¼ = četvrtina = jedan od četiri jednaka dijela. Da nađeš ¼, dijeli s 4: ${tot}÷4=${quarter}.`}; },
      {q:"Pizzu si podijelio na 2 jednaka dijela. Jedan dio je...",answers:["Trećina","Polovina ½","Četvrtina","Cijela"],correct:1,
        hint:"2 jednaka dijela → svaki je pola",edu:"🍕 ½ (polovina) = pizza podijeljena na 2 jednaka dijela. Svaka polovica je isto velika."},
      {q:"Koliko četvrtina (¼) čini jednu cijelu jabuku?",answers:["2","3","4","6"],correct:2,
        hint:"¼ + ¼ + ¼ + ¼ = ?",edu:"🍎 4 četvrtine = 1 cijela. ¼+¼+¼+¼=1. Kao kad jabuku razrežeš na 4 jednaka komada."},
      {q:"Koji je razlomak VEĆI: ½ ili ¼?",answers:["¼","½","Isti su","Ne znam"],correct:1,
        hint:"Pol torte > četvrtina torte",edu:"🍕 Što manji brojnik u nazivniku, to VEĆI dio! ½ > ¼ jer ½ je pola, a ¼ je samo četvrtina."},
      () => { const tot=r(8,20)*2; const half=tot/2;
        return {q:`Mama peče ${tot} keksa. Daje ti polovicu. Koliko keksa dobiš?`,
          correct:0,answers:[String(half),String(half+2),String(half-2),String(tot)],
          hint:`Polovica = ½ = ${tot}÷2`,
          edu:`🍪 "Polovica", "pol", "pola" = ½. Dijeli s 2! ${tot}÷2=${half}. Ostatak je za sutra!`}; },
      {q:"Čokolada ima 8 kockica. Pojedeš ¼. Koliko kockica si pojeo?",answers:["4","3","2","1"],correct:2,
        hint:"¼ od 8 = 8÷4 = ?",edu:"🍫 ¼ od 8: dijeli 8 s 4 = 2 kockice. Ostalo je ¾ = 6 kockica. Provjeri: 2+6=8 ✓"},
    ];
    const t=tpl[r(0,tpl.length-1)];
    return typeof t==="function"?t():t;
  },

  "3_opseg": () => {
    const tpl = [
      () => { const s=r(2,12); const res=4*s;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,6));
        return {q:`Kvadrat ima stranicu ${s} cm. Koliki mu je opseg?`,correct:correctIdx,answers,
          hint:`Kvadrat: 4 jednake stranice → opseg = 4 × ${s}`,
          edu:`📐 Opseg kvadrata = 4 × stranica = 4×${s}=${res} cm. Opseg = ukupna dužina ruba lika.`}; },
      () => { const l=r(3,12),w=r(2,l-1); const res=2*(l+w);
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,6));
        return {q:`Pravokutnik: duljina ${l} cm, širina ${w} cm. Opseg?`,correct:correctIdx,answers,
          hint:`Opseg = 2 × (duljina + širina) = 2 × (${l}+${w})`,
          edu:`📐 Opseg pravokutnika = 2×(d+š) = 2×(${l}+${w}) = 2×${l+w} = ${res} cm. Dva para jednakih stranica!`}; },
      () => { const s=r(2,9)*4; const side=s/4;
        const {answers,correctIdx}=shuffleAnswers(side,makeWrongAnswers(side,3,3));
        return {q:`Opseg kvadrata je ${s} cm. Kolika je jedna stranica?`,correct:correctIdx,answers,
          hint:`Stranica = opseg ÷ 4 = ${s}÷4`,
          edu:`📐 Ako znaš opseg kvadrata, nađi stranicu: stranica = opseg÷4 = ${s}÷4 = ${side} cm.`}; },
      () => { const l=r(3,8),w=r(3,8); const res=2*(l+w);
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,5));
        return {q:`Vrt je ${l} m dug i ${w} m širok. Koliko dugi trebamo plot?`,correct:correctIdx,answers,
          hint:`Plot = opseg = 2×(${l}+${w})`,
          edu:`📐 Plot oko vrta = opseg pravokutnika! 2×(${l}+${w})=2×${l+w}=${res} m plota. Praktična primjena!`}; },
      () => { const a=r(3,6),b=r(3,6),c=r(3,6); const res=a+b+c;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,5));
        return {q:`Trokut ima stranice ${a} cm, ${b} cm i ${c} cm. Opseg?`,correct:correctIdx,answers,
          hint:`Opseg trokuta = zbroj svih 3 stranica: ${a}+${b}+${c}`,
          edu:`📐 Opseg trokuta = ${a}+${b}+${c}=${res} cm. Opseg BILO kojeg lika = zbroj svih stranica!`}; },
    ];
    return tpl[r(0,tpl.length-1)]();
  },

  // ── 4. RAZRED ──────────────────────────────────────────────────────────────
  "4_velikibrojevi": () => {
    const tpl = [
      {q:"Kako se čita broj 1.000.000?",answers:["Sto tisuća","Deset tisuća","Milijun","Milijarda"],correct:2,
        hint:"1 pa 6 nula = milijun",edu:"🔢 Milijun = 1.000.000 (šest nula). Tisuća = 1.000 (tri nule). Deset tisuća = 10.000. Sto tisuća = 100.000."},
      () => { const t=r(10,90); const res=t*1000;
        return {q:`Koliko tisuća ima u broju ${res.toLocaleString("hr-HR")}?`,
          correct:1,answers:[String(t*10),String(t),String(t*100),String(t/10)],
          hint:`${res.toLocaleString("hr-HR")} = ${t} tisuća`,
          edu:`🔢 Tisuće: ${res}=${t}×1000. Da nađemo koliko tisuća, dijelimo s 1000. ${res}÷1000=${t} tisuća.`}; },
      () => { const a=r(100,400)*1000,b=r(10,90)*1000; const res=a+b;
        const {answers,correctIdx}=shuffleAnswers(res,[res+1000,res-1000,res+10000].filter(x=>x>0));
        return {q:`Koliko je ${a.toLocaleString("hr-HR")} + ${b.toLocaleString("hr-HR")}?`,
          correct:correctIdx,answers:answers.map(a=>Number(a).toLocaleString("hr-HR")),
          hint:`Zbroji tisuće: ${a/1000}+${b/1000}=${res/1000} tisuća`,
          edu:`🔢 Zbrajanje tisućica: ${a}+${b}=${res}. Isti princip kao zbrajanje desetica ili stotica, samo s tisućicama!`}; },
      () => { const a=r(100000,850000),b=r(1000,50000);
        return {q:`Koji je veći: ${a.toLocaleString("hr-HR")} ili ${(a+b).toLocaleString("hr-HR")}?`,
          correct:1,answers:[a.toLocaleString("hr-HR"),(a+b).toLocaleString("hr-HR"),"Isti","Ne znam"],
          hint:`Usporedi znamenku po znamenku s lijeva!`,
          edu:`🔢 Uspoređivanje velikih brojeva: gledaj s lijeva. ${a+b}>${a} jer ${a+b} ima više tisuća.`}; },
    ];
    const t=tpl[r(0,tpl.length-1)];
    return typeof t==="function"?t():t;
  },

  "4_dijeljenje_pisano": () => {
    const tpl = [
      () => { const b=r(2,6),res=r(10,30); const a=b*res;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,4));
        return {q:`${a} ÷ ${b} = ?`,correct:correctIdx,answers,
          hint:`Probaj: ${b} × ? = ${a}`,
          edu:`➗ Pisano dijeljenje: ${a}÷${b}. Kreni od lijeve znamenke. ${Math.floor(a/10)}÷${b}=... Pa ostatak s jedinicom.`}; },
      () => { const b=r(2,5),res=r(10,25); const a=b*res;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,4));
        return {q:`${a} učenika podijelimo u ${b} razreda jednako. Koliko u svakom?`,correct:correctIdx,answers,
          hint:`${a} ÷ ${b} = ?`,
          edu:`➗ "Jednako u ${b} grupa" = dijeljenje s ${b}. ${a}÷${b}=${res}. Provjeri: ${res}×${b}=${a} ✓`}; },
      () => { const b=r(2,6),res=r(12,28); const a=b*res;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,4));
        return {q:`Kupimo ${a} jaja u pakiranjima po ${b}. Koliko paketa?`,correct:correctIdx,answers,
          hint:`${a} ÷ ${b} = ?`,
          edu:`➗ "Pakiranje po ${b}" = dijeljenje s ${b}. ${a}÷${b}=${res} paketa. Dijeljenje nam govori koliko jednakih grupa!`}; },
      () => { const b=r(3,6),res=r(10,20); const a=b*res;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,4));
        return {q:`${a} ÷ ${b} = ?`,correct:correctIdx,answers,
          hint:`Kreni od najveće znamenke: ${Math.floor(a/10/b)*10+Math.floor(a%100/b)} → provjeri`,
          edu:`➗ Korak po korak: ${a}÷${b}. Koliko puta ${b} ide u ${Math.floor(a/10)}? → Nastavi s ostatkom.`}; },
    ];
    return tpl[r(0,tpl.length-1)]();
  },

  "4_decimalni": () => {
    const tpl = [
      () => { const w=r(1,9),d=r(1,9);
        return {q:`Kako se piše '${w} i ${d} desetinki'?`,
          answers:[`${w}${d}`,`${w},0${d}`,`${w},${d}`,`0,${w}${d}`],correct:2,
          hint:`Cijeli dio, zarez, pa desetinke: ${w},${d}`,
          edu:`🔣 Decimalni zarez odvaja cijeli od decimalnog dijela. ${w},${d} = ${w} cijela i ${d} desetinki.`}; },
      () => { const w=r(1,5),d1=r(1,4),d2=r(d1+1,9);
        return {q:`Koji je veći: ${w},${d1} ili ${w},${d2}?`,
          correct:1,answers:[`${w},${d1}`,`${w},${d2}`,"Isti su","Ne znam"],
          hint:`Cijeli isti (${w}), usporedi decimale: ${d1} ili ${d2}?`,
          edu:`🔣 Decimalni brojevi: isti cijeli dio → usporedi decimale. ${d2}>${d1}, pa je ${w},${d2} > ${w},${d1}.`}; },
      () => { const euros=r(1,9),cents=r(10,90);
        return {q:`${euros} eura i ${cents} centi zapisujemo kao?`,
          answers:[`${euros}${cents}`,`${euros},${cents} €`,`0,${euros}${cents} €`,`${euros*100} €`],correct:1,
          hint:`${euros} € i ${cents} ct = ${euros},${cents} €`,
          edu:`💶 Euro i centi: 1 € = 100 centi. ${euros},${cents} € = ${euros} eura i ${cents} centi. Decimalni zarez dijeli eure od centi!`}; },
      () => { const a=r(2,5),b=r(1,3); const res=a+b;
        return {q:`${a},5 + ${b},5 = ?`,
          correct:1,answers:[`${res},10`,String(res+1),`${res},5`,`${res-1},0`],
          hint:`${a}+${b}=${res}, a 0,5+0,5=1,0`,
          edu:`🔣 Zbrajanje decimala: najprije cijele (${a}+${b}=${res}), pa decimale (0,5+0,5=1,0). Ukupno ${res+1},0.`}; },
      () => { const a=(r(20,59)/10).toFixed(1), b=(r(10,19)/10).toFixed(1);
        const res=(parseFloat(a)-parseFloat(b)).toFixed(1);
        return {q:`${a} - ${b} = ?`,correct:0,
          answers:[res,`${parseFloat(res)+0.1}`,`${parseFloat(res)+0.2}`,`${parseFloat(res)-0.1}`].map(String),
          hint:`Oduzmi cijele, pa decimale: (${Math.floor(parseFloat(a))}-${Math.floor(parseFloat(b))}) i (${(parseFloat(a)%1).toFixed(1)}−${(parseFloat(b)%1).toFixed(1)})`,
          edu:`🔣 Oduzimanje decimala: poravnaj zareze pa oduzmi kao obične brojeve. ${a}-${b}=${res}.`}; },
    ];
    return tpl[r(0,tpl.length-1)]();
  },

  "4_simetrija": () => {
    const qs = [
      {q:"Koji lik ima os simetrije?",answers:["Nepravilan četverokut","Kvadrat","Nepravilan trokut","Niti jedan"],correct:1,
        hint:"Kvadrat možeš presaviti na pola i oba dijela se poklope!",
        edu:"🦋 Os simetrije: zamislimo presvijanje — obje strane se moraju savršeno poklopiti. Kvadrat ima 4 takve osi."},
      {q:"Koliko osi simetrije ima kvadrat?",answers:["1","2","4","6"],correct:2,
        hint:"Vodoravno, okomito i 2 dijagonale = 4 osi!",
        edu:"🦋 Kvadrat: 4 osi simetrije (2 ravne + 2 dijagonalne). Pravokutnik ima samo 2 (ravne, ne dijagonalne!)."},
      {q:"Os simetrije slova 'A' je...",answers:["Vodoravna","Nema je","Okomita","Dijagonalna"],correct:2,
        hint:"Presaviješ li 'A' po sredini, lijeva i desna strana se poklope!",
        edu:"🦋 Slovo 'A' ima okomitu os simetrije — lijeva i desna strana su ogledalna slika. Koja slova NE? Npr. 'G', 'F'."},
      {q:"Leptir ima os simetrije. Koja?",answers:["Vodoravna","Okomita","Dijagonalna","Nema je"],correct:1,
        hint:"Lijevo i desno krilo su ogledalna slika!",
        edu:"🦋 Leptir: okomita os simetrije. Lijevo i desno krilo su zrcalna slika. Mnoge životinje imaju tu simetriju!"},
      {q:"Koliko osi simetrije ima krug?",answers:["0","1","4","Beskonačno mnogo"],correct:3,
        hint:"Krug možeš presaviti na beskonačno načina!",
        edu:"🦋 Krug ima beskonačno osi simetrije — svaki promjer je os simetrije! Zato je krug 'najsimetričniji' lik."},
      {q:"Koliko osi simetrije ima pravokutnik?",answers:["4","1","3","2"],correct:3,
        hint:"Vodoravno i okomito — dijagonale NISU osi!",
        edu:"🦋 Pravokutnik: samo 2 osi (vodoravna i okomita). Dijagonale pravokutnika NISU osi simetrije — stranice nisu jednake!"},
      {q:"Koje od ovih slova ima os simetrije?",answers:["F","G","H","J"],correct:2,
        hint:"Koje slovo izgleda isto zrcaljeno po sredini?",
        edu:"🦋 Slovo 'H' ima i vodoravnu i okomitu os simetrije! Provjeri ostala: 'F', 'G', 'J' nemaju ni jednu os."},
      {q:"Jednakostranični trokut ima koliko osi simetrije?",answers:["1","2","3","0"],correct:2,
        hint:"Svaka visina jednakokračnog trokuta je os!",
        edu:"🦋 Jednakostranični trokut: 3 osi simetrije (svaka prolazi kroz vrh i polovište nasuprot stranice). Simetrija prati jednakost stranica!"},
    ];
    return qs[r(0,qs.length-1)];
  },

  // ── 2. RAZRED — NOVI GENERATORI ───────────────────────────────────────────

  "2_zbrajanje100": () => {
    const tpl = [
      () => { const a=r(20,89),b=r(1,99-a); const res=a+b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,5));
        return {q:`${a} + ${b} = ?`,correct:correctIdx,answers,
          hint:`Zbroji desetice: ${Math.floor(a/10)*10}+${Math.floor(b/10)*10}, pa jedinice: ${a%10}+${b%10}`,
          edu:`➕ Zbrajanje do 100: zbroji desetice posebno pa jedinice posebno. ${a}+${b}=${res}.`}; },
      () => { const a=r(21,95),b=r(1,a-1); const res=a-b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,5));
        return {q:`${a} - ${b} = ?`,correct:correctIdx,answers,
          hint:`Oduzmi desetice, pa jedinice. Ili: koliko treba dodati ${b} da dobiješ ${a}?`,
          edu:`➖ Oduzimanje do 100: ${a}-${b}=${res}. Trik: dodaj od ${b} do ${a}: ${b}→${res}→${a}.`}; },
      () => { const dec=r(2,8)*10,b=r(1,9); const a=dec+b; const add=r(1,9); const res=a+add;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,5));
        return {q:`${a} + ${add} = ?`,correct:correctIdx,answers,
          hint:`${a} ima ${Math.floor(a/10)} desetica i ${a%10} jedinica. Dodaj ${add} jedinica.`,
          edu:`➕ Zbrajanje s prelaskom: ${a}+${add}. Dopuni do ${Math.ceil(a/10)*10}: treba ${Math.ceil(a/10)*10-a}, ostatak ${add-(Math.ceil(a/10)*10-a)}. Rezultat: ${res}.`}; },
      () => { const a=r(30,90),b=r(10,a-10); const res=a-b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,5));
        return {q:`Martina ima ${a} kuna, potroši ${b}. Koliko ostane?`,correct:correctIdx,answers,
          hint:`${a} - ${b} = ?`,
          edu:`➖ Oduzimanje u zadatku: "potroši" = oduzeti. ${a}-${b}=${res}.`}; },
      () => { const a=r(10,50),b=r(10,50); const res=a+b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,5));
        return {q:`U razredu je ${a} djevojčica i ${b} dječaka. Koliko učenika ukupno?`,correct:correctIdx,answers,
          hint:`"Ukupno" = zbrojiti: ${a}+${b}`,
          edu:`➕ Zbrajanje: ${a}+${b}=${res} učenika. Provjeri: ${Math.floor(a/10)+Math.floor(b/10)} desetica + ${(a%10)+(b%10)} jedinica.`}; },
    ];
    return tpl[r(0,tpl.length-1)]();
  },

  "2_rimski": () => {
    const rim = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
    const arab = [1,2,3,4,5,6,7,8,9,10,11,12];
    const tpl = [
      () => { const i=r(0,11); const res=arab[i];
        const wrongs=[arab[(i+1)%12],arab[(i+11)%12],arab[(i+2)%12]];
        const {answers,correctIdx}=shuffleAnswers(res,wrongs);
        return {q:`Koji je arapski broj rimski broj ${rim[i]}?`,correct:correctIdx,answers,
          hint:`Rimski: I=1, V=5, X=10. ${rim[i]} =?`,
          edu:`🏛️ Rimski ${rim[i]} = ${res}. Zapamti: I=1, V=5, X=10. IV=4 (jedan prije 5), IX=9 (jedan prije 10).`}; },
      () => { const i=r(0,11); const res=i;
        const opts=[rim[(i+1)%12],rim[i],rim[(i+11)%12],rim[(i+2)%12]];
        return {q:`Koji je rimski broj za ${arab[i]}?`,correct:1,answers:opts,
          hint:`I=1, V=5, X=10. Složi ${arab[i]}!`,
          edu:`🏛️ ${arab[i]} = ${rim[i]}. Rimski numerički sustav koristi se za stranice knjiga, satove, nazive vladara!`}; },
      () => { const i=r(0,10);
        return {q:`Je li ${rim[i]} veće ili manje od ${rim[i+1]}?`,correct:0,
          answers:[`${rim[i]} je manje`,`${rim[i+1]} je manje`,"Jednaki su","Ne znam"],
          hint:`${rim[i]}=${arab[i]}, ${rim[i+1]}=${arab[i+1]}. Koji je manji broj?`,
          edu:`🏛️ ${rim[i]}=${arab[i]} < ${rim[i+1]}=${arab[i+1]}. Na rimskim satovima vidimo I-XII.`}; },
      () => { const i=r(0,11);
        return {q:`Koji je sljedeći rimski broj nakon ${rim[i]}?`,correct:0,
          answers:[rim[(i+1)%12],rim[(i+11)%12],rim[(i+2)%12],"Nema ga"],
          hint:`${rim[i]}=${arab[i]}, dodaj 1.`,
          edu:`🏛️ Nakon ${rim[i]} (=${arab[i]}) dolazi ${rim[(i+1)%12]} (=${arab[(i+1)%12]}).`}; },
    ];
    return tpl[r(0,tpl.length-1)]();
  },

  "2_parni_neparni": () => {
    const tpl = [
      () => { const n=r(1,50)*2;
        return {q:`Je li broj ${n} paran ili neparan?`,correct:0,
          answers:["Paran","Neparan","Ne znam","Ni jedno"],
          hint:`Parni brojevi završavaju na: 0, 2, 4, 6, 8.`,
          edu:`🔢 ${n} je PARAN — dijeli se s 2 bez ostatka. Parni: 2,4,6,8,10… Svaki drugi broj je paran!`}; },
      () => { const n=r(0,49)*2+1;
        return {q:`Je li broj ${n} paran ili neparan?`,correct:1,
          answers:["Paran","Neparan","Ne znam","Ni jedno"],
          hint:`Neparni brojevi završavaju na: 1, 3, 5, 7, 9.`,
          edu:`🔢 ${n} je NEPARAN — ne dijeli se s 2. Neparni: 1,3,5,7,9,11… Između svaka dva parna je jedan neparni!`}; },
      () => { const a=r(2,9),b=r(2,9); const res=a*b+a+b; // (a+1)*(b+1) expanded differently; just use simple: a*b
        const aa=r(2,9),bb=r(2,9); const rr=aa*bb;
        const {answers,correctIdx}=shuffleAnswers(rr,makeWrongAnswers(rr,3,4));
        return {q:`${aa} × ${bb} = ?  (množenje ima prednost pred zbrajanjem)`,correct:correctIdx,answers,
          hint:`Najprije × pa +. Ovdje je samo množenje: ${aa}×${bb}.`,
          edu:`✖️ Red operacija: množenje i dijeljenje UVIJEK računamo prije zbrajanja i oduzimanja!`}; },
      () => { const a=r(1,9),b=r(2,6),c=r(1,9); const res=a+b*c;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,5));
        return {q:`${a} + ${b} × ${c} = ?`,correct:correctIdx,answers,
          hint:`Najprije izraunaj ${b}×${c}=${b*c}, pa dodaj ${a}.`,
          edu:`🔢 Red operacija: ${a} + ${b}×${c} = ${a} + ${b*c} = ${res}. Množenje UVIJEK ide prije zbrajanja!`}; },
      () => { const a=r(2,8),b=r(1,9),c=r(2,5); const res=a*c-b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,5));
        return {q:`${a} × ${c} - ${b} = ?`,correct:correctIdx,answers,
          hint:`Najprije ${a}×${c}=${a*c}, pa oduzmi ${b}.`,
          edu:`🔢 ${a}×${c}-${b} = ${a*c}-${b} = ${res}. Množenje prvo, pa oduzimanje!`}; },
      () => { const nums=[r(1,20)*2,r(0,10)*2+1,r(1,20)*2,r(0,10)*2+1];
        const shuffle4=[...nums].sort(()=>Math.random()-0.5);
        const parni=shuffle4.filter(x=>x%2===0).length;
        return {q:`Koji su parni u nizu: ${shuffle4.join(", ")}?`,correct:0,
          answers:[shuffle4.filter(x=>x%2===0).join(" i "),shuffle4.filter(x=>x%2!==0).join(" i "),"Svi su parni","Nema parnih"],
          hint:`Parni završavaju na 0,2,4,6,8.`,
          edu:`🔢 Paran broj djeljiv je s 2 bez ostatka. U nizu [${shuffle4.join(",")}] parni su: ${shuffle4.filter(x=>x%2===0).join(", ")}.`}; },
    ];
    return tpl[r(0,tpl.length-1)]();
  },

  "2_novac": () => {
    const tpl = [
      () => { const a=r(1,9),b=r(1,9-a); const res=a+b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,2));
        return {q:`Tata ima ${a}€ a mama ${b}€. Koliko eura imaju zajedno?`,correct:correctIdx,answers,
          hint:`Zbroji: ${a}€ + ${b}€`,
          edu:`💶 Euro (€) je hrvatska valuta od 2023. ${a}+${b}=${res}€.`}; },
      () => { const tot=r(5,20),spent=r(1,tot-1); const res=tot-spent;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,2));
        return {q:`Ana ima ${tot}€. Kupi igračku za ${spent}€. Koliko joj ostane?`,correct:correctIdx,answers,
          hint:`${tot}€ - ${spent}€ = ?`,
          edu:`💶 "Kupi" = oduzeti. ${tot}-${spent}=${res}€ ostane.`}; },
      () => { const price=r(1,8),count=r(2,5); const res=price*count;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,3));
        return {q:`Jedna jabuka košta ${price}€. Koliko košta ${count} jabuka?`,correct:correctIdx,answers,
          hint:`${count} × ${price}€ = ?`,
          edu:`💶 Jednaka cijena × količina = množenje. ${count}×${price}=${res}€.`}; },
      () => { const tot=r(10,30),price=r(2,8); const res=Math.floor(tot/price);
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,2));
        return {q:`Marko ima ${tot}€. Karta košta ${price}€. Koliko karata može kupiti?`,correct:correctIdx,answers,
          hint:`${tot} ÷ ${price} = ? (koliko puta ide ${price} u ${tot}?)`,
          edu:`💶 Koliko puta možemo platiti? ${tot}÷${price}=${res} karata. Ostatak: ${tot%price}€.`}; },
      () => { const a=r(50,200),b=r(10,a-10); const res=a-b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,10));
        return {q:`Cipele koštaju ${a}€, majica ${b}€. Za koliko je majica jeftinija?`,correct:correctIdx,answers,
          hint:`Razlika: ${a}€ - ${b}€ = ?`,
          edu:`💶 "Za koliko jeftinija" = razlika = oduzimanje. ${a}-${b}=${res}€.`}; },
      () => { const coins=[1,2,5,10,20,50]; const c=coins[r(0,5)]; const count=r(2,6); const res=c*count;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,Math.max(3,c)));
        return {q:`Imam ${count} kovanice od ${c}€. Koliko novca imam ukupno?`,correct:correctIdx,answers,
          hint:`${count} × ${c}€ = ?`,
          edu:`💶 Kovanice eura: 1ct, 2ct, 5ct, 10ct, 20ct, 50ct, 1€, 2€. ${count}×${c}=${res}€.`}; },
    ];
    return tpl[r(0,tpl.length-1)]();
  },

  "2_geometrija": () => {
    const tpl = [
      () => { const s=r(2,12); const res=4*s;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,4));
        return {q:`Kvadrat ima stranicu duljine ${s} cm. Koliki je opseg?`,correct:correctIdx,answers,
          hint:`Kvadrat ima 4 jednake stranice. Opseg = 4 × ${s}`,
          edu:`📐 Opseg kvadrata = 4 × stranica = 4×${s} = ${res} cm. Opseg = zbroj svih stranica.`,
          visual:(
            <svg width="130" height="130" viewBox="0 0 130 130">
              <rect x="15" y="15" width="95" height="95" fill="rgba(255,159,67,0.15)" stroke="#FF9F43" strokeWidth="2.5" rx="4"/>
              <text x="62" y="124" textAnchor="middle" fill="#FF9F43" fontSize="12" fontFamily="Nunito,sans-serif" fontWeight="bold">{s} cm</text>
              <text x="6" y="68" textAnchor="middle" fill="#FF9F43" fontSize="12" fontFamily="Nunito,sans-serif" fontWeight="bold" transform="rotate(-90,6,68)">{s} cm</text>
              <line x1="15" y1="125" x2="110" y2="125" stroke="#FF9F43" strokeWidth="1.5" markerEnd="url(#arr)" markerStart="url(#arr)"/>
            </svg>
          )}; },
      () => { const a=r(3,12),b=r(2,8); const res=2*(a+b);
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,4));
        return {q:`Pravokutnik ima duljinu ${a} cm i širinu ${b} cm. Koliki je opseg?`,correct:correctIdx,answers,
          hint:`Opseg = 2 × (duljina + širina) = 2 × (${a}+${b})`,
          edu:`📐 Opseg pravokutnika = 2×(a+b) = 2×(${a}+${b}) = 2×${a+b} = ${res} cm.`,
          visual:(
            <svg width="150" height="110" viewBox="0 0 150 110">
              <rect x="10" y="12" width="130" height="72" fill="rgba(84,160,255,0.15)" stroke="#54A0FF" strokeWidth="2.5" rx="4"/>
              <text x="75" y="105" textAnchor="middle" fill="#54A0FF" fontSize="12" fontFamily="Nunito,sans-serif" fontWeight="bold">{a} cm</text>
              <text x="5" y="50" textAnchor="middle" fill="#54A0FF" fontSize="12" fontFamily="Nunito,sans-serif" fontWeight="bold" transform="rotate(-90,5,50)">{b} cm</text>
            </svg>
          )}; },
      () => { const a=r(3,10); const res=3*a;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,3));
        return {q:`Jednakostranični trokut ima stranicu ${a} cm. Koliki je opseg?`,correct:correctIdx,answers,
          hint:`Trokut ima 3 jednake stranice. Opseg = 3 × ${a}`,
          edu:`📐 Opseg jednakostraničnog trokuta = 3 × stranica = 3×${a} = ${res} cm.`,
          visual:(
            <svg width="130" height="115" viewBox="0 0 130 115">
              <polygon points="65,10 10,105 120,105" fill="rgba(46,213,115,0.15)" stroke="#2ed573" strokeWidth="2.5"/>
              <text x="65" y="113" textAnchor="middle" fill="#2ed573" fontSize="12" fontFamily="Nunito,sans-serif" fontWeight="bold">{a} cm</text>
              <text x="26" y="65" textAnchor="middle" fill="#2ed573" fontSize="11" fontFamily="Nunito,sans-serif" transform="rotate(-62,26,65)">{a} cm</text>
              <text x="106" y="65" textAnchor="middle" fill="#2ed573" fontSize="11" fontFamily="Nunito,sans-serif" transform="rotate(62,106,65)">{a} cm</text>
            </svg>
          )}; },
      () => { const a=r(2,10),b=r(2,10); const res=a+b;
        const {answers,correctIdx}=shuffleAnswers(res,makeWrongAnswers(res,3,3));
        return {q:`Dužina AB = ${a} cm, dužina BC = ${b} cm. Kolika je dužina AC?`,correct:correctIdx,answers,
          hint:`AC = AB + BC = ${a} + ${b}`,
          edu:`📏 Dužina = ravni put između dvije točke. AB+BC=${a}+${b}=${res} cm.`,
          visual:(
            <svg width="200" height="50" viewBox="0 0 200 50">
              <line x1="10" y1="25" x2="190" y2="25" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
              <circle cx="10" cy="25" r="5" fill="#FECA57"/>
              <circle cx={10+a*16} cy="25" r="5" fill="#FF9F43"/>
              <circle cx="190" cy="25" r="5" fill="#FECA57"/>
              <text x="10" y="44" textAnchor="middle" fill="#FECA57" fontSize="12" fontFamily="Nunito,sans-serif" fontWeight="bold">A</text>
              <text x={10+a*16} y="44" textAnchor="middle" fill="#FF9F43" fontSize="12" fontFamily="Nunito,sans-serif" fontWeight="bold">B</text>
              <text x="190" y="44" textAnchor="middle" fill="#FECA57" fontSize="12" fontFamily="Nunito,sans-serif" fontWeight="bold">C</text>
              <text x={5+a*8} y="17" textAnchor="middle" fill="#FF9F43" fontSize="11" fontFamily="Nunito,sans-serif">{a} cm</text>
              <text x={10+a*16+(190-10-a*16)/2} y="17" textAnchor="middle" fill="#FF9F43" fontSize="11" fontFamily="Nunito,sans-serif">{b} cm</text>
            </svg>
          )}; },
      {q:"Koliko stranica ima kvadrat?",answers:["3","5","4","6"],correct:2,
        hint:"Kvadrat izgleda kao prozor — broji rubove!",
        edu:"📐 Kvadrat: 4 jednake stranice i 4 kuta (svi pravi kutovi = 90°). Kvadrat je posebna vrsta pravokutnika!",
        visual:(
          <svg width="90" height="90" viewBox="0 0 90 90">
            <rect x="10" y="10" width="70" height="70" fill="rgba(255,159,67,0.15)" stroke="#FF9F43" strokeWidth="2.5" rx="4"/>
            <text x="45" y="52" textAnchor="middle" fill="#FF9F43" fontSize="28" fontFamily="Nunito,sans-serif" fontWeight="bold">4</text>
          </svg>
        )},
      {q:"Koliko stranica ima pravokutnik?",answers:["3","4","5","6"],correct:1,
        hint:"Pravokutnik ima 2 dulje i 2 kraće stranice.",
        edu:"📐 Pravokutnik: 4 stranice (2 para jednakih), svi kutovi su 90°. Vrata, knjiga, ekran — sve su to pravokutnici!",
        visual:(
          <svg width="120" height="80" viewBox="0 0 120 80">
            <rect x="10" y="10" width="100" height="60" fill="rgba(84,160,255,0.15)" stroke="#54A0FF" strokeWidth="2.5" rx="4"/>
            <text x="60" y="48" textAnchor="middle" fill="#54A0FF" fontSize="28" fontFamily="Nunito,sans-serif" fontWeight="bold">4</text>
          </svg>
        )},
      {q:"Koliko stranica ima trokut?",answers:["4","2","3","5"],correct:2,
        hint:"Tri kuta = tri stranice!",
        edu:"📐 Trokut: 3 stranice i 3 kuta. Zbroj svih kutova trokuta uvijek je 180°!",
        visual:(
          <svg width="110" height="100" viewBox="0 0 110 100">
            <polygon points="55,8 8,92 102,92" fill="rgba(46,213,115,0.15)" stroke="#2ed573" strokeWidth="2.5"/>
            <text x="55" y="68" textAnchor="middle" fill="#2ed573" fontSize="28" fontFamily="Nunito,sans-serif" fontWeight="bold">3</text>
          </svg>
        )},
      () => { const s=r(2,12);
        return {q:`Koliko je duljina stranice kvadrata s opsegom ${4*s} cm?`,correct:0,
          answers:[String(s),String(s+1),String(2*s),String(3*s)],
          hint:`Opseg kvadrata = 4 × stranica. Dijeli opseg s 4!`,
          edu:`📐 Ako je opseg=${4*s}, stranica = ${4*s}÷4 = ${s} cm.`,
          visual:(
            <svg width="110" height="110" viewBox="0 0 110 110">
              <rect x="12" y="12" width="86" height="86" fill="rgba(255,159,67,0.15)" stroke="#FF9F43" strokeWidth="2.5" rx="4" strokeDasharray="6,3"/>
              <text x="55" y="62" textAnchor="middle" fill="#FF9F43" fontSize="13" fontFamily="Nunito,sans-serif" fontWeight="bold">opseg = {4*s} cm</text>
              <text x="55" y="80" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="Nunito,sans-serif">stranica = ?</text>
            </svg>
          )}; },
    ];
    const item=tpl[r(0,tpl.length-1)];
    return typeof item==="function"?item():item;
  },
};

const CURRICULUM = {
  1: {
    color:"#FF6B6B",emoji:"🌱",name:"1. razred",
    topics:[
      {id:"1_brojevi20",icon:"🔢",name:"Brojevi do 20",desc:"Čitanje, pisanje i uspoređivanje"},
      {id:"1_zbrajanje",icon:"➕",name:"Zbrajanje do 20",desc:"Zbrajanje s prelazom i bez"},
      {id:"1_oduzimanje",icon:"➖",name:"Oduzimanje do 20",desc:"Oduzimanje s prelazom i bez"},
      {id:"1_oblici",icon:"🔷",name:"Geometrijski oblici",desc:"Trokut, krug, kvadrat, pravokutnik"},
    ]
  },
  2: {
    color:"#FF9F43",emoji:"🌟",name:"2. razred",
    topics:[
      {id:"2_brojevi100",icon:"💯",name:"Brojevi do 100",desc:"Desetice, jedinice, uspoređivanje"},
      {id:"2_zbrajanje100",icon:"➕",name:"Zbrajanje i oduzimanje do 100",desc:"S prelaskom desetice"},
      {id:"2_rimski",icon:"🏛️",name:"Rimski brojevi I–XII",desc:"Čitanje i pisanje rimskih brojeva"},
      {id:"2_mnozenje",icon:"✖️",name:"Množenje — tablice 1–10",desc:"Sve tablice množenja"},
      {id:"2_dijeljenje",icon:"➗",name:"Dijeljenje — osnove",desc:"Dijeljenje kao suprotnost množenja"},
      {id:"2_parni_neparni",icon:"🔢",name:"Parni, neparni i redoslijed",desc:"Parni/neparni brojevi, × prije +"},
      {id:"2_novac",icon:"💶",name:"Novac — euro",desc:"Zadaci s eurima i kovanicama"},
      {id:"2_geometrija",icon:"📐",name:"Geometrija — opseg",desc:"Stranice i opseg likova"},
      {id:"2_mjerenje",icon:"📏",name:"Mjerenje i vrijeme",desc:"Duljina, masa, sat"},
    ]
  },
  3: {
    color:"#FECA57",emoji:"🚀",name:"3. razred",
    topics:[
      {id:"3_brojevi1000",icon:"🔢",name:"Brojevi do 1000",desc:"Stotice, desetice, jedinice"},
      {id:"3_mnozenje_pisano",icon:"📝",name:"Pisano množenje",desc:"Množenje višeznamenkastih"},
      {id:"3_razlomci",icon:"🍕",name:"Razlomci ½ i ¼",desc:"Osnove razlomaka"},
      {id:"3_opseg",icon:"📐",name:"Opseg likova",desc:"Opseg kvadrata i pravokutnika"},
    ]
  },
  4: {
    color:"#48DBFB",emoji:"🌊",name:"4. razred",
    topics:[
      {id:"4_velikibrojevi",icon:"🔢",name:"Veliki brojevi",desc:"Brojevi do milijuna"},
      {id:"4_dijeljenje_pisano",icon:"➗",name:"Pisano dijeljenje",desc:"Dijeljenje s jednoznamenkastim"},
      {id:"4_decimalni",icon:"🔣",name:"Decimalni brojevi",desc:"Desetinke i stotinke"},
      {id:"4_simetrija",icon:"🦋",name:"Simetrija",desc:"Os simetrije i sukladnost"},
    ]
  },
};


// ─── HELPERS ─────────────────────────────────────────────────────────────────
const STARS_DATA = Array.from({length:50},(_,i)=>({
  id:i,x:Math.random()*100,y:Math.random()*100,
  size:Math.random()*2.5+0.8,delay:Math.random()*4,
}));

// ─── LOCALSTORAGE HELPERS ─────────────────────────────────────────────────────
const LS_PLAYERS = "mq_players";
const LS_LAST_NAME = "mq_last_name";

function loadAllPlayers() {
  try { return JSON.parse(localStorage.getItem(LS_PLAYERS)||"{}")||{}; }
  catch { return {}; }
}
function savePlayer(name, grade, progress) {
  const all = loadAllPlayers();
  const key = `${name.trim()}_${grade}`;
  const prev = all[key]||{};
  // Merge: keep max XP per topic
  const merged = {...(prev.progress||{})};
  Object.entries(progress).forEach(([id,val])=>{
    const old = merged[id]||{};
    merged[id] = {xp: Math.max(old.xp||0, val.xp||0), completed: val.completed||old.completed||false};
  });
  all[key] = {name:name.trim(), grade, progress:merged, lastPlayed:Date.now()};
  try { localStorage.setItem(LS_PLAYERS, JSON.stringify(all)); } catch{}
  try { localStorage.setItem(LS_LAST_NAME, name.trim()); } catch{}
}
function loadLastName() {
  try { return localStorage.getItem(LS_LAST_NAME)||""} catch { return ""; }
}
function loadPlayerProgress(name, grade) {
  const all = loadAllPlayers();
  return (all[`${name.trim()}_${grade}`]?.progress)||{};
}

function Stars() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {STARS_DATA.map(s=>(
        <div key={s.id} className="absolute rounded-full bg-white"
          style={{left:`${s.x}%`,top:`${s.y}%`,width:s.size,height:s.size,
            opacity:0.25+Math.random()*0.45,
            animation:`twinkle ${2+s.delay}s ease-in-out infinite alternate`}} />
      ))}
    </div>
  );
}

function ProgressBar({value,max,color,h=4}) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{height:h,background:"rgba(255,255,255,0.1)"}}>
      <div className="h-full rounded-full transition-all duration-700"
        style={{width:`${Math.min(100,(value/max)*100)}%`,background:color}} />
    </div>
  );
}

function Pill({children,color,bg,onClick}) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold cursor-pointer"
      onClick={onClick}
      style={{color,background:bg,fontFamily:"'Nunito',sans-serif"}}>
      {children}
    </span>
  );
}

// Logo / Home link component
function Logo({onClick}) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 group transition-all duration-200 hover:opacity-80"
      style={{background:"none",border:"none",cursor:"pointer",padding:0}}>
      <span className="text-2xl" style={{animation:"float 3s ease-in-out infinite"}}>🧮</span>
      <span className="font-black text-lg" style={{
        fontFamily:"'Baloo 2',cursive",
        background:"linear-gradient(90deg,#FECA57,#FF6B6B)",
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"
      }}>MathQuest</span>
    </button>
  );
}

// ─── SCREEN: WELCOME ─────────────────────────────────────────────────────────
function WelcomeScreen({onStart, onLeaderboard, onAdmin}) {
  const [name,setName]=useState(()=>loadLastName());
  const [selected,setSelected]=useState(null);
  const [nameTouched,setNameTouched]=useState(false);
  const grades=Object.entries(CURRICULUM);
  const nameInvalid = nameTouched && name.trim().length === 0;

  // Admin modal state
  const [showAdmin,setShowAdmin]=useState(false);
  const [adminPwd,setAdminPwd]=useState("");
  const [adminPwdOk,setAdminPwdOk]=useState(false);
  const [adminPwdError,setAdminPwdError]=useState(false);
  const [adminGrade,setAdminGrade]=useState(null);

  const handleStart = () => {
    setNameTouched(true);
    if (!name.trim()) return;
    if (!selected) return;
    onStart(name.trim(), selected);
  };

  const handleAdminPwd = () => {
    if (adminPwd === "a") { setAdminPwdOk(true); setAdminPwdError(false); }
    else { setAdminPwdError(true); setAdminPwd(""); }
  };

  const handleAdminEnter = () => {
    if (!adminGrade) return;
    setShowAdmin(false); setAdminPwd(""); setAdminPwdOk(false); setAdminGrade(null);
    onAdmin(adminGrade);
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6">

      {/* ── HERO: centrirano, jedan ispod drugog ── */}
      <div className="flex flex-col items-center w-full">

        {/* 1. Dječak */}
        <img
          src="/images/marko.png"
          alt="Marko"
          style={{width:"180px",height:"auto",display:"block",objectFit:"contain",marginBottom:"2px"}}
        />

        {/* 2. Pozdrav */}
        <div className="relative px-4 py-2.5 rounded-2xl text-center"
          style={{background:"rgba(255,255,255,0.09)",border:"1.5px solid rgba(255,255,255,0.15)"}}>
          <div style={{position:"absolute",top:"-8px",left:"50%",transform:"translateX(-50%)",
            width:0,height:0,
            borderLeft:"8px solid transparent",borderRight:"8px solid transparent",
            borderBottom:"8px solid rgba(255,255,255,0.15)"}}/>
          <p className="text-white font-bold text-sm leading-snug" style={{fontFamily:"'Nunito',sans-serif"}}>
            {name.trim()
              ? <>Bok, <span style={{color:"#FECA57"}}>{name.trim()}</span>! 👋 Ja sam <span style={{color:"#54A0FF"}}>Marko</span>!</>
              : <>Pozdrav! 👋 Ja sam <span style={{color:"#54A0FF"}}>Marko</span>!</>}
          </p>
          <p className="text-white opacity-40 text-xs mt-0.5" style={{fontFamily:"'Nunito',sans-serif"}}>
            Zajedno učimo matematiku!
          </p>
        </div>

        {/* 3. MathQuest naslov */}
        <div className="text-center" style={{marginTop:"20px"}}>
          <h1 className="text-5xl font-black mb-1" style={{fontFamily:"'Baloo 2',cursive",
            background:"linear-gradient(90deg,#FECA57 0%,#FF6B6B 50%,#54A0FF 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            MathQuest
          </h1>
          <p className="text-white opacity-60 text-base" style={{fontFamily:"'Nunito',sans-serif"}}>
            Matematika za 1. – 4. razred · HRV kurikulum
          </p>
        </div>
      </div>

      <div className="w-full max-w-xs">
        <label className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1"
          style={{fontFamily:"'Nunito',sans-serif",color: nameInvalid ? "#FF6B6B" : "rgba(255,255,255,0.6)"}}>
          Tvoje ime <span style={{color:"#FF6B6B"}}>*</span>
        </label>
        <input
          value={name}
          onChange={e=>{setName(e.target.value); setNameTouched(true);}}
          onBlur={()=>setNameTouched(true)}
          placeholder="Upiši svoje ime za početak..."
          className="w-full px-4 py-3 rounded-2xl text-white font-bold outline-none text-base transition-all"
          style={{
            background: nameInvalid ? "rgba(255,107,107,0.08)" : "rgba(255,255,255,0.08)",
            border: `1.5px solid ${nameInvalid ? "#FF6B6B" : name.trim() ? "#2ed573" : "rgba(255,255,255,0.15)"}`,
            fontFamily:"'Nunito',sans-serif",
            boxShadow: nameInvalid ? "0 0 12px rgba(255,107,107,0.2)" : name.trim() ? "0 0 12px rgba(46,213,115,0.15)" : "none",
          }} />
        {nameInvalid && (
          <p className="text-xs mt-1.5 font-semibold" style={{color:"#FF6B6B",fontFamily:"'Nunito',sans-serif"}}>
            ⚠️ Ime je obavezno za početak!
          </p>
        )}
      </div>

      <div className="w-full max-w-xs">
        <p className="text-white opacity-60 text-xs font-semibold uppercase tracking-wider mb-3"
          style={{fontFamily:"'Nunito',sans-serif"}}>Odaberi razred</p>
        <div className="grid grid-cols-2 gap-3">
          {grades.map(([g,data])=>(
            <button key={g} onClick={()=>setSelected(Number(g))}
              className="flex flex-col items-center gap-2 rounded-2xl py-5 transition-all duration-200"
              style={{
                background:selected===Number(g)?`${data.color}25`:"rgba(255,255,255,0.06)",
                border:`2px solid ${selected===Number(g)?data.color:"rgba(255,255,255,0.1)"}`,
                transform:selected===Number(g)?"scale(1.04)":"scale(1)",
                boxShadow:selected===Number(g)?`0 8px 24px ${data.color}40`:"none",
              }}>
              <span className="text-3xl">{data.emoji}</span>
              <span className="font-black text-white text-xl" style={{fontFamily:"'Baloo 2',cursive"}}>{data.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 w-full max-w-xs">
        {[{icon:"🔄",v:"∞",l:"Zadataka"},{icon:"🇭🇷",v:"HRV",l:"Kurikulum"},{icon:"🎁",v:"100%",l:"Besplatno"}].map(s=>(
          <div key={s.l} className="flex-1 flex flex-col items-center gap-1 rounded-2xl py-3"
            style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <span className="text-xl">{s.icon}</span>
            <span className="text-white font-black text-sm" style={{fontFamily:"'Baloo 2',cursive"}}>{s.v}</span>
            <span className="text-white opacity-40 text-xs" style={{fontFamily:"'Nunito',sans-serif"}}>{s.l}</span>
          </div>
        ))}
      </div>

      <button onClick={handleStart}
        className="w-full max-w-xs py-4 rounded-2xl font-black text-white text-lg transition-all duration-200"
        style={{
          background: (name.trim() && selected) ? "linear-gradient(135deg,#FECA57,#FF6B6B)" : "rgba(255,255,255,0.1)",
          fontFamily:"'Baloo 2',cursive",
          opacity: (name.trim() && selected) ? 1 : 0.5,
          boxShadow: (name.trim() && selected) ? "0 8px 24px rgba(254,202,87,0.35)" : "none",
        }}>
        {!name.trim() ? "Upiši ime ↑" : !selected ? "Odaberi razred ↑" : `Kreni u avanturu! 🚀`}
      </button>

      <button onClick={onLeaderboard}
        className="w-full max-w-xs py-3 rounded-2xl font-bold text-white text-base transition-all duration-200"
        style={{
          background:"rgba(255,255,255,0.05)",
          border:"1.5px solid rgba(255,255,255,0.12)",
          fontFamily:"'Baloo 2',cursive",
        }}>
        🏆 Ljestvica igrača
      </button>

      <button onClick={()=>{setShowAdmin(true);setAdminPwd("");setAdminPwdOk(false);setAdminPwdError(false);setAdminGrade(null);}}
        className="text-white opacity-20 hover:opacity-50 transition-all text-xs"
        style={{fontFamily:"'Nunito',sans-serif"}}>
        ⚙️ Admin
      </button>

      {showAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{background:"rgba(0,0,0,0.75)"}}>
          <div className="rounded-3xl p-6 flex flex-col gap-4 w-80"
            style={{background:"#1a1a2e",border:"1px solid rgba(255,255,255,0.12)"}}>
            <p className="text-white font-black text-lg text-center" style={{fontFamily:"'Baloo 2',cursive"}}>
              🔑 Admin pristup
            </p>

            {!adminPwdOk ? (
              <>
                <p className="text-white opacity-50 text-sm text-center" style={{fontFamily:"'Nunito',sans-serif"}}>
                  Unesi lozinku za admin pregled
                </p>
                <input
                  type="password"
                  value={adminPwd}
                  onChange={e=>{setAdminPwd(e.target.value);setAdminPwdError(false);}}
                  onKeyDown={e=>e.key==="Enter"&&handleAdminPwd()}
                  placeholder="Lozinka"
                  autoFocus
                  className="rounded-xl px-4 py-2.5 text-white text-center text-lg outline-none"
                  style={{background:"rgba(255,255,255,0.07)",border:`1px solid ${adminPwdError?"rgba(255,80,80,0.6)":"rgba(255,255,255,0.15)"}`,fontFamily:"'Nunito',sans-serif"}}
                />
                {adminPwdError && (
                  <p className="text-red-400 text-xs text-center -mt-2" style={{fontFamily:"'Nunito',sans-serif"}}>
                    Pogrešna lozinka.
                  </p>
                )}
                <div className="flex gap-3">
                  <button onClick={()=>setShowAdmin(false)}
                    className="flex-1 py-2 rounded-xl font-bold text-sm"
                    style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.6)",fontFamily:"'Nunito',sans-serif"}}>
                    Odustani
                  </button>
                  <button onClick={handleAdminPwd}
                    className="flex-1 py-2 rounded-xl font-bold text-sm"
                    style={{background:"rgba(84,160,255,0.2)",border:"1px solid rgba(84,160,255,0.4)",color:"rgba(130,190,255,0.9)",fontFamily:"'Nunito',sans-serif"}}>
                    Potvrdi
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-white opacity-50 text-sm text-center" style={{fontFamily:"'Nunito',sans-serif"}}>
                  Odaberi razred za pregled
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {grades.map(([g,data])=>(
                    <button key={g} onClick={()=>setAdminGrade(Number(g))}
                      className="flex flex-col items-center gap-1.5 rounded-2xl py-4 transition-all duration-200"
                      style={{
                        background:adminGrade===Number(g)?`${data.color}25`:"rgba(255,255,255,0.06)",
                        border:`2px solid ${adminGrade===Number(g)?data.color:"rgba(255,255,255,0.1)"}`,
                        transform:adminGrade===Number(g)?"scale(1.04)":"scale(1)",
                      }}>
                      <span className="text-2xl">{data.emoji}</span>
                      <span className="font-black text-white text-base" style={{fontFamily:"'Baloo 2',cursive"}}>{data.name}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={()=>setShowAdmin(false)}
                    className="flex-1 py-2 rounded-xl font-bold text-sm"
                    style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.6)",fontFamily:"'Nunito',sans-serif"}}>
                    Odustani
                  </button>
                  <button onClick={handleAdminEnter} disabled={!adminGrade}
                    className="flex-1 py-2 rounded-xl font-bold text-sm transition-all"
                    style={{background:adminGrade?"rgba(84,160,255,0.2)":"rgba(255,255,255,0.05)",border:`1px solid ${adminGrade?"rgba(84,160,255,0.4)":"rgba(255,255,255,0.08)"}`,color:adminGrade?"rgba(130,190,255,0.9)":"rgba(255,255,255,0.2)",fontFamily:"'Nunito',sans-serif"}}>
                    Otvori →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SCREEN: LEADERBOARD ─────────────────────────────────────────────────────
function LeaderboardScreen({onBack, currentName, currentGrade}) {
  const [players, setPlayers] = useState(()=>loadAllPlayers());
  const [showReset, setShowReset] = useState(false);
  const [resetPwd, setResetPwd] = useState("");
  const [resetError, setResetError] = useState(false);

  const entries = Object.values(players).map(p => {
    const totalXP = Object.values(p.progress||{}).reduce((a,b)=>a+(b.xp||0),0);
    const completed = Object.values(p.progress||{}).filter(t=>t.completed).length;
    return {...p, totalXP, completed};
  }).sort((a,b)=>b.totalXP-a.totalXP);

  const handleResetConfirm = () => {
    if (resetPwd === "a") {
      try { localStorage.removeItem(LS_PLAYERS); } catch{}
      setPlayers({});
      setShowReset(false);
      setResetPwd("");
      setResetError(false);
    } else {
      setResetError(true);
      setResetPwd("");
    }
  };

  const rankEmoji = (i) => i===0?"🥇":i===1?"🥈":i===2?"🥉":"";
  const isMe = (p) => p.name===currentName && p.grade===currentGrade;

  return (
    <div className="flex flex-col gap-5 px-4 py-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="text-white opacity-50 hover:opacity-90 transition-all text-sm px-3 py-1.5 rounded-xl"
          style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'Nunito',sans-serif"}}>
          ← Natrag
        </button>
        <p className="text-white font-black text-xl flex-1" style={{fontFamily:"'Baloo 2',cursive"}}>🏆 Ljestvica</p>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="text-6xl" style={{animation:"float 3s ease-in-out infinite"}}>🌟</div>
          <p className="text-white opacity-50 text-center text-base" style={{fontFamily:"'Nunito',sans-serif"}}>
            Još nema igrača na ljestvici.<br/>Odigraj kviz i osvoji XP!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((p,i) => {
            const gradeData = CURRICULUM[p.grade];
            const mine = isMe(p);
            return (
              <div key={`${p.name}_${p.grade}`}
                className="flex items-center gap-3 rounded-2xl px-4 py-4"
                style={{
                  background: mine ? "rgba(254,202,87,0.1)" : i===0 ? "rgba(255,215,0,0.07)" : "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${mine ? "rgba(254,202,87,0.4)" : i===0 ? "rgba(255,215,0,0.25)" : "rgba(255,255,255,0.08)"}`,
                  boxShadow: mine ? "0 0 20px rgba(254,202,87,0.1)" : "none",
                }}>
                {/* Rank */}
                <div className="w-9 text-center">
                  {rankEmoji(i) ? (
                    <span className="text-2xl">{rankEmoji(i)}</span>
                  ) : (
                    <span className="text-white opacity-30 font-black text-lg" style={{fontFamily:"'Baloo 2',cursive"}}>{i+1}</span>
                  )}
                </div>
                {/* Grade emoji */}
                <span className="text-2xl">{gradeData?.emoji||"📚"}</span>
                {/* Name & info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-black text-base truncate" style={{fontFamily:"'Baloo 2',cursive"}}>
                      {p.name}
                    </p>
                    {mine && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:"rgba(254,202,87,0.2)",color:"#FECA57",fontFamily:"'Nunito',sans-serif"}}>Ti</span>}
                  </div>
                  <p className="text-white opacity-40 text-xs" style={{fontFamily:"'Nunito',sans-serif"}}>
                    {gradeData?.name} · {p.completed} poglavlja završeno
                  </p>
                </div>
                {/* XP */}
                <div className="text-right shrink-0">
                  <p className="text-yellow-300 font-black text-lg" style={{fontFamily:"'Baloo 2',cursive"}}>{p.totalXP}</p>
                  <p className="text-white opacity-30 text-xs" style={{fontFamily:"'Nunito',sans-serif"}}>XP</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl p-3 text-center"
        style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}>
        <p className="text-white opacity-30 text-xs" style={{fontFamily:"'Nunito',sans-serif"}}>
          Ljestvica se čuva lokalno na ovom uređaju
        </p>
      </div>

      <button onClick={()=>{setShowReset(true);setResetPwd("");setResetError(false);}}
        className="w-full py-2.5 rounded-2xl font-bold text-sm transition-all duration-200"
        style={{background:"rgba(255,80,80,0.08)",border:"1px solid rgba(255,80,80,0.2)",color:"rgba(255,100,100,0.7)",fontFamily:"'Nunito',sans-serif"}}>
        🗑️ Resetiraj ljestvicu
      </button>

      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{background:"rgba(0,0,0,0.7)"}}>
          <div className="rounded-3xl p-6 flex flex-col gap-4 w-72"
            style={{background:"#1a1a2e",border:"1px solid rgba(255,255,255,0.12)"}}>
            <p className="text-white font-black text-lg text-center" style={{fontFamily:"'Baloo 2',cursive"}}>
              🔒 Unesi lozinku
            </p>
            <p className="text-white opacity-50 text-sm text-center" style={{fontFamily:"'Nunito',sans-serif"}}>
              Ova radnja briše sve igrače s ljestvice.
            </p>
            <input
              type="password"
              value={resetPwd}
              onChange={e=>{setResetPwd(e.target.value);setResetError(false);}}
              onKeyDown={e=>e.key==="Enter"&&handleResetConfirm()}
              placeholder="Lozinka"
              autoFocus
              className="rounded-xl px-4 py-2.5 text-white text-center text-lg outline-none"
              style={{background:"rgba(255,255,255,0.07)",border:`1px solid ${resetError?"rgba(255,80,80,0.6)":"rgba(255,255,255,0.15)"}`,fontFamily:"'Nunito',sans-serif"}}
            />
            {resetError && (
              <p className="text-red-400 text-xs text-center" style={{fontFamily:"'Nunito',sans-serif"}}>
                Pogrešna lozinka. Pokušaj ponovo.
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={()=>{setShowReset(false);setResetPwd("");setResetError(false);}}
                className="flex-1 py-2 rounded-xl font-bold text-sm"
                style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.6)",fontFamily:"'Nunito',sans-serif"}}>
                Odustani
              </button>
              <button onClick={handleResetConfirm}
                className="flex-1 py-2 rounded-xl font-bold text-sm"
                style={{background:"rgba(255,60,60,0.2)",border:"1px solid rgba(255,80,80,0.3)",color:"rgba(255,120,120,0.9)",fontFamily:"'Nunito',sans-serif"}}>
                Resetiraj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SCREEN: TOPIC MAP ────────────────────────────────────────────────────────
function TopicMap({grade,userName,progress,onTopic,onHome,isAdmin=false}) {
  const data=CURRICULUM[grade];
  const totalXP=Object.values(progress).reduce((a,b)=>a+(b.xp||0),0);

  return (
    <div className="flex flex-col gap-5 px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-white font-black text-xl" style={{fontFamily:"'Baloo 2',cursive"}}>
            {data.emoji} {data.name}
          </p>
          <p className="text-white opacity-50 text-sm" style={{fontFamily:"'Nunito',sans-serif"}}>
            {isAdmin ? "🔑 Admin pregled — sva poglavlja otključana" : `Hej, ${userName}! Odaberi poglavlje.`}
          </p>
        </div>
        <Pill color="#FECA57" bg="rgba(254,202,87,0.12)">⭐ {totalXP} XP</Pill>
      </div>

      <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
        <div className="flex justify-between mb-2">
          <span className="text-white text-sm opacity-60" style={{fontFamily:"'Nunito',sans-serif"}}>Ukupni napredak</span>
          <span className="text-yellow-300 text-sm font-bold" style={{fontFamily:"'Nunito',sans-serif"}}>
            {Object.values(progress).filter(p=>p.completed).length}/{data.topics.length} poglavlja
          </span>
        </div>
        <ProgressBar value={Object.values(progress).filter(p=>p.completed).length}
          max={data.topics.length} color={`linear-gradient(90deg,${data.color},#FF6B6B)`} h={6} />
      </div>

      <div className="flex flex-col gap-3">
        {data.topics.map((topic,idx)=>{
          const prog=progress[topic.id]||{};
          const done=prog.completed;
          const locked=!isAdmin&&idx>0&&!(progress[data.topics[idx-1].id]?.completed);
          return (
            <button key={topic.id} onClick={()=>!locked&&onTopic(topic)}
              className="flex items-center gap-4 rounded-2xl px-4 py-4 text-left w-full transition-all duration-200"
              style={{
                background:done?`${data.color}18`:locked?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.07)",
                border:`1.5px solid ${done?data.color+"44":locked?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.12)"}`,
                opacity:locked?0.4:1,
              }}>
              <div className="text-4xl w-12 flex items-center justify-center">{topic.icon}</div>
              <div className="flex-1">
                <p className="text-white font-bold text-base mb-0.5" style={{fontFamily:"'Nunito',sans-serif"}}>{topic.name}</p>
                <p className="text-white opacity-50 text-xs mb-2" style={{fontFamily:"'Nunito',sans-serif"}}>{topic.desc}</p>
                <ProgressBar value={prog.xp||0} max={50} color={data.color} h={4} />
              </div>
              <div className="flex flex-col items-center gap-1 ml-2">
                {done?<span className="text-2xl">✅</span>
                  :locked?<span className="text-2xl opacity-30">🔒</span>
                  :(prog.xp||0)>0?<span className="text-2xl">⚡</span>
                  :<span className="text-white opacity-30 text-2xl">▶️</span>}
                {!locked&&<span className="text-xs font-bold" style={{color:data.color,fontFamily:"'Nunito',sans-serif"}}>
                  {prog.xp||0}/50 XP
                </span>}
              </div>
            </button>
          );
        })}
      </div>

      {Object.values(progress).some(p=>p.completed)&&(
        <div className="rounded-2xl p-4" style={{background:"rgba(254,202,87,0.08)",border:"1px solid rgba(254,202,87,0.2)"}}>
          <p className="text-yellow-300 font-black text-sm mb-2" style={{fontFamily:"'Baloo 2',cursive"}}>🏅 Zaslužene značke</p>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(progress).filter(([,p])=>p.completed).map(([id])=>{
              const t=data.topics.find(t=>t.id===id);
              return t?(<div key={id} className="flex items-center gap-1 px-3 py-1 rounded-xl"
                style={{background:"rgba(254,202,87,0.12)",border:"1px solid rgba(254,202,87,0.3)"}}>
                <span>{t.icon}</span>
                <span className="text-white text-xs font-bold" style={{fontFamily:"'Nunito',sans-serif"}}>{t.name}</span>
              </div>):null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SCREEN: QUIZ ────────────────────────────────────────────────────────────
// onSaveProgress: llamado inmediatamente al finalizar (persiste XP)
// onFinish: navega de vuelta a topics
function QuizScreen({topic,grade,onFinish,onSaveProgress,existing,onHome,isAdmin=false,questionCount=20}) {
  const data=CURRICULUM[grade];
  const maxXP = questionCount === 10 ? 25 : 50;

  // Generate fresh questions on every mount (or retry)
  // Every 3rd question is a visual task (for supported topics)
  const generateQuestions = useCallback(()=>
    Array.from({length:questionCount},(_,i)=>
      (VISUAL_TOPICS.has(topic.id) && (i+1)%3===0)
        ? generateVisualQ(grade)
        : GENERATORS[topic.id]()
    )
  ,[topic.id, questionCount, grade]);

  const [questions,setQuestions]=useState(()=>generateQuestions());
  const [qIdx,setQIdx]=useState(0);
  const [selected,setSelected]=useState(null);   // for MC: index; for visual: number
  const [visualInput,setVisualInput]=useState(""); // typed answer for visual tasks
  const [showResult,setShowResult]=useState(false);
  const [score,setScore]=useState(0);
  const [showHint,setShowHint]=useState(false);
  const [streak,setStreak]=useState(0);
  const [finished,setFinished]=useState(false);
  const [results,setResults]=useState([]);
  const [animateCorrect,setAnimateCorrect]=useState(false);
  const savedRef = useRef(false); // prevent duplicate onSaveProgress calls

  const q=questions[qIdx];
  const isCorrect = q.type==="visual"
    ? selected===q.answer
    : selected===q.correct;

  const handleAnswer=(i)=>{
    if(selected!==null)return;
    setSelected(i);
    const correct=i===q.correct;
    setResults(r=>[...r,correct]);
    if(correct){setScore(s=>s+1);setStreak(s=>s+1);}
    else setStreak(0);
    setTimeout(()=>setShowResult(true),500);
  };

  const handleVisualSubmit=()=>{
    if(selected!==null)return;
    const val=parseInt(visualInput,10);
    if(isNaN(val))return;
    setSelected(val);
    const correct=val===q.answer;
    setResults(r=>[...r,correct]);
    if(correct){setScore(s=>s+1);setStreak(s=>s+1);setAnimateCorrect(true);setTimeout(()=>setAnimateCorrect(false),900);}
    else setStreak(0);
    setTimeout(()=>setShowResult(true),correct?600:400);
  };

  const resetQ=()=>{setSelected(null);setShowResult(false);setShowHint(false);setVisualInput("");};

  const handleNext=()=>{
    if(qIdx<questions.length-1){setQIdx(i=>i+1);resetQ();}
    else setFinished(true);
  };

  // Admin navigation: jump freely between questions
  const handleAdminPrev=()=>{ if(qIdx>0){setQIdx(i=>i-1);resetQ();} };
  const handleAdminNext=()=>{
    if(qIdx<questions.length-1){setQIdx(i=>i+1);resetQ();}
    else{setQuestions(generateQuestions());setQIdx(0);resetQ();}
  };

  const handleRetry=()=>{
    setQuestions(generateQuestions());
    setQIdx(0);resetQ();setScore(0);setStreak(0);
    setFinished(false);setResults([]);
    savedRef.current = false;
  };

  if(finished){
    const pct=Math.round((score/questions.length)*100);
    const xpEarned=Math.round((score/questions.length)*maxXP);
    const prevXP=existing?.xp||0;
    // XP = MAX of all attempts, never additive
    const newXP=Math.max(prevXP, xpEarned);
    const improved = newXP > prevXP;
    const completed=newXP>=40||pct>=80;
    // Persist immediately on first render of result screen
    if (!savedRef.current) { savedRef.current = true; onSaveProgress({xp:newXP,completed}); }

    return (
      <div className="flex flex-col items-center gap-6 px-4 py-6 text-center">
        <div className="text-7xl" style={{animation:"float 2s ease-in-out infinite",filter:`drop-shadow(0 0 24px ${data.color})`}}>
          {pct>=80?"🏆":pct>=60?"🌟":"💪"}
        </div>
        <div>
          <p className="text-white font-black text-3xl mb-1" style={{fontFamily:"'Baloo 2',cursive"}}>
            {pct>=80?"Izvrsno!":pct>=60?"Dobro!":"Pokušaj opet!"}
          </p>
          <p className="text-white opacity-60" style={{fontFamily:"'Nunito',sans-serif"}}>
            {score} od {questions.length} točnih odgovora
          </p>
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {results.map((res,i)=>(
            <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center font-black text-base"
              style={{background:res?"rgba(46,213,115,0.2)":"rgba(255,107,107,0.2)",
                border:`2px solid ${res?"#2ed573":"#FF6B6B"}`}}>
              {res?"✓":"✗"}
            </div>
          ))}
        </div>

        <div className="w-full rounded-2xl p-5"
          style={{background:completed?"rgba(254,202,87,0.12)":"rgba(255,255,255,0.06)",
            border:`1.5px solid ${completed?"rgba(254,202,87,0.3)":"rgba(255,255,255,0.1)"}`}}>
          <p className="text-yellow-300 font-black text-xl mb-1" style={{fontFamily:"'Baloo 2',cursive"}}>
            {improved ? `🆙 Novi rekord: ${newXP} XP!` : `⭐ Tvoj best: ${newXP} XP`}
          </p>
          {improved && prevXP > 0 && (
            <p className="text-white opacity-50 text-xs mb-2" style={{fontFamily:"'Nunito',sans-serif"}}>
              Prethodni best: {prevXP} XP → poboljšao si za {newXP - prevXP} XP!
            </p>
          )}
          {!improved && prevXP > 0 && (
            <p className="text-white opacity-50 text-xs mb-2" style={{fontFamily:"'Nunito',sans-serif"}}>
              Ovaj pokušaj: {xpEarned} XP · Tvoj best ostaje {prevXP} XP
            </p>
          )}
          <ProgressBar value={newXP} max={maxXP} color={data.color} h={8} />
          <p className="text-white opacity-50 text-xs mt-2" style={{fontFamily:"'Nunito',sans-serif"}}>
            {newXP}/{maxXP} XP · Maksimum = sve točno = {maxXP} XP
          </p>
          {completed&&<p className="text-yellow-300 font-bold mt-2 text-sm" style={{fontFamily:"'Nunito',sans-serif"}}>
            ✅ Poglavlje završeno! Otključano sljedeće!
          </p>}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 w-full">
          {/* Retry with NEW questions */}
          <button onClick={handleRetry}
            className="w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2 transition-all"
            style={{background:`linear-gradient(135deg,${data.color},#FF6B6B)`,fontFamily:"'Baloo 2',cursive",
              boxShadow:`0 6px 20px ${data.color}44`}}>
            🔄 Vježbaj opet — novi zadaci!
          </button>

          <div className="flex gap-3">
            <button onClick={()=>onFinish({xp:newXP,completed})}
              className="flex-1 py-3 rounded-2xl font-bold text-white transition-all text-sm"
              style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",fontFamily:"'Nunito',sans-serif"}}>
              ← Poglavlja
            </button>
            <button onClick={onHome}
              className="flex-1 py-3 rounded-2xl font-bold text-white transition-all text-sm"
              style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",fontFamily:"'Nunito',sans-serif"}}>
              🏠 Početna
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Progress header */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex justify-between mb-1.5">
            <span className="text-white opacity-50 text-xs" style={{fontFamily:"'Nunito',sans-serif"}}>
              {topic.icon} {topic.name}
            </span>
            <span className="text-white opacity-50 text-xs" style={{fontFamily:"'Nunito',sans-serif"}}>
              {qIdx+1} / {questions.length}
            </span>
          </div>
          <ProgressBar value={qIdx+1} max={questions.length} color={data.color} h={5} />
        </div>
        {streak>=2&&!isAdmin&&(
          <div className="px-2 py-1 rounded-xl text-xs font-bold"
            style={{background:"rgba(255,107,107,0.2)",color:"#FF6B6B",border:"1px solid rgba(255,107,107,0.3)",fontFamily:"'Nunito',sans-serif"}}>
            🔥 {streak}×
          </div>
        )}
      </div>

      {/* Question card */}
      <div className="rounded-3xl p-6 flex flex-col items-center gap-3 text-center"
        style={{background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(255,255,255,0.1)",boxShadow:"0 8px 40px rgba(0,0,0,0.3)"}}>
        <span className="px-3 py-1 rounded-full text-xs font-bold"
          style={{color:data.color,background:`${data.color}20`,fontFamily:"'Nunito',sans-serif"}}>
          {topic.icon} {topic.name}
        </span>
        <p className="text-white font-black text-2xl leading-snug"
          style={{fontFamily:"'Baloo 2',cursive",textShadow:`0 0 40px ${data.color}44`}}>
          {q.q}
        </p>
        {q.visual&&q.type!=="visual"&&(
          <div className="flex justify-center py-1">{q.visual}</div>
        )}
        {(showHint||isAdmin)&&q.type!=="visual"&&(
          <div className="mt-1 px-4 py-2 rounded-xl text-sm w-full"
            style={{background:"rgba(254,202,87,0.1)",border:"1px solid rgba(254,202,87,0.25)",fontFamily:"'Nunito',sans-serif"}}>
            <span className="text-yellow-300">💡 </span>
            <span className="text-white opacity-80">{q.hint}</span>
          </div>
        )}
      </div>

      {/* 📘 Educational explanation — shown after answering (always in admin) */}
      {(selected !== null || isAdmin) && q.edu && (
        <div className="rounded-2xl px-4 py-3 flex items-start gap-2"
          style={{background:"rgba(84,160,255,0.08)",border:"1px solid rgba(84,160,255,0.2)"}}>
          <span className="text-base mt-0.5 shrink-0">📘</span>
          <p className="text-white opacity-80 text-sm leading-relaxed" style={{fontFamily:"'Nunito',sans-serif"}}>
            {q.edu}
          </p>
        </div>
      )}

      {/* ── VISUAL TASK OBJECTS ── */}
      {q.type==="visual"&&(
        <div className="rounded-3xl p-4 flex flex-col items-center gap-3"
          style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
          {q.operation==="+"?(
            /* Addition: left group + right group */
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <div className="flex flex-wrap gap-1.5 justify-center" style={{maxWidth:"160px"}}>
                {Array.from({length:q.leftCount}).map((_,i)=>{
                  const OC=SVGObj[q.obj];
                  return <div key={i} style={{animation:animateCorrect?`bounce 0.5s ease ${i*0.06}s both`:"none"}}><OC size={selected!==null&&q.leftCount>6?26:30}/></div>;
                })}
              </div>
              <span className="text-white font-black text-3xl opacity-70" style={{fontFamily:"'Baloo 2',cursive"}}>+</span>
              <div className="flex flex-wrap gap-1.5 justify-center" style={{maxWidth:"160px"}}>
                {Array.from({length:q.rightCount}).map((_,i)=>{
                  const OC=SVGObj[q.obj];
                  return <div key={i} style={{animation:animateCorrect?`bounce 0.5s ease ${(q.leftCount+i)*0.06}s both`:"none"}}><OC size={selected!==null&&q.rightCount>6?26:30}/></div>;
                })}
              </div>
            </div>
          ):(
            /* Subtraction: all objects, rightCount crossed out */
            <div className="flex flex-wrap gap-1.5 justify-center" style={{maxWidth:"260px"}}>
              {Array.from({length:q.leftCount}).map((_,i)=>{
                const OC=SVGObj[q.obj];
                const crossed=i>=q.leftCount-q.rightCount;
                return (
                  <div key={i} style={{position:"relative",opacity:crossed?0.45:1,
                    animation:animateCorrect&&!crossed?`bounce 0.5s ease ${i*0.07}s both`:"none"}}>
                    <OC size={q.leftCount>10?24:28}/>
                    {crossed&&(
                      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 30 30">
                        <line x1="4" y1="4" x2="26" y2="26" stroke="#FF6B6B" strokeWidth="3.5" strokeLinecap="round"/>
                        <line x1="26" y1="4" x2="4" y2="26" stroke="#FF6B6B" strokeWidth="3.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Answer input or admin/result display */}
          {isAdmin?(
            <div className="px-5 py-2 rounded-xl text-lg font-black text-white"
              style={{background:"rgba(46,213,115,0.2)",border:"1px solid #2ed573",fontFamily:"'Baloo 2',cursive"}}>
              ✅ Odgovor: {q.answer}
            </div>
          ):selected!==null?(
            <div className="flex items-center gap-3">
              <div className="px-5 py-2 rounded-xl text-xl font-black"
                style={{background:isCorrect?"rgba(46,213,115,0.2)":"rgba(255,107,107,0.15)",
                  border:`1.5px solid ${isCorrect?"#2ed573":"#FF6B6B"}`,
                  color:isCorrect?"#2ed573":"#FF6B6B",fontFamily:"'Baloo 2',cursive"}}>
                {selected} {isCorrect?"✅":"❌"}
              </div>
              {!isCorrect&&<div className="px-4 py-2 rounded-xl text-xl font-black"
                style={{background:"rgba(46,213,115,0.15)",border:"1.5px solid #2ed573",
                  color:"#2ed573",fontFamily:"'Baloo 2',cursive"}}>
                {q.answer} ✅
              </div>}
            </div>
          ):(
            <div className="flex gap-2 items-center">
              <input
                type="number" inputMode="numeric" pattern="[0-9]*"
                value={visualInput}
                onChange={e=>setVisualInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleVisualSubmit()}
                placeholder="?"
                autoFocus
                className="w-20 text-center font-black text-2xl rounded-xl outline-none text-white"
                style={{background:"rgba(255,255,255,0.1)",border:"2px solid rgba(255,255,255,0.25)",
                  fontFamily:"'Baloo 2',cursive",padding:"10px 0"}}
              />
              <button onClick={handleVisualSubmit}
                disabled={!visualInput}
                className="px-5 py-3 rounded-xl font-black text-white text-base transition-all"
                style={{background:visualInput?"linear-gradient(135deg,#FECA57,#FF9F43)":"rgba(255,255,255,0.1)",
                  fontFamily:"'Baloo 2',cursive",opacity:visualInput?1:0.4}}>
                Provjeri!
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MULTIPLE CHOICE ANSWERS (normal tasks) ── */}
      {q.type!=="visual"&&(
        <div className="grid grid-cols-2 gap-3">
          {q.answers.map((a,i)=>{
            let bg="rgba(255,255,255,0.07)",border="rgba(255,255,255,0.12)",shadow="none",badge=null;
            if(isAdmin){
              if(i===q.correct){bg="rgba(46,213,115,0.15)";border="#2ed573";shadow="0 0 20px rgba(46,213,115,0.3)";badge="✅";}
            } else if(selected!==null){
              if(i===q.correct){bg="rgba(46,213,115,0.15)";border="#2ed573";shadow="0 0 20px rgba(46,213,115,0.3)";badge="✅";}
              else if(i===selected&&i!==q.correct){bg="rgba(255,107,107,0.15)";border="#FF6B6B";shadow="0 0 20px rgba(255,107,107,0.3)";badge="❌";}
            }
            return (
              <button key={i} onClick={isAdmin?undefined:()=>handleAnswer(i)}
                className="rounded-2xl py-5 flex flex-col items-center justify-center gap-1 font-black text-white text-xl transition-all duration-200 relative"
                style={{background:bg,border:`2px solid ${border}`,boxShadow:shadow,fontFamily:"'Baloo 2',cursive",
                  cursor:isAdmin?"default":"pointer"}}>
                {badge&&<span className="text-base absolute top-2 right-3">{badge}</span>}
                {a}
              </button>
            );
          })}
        </div>
      )}

      {/* Admin navigation bar */}
      {isAdmin?(
        <div className="flex items-center gap-3 mt-1">
          <button onClick={handleAdminPrev} disabled={qIdx===0}
            className="flex-1 py-3 rounded-2xl font-bold text-white transition-all text-lg"
            style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",
              opacity:qIdx===0?0.3:1,fontFamily:"'Nunito',sans-serif"}}>
            ← Prethodni
          </button>
          <span className="text-white opacity-40 text-sm shrink-0" style={{fontFamily:"'Nunito',sans-serif"}}>
            {qIdx+1}/{questions.length}
          </span>
          <button onClick={handleAdminNext}
            className="flex-1 py-3 rounded-2xl font-bold text-white transition-all text-lg"
            style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",fontFamily:"'Nunito',sans-serif"}}>
            {qIdx<questions.length-1?"Sljedeći →":"↺ Novi set"}
          </button>
        </div>
      ):(
        /* Hint / result bar — shared for both task types */
        showResult?(
          <div className="rounded-2xl p-4 text-center"
            style={{background:isCorrect?"rgba(46,213,115,0.1)":"rgba(255,107,107,0.1)",
              border:`1.5px solid ${isCorrect?"#2ed57355":"#FF6B6B55"}`}}>
            <p className="text-white font-black text-lg mb-1" style={{fontFamily:"'Baloo 2',cursive"}}>
              {isCorrect?`🎉 Točno! ${streak>=2?`${streak}× zaredom!`:"Bravo!"}`:"😅 Nije točno!"}
            </p>
            {!isCorrect&&<p className="text-white opacity-60 text-sm mb-3" style={{fontFamily:"'Nunito',sans-serif"}}>💡 {q.hint}</p>}
            <button onClick={handleNext}
              className="px-8 py-2 rounded-xl font-bold text-white"
              style={{background:isCorrect?"#2ed573":"#FF6B6B",fontFamily:"'Nunito',sans-serif"}}>
              {qIdx<questions.length-1?"Sljedeće pitanje →":"Pogledaj rezultate 🏆"}
            </button>
          </div>
        ):(
          <button onClick={()=>setShowHint(true)}
            className="text-center py-2 text-sm hover:opacity-70 transition-all text-white"
            style={{opacity:showHint?0:0.4,fontFamily:"'Nunito',sans-serif",pointerEvents:showHint?"none":"auto"}}>
            💡 Treba mi pomoć
          </button>
        )
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen]=useState("welcome");
  const [userName,setUserName]=useState("Učenik");
  const [grade,setGrade]=useState(null);
  const [activeTopic,setActiveTopic]=useState(null);
  const [progress,setProgress]=useState({});
  const [isAdmin,setIsAdmin]=useState(false);
  const [pendingTopic,setPendingTopic]=useState(null);
  const [questionCount,setQuestionCount]=useState(20);

  const goHome=()=>{ setScreen("welcome"); setGrade(null); setActiveTopic(null); setProgress({}); setIsAdmin(false); };
  const goLeaderboard=()=>setScreen("leaderboard");

  const handleStart=(name,g)=>{
    setUserName(name);
    setGrade(g);
    setIsAdmin(false);
    // Load saved progress for this player+grade combo
    const saved = loadPlayerProgress(name, g);
    setProgress(saved);
    setScreen("topics");
  };

  const handleAdminStart=(g)=>{
    setUserName("Admin");
    setGrade(g);
    setIsAdmin(true);
    setProgress({});
    setScreen("topics");
  };

  const handleTopicSave=(result)=>{
    if (isAdmin) return; // admin pregled ne sprema napredak
    // Called immediately when quiz finishes — persist to localStorage
    const newProgress = {...progress,[activeTopic.id]:{xp:result.xp,completed:result.completed}};
    setProgress(newProgress);
    savePlayer(userName, grade, newProgress);
  };

  const handleTopicFinish=(result)=>{
    // Called when user clicks ← Poglavlja — navigate back
    setActiveTopic(null);setScreen("topics");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800;900&family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes twinkle{from{opacity:.2;}to{opacity:.9;}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes wave{0%,100%{transform:rotate(-20deg)}50%{transform:rotate(-80deg)}}
        @keyframes blink{0%,90%,100%{transform:scaleY(1)}95%{transform:scaleY(0.1)}}
        @keyframes bounce{0%{transform:scale(1) translateY(0)}35%{transform:scale(1.45) translateY(-6px)}65%{transform:scale(0.9) translateY(0)}85%{transform:scale(1.1) translateY(-2px)}100%{transform:scale(1) translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:4px}
        input::placeholder{color:rgba(255,255,255,0.3)}
      `}</style>
      <div className="min-h-screen flex justify-center"
        style={{background:"linear-gradient(160deg,#0D0F1A 0%,#160D30 40%,#0D1A2A 100%)"}}>
        <Stars />
        <div className="relative w-full max-w-sm flex flex-col z-10" style={{minHeight:"100vh"}}>

          {/* ── TOP BAR ── */}
          <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-20"
            style={{background:"rgba(13,15,26,0.85)",backdropFilter:"blur(20px)",
              borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
            <Logo onClick={goHome} />
            <div className="flex gap-2 items-center">
              {grade&&screen!=="welcome"&&screen!=="leaderboard"&&(
                <Pill color={CURRICULUM[grade]?.color} bg={`${CURRICULUM[grade]?.color}18`}>
                  {CURRICULUM[grade]?.emoji} {grade}. r.
                </Pill>
              )}
              {isAdmin&&screen!=="welcome"&&screen!=="leaderboard"&&(
                <Pill color="#54A0FF" bg="rgba(84,160,255,0.15)">🔑 Admin</Pill>
              )}
              {!isAdmin&&grade&&screen!=="welcome"&&screen!=="leaderboard"&&(
                <Pill color="#FECA57" bg="rgba(254,202,87,0.12)">
                  ⭐ {Object.values(progress).reduce((a,b)=>a+(b.xp||0),0)} XP
                </Pill>
              )}
              {screen!=="leaderboard"&&(
                <button onClick={goLeaderboard}
                  className="text-white opacity-50 hover:opacity-90 transition-all text-sm px-2 py-1 rounded-xl"
                  style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'Nunito',sans-serif"}}>
                  🏆
                </button>
              )}
              {screen!=="welcome"&&screen!=="leaderboard"&&(
                <button onClick={goHome}
                  className="text-white opacity-40 hover:opacity-80 transition-all text-sm px-2 py-1 rounded-xl"
                  style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'Nunito',sans-serif"}}>
                  🏠
                </button>
              )}
            </div>
          </div>

          {/* ── CONTENT ── */}
          <div className="flex-1 overflow-y-auto pb-8">
            {screen==="welcome"&&<WelcomeScreen onStart={handleStart} onLeaderboard={goLeaderboard} onAdmin={handleAdminStart} />}
            {screen==="topics"&&grade&&(
              <TopicMap grade={grade} userName={userName} progress={progress} isAdmin={isAdmin}
                onTopic={t=>setPendingTopic(t)}
                onHome={goHome} />
            )}
            {screen==="quiz"&&activeTopic&&(
              <QuizScreen topic={activeTopic} grade={grade}
                existing={progress[activeTopic.id]}
                onSaveProgress={handleTopicSave}
                onFinish={handleTopicFinish}
                onHome={goHome}
                isAdmin={isAdmin}
                questionCount={questionCount} />
            )}

            {/* ── QUESTION COUNT SELECTOR MODAL ── */}
            {pendingTopic&&(
              <div className="fixed inset-0 z-50 flex items-center justify-center"
                style={{background:"rgba(0,0,0,0.75)"}}>
                <div className="rounded-3xl p-6 flex flex-col gap-5 w-80"
                  style={{background:"#1a1a2e",border:"1px solid rgba(255,255,255,0.12)"}}>
                  <p className="text-white font-black text-xl text-center" style={{fontFamily:"'Baloo 2',cursive"}}>
                    {pendingTopic.icon} {pendingTopic.name}
                  </p>
                  <p className="text-white opacity-60 text-sm text-center -mt-2" style={{fontFamily:"'Nunito',sans-serif"}}>
                    Koliko pitanja želiš?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[{n:10,xp:25,label:"Kratki krug"},{n:20,xp:50,label:"Puni krug"}].map(({n,xp,label})=>(
                      <button key={n}
                        onClick={()=>{setQuestionCount(n);setActiveTopic(pendingTopic);setPendingTopic(null);setScreen("quiz");}}
                        className="flex flex-col items-center gap-1.5 rounded-2xl py-5 transition-all hover:scale-105"
                        style={{background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(255,255,255,0.15)",fontFamily:"'Baloo 2',cursive"}}>
                        <span className="text-4xl font-black text-white">{n}</span>
                        <span className="text-xs font-bold" style={{color:"#FECA57",fontFamily:"'Nunito',sans-serif"}}>max {xp} XP</span>
                        <span className="text-xs opacity-40 text-white" style={{fontFamily:"'Nunito',sans-serif"}}>{label}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={()=>setPendingTopic(null)}
                    className="py-2 rounded-xl text-sm font-bold text-white opacity-30 hover:opacity-60 transition-all"
                    style={{fontFamily:"'Nunito',sans-serif"}}>
                    Odustani
                  </button>
                </div>
              </div>
            )}
            {screen==="leaderboard"&&(
              <LeaderboardScreen onBack={()=>setScreen(screen==="welcome"?"welcome":grade?"topics":"welcome")}
                currentName={userName} currentGrade={grade} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
