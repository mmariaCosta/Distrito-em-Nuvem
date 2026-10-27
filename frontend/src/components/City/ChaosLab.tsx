import { useState, useEffect } from 'react';
import { Play, RotateCcw, Activity, CheckCircle2, Loader2 } from 'lucide-react';
import type { ScenarioData } from '../../types';

const SCENARIOS: Record<string, ScenarioData> = {
  traffic_spike: { name: "Pico de tráfego", desc: "EC2 chega a 90% de CPU.", impact: ["Falha simulada: Pico de tráfego.", "EC2 entra em estado crítico."], plan: ["Escalar EC2.", "Aumentar concorrência."], target: "ec2" },
  database_down: { name: "Queda do banco", desc: "RDS perde conexão.", impact: ["Falha simulada: Queda do banco.", "RDS fica offline."], plan: ["Restaurar backup.", "Reiniciar conexões."], target: "rds" },
  cascade: { name: "Esgotamento em cascata", desc: "S3 bloqueia gravações e RDS fica sem espaço.", impact: ["Falha simultânea: S3 nega gravações; RDS fica sem espaço.", "Aplicações falham ao salvar dados."], plan: ["Corrigir acesso e ampliar disco.", "Retomar aplicações e drenar fila."], target: "rds" },
  identity_crisis: { name: "Crise de identidade", desc: "Lambda perde permissão.", impact: ["Falha simulada: Crise de identidade.", "Lambda tem permissão revogada."], plan: ["Restaurar roles do IAM.", "Limpar cache."], target: "lambda" }
};

interface ChaosLabProps {
  activeScenario: string | null;
  resolvedSteps: number[];
  onSimulate: (id: string) => void;
  onRecover: () => void;
  onApplyStep: (index: number) => void;
  onScenarioChange: (id: string) => void;
}

export default function ChaosLab({ activeScenario, resolvedSteps, onSimulate, onRecover, onApplyStep, onScenarioChange }: ChaosLabProps) {
  const [selected, setSelected] = useState('cascade');
  const [loading, setLoading] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{type: 'info' | 'error' | 'success', text: string} | null>(null);

  useEffect(() => {
    if (activeScenario && SCENARIOS[activeScenario]) setSelected(activeScenario);
  }, [activeScenario]);

  const handleSimulate = () => onSimulate(selected);
  const handleRecover = () => onRecover();
  const handleApply = (index: number) => onApplyStep(index);

  const scenario = SCENARIOS[selected];
  const isRunning = activeScenario !== null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <Activity size={18} className="text-blue-500" /> Laboratório de falhas
        </div>
        <span className="text-[10px] text-slate-400 font-bold tracking-widest">SIMULADO</span>
      </div>

      <div className="flex gap-4">
        <select value={selected} onChange={(e) => { setSelected(e.target.value); onScenarioChange(e.target.value); }} disabled={isRunning}
          className="flex-1 p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 bg-slate-50 text-slate-700 font-medium disabled:opacity-50">
          {Object.entries(SCENARIOS).map(([id, s]) => <option key={id} value={id}>{s.name}</option>)}
        </select>

        <button onClick={handleSimulate} disabled={isRunning || loading !== null}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 disabled:opacity-50">
          <Play size={16} /> Simular falha
        </button>

        <button onClick={handleRecover} disabled={!isRunning || loading !== null}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 disabled:bg-slate-300 transition-colors">
          <RotateCcw size={16} /> Recuperar
        </button>
      </div>

      <p className="text-sm text-slate-500">{scenario.desc}</p>

      {isRunning && (
        <div className="grid grid-cols-2 gap-6 mt-2 pt-4 border-t border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Propagação do impacto</h4>
            <div className="space-y-2 text-sm text-slate-700 font-mono">
              {scenario.impact.map((line, i) => (
                <div key={i} className={`flex items-start gap-2 ${i === scenario.impact.length - 1 ? 'text-red-500 font-bold' : ''}`}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-current flex-shrink-0" />{line}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Plano de resolução</h4>
            <div className="space-y-3">
              {scenario.plan.map((step, i) => {
                const isResolved = resolvedSteps.includes(i);
                return (
                  <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100">
                    <span className={`text-sm ${isResolved ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{step}</span>
                    {isResolved ? (
                      <button disabled className="text-xs px-2 py-1 flex items-center gap-1 text-slate-400"><CheckCircle2 size={12} /> Concluído</button>
                    ) : (
                      <button onClick={() => handleApply(i)} className="text-xs px-2 py-1 border border-slate-300 rounded hover:bg-white flex items-center gap-1 text-slate-600">
                        <CheckCircle2 size={12} /> Aplicar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}