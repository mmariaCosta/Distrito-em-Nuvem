import { motion } from 'framer-motion';
import AWSIcon from './AWSIcon';
import type { BuildingData } from '../../types';

interface MarkerProps {
  building: BuildingData;
  isSelected: boolean;
  onClick: () => void;
}

export default function BuildingMarker({ building, isSelected, onClick }: MarkerProps) {
  const { x, y, w, h } = building.position; 
  const status = building.status as string;

  const statusConfig = {
    healthy: { border: 'border-green-500/50', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]', text: 'text-green-400' },
    warning: { border: 'border-yellow-500/50', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.4)]', text: 'text-yellow-400' },
    critical: { border: 'border-red-500/80', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]', text: 'text-red-400' },
    destroyed: { border: 'border-slate-600', glow: 'shadow-none', text: 'text-slate-400' }
  }[status] || { border: 'border-slate-600', glow: 'shadow-md', text: 'text-slate-400' };

  return (
    <motion.button
      onClick={onClick}
      className={`absolute flex flex-col items-center justify-center cursor-pointer transition-all duration-300 z-10 ${isSelected ? 'scale-110 z-40' : 'hover:scale-105'}`}
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
      animate={status === 'critical' ? { x: [0, -2, 2, -2, 2, 0] } : {}}
      transition={{ repeat: status === 'critical' ? Infinity : 0, duration: 0.3 }}
    >
      <div className={`
        relative flex flex-col items-center justify-center p-3 rounded-xl backdrop-blur-md
        bg-slate-900/90 border transition-all duration-300
        ${statusConfig.border} ${statusConfig.glow}
        ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900' : ''}
      `}>
        <div className="w-10 h-10 mb-1">
          <AWSIcon type={building.type} />
        </div>
        
        <span className="font-mono text-[10px] font-bold text-slate-200 uppercase tracking-wider text-center leading-tight">
          {building.name}
        </span>

        {/* Barra de Status */}
        <div className={`mt-1.5 w-full h-1 rounded-full ${statusConfig.border.replace('border-', 'bg-').replace('/50', '').replace('/80', '')}`} />
      </div>

      {status === 'critical' && (
        <motion.div 
          className="absolute -top-8 text-2xl pointer-events-none"
          animate={{ y: [-5, -20], opacity: [1, 0], scale: [1, 1.2] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          💨
        </motion.div>
      )}
    </motion.button>
  );
}