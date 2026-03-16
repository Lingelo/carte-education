import type { Filters as FiltersType, EtablissementType, Secteur, EduPrio } from '../types';
import { TYPE_COLORS, TYPE_LABELS, ALL_TYPES } from '../utils/colors';

interface Props {
  filters: FiltersType;
  onToggleType: (type: EtablissementType) => void;
  onSecteur: (s: Secteur) => void;
  onEduPrio: (s: EduPrio) => void;
  onToggleOption: (opt: string) => void;
  onToggleInsertion: () => void;
  insertionVisible: boolean;
  totalCount: number;
  filteredCount: number;
}

const OPTION_FILTERS = [
  { key: 'sport', label: 'Sport' },
  { key: 'international', label: 'International' },
  { key: 'euro', label: 'Europeenne' },
];

export function Filters({
  filters,
  onToggleType,
  onSecteur,
  onEduPrio,
  onToggleOption,
  onToggleInsertion,
  insertionVisible,
  totalCount,
  filteredCount,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      {/* Type chips */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_TYPES.map((type) => {
          const active = filters.types.length === 0 || filters.types.includes(type);
          const color = TYPE_COLORS[type];
          return (
            <button
              key={type}
              onClick={() => onToggleType(type)}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all"
              style={{
                background: active ? color : '#f3f4f6',
                color: active ? 'white' : '#6b7280',
                opacity: active ? 1 : 0.6,
              }}
            >
              {TYPE_LABELS[type]}
            </button>
          );
        })}

        {/* Insertion toggle */}
        <button
          onClick={onToggleInsertion}
          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all"
          style={{
            background: insertionVisible ? '#f59e0b' : '#f3f4f6',
            color: insertionVisible ? 'white' : '#6b7280',
            opacity: insertionVisible ? 1 : 0.6,
          }}
        >
          Insertion pro
        </button>
      </div>

      {/* Secteur + EduPrio + Options + Count */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <select
          value={filters.secteur}
          onChange={(e) => onSecteur(e.target.value as Secteur)}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-gray-600 outline-none"
        >
          <option value="tous">Public & Prive</option>
          <option value="public">Public</option>
          <option value="prive">Prive</option>
        </select>

        <select
          value={filters.eduPrio}
          onChange={(e) => onEduPrio(e.target.value as EduPrio)}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-gray-600 outline-none"
        >
          <option value="tous">Edu. prioritaire : tous</option>
          <option value="oui">Education prioritaire</option>
          <option value="non">Hors education prioritaire</option>
        </select>

        {OPTION_FILTERS.map(({ key, label }) => {
          const active = filters.options.includes(key);
          return (
            <button
              key={key}
              onClick={() => onToggleOption(key)}
              className={`rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors ${
                active
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          );
        })}

        <span className="ml-auto text-gray-400">
          {filteredCount.toLocaleString('fr-FR')} / {totalCount.toLocaleString('fr-FR')}
        </span>
      </div>
    </div>
  );
}
