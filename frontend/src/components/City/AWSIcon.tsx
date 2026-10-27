import type { BuildingType } from '../../types';

export default function AWSIcon({ type }: { type: BuildingType }) {
  const colors: Record<string, { bg: string }> = {
    ec2: { bg: '#FF9900' }, s3: { bg: '#E7157B' }, lambda: { bg: '#FF9900' },
    rds: { bg: '#3B48CC' }, sqs: { bg: '#E7157B' }, cloudwatch: { bg: '#E7157B' },
    api: { bg: '#8C4FFF' }, cloudfront: { bg: '#8C4FFF' },
    dynamodb: { bg: '#3B48CC' }, sns: { bg: '#E7157B' }
  };
  const bg = colors[type]?.bg || '#FF9900';

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
      <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill={bg} />
      
      {type === 'ec2' && (
        <g fill="white"><rect x="30" y="30" width="40" height="10" rx="2" /><rect x="30" y="45" width="40" height="10" rx="2" /><rect x="30" y="60" width="40" height="10" rx="2" /></g>
      )}
      {type === 's3' && (
        <g fill="white"><path d="M30 35 L70 35 L65 70 L35 70 Z" /><rect x="35" y="25" width="30" height="5" rx="2" /></g>
      )}
      {type === 'lambda' && (
        <g fill="white"><path d="M30 70 L45 40 L50 50 L60 30 L70 70 L58 70 L52 50 L45 70 Z" /></g>
      )}
      {type === 'rds' && (
        <g fill="white"><ellipse cx="50" cy="30" rx="20" ry="8" /><rect x="30" y="30" width="40" height="25" /><ellipse cx="50" cy="55" rx="20" ry="8" /></g>
      )}
      {type === 'sqs' && (
        <g fill="white"><rect x="30" y="35" width="10" height="30" rx="2" /><rect x="45" y="35" width="10" height="30" rx="2" /><rect x="60" y="35" width="10" height="30" rx="2" /></g>
      )}
      {type === 'cloudwatch' && (
        <g fill="white"><circle cx="50" cy="50" r="15" fill="none" stroke="white" strokeWidth="6" /><circle cx="50" cy="50" r="5" /><path d="M65 65 L80 80" stroke="white" strokeWidth="6" /></g>
      )}
      {type === 'api' && (
        <g fill="white"><rect x="30" y="35" width="40" height="30" rx="4" /><path d="M40 50 L45 45 L50 50 L55 45 L60 50" stroke={bg} strokeWidth="3" fill="none" /></g>
      )}
      {type === 'cloudfront' && (
        <g fill="white"><circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="4" /><path d="M50 30 L50 70 M30 50 L70 50 M36 36 L64 64 M36 64 L64 36" stroke="white" strokeWidth="3" /></g>
      )}
      {type === 'dynamodb' && (
        <g fill="white"><path d="M30 30 L70 30 L70 45 L50 55 L30 45 Z" /><path d="M30 50 L70 50 L70 65 L50 75 L30 65 Z" /></g>
      )}
      {type === 'sns' && (
        <g fill="white"><path d="M40 70 L70 30 M30 40 L50 70 L70 40" stroke="white" strokeWidth="6" strokeLinecap="round" /></g>
      )}
    </svg>
  );
}