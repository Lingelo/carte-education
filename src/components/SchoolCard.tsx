import type { Etablissement } from '../types';
import { TYPE_COLORS, TYPE_LABELS } from '../utils/colors';
import { truncate } from '../utils/format';

interface Props {
  etablissement: Etablissement;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  selected: boolean;
}

export function SchoolCard({ etablissement, onClick, onHover, selected }: Props) {
  const color = TYPE_COLORS[etablissement.type];

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`w-full rounded-lg border px-3 py-2.5 text-left transition-all hover:shadow-md ${
        selected
          ? 'border-blue-300 bg-blue-50 shadow-md'
          : 'border-gray-100 bg-white hover:border-gray-200'
      }`}
    >
      {/* Type badge + sector */}
      <div className="mb-1.5 flex items-center gap-1.5">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
          style={{ background: color }}
        >
          {TYPE_LABELS[etablissement.type]}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            etablissement.secteur.toLowerCase().includes('public')
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {etablissement.secteur.toLowerCase().includes('public') ? 'Public' : 'Prive'}
        </span>
        {etablissement.eduPrio && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
            REP
          </span>
        )}
      </div>

      {/* Name */}
      <div className="text-xs font-semibold leading-tight text-gray-800">
        {truncate(etablissement.nom, 80)}
      </div>

      {/* City + dept */}
      <div className="mt-0.5 text-[11px] text-gray-500">
        {etablissement.ville} ({etablissement.dept})
      </div>

      {/* Options */}
      {etablissement.options.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {etablissement.options.slice(0, 4).map((opt) => (
            <span
              key={opt}
              className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] text-gray-500"
            >
              {opt}
            </span>
          ))}
          {etablissement.options.length > 4 && (
            <span className="text-[9px] text-gray-400">
              +{etablissement.options.length - 4}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
