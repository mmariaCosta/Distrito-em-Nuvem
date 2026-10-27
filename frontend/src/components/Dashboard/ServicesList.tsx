import { useState } from 'react';
import { Search, Server, HardDrive, Zap, Database, Mail, Activity } from 'lucide-react';
import type { BuildingData } from '../../types';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  ec2: <Server size={18} />, s3: <HardDrive size={18} />, lambda: <Zap size={18} />,
  rds: <Database size={18} />, sqs: <Mail size={18} />, cloudwatch: <Activity size={18} />,
};

const SERVICE_DESCS: Record<string, string> = {
  ec2: "Computação", s3: "Armazenamento", lambda: "Serverless",
  rds: "Banco de dados", sqs: "Fila", cloudwatch: "Monitoramento",
};

const STATUS_LABELS: Record<string, string> = {
  healthy: "Operacional", warning: "Atenção", destroyed: "Parado", critical: "Falha",
};

interface ServicesListProps {
  buildings: BuildingData[];
  selectedId?: string;
  onSelectBuilding: (id: string) => void;
  onStatusChange: (id: string, status: string) => void; // Propriedade adicionada
}

export default function ServicesList({ buildings, selectedId, onSelectBuilding, onStatusChange }: ServicesListProps) {
  const [search, setSearch] = useState('');

  const filtered = buildings.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Buscar um serviço..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered.map((b) => (
          <div 
            key={b.id} onClick={() => onSelectBuilding(b.id)}
            className={`flex items-center justify-between p-3 mb-1 rounded-lg cursor-pointer transition-colors ${selectedId === b.id ? 'bg-green-50' : 'hover:bg-slate-50'}`}
          >
            <div className="flex items-center gap-3">
              <div className="text-slate-500">{SERVICE_ICONS[b.type]}</div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{b.name}</p>
                <p className="text-xs text-slate-500">{SERVICE_DESCS[b.type]}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={b.status}
                onChange={(e) => {
                  e.stopPropagation();
                  onStatusChange(b.id, e.target.value); // Chama a função do App
                }}
                onClick={(e) => e.stopPropagation()}
                className="text-xs border border-slate-200 rounded p-1 bg-white text-slate-600 outline-none cursor-pointer hover:border-slate-300"
              >
                <option value="healthy">Operacional</option>
                <option value="warning">Atenção</option>
                <option value="destroyed">Parado</option>
                <option value="critical">Falha</option>
              </select>

              <span className={`text-xs font-medium w-20 text-right ${b.status === 'healthy' ? 'text-green-600' : b.status === 'warning' ? 'text-yellow-600' : b.status === 'destroyed' ? 'text-blue-600' : 'text-red-600'}`}>
                {STATUS_LABELS[b.status]}
              </span>
              
              <i className={`status-dot ${b.status}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}