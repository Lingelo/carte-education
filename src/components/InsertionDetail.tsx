import type { UniversiteAggregate } from '../types';
import { insertionColor } from '../utils/colors';
import { formatPct, formatSalary } from '../utils/format';

interface Props {
  universite: UniversiteAggregate;
  onClose: () => void;
}

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-semibold" style={color ? { color } : undefined}>
        {value}
      </span>
    </div>
  );
}

export function InsertionDetail({ universite, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-5 py-4">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">
              Insertion professionnelle
            </span>
          </div>

          <h2 className="pr-8 text-base font-bold text-gray-900">{universite.etab}</h2>
        </div>

        {/* Body */}
        <div className="space-y-5 px-5 py-4">
          {/* Aggregated stats */}
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Moyennes toutes disciplines
            </h3>
            <div className="divide-y divide-gray-50">
              <StatRow
                label="Taux d'insertion"
                value={formatPct(universite.tauxInsertion)}
                color={insertionColor(universite.tauxInsertion)}
              />
              <StatRow
                label="Taux d'emploi"
                value={formatPct(universite.tauxEmploi)}
                color={insertionColor(universite.tauxEmploi)}
              />
              <StatRow
                label="Salaire net median"
                value={formatSalary(universite.salaire)}
              />
            </div>
          </div>

          {/* Discipline breakdown */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Par discipline ({universite.disciplines.length})
            </h3>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {universite.disciplines
                .sort((a, b) => (b.tauxInsertion ?? 0) - (a.tauxInsertion ?? 0))
                .map((d, i) => (
                  <div
                    key={`${d.discipline}-${i}`}
                    className="rounded-lg border border-gray-100 px-3 py-2"
                  >
                    <div className="text-xs font-semibold text-gray-700">{d.discipline}</div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]">
                      <span>
                        Insertion :{' '}
                        <span className="font-semibold" style={{ color: insertionColor(d.tauxInsertion) }}>
                          {formatPct(d.tauxInsertion)}
                        </span>
                      </span>
                      <span>
                        Emploi :{' '}
                        <span className="font-semibold" style={{ color: insertionColor(d.tauxEmploi) }}>
                          {formatPct(d.tauxEmploi)}
                        </span>
                      </span>
                      {d.emploisCadre != null && (
                        <span>
                          Cadre : <span className="font-semibold text-gray-600">{formatPct(d.emploisCadre)}</span>
                        </span>
                      )}
                      {d.salaire != null && (
                        <span>
                          Salaire : <span className="font-semibold text-gray-600">{formatSalary(d.salaire)}</span>
                        </span>
                      )}
                      {d.reponses != null && (
                        <span className="text-gray-400">
                          ({d.reponses} reponses)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
