export type BuildingType = 
  | 'ec2' | 's3' | 'lambda' | 'rds' | 'sqs' | 'cloudwatch' 
  | 'api' | 'cloudfront' | 'dynamodb' | 'sns';

export type BuildingStatus = 'healthy' | 'warning' | 'critical' | 'destroyed';

export interface BuildingMetrics {
  cpu: number; memory: number; requests: number; errors: number;
}

export interface Position {
  x: number; y: number; w: number; h: number;
}

export interface BuildingData {
  id: string; name: string; type: BuildingType; status: BuildingStatus;
  health: number; load: number; position: Position; metrics: BuildingMetrics;
  dependsOn: string[];
}