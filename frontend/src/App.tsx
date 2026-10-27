import { useState } from 'react';
import HUD from './components/Dashboard/HUD';
import City from './components/City/City';
import Sidebar from './components/Dashboard/Sidebar';
import ChaosLab from './components/City/ChaosLab';
import ServicesList from './components/Dashboard/ServicesList';
import MetricsList from './components/Dashboard/MetricsList';
import { DistrictTerminal } from './components/district-terminal';
import type { CommandResult, Service, ScenarioId } from './lib/district';
import { useDistrict } from './hooks/useDistrict';
import { Map, Server, Activity, HelpCircle } from 'lucide-react';

function App() {
  const { buildings, activeScenario, resolvedSteps, connected } = useDistrict();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'city' | 'services' | 'metrics'>('city');

  const selectedBuilding = buildings.find(b => b.id === selectedId) || buildings[0];

  const terminalServices: Service[] = buildings.map(b => ({
    id: b.id as any, name: b.name,
    status: b.status === 'healthy' ? 'running' : b.status === 'destroyed' ? 'stopped' : (b.status as any),
    count: 1, resource: `i-0f9c...`, cost: 5.89, metric: 'Uso de CPU', metricValue: `${b.metrics.cpu.toFixed(0)}%`
  }));

  // 1. MAPEAMENTO DO CENÁRIO: Python manda em inglês, Terminal espera em PT
  const mappedScenarioId = activeScenario ? {
    'traffic_spike': 'sobrecarga',
    'database_down': 'banco',
    'cascade': 'cascata',
    'identity_crisis': 'permissao'
  }[activeScenario] || activeScenario : null;

  // 2. CONTEXTO DE RESOLUÇÃO: Informa ao Terminal qual passo está e o que já foi feito
  const resolutionContext = mappedScenarioId ? {
    id: mappedScenarioId as ScenarioId,
    completed: resolvedSteps.length,
    propagated: true
  } : undefined;

  const triggerUICommand = (cmd: string) => {
    window.dispatchEvent(new CustomEvent('ui-command', { detail: cmd }));
  };

  const handleTerminalResult = async (result: CommandResult) => {
    if (result.select) setSelectedId(result.select);
    
    if (result.update) {
      let backendStatus = result.update.status;
      if (backendStatus === 'running') backendStatus = 'healthy';
      else if (backendStatus === 'stopped') backendStatus = 'destroyed';

      await fetch(`/api/status/${result.update.id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: backendStatus }),
      });
    }

    let backendCmd = '';
    if (result.scenario) backendCmd = `simular ${result.scenario}`;
    if (result.recover) backendCmd = 'recuperar';
    if (result.remedy) backendCmd = `resolver ${result.remedy}`;

    if (backendCmd) {
      await fetch('/api/command', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: backendCmd }),
      });
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden font-sans">
      <nav className="w-[68px] flex-none bg-white border-r border-slate-200 flex flex-col items-center py-4 z-30">
        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white font-bold mb-6">D</div>
        <div className="flex flex-col gap-4 flex-1">
          <button onClick={() => setActiveTab('city')} className={`p-2 rounded-lg ${activeTab === 'city' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}><Map size={20} /></button>
          <button onClick={() => setActiveTab('services')} className={`p-2 rounded-lg ${activeTab === 'services' ? 'bg-green-50 text-green-600' : 'text-slate-400 hover:bg-slate-50'}`}><Server size={20} /></button>
          <button onClick={() => setActiveTab('metrics')} className={`p-2 rounded-lg ${activeTab === 'metrics' ? 'bg-purple-50 text-purple-600' : 'text-slate-400 hover:bg-slate-50'}`}><Activity size={20} /></button>
        </div>
        <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><HelpCircle size={20} /></button>
        <div className="mt-4 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">MC</div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[76px] flex-none bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-slate-800">distrito <span className="font-normal text-slate-500">em nuvem</span></span>
            <div className="h-6 w-px bg-slate-300"></div>
            <span className="text-sm font-medium text-slate-600">Meu distrito</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Modo simulação
            </div>
            <span className="font-mono text-xs text-slate-500">us-east-1</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1600px] mx-auto flex flex-col gap-4">
            <HUD buildings={buildings} connected={connected} />

            <div className="grid grid-cols-[minmax(0,1fr)_282px] gap-4 mt-2">
              <div className="flex flex-col gap-4 min-w-0">
                
                <ChaosLab 
                  activeScenario={activeScenario} 
                  resolvedSteps={resolvedSteps}
                  onSimulate={(id) => triggerUICommand(`simular ${id}`)}
                  onRecover={() => triggerUICommand('recuperar')} 
                  onApplyStep={(step) => triggerUICommand(`resolver ${step}`)}
                  onScenarioChange={() => {}} 
                />

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                  <div className="flex items-center border-b border-slate-200 px-4 bg-slate-50/50">
                    <button onClick={() => setActiveTab('city')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'city' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Cidade</button>
                    <button onClick={() => setActiveTab('services')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'services' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Serviços</button>
                    <button onClick={() => setActiveTab('metrics')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'metrics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Métricas</button>
                  </div>
                  
                  <div className="h-[500px] relative bg-slate-900">
                    {activeTab === 'city' && (
                      <City buildings={buildings} selectedId={selectedBuilding?.id} activeScenario={activeScenario} onSelectBuilding={setSelectedId} />
                    )}
                    {activeTab === 'services' && (
                      <ServicesList 
                        buildings={buildings} 
                        selectedId={selectedBuilding?.id} 
                        onSelectBuilding={setSelectedId} 
                        onStatusChange={(id, status) => triggerUICommand(`definir ${id} ${status}`)} 
                      />
                    )}
                    {activeTab === 'metrics' && (
                      <MetricsList buildings={buildings} selectedId={selectedBuilding?.id} onSelectBuilding={setSelectedId} />
                    )}
                  </div>
                </div>

                <div className="h-[380px]">
                  <DistrictTerminal 
                    services={terminalServices}
                    onResult={handleTerminalResult}
                    incident={activeScenario ? 'active' : 'idle'}
                    resolution={resolutionContext} // <-- PASSANDO O CONTEXTO AQUI
                  />
                </div>
              </div>

              <div className="w-[282px] flex-none">
                <Sidebar 
                  building={selectedBuilding} 
                  onAction={(id, status) => triggerUICommand(`definir ${id} ${status}`)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;