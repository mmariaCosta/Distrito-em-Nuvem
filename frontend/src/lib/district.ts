export type ServiceId = 'ec2' | 's3' | 'lambda' | 'rds' | 'sqs' | 'cloudwatch' | 'api' | 'cloudfront' | 'dynamodb' | 'sns';
export type ScenarioId = 'sobrecarga' | 'banco' | 'fila' | 'cascata' | 'permissao';

export interface Service {
  id: ServiceId;
  name: string;
  status: 'running' | 'stopped' | 'warning' | 'critical';
  count: number;
  resource: string;
  cost: number;
  metric: string;
  metricValue: string;
}

export type ResolutionContext = {
  id: ScenarioId;
  completed: number;
  propagated: boolean;
};

export type CommandResult = {
  lines: string[];
  select?: ServiceId;
  update?: { id: ServiceId; status: Service['status'] };
  clear?: boolean;
  scenario?: ScenarioId;
  recover?: boolean;
  remedy?: string;
};

export const scenarios: {
  id: ScenarioId;
  name: string;
  description: string;
  target: ServiceId;
  remedies: { id: string; title: string; description: string }[];
}[] = [
  { id: 'sobrecarga', name: 'Pico de tráfego', description: 'EC2 chega a 90% de CPU.', target: 'ec2', remedies: [{ id: '0', title: 'Escalar EC2', description: 'Aumenta a capacidade computacional.' }] },
  { id: 'banco', name: 'Queda do banco', description: 'RDS perde conexão.', target: 'rds', remedies: [{ id: '0', title: 'Restaurar backup', description: 'Reverte o banco para o último estado seguro.' }] },
  { id: 'fila', name: 'Fila travada', description: 'SQS acumula mensagens.', target: 'sqs', remedies: [{ id: '0', title: 'Limpar fila', description: 'Descarta mensagens corrompidas.' }] },
  { id: 'cascata', name: 'Esgotamento em cascata', description: 'S3 e RDS falham ao mesmo tempo.', target: 'rds', remedies: [{ id: '0', title: 'Ampliar disco', description: 'Aumenta o armazenamento.' }, { id: '1', title: 'Retomar aplicações', description: 'Reconecta EC2 e Lambda.' }] },
  { id: 'permissao', name: 'Crise de identidade', description: 'Lambda perde permissão.', target: 'lambda', remedies: [{ id: '0', title: 'Restaurar IAM', description: 'Aplica roles corretas.' }] },
];

export const statusLabel: Record<Service['status'], string> = {
  running: 'Operacional',
  stopped: 'Parado',
  warning: 'Atenção',
  critical: 'Falha',
};

export function metricValue(service: Service) {
  return service.metricValue;
}

export function runCommand(
  input: string,
  services: Service[],
  incident: 'idle' | 'active' | 'recovering' = 'idle',
  context?: ResolutionContext
): CommandResult {
  const sanitizedInput = input.replace(/[<>]/g, '');
  const [verb = '', arg] = sanitizedInput.trim().toLowerCase().split(/\s+/);

  if (['clear', 'limpar'].includes(verb)) return { lines: [], clear: true };

  if (verb === 'cenarios' || verb === 'cenários') {
    return { lines: scenarios.map((s) => `${s.id}: ${s.name} — ${s.description}`) };
  }

  if (['solucoes', 'soluções', 'resolver'].includes(verb)) {
    const mapToId: Record<string, ScenarioId> = {
      'cascade': 'cascata', 'database_down': 'banco', 'traffic_spike': 'sobrecarga', 'identity_crisis': 'permissao'
    };
    const safeContextId = context?.id ? (mapToId[context.id] || context.id) : undefined;
    const scenario = scenarios.find((s) => s.id === safeContextId);

    if (!scenario || incident === 'idle') return { lines: ['Inicie um cenário para explorar as soluções.'] };
    
    if (verb !== 'resolver') {
      return { lines: scenario.remedies.map((r, i) => `${i + 1}. ${i < (context?.completed ?? 0) ? '[concluído] ' : ''}${r.title} — Comando: resolver ${r.id}`) };
    }
    
    if (incident === 'recovering') return { lines: ['Aguarde a recuperação em andamento.'] };
    
    const remedyIndex = parseInt(arg || '0', 10);
    const next = scenario.remedies[remedyIndex];
    
    if (!next) return { lines: ['Ação inválida.'] };
    
    return { lines: [`Aplicando: ${next.title}. Aguarde...`], remedy: next.id };
  }

  if (verb === 'simular') {
    const aliases: Record<string, ScenarioId> = {
      'cascade': 'cascata', 'database_down': 'banco', 'traffic_spike': 'sobrecarga', 'identity_crisis': 'permissao'
    };
    const scenarioId = aliases[arg] || (arg as ScenarioId);
    const scenario = scenarios.find((s) => s.id === scenarioId);
    
    if (!scenario) return { lines: ['Cenários disponíveis: sobrecarga, banco, fila, cascata, permissao'] };
    if (incident !== 'idle') return { lines: ['Recupere o cenário atual antes de iniciar outro.'] };
    
    return {
      lines: [`Falha simulada: ${scenario.name}.`, scenario.description, 'Digite solucoes para ver ações, ou recuperar.'],
      scenario: scenario.id,
      select: scenario.target,
    };
  }

  if (verb === 'recuperar') {
    return incident === 'active' 
      ? { lines: ['Recuperação iniciada. Os serviços serão restaurados.'], recover: true }
      : { lines: [incident === 'recovering' ? 'Recuperação em andamento.' : 'Nenhum cenário ativo.'] };
  }

  if (verb === 'definir') {
    const [_, svcId, newStatus] = sanitizedInput.trim().toLowerCase().split(/\s+/);
    if (!svcId || !newStatus) return { lines: ['Uso: definir <serviço> <healthy|warning|critical|destroyed>'] };
    
    const validStatuses = ['running', 'stopped', 'warning', 'critical', 'healthy', 'destroyed'];
    if (!validStatuses.includes(newStatus)) return { lines: ['Status inválido.'] };
    
    const targetService = services.find(s => s.id === svcId);
    if (!targetService) return { lines: ['Serviço não encontrado.'] };
    
    let finalStatus: any = newStatus;
    if (newStatus === 'healthy') finalStatus = 'running';
    if (newStatus === 'destroyed') finalStatus = 'stopped';
    
    return {
      lines: [`Status do serviço ${svcId} alterado para ${newStatus}.`],
      select: svcId as ServiceId,
      update: { id: svcId as ServiceId, status: finalStatus }
    };
  }

  if (['help', 'ajuda'].includes(verb)) {
    return {
      lines: [
        'listar · status <serviço> · abrir <serviço> · iniciar <serviço> · parar <serviço>',
        'metricas <serviço> · custos · limpar',
        'cenarios · simular sobrecarga|banco|fila|cascata|permissao · recuperar',
        'solucoes · resolver <ação>',
        `Serviços: ${services.map(s => s.id).join(', ')}`, // <-- AGORA É DINÂMICO
      ],
    };
  }

  if (['listar', 'ls'].includes(verb)) {
    return { lines: services.filter((s) => !arg || s.id === arg).map((s) => `${s.id.padEnd(12)} ${statusLabel[s.status].padEnd(13)} ${s.count} recursos` ) };
  }

  if (['custos', 'cost'].includes(verb)) {
    return { lines: [...services.map((s) => `${s.id.padEnd(12)} US$ ${s.cost.toFixed(2)}/mês`), `Total: US$ ${services.reduce((sum, s) => sum + s.cost, 0).toFixed(2)}/mês`] };
  }

  const service = services.find((s) => s.id === arg);
  if (!service && !['abrir','cd','status','metricas','métricas','metrics','iniciar','start','parar','stop'].includes(verb)) {
    return { lines: ['Comando ou serviço não encontrado.'] };
  }

  if (['abrir', 'cd'].includes(verb) && service) return { lines: [`Você está no distrito ${service.name}.`], select: service.id };
  if (verb === 'status' && service) return { lines: [`${service.name}: ${statusLabel[service.status]}`], select: service.id };
  if (['metricas', 'métricas', 'metrics'].includes(verb) && service) return { lines: [`${service.name} · ${service.metric}: ${metricValue(service)}`], select: service.id };
  
  if (['iniciar', 'start', 'parar', 'stop'].includes(verb) && service) {
    if (incident !== 'idle') return { lines: ['Cenário em andamento. Use recuperar antes.'] };
    const targetStatus = ['iniciar', 'start'].includes(verb) ? 'running' : 'stopped';
    if (service.status === targetStatus) {
      return { lines: [`${service.name} já está ${targetStatus === 'running' ? 'iniciado' : 'parado'}.`], select: service.id };
    }
    return { lines: [`${service.name} ${targetStatus === 'running' ? 'iniciado' : 'parado'}.`], select: service.id, update: { id: service.id, status: targetStatus } };
  }

  return { lines: ['Comando desconhecido. Digite ajuda.'] };
}