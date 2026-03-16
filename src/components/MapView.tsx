import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { Etablissement, UniversiteAggregate } from '../types';
import { TYPE_COLORS, TYPE_LABELS, UNIVERSITE_COLOR, insertionColor } from '../utils/colors';
import { formatPct, formatSalary } from '../utils/format';

// Fix default marker icons in bundled environments
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Props {
  etablissements: Etablissement[];
  universites: UniversiteAggregate[];
  showInsertion: boolean;
  onBoundsChange: (bounds: L.LatLngBounds) => void;
  onSchoolSelect: (e: Etablissement) => void;
  onUniversiteSelect: (u: UniversiteAggregate) => void;
  hoveredSchool: Etablissement | null;
}

function createSchoolIcon(type: Etablissement['type'], dimmed = false): L.DivIcon {
  const color = dimmed ? '#d1d5db' : TYPE_COLORS[type];
  const opacity = dimmed ? '0.4' : '1';
  return L.divIcon({
    html: `<div style="
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: ${color};
      border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      opacity: ${opacity};
      transition: opacity 0.15s;
    "></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -9],
  });
}

function createUniversiteIcon(tauxInsertion: number | null): L.DivIcon {
  const color = insertionColor(tauxInsertion);
  return L.divIcon({
    html: `<div style="
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: ${color};
      border: 3px solid ${UNIVERSITE_COLOR};
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

function renderSchoolPopup(e: Etablissement): string {
  const typeColor = TYPE_COLORS[e.type];
  const secteurBadge = e.secteur.toLowerCase().includes('public')
    ? '<span style="background:#d1fae5;color:#065f46;padding:1px 6px;border-radius:10px;font-size:10px;">Public</span>'
    : '<span style="background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:10px;font-size:10px;">Prive</span>';

  const optionsHtml = e.options.length > 0
    ? `<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:6px;">${e.options.map((o) =>
        `<span style="background:#f3f4f6;color:#6b7280;padding:1px 5px;border-radius:6px;font-size:9px;">${o}</span>`
      ).join('')}</div>`
    : '';

  return `
    <div style="min-width:200px;max-width:280px;font-family:Inter,system-ui,sans-serif;">
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:6px;">
        <span style="background:${typeColor};color:white;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600;">${TYPE_LABELS[e.type]}</span>
        ${secteurBadge}
        ${e.eduPrio ? '<span style="background:#fee2e2;color:#991b1b;padding:1px 6px;border-radius:10px;font-size:10px;">REP</span>' : ''}
      </div>
      <div style="font-weight:600;font-size:12px;color:#1f2937;line-height:1.3;margin-bottom:3px;">${e.nom}</div>
      <div style="font-size:11px;color:#9ca3af;">${e.ville} (${e.dept})</div>
      ${optionsHtml}
    </div>
  `;
}

function renderUniversitePopup(u: UniversiteAggregate): string {
  const insertColor = insertionColor(u.tauxInsertion);
  return `
    <div style="min-width:220px;max-width:300px;font-family:Inter,system-ui,sans-serif;">
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:6px;">
        <span style="background:${UNIVERSITE_COLOR};color:white;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600;">Insertion pro</span>
      </div>
      <div style="font-weight:600;font-size:12px;color:#1f2937;line-height:1.3;margin-bottom:6px;">${u.etab}</div>
      <div style="display:flex;gap:12px;padding:6px 0;border-top:1px solid #f3f4f6;">
        <div style="text-align:center;">
          <div style="font-size:16px;font-weight:700;color:${insertColor};">${formatPct(u.tauxInsertion)}</div>
          <div style="font-size:9px;color:#9ca3af;">insertion</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:16px;font-weight:700;color:#374151;">${formatPct(u.tauxEmploi)}</div>
          <div style="font-size:9px;color:#9ca3af;">emploi</div>
        </div>
        ${u.salaire != null ? `<div style="text-align:center;">
          <div style="font-size:16px;font-weight:700;color:#374151;">${formatSalary(u.salaire)}</div>
          <div style="font-size:9px;color:#9ca3af;">salaire median</div>
        </div>` : ''}
      </div>
      <button
        onclick="window.__education_detail__=true"
        style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:8px;padding:7px 0;width:100%;background:#f59e0b;color:white;border-radius:8px;font-size:12px;font-weight:600;border:none;cursor:pointer;"
      >
        Voir les disciplines
      </button>
    </div>
  `;
}

function BoundsTracker({ onChange }: { onChange: (bounds: L.LatLngBounds) => void }) {
  const map = useMap();
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const handler = () => onChangeRef.current(map.getBounds());
    handler();
    map.on('moveend', handler);
    map.on('zoomend', handler);
    return () => {
      map.off('moveend', handler);
      map.off('zoomend', handler);
    };
  }, [map]);

  return null;
}

function SchoolMarkerLayer({
  etablissements,
  onSchoolSelect,
  hoveredSchool,
}: {
  etablissements: Etablissement[];
  onSchoolSelect: (e: Etablissement) => void;
  hoveredSchool: Etablissement | null;
}) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const etabMapRef = useRef<Map<string, Etablissement>>(new Map());

  const indexed = useMemo(() =>
    etablissements.map((e) => ({ e, key: e.id })),
    [etablissements],
  );

  useEffect(() => {
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
    }

    const newMarkers = new Map<string, L.Marker>();
    const newEtabMap = new Map<string, Etablissement>();

    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      disableClusteringAtZoom: 15,
    });

    for (const { e, key } of indexed) {
      const icon = createSchoolIcon(e.type);
      const marker = L.marker([e.lat, e.lng], { icon });

      marker.bindPopup(renderSchoolPopup(e), { maxWidth: 300 });

      marker.on('click', () => {
        onSchoolSelect(e);
      });

      newMarkers.set(key, marker);
      newEtabMap.set(key, e);
      cluster.addLayer(marker);
    }

    markersRef.current = newMarkers;
    etabMapRef.current = newEtabMap;
    clusterRef.current = cluster;
    map.addLayer(cluster);

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
      }
    };
  }, [map, indexed, onSchoolSelect]);

  // Hover dimming
  useEffect(() => {
    for (const [key, marker] of markersRef.current) {
      const e = etabMapRef.current.get(key);
      if (!e) continue;
      if (hoveredSchool === null) {
        marker.setIcon(createSchoolIcon(e.type));
      } else {
        const dimmed = e !== hoveredSchool;
        marker.setIcon(createSchoolIcon(e.type, dimmed));
      }
    }
    if (clusterRef.current) {
      clusterRef.current.refreshClusters();
    }
  }, [hoveredSchool]);

  return null;
}

function InsertionMarkerLayer({
  universites,
  onUniversiteSelect,
}: {
  universites: UniversiteAggregate[];
  onUniversiteSelect: (u: UniversiteAggregate) => void;
}) {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    const group = L.layerGroup();

    for (const u of universites) {
      const icon = createUniversiteIcon(u.tauxInsertion);
      const marker = L.marker([u.lat, u.lng], { icon, zIndexOffset: 1000 });
      marker.bindPopup(renderUniversitePopup(u), { maxWidth: 320 });

      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = marker.getPopup()?.getElement()?.querySelector('button');
          if (btn) {
            btn.addEventListener('click', () => {
              if (window.__education_detail__) {
                window.__education_detail__ = false;
                marker.closePopup();
                onUniversiteSelect(u);
              }
            });
          }
        }, 50);
      });

      group.addLayer(marker);
    }

    layerRef.current = group;
    map.addLayer(group);

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, universites, onUniversiteSelect]);

  return null;
}

export function MapView({
  etablissements,
  universites,
  showInsertion,
  onBoundsChange,
  onSchoolSelect,
  onUniversiteSelect,
  hoveredSchool,
}: Props) {
  return (
    <MapContainer
      center={[46.6, 2.5]}
      zoom={6}
      className="h-full w-full"
      zoomControl={false}
      minZoom={3}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <BoundsTracker onChange={onBoundsChange} />
      <SchoolMarkerLayer
        etablissements={etablissements}
        onSchoolSelect={onSchoolSelect}
        hoveredSchool={hoveredSchool}
      />
      {showInsertion && (
        <InsertionMarkerLayer
          universites={universites}
          onUniversiteSelect={onUniversiteSelect}
        />
      )}
    </MapContainer>
  );
}

// Global declaration for popup detail button communication
declare global {
  interface Window {
    __education_detail__?: boolean;
  }
}
