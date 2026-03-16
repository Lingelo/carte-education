#!/usr/bin/env node

/**
 * Data pipeline for Carte de l'Education.
 *
 * 1. Fetches all schools (Ecole, College, Lycee) from the Education annuaire API
 * 2. Fetches insertion professionnelle Master data
 * 3. Fetches higher education establishments for geolocation join
 * 4. Outputs two JSON files:
 *    - public/data/etablissements.json (~63K schools)
 *    - public/data/insertion.json (~2K university insertion records)
 *
 * Usage: node scripts/fetch-data.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'data');

// --- API endpoints ---

const ANNUAIRE_BASE = 'https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education';
const INSERTION_BASE = 'https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-insertion_professionnelle-master';
const ETAB_SUP_BASE = 'https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-principaux-etablissements-enseignement-superieur';

// --- Annuaire fields ---
const ANNUAIRE_SELECT = [
  'identifiant_de_l_etablissement',
  'nom_etablissement',
  'type_etablissement',
  'latitude',
  'longitude',
  'code_postal',
  'nom_commune',
  'statut_public_prive',
  'code_departement',
  'libelle_departement',
  'code_region',
  'libelle_region',
  'appartenance_education_prioritaire',
  'restauration',
  'section_sport',
  'section_internationale',
  'section_europeenne',
  'voie_generale',
  'voie_technologique',
  'voie_professionnelle',
  'post_bac',
  'segpa',
  'ulis',
].join(',');

// --- Helpers ---

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function round4(v) {
  if (v === null || v === undefined) return null;
  return Math.round(v * 10000) / 10000;
}

function mapType(typeStr) {
  if (!typeStr) return null;
  const t = typeStr.toLowerCase();
  if (t.includes('cole')) return 'Ecole';
  if (t.includes('coll')) return 'College';
  if (t.includes('lyc')) return 'Lycee';
  return null;
}

function buildOptions(record) {
  const opts = [];
  if (record.section_sport === '1' || record.section_sport === 1) opts.push('sport');
  if (record.section_internationale === '1' || record.section_internationale === 1) opts.push('international');
  if (record.section_europeenne === '1' || record.section_europeenne === 1) opts.push('euro');
  if (record.voie_generale === '1' || record.voie_generale === 1) opts.push('generale');
  if (record.voie_technologique === '1' || record.voie_technologique === 1) opts.push('techno');
  if (record.voie_professionnelle === '1' || record.voie_professionnelle === 1) opts.push('pro');
  if (record.post_bac === '1' || record.post_bac === 1) opts.push('postbac');
  if (record.segpa === '1' || record.segpa === 1) opts.push('segpa');
  if (record.ulis === '1' || record.ulis === 1) opts.push('ulis');
  if (record.restauration === '1' || record.restauration === 1) opts.push('restauration');
  return opts;
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      }
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`  Retry ${i + 1}/${retries} after error: ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

// --- Step 1: Fetch all schools ---

async function fetchAnnuaire() {
  console.log('Step 1: Fetching annuaire education...');

  const where = encodeURIComponent("type_etablissement IN ('Ecole', 'Collège', 'Lycée')");
  const url = `${ANNUAIRE_BASE}/exports/json?select=${ANNUAIRE_SELECT}&where=${where}`;

  console.log(`  URL: ${url.slice(0, 120)}...`);
  const res = await fetchWithRetry(url);
  const records = await res.json();
  console.log(`  -> ${records.length} records fetched from annuaire`);

  const etablissements = [];
  let skippedNoGeo = 0;

  for (const r of records) {
    const lat = round4(num(r.latitude));
    const lng = round4(num(r.longitude));

    if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      skippedNoGeo++;
      continue;
    }

    const type = mapType(r.type_etablissement);
    if (!type) continue;

    const eduPrio = r.appartenance_education_prioritaire != null &&
      r.appartenance_education_prioritaire !== '' &&
      r.appartenance_education_prioritaire !== 'NON' &&
      r.appartenance_education_prioritaire !== '0';

    etablissements.push({
      id: r.identifiant_de_l_etablissement || '',
      nom: r.nom_etablissement || '',
      type,
      lat,
      lng,
      ville: r.nom_commune || '',
      dept: r.code_departement || '',
      deptLib: r.libelle_departement || '',
      region: r.libelle_region || '',
      secteur: r.statut_public_prive || '',
      eduPrio,
      options: buildOptions(r),
    });
  }

  console.log(`  -> ${etablissements.length} with geolocation, ${skippedNoGeo} skipped`);
  return etablissements;
}

// --- Step 2: Fetch insertion professionnelle Master ---

async function fetchLatestInsertionYear() {
  const url = `${INSERTION_BASE}/records?select=annee&group_by=annee&order_by=annee%20desc&limit=1`;
  const res = await fetchWithRetry(url);
  const data = await res.json();
  if (!data.results?.length) throw new Error('No insertion years found');
  return String(data.results[0].annee);
}

async function fetchInsertion(year) {
  console.log(`Step 2: Fetching insertion pro data (year ${year})...`);

  const select = [
    'annee',
    'etablissement',
    'discipline',
    'taux_dinsertion',
    'taux_d_emploi',
    'emplois_cadre',
    'salaire_net_median_des_emplois_a_temps_plein',
    'nombre_de_reponses',
  ].join(',');

  const where = encodeURIComponent(`annee=${year}`);
  const url = `${INSERTION_BASE}/exports/json?select=${select}&where=${where}`;

  const res = await fetchWithRetry(url);
  const records = await res.json();
  console.log(`  -> ${records.length} insertion records fetched`);
  return records;
}

// --- Step 3: Fetch higher ed establishments for geolocation ---

async function fetchEtabSup() {
  console.log('Step 3: Fetching higher education establishments for geolocation...');

  const select = 'uo_lib,localisation';
  const url = `${ETAB_SUP_BASE}/exports/json?select=${select}`;

  const res = await fetchWithRetry(url);
  const records = await res.json();
  console.log(`  -> ${records.length} higher ed establishments fetched`);

  // Build a map of name -> {lat, lng}
  const geoMap = new Map();
  for (const r of records) {
    if (!r.uo_lib || !r.localisation) continue;

    let lat = null;
    let lng = null;

    if (typeof r.localisation === 'object') {
      if (r.localisation.lat != null && r.localisation.lon != null) {
        lat = parseFloat(r.localisation.lat);
        lng = parseFloat(r.localisation.lon);
      } else if (r.localisation.latitude != null && r.localisation.longitude != null) {
        lat = parseFloat(r.localisation.latitude);
        lng = parseFloat(r.localisation.longitude);
      }
    }

    if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
      const name = r.uo_lib.trim().toLowerCase();
      geoMap.set(name, { lat: round4(lat), lng: round4(lng) });
    }
  }

  console.log(`  -> ${geoMap.size} establishments with geolocation`);
  return geoMap;
}

// --- Step 4: Join insertion data with geo ---

function joinInsertionWithGeo(insertionRecords, geoMap, year) {
  console.log('Step 4: Joining insertion data with geolocation...');

  const joined = [];
  let matched = 0;
  let unmatched = 0;

  for (const r of insertionRecords) {
    if (!r.etablissement) continue;

    const name = r.etablissement.trim().toLowerCase();

    // Try exact match first
    let geo = geoMap.get(name);

    // Try fuzzy: remove "universite de", "universite", common prefixes
    if (!geo) {
      for (const [key, val] of geoMap) {
        if (key.includes(name) || name.includes(key)) {
          geo = val;
          break;
        }
      }
    }

    if (!geo) {
      unmatched++;
      continue;
    }

    matched++;
    joined.push({
      etab: r.etablissement,
      discipline: r.discipline || 'Non precise',
      annee: num(r.annee) ?? parseInt(year),
      lat: geo.lat,
      lng: geo.lng,
      tauxInsertion: num(r.taux_dinsertion),
      tauxEmploi: num(r.taux_d_emploi),
      emploisCadre: num(r.emplois_cadre),
      salaire: num(r.salaire_net_median_des_emplois_a_temps_plein),
      reponses: num(r.nombre_de_reponses),
    });
  }

  console.log(`  -> ${matched} records matched, ${unmatched} unmatched`);
  return joined;
}

// --- Main ---

async function main() {
  console.log('\n=== Carte de l\'Education - Data Pipeline ===\n');

  // Step 1: Schools
  const etablissements = await fetchAnnuaire();

  // Step 2: Insertion pro
  const year = await fetchLatestInsertionYear();
  const insertionRaw = await fetchInsertion(year);

  // Step 3: Higher ed geo
  const geoMap = await fetchEtabSup();

  // Step 4: Join
  const insertionRecords = joinInsertionWithGeo(insertionRaw, geoMap, year);

  // Write output files
  mkdirSync(OUT_DIR, { recursive: true });

  // Etablissements
  const etabOutput = {
    meta: {
      generatedAt: new Date().toISOString(),
      total: etablissements.length,
    },
    etablissements,
  };

  const etabPath = join(OUT_DIR, 'etablissements.json');
  writeFileSync(etabPath, JSON.stringify(etabOutput));
  const etabSize = (Buffer.byteLength(JSON.stringify(etabOutput)) / 1024 / 1024).toFixed(2);
  console.log(`\nWritten ${etabPath} (${etabSize} MB, ${etablissements.length} schools)`);

  // Insertion
  const insertionOutput = {
    meta: {
      generatedAt: new Date().toISOString(),
      total: insertionRecords.length,
      annee: parseInt(year),
    },
    records: insertionRecords,
  };

  const insertionPath = join(OUT_DIR, 'insertion.json');
  writeFileSync(insertionPath, JSON.stringify(insertionOutput));
  const insertionSize = (Buffer.byteLength(JSON.stringify(insertionOutput)) / 1024 / 1024).toFixed(2);
  console.log(`Written ${insertionPath} (${insertionSize} MB, ${insertionRecords.length} records)`);

  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
