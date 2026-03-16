import type { Etablissement } from '../types';
import { SchoolCard } from './SchoolCard';

interface Props {
  etablissements: Etablissement[];
  onSelect: (e: Etablissement) => void;
  selectedId: string | null;
  onHover: (e: Etablissement | null) => void;
}

export function SchoolPanel({ etablissements, onSelect, selectedId, onHover }: Props) {
  // Limit to 200 for performance
  const display = etablissements.slice(0, 200);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-1 border-b border-gray-100 px-3 py-2">
        <span className="text-xs font-semibold text-gray-600">Etablissements</span>
        <span className="ml-auto text-[10px] text-gray-400">
          {etablissements.length} visible{etablissements.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* List */}
      <div className="panel-scroll flex-1 overflow-y-auto p-2">
        {display.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-400">
            Aucun etablissement visible
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {display.map((e) => (
              <SchoolCard
                key={e.id}
                etablissement={e}
                onClick={() => onSelect(e)}
                onHover={(h) => onHover(h ? e : null)}
                selected={e.id === selectedId}
              />
            ))}
            {etablissements.length > 200 && (
              <div className="py-2 text-center text-[10px] text-gray-400">
                {etablissements.length - 200} etablissements supplementaires non affiches. Zoomez ou filtrez pour affiner.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
