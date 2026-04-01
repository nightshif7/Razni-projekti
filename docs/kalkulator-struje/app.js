// ============================================================
// TARIFNI MODELI - HEP Elektra, Kućanstvo
// Izvor: Narodne Novine NN 29/2026 (vrijedi 1.4.2026 - 30.9.2026)
//         + originalni račun korisnika (02/2026)
// ============================================================
//
// PRAG: Uredba štiti potrošnju do 3.000 kWh/6 mjeseci (= ~6.000 kWh/god)
// Iznad toga: tržišna cijena (market rate)
//
// DISTRIBUCIJA i PRIJENOS: regulira HERA, jednako za sve modele
//   - RVT/RNT: potvrđeno s računa
//   - ET: procjena (ponderirana sredina RVT+RNT)
// OPSKRBA: regulirana NN 29/2026 (≤3000 kWh/6mj), tržišna iznad
// ============================================================

const TARIFE = {
  bijeli: {
    naziv: 'Bijeli model – dvotarifni (RVT + RNT)',
    tip: 'dvotarifni',
    prag_kwh_6mj: 3000,
    distribucija: {
      rvt: 0.044446,   // ✅ potvrđeno s računa
      rnt: 0.020514,   // ✅ potvrđeno s računa
      omm: 1.983000    // ✅ potvrđeno s računa
    },
    prijenos: {
      rvt: 0.021256,   // ✅ potvrđeno s računa
      rnt: 0.008175    // ✅ potvrđeno s računa
    },
    opskrba: {
      // ≤ 3.000 kWh/6mj — NN 29/2026 ✅
      rvt_ispod: 0.097189,
      rnt_ispod: 0.047688,
      // > 3.000 kWh/6mj — tržišna cijena, potvrđeno s računa ✅
      rvt_iznad: 0.131205,
      rnt_iznad: 0.064379,
      naknada: 0.982000  // ✅ potvrđeno s računa
    },
    potvrdjeno: true
  },

  plavi: {
    naziv: 'Plavi model – jednotarifni (ET)',
    tip: 'jednotarifni',
    prag_kwh_6mj: 3000,
    distribucija: {
      et: 0.033150,    // ⚠️ procjena (ponderirana sredina RVT+RNT)
      omm: 1.983000    // ✅ ista kao Bijeli
    },
    prijenos: {
      et: 0.015090     // ⚠️ procjena (ponderirana sredina RVT+RNT)
    },
    opskrba: {
      // ≤ 3.000 kWh/6mj — NN 29/2026 ✅
      et_ispod: 0.091324,
      // > 3.000 kWh/6mj — tržišna, nepoznata, koristimo skaliranu procjenu
      et_iznad: 0.115000,   // ⚠️ procjena tržišne cijene
      naknada: 0.982000
    },
    potvrdjeno: false
  }
};

// Naknade (iste za sve modele) — ✅ potvrđeno s računa
const NAKNADE = {
  oie: 0.013239,
  solidarna: 0.003982
};

let aktivnaTarifa = 'bijeli';

function promijeniTarifu() {
  const sel = document.getElementById('tarifa_model').value;
  aktivnaTarifa = sel;
  const tarifa = TARIFE[sel];

  document.getElementById('blok_dvotarifni').style.display =
    tarifa.tip === 'dvotarifni' ? '' : 'none';
  document.getElementById('blok_jednotarifni').style.display =
    tarifa.tip === 'jednotarifni' ? '' : 'none';

  const upoz = document.getElementById('upozorenje');
  if (!tarifa.potvrdjeno) {
    upoz.style.display = '';
    upoz.innerHTML = '⚠️ <strong>Opskrba ≤3.000 kWh/6mj</strong> potvrđena (NN 29/2026).<br>'
      + 'Distribucija i prijenos ET su procijenjeni. Pošaljite mi Plavi model račun za precizne cijene!';
  } else {
    upoz.style.display = 'none';
  }

  document.getElementById('result').style.display = 'none';
}

function fmt(val) {
  return parseFloat(val).toFixed(2);
}

function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = fmt(val);
}

function izracunaj() {
  const tarifa = TARIFE[aktivnaTarifa];
  let rvt = 0, rnt = 0, et = 0, ukupno_kwh = 0;

  if (tarifa.tip === 'dvotarifni') {
    const rvt_od = parseFloat(document.getElementById('rvt_od').value);
    const rvt_do = parseFloat(document.getElementById('rvt_do').value);
    const rnt_od = parseFloat(document.getElementById('rnt_od').value);
    const rnt_do = parseFloat(document.getElementById('rnt_do').value);

    if ([rvt_od, rvt_do, rnt_od, rnt_do].some(isNaN)) {
      alert('Molim unesite sva četiri očitanja!'); return;
    }
    if (rvt_do < rvt_od || rnt_do < rnt_od) {
      alert('Novo stanje mora biti veće od starog!'); return;
    }
    rvt = rvt_do - rvt_od;
    rnt = rnt_do - rnt_od;
    ukupno_kwh = rvt + rnt;
  } else {
    const et_od = parseFloat(document.getElementById('et_od').value);
    const et_do = parseFloat(document.getElementById('et_do').value);
    if (isNaN(et_od) || isNaN(et_do)) {
      alert('Molim unesite staro i novo stanje!'); return;
    }
    if (et_do < et_od) {
      alert('Novo stanje mora biti veće od starog!'); return;
    }
    et = et_do - et_od;
    ukupno_kwh = et;
  }

  // Procjena 6-mjesečne potrošnje (mjesečno × 6)
  const potrosnja_6mj = ukupno_kwh * 6;
  const iznad_praga = potrosnja_6mj > tarifa.prag_kwh_6mj;

  let dist_uk, prij_uk, ops_uk;
  let dist_rvt = 0, dist_rnt = 0, dist_et = 0;
  let prij_rvt = 0, prij_rnt = 0, prij_et = 0;
  let ops_rvt = 0, ops_rnt = 0, ops_et = 0;
  const dist_omm = tarifa.distribucija.omm;
  const ops_nak = tarifa.opskrba.naknada;

  if (tarifa.tip === 'dvotarifni') {
    const sfx = iznad_praga ? 'iznad' : 'ispod';
    dist_rvt = rvt * tarifa.distribucija.rvt;
    dist_rnt = rnt * tarifa.distribucija.rnt;
    dist_uk = dist_rvt + dist_rnt + dist_omm;

    prij_rvt = rvt * tarifa.prijenos.rvt;
    prij_rnt = rnt * tarifa.prijenos.rnt;
    prij_uk = prij_rvt + prij_rnt;

    ops_rvt = rvt * tarifa.opskrba[`rvt_${sfx}`];
    ops_rnt = rnt * tarifa.opskrba[`rnt_${sfx}`];
    ops_uk = ops_rvt + ops_rnt + ops_nak;
  } else {
    const sfx = iznad_praga ? 'iznad' : 'ispod';
    dist_et = et * tarifa.distribucija.et;
    dist_uk = dist_et + dist_omm;

    prij_et = et * tarifa.prijenos.et;
    prij_uk = prij_et;

    ops_et = et * tarifa.opskrba[`et_${sfx}`];
    ops_uk = ops_et + ops_nak;
  }

  const oie = ukupno_kwh * NAKNADE.oie;
  const solidarna = ukupno_kwh * NAKNADE.solidarna;
  const popust = -solidarna;

  const bez_pdv = dist_uk + prij_uk + ops_uk + oie + solidarna + popust;
  const pdv = bez_pdv * 0.25;
  const total = bez_pdv + pdv;

  // Prikaz — potrošnja
  document.getElementById('r_rvt_kwh').textContent = rvt || '—';
  document.getElementById('r_rnt_kwh').textContent = rnt || '—';
  document.getElementById('r_et_kwh').textContent = et || '—';
  set('r_ukupno_kwh', ukupno_kwh);

  // Prikaži/sakrij redove po tipu tarife
  document.querySelectorAll('.row-dvotarifni').forEach(el => {
    el.style.display = tarifa.tip === 'dvotarifni' ? '' : 'none';
  });
  document.querySelectorAll('.row-jednotarifni').forEach(el => {
    el.style.display = tarifa.tip === 'jednotarifni' ? '' : 'none';
  });

  // Distribucija
  set('r_dist_rvt', dist_rvt);
  set('r_dist_rnt', dist_rnt);
  set('r_dist_et', dist_et);
  set('r_dist_omm', dist_omm);
  set('r_dist_uk', dist_uk);

  // Prijenos
  set('r_prij_rvt', prij_rvt);
  set('r_prij_rnt', prij_rnt);
  set('r_prij_et', prij_et);
  set('r_prij_uk', prij_uk);

  // Opskrba
  set('r_ops_rvt', ops_rvt);
  set('r_ops_rnt', ops_rnt);
  set('r_ops_et', ops_et);
  set('r_ops_nak', ops_nak);
  set('r_ops_uk', ops_uk);

  // Naknade
  set('r_oie', oie);
  set('r_solid', solidarna);
  document.getElementById('r_popust').textContent = '-' + fmt(solidarna);

  // Ukupno
  set('r_bez_pdv', bez_pdv);
  set('r_pdv', pdv);
  set('r_total', total);

  // Info o pragu
  const pragovnaInfo = iznad_praga
    ? `⚠️ Godišnja procjena ~${Math.round(potrosnja_6mj * 2)} kWh → IZNAD praga (${tarifa.prag_kwh_6mj * 2} kWh/god) → tržišna cijena`
    : `✅ Godišnja procjena ~${Math.round(potrosnja_6mj * 2)} kWh → ISPOD praga (${tarifa.prag_kwh_6mj * 2} kWh/god) → regulirana cijena (NN 29/2026)`;
  document.getElementById('r_godisnje').innerHTML = pragovnaInfo;

  document.getElementById('result').style.display = 'block';
  document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
}
