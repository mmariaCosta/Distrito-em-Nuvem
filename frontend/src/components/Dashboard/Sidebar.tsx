import { Server, HardDrive, Zap, Database, Mail, Activity, Settings, Play, Square, RefreshCw, AlertTriangle, XCircle, PauseCircle, RotateCw } from 'lucide-react';
import type { BuildingData } from '../../types';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  ec2: <Server size={28} />, s3: <HardDrive size={28} />, lambda: <Zap size={28} />,
  rds: <Database size={28} />, sqs: <Mail size={28} />, cloudwatch: <Activity size={28} />,
};

const SERVICE_TITLES: Record<string, string> = {
  ec2: "Amazon EC2", s3: "Amazon S3", lambda: "AWS Lambda",
  rds: "Amazon RDS", sqs: "Amazon SQS", cloudwatch: "CloudWatch",
};

const SERVICE_DESCS: Record<string, string> = {
  ec2: "Instâncias e capacidade de computação do distrito.", s3: "Armazenamento de objetos e arquivos.",
  lambda: "Funções serverless sob demanda.", rds: "Bancos de dados relacionais.",
  sqs: "Filas de mensagens para desacoplamento.", cloudwatch: "Monitoramento e observabilidade.",
};

interface SidebarProps {
  building?: BuildingData;
  onAction: (id: string, status: string) => void; 
}

export default function Sidebar({ building, onAction }: SidebarProps) {
  if (!building) return null;

  // Mapeamento do status
  const isStopped = building.status === 'destroyed';
  
  // Define as propriedades visuais do status
  const statusConfig = {
    healthy: { label: 'Operacional', color: 'text-green-700 bg-green-100 border-green-200', icon: null, dot: 'bg-green-500' },
    warning: { label: 'Atenção', color: 'text-yellow-700 bg-yellow-100 border-yellow-200', icon: <AlertTriangle size={16} className="text-yellow-600"/>, dot: 'bg-yellow-500' },
    critical: { label: 'Falha', color: 'text-red-700 bg-red-100 border-red-200', icon: <XCircle size={16} className="text-red-600"/>, dot: 'bg-red-500' },
    destroyed: { label: 'Parado', color: 'text-blue-700 bg-blue-100 border-blue-200', icon: <PauseCircle size={16} className="text-blue-600"/>, dot: 'bg-blue-500' },
    recovering: { label: 'Recuperando', color: 'text-sky-700 bg-sky-100 border-sky-200', icon: <RotateCw size={16} className="text-sky-600 animate-spin"/>, dot: 'bg-sky-500' }
  }[building.status] || { label: 'Operacional', color: 'text-green-700 bg-green-100 border-green-200', icon: null, dot: 'bg-green-500' };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-5 pb-0">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden">
          
          {/* Linha superior decorativa baseada no status */}
          <div className={`absolute top-0 left-0 w-full h-1 ${statusConfig.dot}`}></div>

          <div className="flex justify-between items-start mb-4 mt-2">
            <div className={`p-3 rounded-lg ${isStopped ? 'bg-slate-100 text-slate-400' : 'bg-orange-50 text-orange-500'}`}>
              {SERVICE_ICONS[building.type]}
            </div>
            <Settings size={18} className="text-slate-300 cursor-pointer" />
          </div>

          <h2 className="text-xl font-bold text-slate-800">{SERVICE_TITLES[building.type]}</h2>
          <p className="text-sm text-slate-500 mt-1 mb-4">{SERVICE_DESCS[building.type]}</p>
          
          {/* BANNER DE STATUS MUITO MAIS VISÍVEL */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border ${statusConfig.color}`}>
            {statusConfig.icon}
            <span className={statusConfig.dot === 'bg-sky-500' ? 'animate-pulse' : ''}>{statusConfig.label}</span>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Região</span><span className="font-medium text-slate-700">us-east-1</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Recursos</span><span className="font-medium text-slate-700">2 recursos</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Ambiente</span><span className="font-medium text-slate-700">Sandbox</span></div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-4 flex-1 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-500 font-medium">Uso de CPU</span>
            <span className="text-[10px] text-slate-400">Últimos 30 min</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-800">{building.metrics.cpu.toFixed(0)}%</span>
            <span className="text-xs text-green-600 mb-1 flex items-center gap-1"><Activity size={12} /> {statusConfig.label}</span>
          </div>
          
          {/* Gráfico com cor dinâmica */}
          <svg className={`w-full h-12 mt-4 ${building.status === 'critical' ? 'text-red-500' : building.status === 'warning' ? 'text-yellow-500' : 'text-green-500'}`} viewBox="0 0 100 30" preserveAspectRatio="none">
            <path d="M0 25 L10 20 L20 22 L30 15 L40 18 L50 10 L60 12 L70 5 L80 8 L90 2 L100 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M0 25 L10 20 L20 22 L30 15 L40 18 L50 10 L60 12 L70 5 L80 8 L90 2 L100 10 L100 30 L0 30 Z" fill="currentColor" opacity="0.1" />
          </svg>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Recurso Principal</p>
          <div className="flex items-center gap-2 mb-1">
            <Server size={16} className="text-slate-600" />
            <span className="font-semibold text-slate-800">distrito-assets</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">Armazenamento · simulado</p>
          
          <button 
            onClick={() => onAction(building.id, isStopped ? 'healthy' : 'destroyed')}
            className={`w-full py-2 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors border ${isStopped ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'}`}
          >
            {isStopped ? <><Play size={16} /> Iniciar serviço</> : <><Square size={16} /> Parar serviço</>}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Atividade recente</p>
            <Activity size={14} className="text-slate-400" />
          </div>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-1 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
            <div className="relative flex items-start gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${statusConfig.dot} ring-4 ring-white flex-shrink-0 mt-1 z-10`} />
              <div><p className="text-sm font-medium text-slate-700">{statusConfig.label}</p><p className="text-xs text-slate-400">Agora mesmo</p></div>
            </div>
            <div className="relative flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-white flex-shrink-0 mt-1 z-10" />
              <div><p className="text-sm font-medium text-slate-700">Distrito inicializado</p><p className="text-xs text-slate-400">Há alguns minutos</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0">
        <div className="bg-slate-100 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400"><RefreshCw size={16} /></div>
          <div><p className="text-xs font-medium text-slate-600">Um mundo de possibilidades.</p><p className="text-[10px] text-slate-500">Sem custos reais.</p></div>
        </div>
      </div>
    </div>
  );
}