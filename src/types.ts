export type EtablissementType = 'Ecole' | 'College' | 'Lycee';

export type Secteur = 'public' | 'prive' | 'tous';
export type EduPrio = 'oui' | 'non' | 'tous';

export interface Etablissement {
  /** Unique identifier */
  id: string;
  /** Name */
  nom: string;
  /** Type */
  type: EtablissementType;
  /** Latitude */
  lat: number;
  /** Longitude */
  lng: number;
  /** City */
  ville: string;
  /** Department code */
  dept: string;
  /** Department name */
  deptLib: string;
  /** Region */
  region: string;
  /** Public or Private */
  secteur: string;
  /** Education prioritaire */
  eduPrio: boolean;
  /** Options (sport, international, euro, pro, postbac, segpa, ulis, restauration) */
  options: string[];
}

export interface EtablissementData {
  meta: {
    generatedAt: string;
    total: number;
  };
  etablissements: Etablissement[];
}

export interface InsertionRecord {
  /** University name */
  etab: string;
  /** Discipline */
  discipline: string;
  /** Year */
  annee: number;
  /** Latitude */
  lat: number;
  /** Longitude */
  lng: number;
  /** Employment insertion rate (%) */
  tauxInsertion: number | null;
  /** Employment rate (%) */
  tauxEmploi: number | null;
  /** Executive-level jobs (%) */
  emploisCadre: number | null;
  /** Median net salary */
  salaire: number | null;
  /** Number of responses */
  reponses: number | null;
}

export interface InsertionData {
  meta: {
    generatedAt: string;
    total: number;
    annee: number;
  };
  records: InsertionRecord[];
}

/** Aggregated university data for map display */
export interface UniversiteAggregate {
  etab: string;
  lat: number;
  lng: number;
  tauxInsertion: number | null;
  tauxEmploi: number | null;
  salaire: number | null;
  disciplines: InsertionRecord[];
}

export interface Filters {
  search: string;
  types: EtablissementType[];
  secteur: Secteur;
  eduPrio: EduPrio;
  options: string[];
}
