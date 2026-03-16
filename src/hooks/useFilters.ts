import { useState, useMemo, useCallback } from 'react';
import type { Etablissement, Filters, EtablissementType, InsertionRecord, UniversiteAggregate } from '../types';

export function useFilters(allEtablissements: Etablissement[], insertionRecords: InsertionRecord[]) {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    types: [],
    secteur: 'tous',
    eduPrio: 'tous',
    options: [],
  });

  const filtered = useMemo(() => {
    let result = allEtablissements;

    // Text search
    if (filters.search.trim()) {
      const terms = filters.search.toLowerCase().trim().split(/\s+/);
      result = result.filter((e) => {
        const haystack = `${e.nom} ${e.ville} ${e.dept} ${e.deptLib}`.toLowerCase();
        return terms.every((t) => haystack.includes(t));
      });
    }

    // Type filter
    if (filters.types.length > 0) {
      result = result.filter((e) => filters.types.includes(e.type));
    }

    // Secteur filter
    if (filters.secteur === 'public') {
      result = result.filter((e) => e.secteur.toLowerCase().includes('public'));
    } else if (filters.secteur === 'prive') {
      result = result.filter((e) => e.secteur.toLowerCase().includes('priv'));
    }

    // Education prioritaire
    if (filters.eduPrio === 'oui') {
      result = result.filter((e) => e.eduPrio);
    } else if (filters.eduPrio === 'non') {
      result = result.filter((e) => !e.eduPrio);
    }

    // Options filter
    if (filters.options.length > 0) {
      result = result.filter((e) =>
        filters.options.every((opt) => e.options.includes(opt)),
      );
    }

    return result;
  }, [allEtablissements, filters]);

  const universites = useMemo(() => {
    const byEtab = new Map<string, InsertionRecord[]>();
    for (const r of insertionRecords) {
      const key = r.etab;
      if (!byEtab.has(key)) byEtab.set(key, []);
      byEtab.get(key)!.push(r);
    }

    const aggregates: UniversiteAggregate[] = [];
    for (const [etab, records] of byEtab) {
      const withInsertion = records.filter((r) => r.tauxInsertion != null);
      const withEmploi = records.filter((r) => r.tauxEmploi != null);
      const withSalaire = records.filter((r) => r.salaire != null);

      const avgInsertion = withInsertion.length > 0
        ? withInsertion.reduce((s, r) => s + r.tauxInsertion!, 0) / withInsertion.length
        : null;
      const avgEmploi = withEmploi.length > 0
        ? withEmploi.reduce((s, r) => s + r.tauxEmploi!, 0) / withEmploi.length
        : null;
      const avgSalaire = withSalaire.length > 0
        ? Math.round(withSalaire.reduce((s, r) => s + r.salaire!, 0) / withSalaire.length)
        : null;

      aggregates.push({
        etab,
        lat: records[0].lat,
        lng: records[0].lng,
        tauxInsertion: avgInsertion != null ? Math.round(avgInsertion) : null,
        tauxEmploi: avgEmploi != null ? Math.round(avgEmploi) : null,
        salaire: avgSalaire,
        disciplines: records,
      });
    }

    return aggregates;
  }, [insertionRecords]);

  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleType = useCallback((type: EtablissementType) => {
    setFilters((prev) => {
      const types = prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type];
      return { ...prev, types };
    });
  }, []);

  const toggleOption = useCallback((option: string) => {
    setFilters((prev) => {
      const options = prev.options.includes(option)
        ? prev.options.filter((o) => o !== option)
        : [...prev.options, option];
      return { ...prev, options };
    });
  }, []);

  return {
    etablissements: filtered,
    allEtablissements,
    universites,
    filters,
    updateFilter,
    toggleType,
    toggleOption,
  };
}
