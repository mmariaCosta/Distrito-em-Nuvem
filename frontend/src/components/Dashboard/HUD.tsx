import { Server, Activity, DollarSign, ShieldCheck } from 'lucide-react';
import type { BuildingData } from '../../types';

interface HUDProps {
  buildings: BuildingData[];
  connected: boolean;
}

export default function HUD({ buildings, connected }: HUDProps) {
  const activeCount = buildings.filter(b => b.status === 'healthy' || b.status === 'warning').length;
  const alertCount = buildings.filter(b => b.status === 'warning' || b.status === 'critical').length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs text-slate-400 mb-1">Workspace / Meu distrito</p>
          <h1 className="text-2xl font-bold text-slate-800">Seu pequeno mundo na nuvem.</h1>
        </div>
        <button className="px-4 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 bg-white">Sandbox</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Serviços Ativos</span>
            <Server size={16} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{activeCount} <span className="text-sm font-normal text-slate-400">/ {buildings.length || 6}</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Recursos no distrito</span>
            <Activity size={16} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">15</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Custo estimado / mês</span>
            <DollarSign size={16} className="text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">US$ 35,38 <span className="text-xs font-normal text-slate-400">simulado</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Saúde do distrito</span>
            <ShieldCheck size={16} className="text-green-500" />
          </div>
          <p className={`text-lg font-bold mt-2 ${alertCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {alertCount > 0 ? `${alertCount} alertas` : 'Operacional'}
          </p>
        </div>
      </div>
    </div>
  );
}