import { useState, useEffect } from 'react';
import type { EtablissementData, InsertionData } from '../types';

const ETAB_URL = `${import.meta.env.BASE_URL}data/etablissements.json`;
const INSERTION_URL = `${import.meta.env.BASE_URL}data/insertion.json`;

export function useData() {
  const [etabData, setEtabData] = useState<EtablissementData | null>(null);
  const [insertionData, setInsertionData] = useState<InsertionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [etabRes, insertionRes] = await Promise.all([
          fetch(ETAB_URL),
          fetch(INSERTION_URL),
        ]);

        if (!etabRes.ok) throw new Error(`Etablissements: HTTP ${etabRes.status}`);

        const etabJson = await etabRes.json() as EtablissementData;

        let insertionJson: InsertionData | null = null;
        if (insertionRes.ok) {
          insertionJson = await insertionRes.json() as InsertionData;
        }

        if (!cancelled) {
          setEtabData(etabJson);
          setInsertionData(insertionJson);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur de chargement');
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { etabData, insertionData, loading, error };
}
