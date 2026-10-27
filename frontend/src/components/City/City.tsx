import BuildingMarker from './BuildingMarker';
import type { BuildingData } from '../../types';

interface CityProps {
  buildings: BuildingData[];
  selectedId?: string;
  activeScenario: string | null;
  onSelectBuilding: (id: string) => void;
}

export default function City({ buildings, selectedId, activeScenario, onSelectBuilding }: CityProps) {
  const getCenter = (b: BuildingData) => ({
    cx: b.position.x + (b.position.w / 2),
    cy: b.position.y + (b.position.h / 2),
  });

  const renderConnections = () => {
    if (!activeScenario) return null;
    const affected = buildings.filter(b => b.status === 'critical' || b.status === 'warning');
    const paths: React.ReactNode[] = [];

    affected.forEach(source => {
      const dependents = buildings.filter(b => b.dependsOn.includes(source.id));
      dependents.forEach(target => {
        const p1 = getCenter(source);
        const p2 = getCenter(target);
        const midX = (p1.cx + p2.cx) / 2;
        const midY = (p1.cy + p2.cy) / 2 - 5; 
        const pathData = `M ${p1.cx} ${p1.cy} Q ${midX} ${midY} ${p2.cx} ${p2.cy}`;
        
        paths.push(
          <g key={`${source.id}-${target.id}`}>
            <path d={pathData} fill="none" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="0.5" />
            <path id={`path-${source.id}-${target.id}`} d={pathData} fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="3, 3">
              <animate attributeName="stroke-dashoffset" from="6" to="0" dur="0.5s" repeatCount="indefinite" />
            </path>
            <circle r="1" fill="#ef4444">
              <animateMotion dur="1.5s" repeatCount="indefinite">
                <mpath href={`#path-${source.id}-${target.id}`} />
              </animateMotion>
            </circle>
          </g>
        );
      });
    });
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        {paths}
      </svg>
    );
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0b1120] flex items-center justify-center">
      
      {/* Fundo com gradiente suave (sem o grid poluído) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1120] via-[#111827] to-[#0b1120]" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full h-full p-4 z-20">
        
        {/* BLOCOS DE FUNDO (As "VPCs" visuais) */}
        <div className="absolute border border-slate-700/50 bg-slate-800/20 rounded-2xl backdrop-blur-sm"
             style={{ left: '5%', top: '10%', width: '42%', height: '35%' }}>
          <span className="absolute top-3 left-4 text-xs font-bold text-slate-500 tracking-wider">REDE & API</span>
        </div>

        <div className="absolute border border-slate-700/50 bg-slate-800/20 rounded-2xl backdrop-blur-sm"
             style={{ left: '55%', top: '10%', width: '40%', height: '35%' }}>
          <span className="absolute top-3 left-4 text-xs font-bold text-slate-500 tracking-wider">COMPUTAÇÃO</span>
        </div>

        <div className="absolute border border-slate-700/50 bg-slate-800/20 rounded-2xl backdrop-blur-sm"
             style={{ left: '5%', top: '55%', width: '42%', height: '35%' }}>
          <span className="absolute top-3 left-4 text-xs font-bold text-slate-500 tracking-wider">DADOS & ARMAZENAMENTO</span>
        </div>

        <div className="absolute border border-slate-700/50 bg-slate-800/20 rounded-2xl backdrop-blur-sm"
             style={{ left: '55%', top: '55%', width: '40%', height: '35%' }}>
          <span className="absolute top-3 left-4 text-xs font-bold text-slate-500 tracking-wider">MENSAGERIA & OBSERVAÇÃO</span>
        </div>

        {renderConnections()}
        
        <div className="absolute inset-0 z-30">
          {buildings.map((building) => (
            <BuildingMarker
              key={building.id}
              building={building}
              isSelected={selectedId === building.id}
              onClick={() => onSelectBuilding(building.id)}
            />
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 z-40 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-700 flex gap-4 text-xs font-medium text-slate-300 shadow-xl">
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Operacional</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Alerta</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Falha</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> Parado</div>
      </div>
    </div>
  );
}