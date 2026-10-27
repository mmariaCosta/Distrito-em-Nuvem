// src/components/Dashboard/MetricsList.tsx
import { Server, HardDrive, Zap, Database, Mail, Activity } from 'lucide-react';
import type { BuildingData } from '../../types';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  ec2: <Server size={18} />, s3: <HardDrive size={18} />, lambda: <Zap size={18} />,
  rds: <Database size={18} />, sqs: <Mail size={18} />, cloudwatch: <Activity size={18} />,
};

interface MetricsListProps {
  buildings: BuildingData[];
  selectedId?: string;
  onSelectBuilding: (id: string) => void;
}

export default function MetricsList({ buildings, selectedId, onSelectBuilding }: MetricsListProps) {
  
  // Função que retorna o título e o valor da métrica baseado no tipo do prédio
  const getMetricData = (b: BuildingData) => {
    switch (b.type) {
      case 'ec2': 
        return { label: "Uso de CPU", value: `${b.metrics.cpu.toFixed(0)}%` };
      case 's3': 
        return { label: "Armazenamento", value: "8.4 GB" };
      case 'lambda': 
        return { label: "Invocações", value: "12.840" };
      case 'rds': 
        return { label: "Conexões", value: "18 / 100" };
      case 'sqs': 
        return { label: "Na fila", value: b.metrics.errors > 0 ? b.metrics.errors.toString() : "142" };
      case 'cloudwatch': 
        return { label: "Alarmes", value: "1 ativo" };
      default: 
        return { label: "Métrica", value: "N/A" };
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      
      {/* Lista de Métricas */}
      <div className="flex-1 overflow-y-auto p-2">
        {buildings.map((b) => {
          const { label, value } = getMetricData(b);
          
          return (
            <div 
              key={b.id} 
              onClick={() => onSelectBuilding(b.id)}
              className={`flex items-center justify-between p-3 mb-1 rounded-lg cursor-pointer transition-colors ${selectedId === b.id ? 'bg-green-50' : 'hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className="text-slate-500">{SERVICE_ICONS[b.type]}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {b.type === 'ec2' ? 'Amazon EC2' : b.type === 's3' ? 'Amazon S3' : b.type === 'lambda' ? 'AWS Lambda' : b.type === 'rds' ? 'Amazon RDS' : b.type === 'sqs' ? 'Amazon SQS' : 'CloudWatch'}
                  </p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700">{value}</span>
                <i className={`status-dot ${b.status}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="border-t border-slate-100 p-4 flex justify-between items-center bg-white mt-auto">
        <div className="flex gap-4 text-[10px] font-medium text-slate-500">
          <div className="flex items-center gap-1.5"><i className="status-dot healthy w-2 h-2"></i> Operacional</div>
          <div className="flex items-center gap-1.5"><i className="status-dot warning w-2 h-2"></i> Alerta</div>
          <div className="flex items-center gap-1.5"><i className="status-dot destroyed w-2 h-2"></i> Parado</div>
          <div className="flex items-center gap-1.5"><i className="status-dot critical w-2 h-2"></i> Falha</div>
          <div className="flex items-center gap-1.5"><i className="status-dot bg-blue-400 w-2 h-2"></i> Recuperando</div>
        </div>
        <div className="text-[10px] text-slate-400">
          {buildings.length} serviços · 15 recursos
        </div>
      </div>
    </div>
  );
}