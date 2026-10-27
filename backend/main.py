import asyncio, random, re
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

SCENARIOS = {
    "traffic_spike": {
        "name": "Pico de tráfego",
        "desc": "EC2 chega a 90% de CPU.",
        "impact": ["Falha simulada: Pico de tráfego.", "EC2 entra em estado crítico."],
        "plan": ["Escalar EC2."],
        "target": "ec2",
        "resolution": [["ec2"]] 
    },
    "database_down": {
        "name": "Queda do banco",
        "desc": "RDS perde conexão.",
        "impact": ["Falha simulada: Queda do banco.", "RDS fica offline."],
        "plan": ["Restaurar backup."],
        "target": "rds",
        "resolution": [["rds"]]
    },
    "cascade": {
        "name": "Esgotamento em cascata",
        "desc": "S3 e RDS falham ao mesmo tempo.",
        "impact": ["Falha simultânea: S3 nega gravações; RDS fica sem espaço.", "Aplicações falham ao salvar dados."],
        "plan": ["Corrigir acesso e ampliar disco.", "Retomar aplicações e drenar fila."],
        "target": "rds",
        "resolution": [["rds"], ["ec2", "lambda", "sqs", "cloudwatch", "s3"]]
    },
    "identity_crisis": {
        "name": "Crise de identidade",
        "desc": "Lambda perde permissão.",
        "impact": ["Falha simulada: Crise de identidade.", "Lambda tem permissão revogada."],
        "plan": ["Restaurar roles do IAM."],
        "target": "lambda",
        "resolution": [["lambda"]]
    }
}

class Building(BaseModel):
    id: str
    name: str
    type: str
    status: str = "healthy"
    health: float = 100.0
    load: float = 30.0
    position: dict
    metrics: dict
    depends_on: list[str] = []
    last_event: str | None = None

class DistrictState:
    def __init__(self):
        self.buildings: dict[str, Building] = {}
        self.active_scenario: str | None = None
        self.resolved_steps: list[int] = []
        self._seed()

    def _seed(self):
        # NOVO LAYOUT EM BLOCOS ALINHADOS
        layout = [
            # BLOCO 1: REDE & API (Topo Esquerdo)
            ("cloudfront", "CloudFront", "cloudfront", {"x": 8,  "y": 20, "w": 9, "h": 16}),
            ("api",        "API Gateway", "api",       {"x": 20, "y": 20, "w": 9, "h": 16}),
            ("sns",        "SNS",         "sns",       {"x": 32, "y": 20, "w": 9, "h": 16}),

            # BLOCO 2: COMPUTAÇÃO (Topo Direito)
            ("ec2",        "EC2",         "ec2",       {"x": 60, "y": 20, "w": 9, "h": 16}),
            ("lambda",     "Lambda",      "lambda",    {"x": 75, "y": 20, "w": 9, "h": 16}),
            ("dynamodb",   "DynamoDB",    "dynamodb",  {"x": 85, "y": 20, "w": 9, "h": 16}), # Movido para cá para balancear

            # BLOCO 3: DADOS (Base Esquerdo)
            ("rds",        "RDS",         "rds",       {"x": 8,  "y": 65, "w": 9, "h": 16}),
            ("s3",         "S3",          "s3",        {"x": 20, "y": 65, "w": 9, "h": 16}),
            ("cloudwatch", "CloudWatch",  "cloudwatch",{"x": 32, "y": 65, "w": 9, "h": 16}),

            # BLOCO 4: MENSAGERIA (Base Direito)
            ("sqs",        "SQS",         "sqs",       {"x": 65, "y": 65, "w": 9, "h": 16}),
        ]
        
        # Dependências ajustadas para o novo visual
        deps = {
            "api": ["cloudfront"],
            "sns": ["api"],
            "ec2": ["api"],
            "lambda": ["api", "sns"],
            "dynamodb": ["lambda"],
            "rds": ["ec2", "lambda"],
            "s3": ["lambda", "sqs"],
            "sqs": ["sns"],
            "cloudwatch": ["ec2", "lambda", "rds", "dynamodb", "s3"]
        }
        
        for bid, name, btype, pos in layout:
            self.buildings[bid] = Building(
                id=bid, name=name, type=btype, position=pos,
                depends_on=deps.get(bid, []),
                metrics={"cpu": 20.0, "memory": 40.0, "requests": 0, "errors": 0},
            )

    def snapshot(self):
        return {
            "buildings": [b.model_dump() for b in self.buildings.values()],
            "activeScenario": self.active_scenario,
            "resolvedSteps": self.resolved_steps
        }

    def apply_scenario(self, scenario_id: str):
        scenario = SCENARIOS.get(scenario_id)
        if not scenario: return f"Cenário '{scenario_id}' não encontrado."
        self.reset(silent=True)
        self.active_scenario = scenario_id
        self.resolved_steps = []
        
        target_id = scenario["target"]
        if target_id in self.buildings:
            self.buildings[target_id].status = "critical"
            self.buildings[target_id].health = 10
            self.buildings[target_id].metrics["cpu"] = 95

        for b in self.buildings.values():
            if target_id in b.depends_on or (scenario_id == "cascade" and b.id in ["ec2", "lambda", "sqs"]):
                b.status = "warning"
                b.health = 40
                b.metrics["cpu"] = 80
        return scenario["name"]

    def resolve_step(self, step_index: int):
        if not self.active_scenario: return "Nenhum cenário ativo."
        scenario = SCENARIOS[self.active_scenario]
        if step_index < 0 or step_index >= len(scenario["resolution"]): return "Passo inválido."
        targets = scenario["resolution"][step_index]
        
        for t in targets:
            if t in self.buildings:
                self.buildings[t].status = "healthy"
                self.buildings[t].health = 100
                self.buildings[t].metrics["cpu"] = 30
        
        self.resolved_steps.append(step_index)
        if len(self.resolved_steps) >= len(scenario["plan"]):
            self.active_scenario = None
            return "Recuperação concluída. Status e métricas anteriores restaurados."
        return "Causa corrigida; resolve agora o impacto nos demais serviços."

    def recover(self):
        self.reset(silent=True)
        self.active_scenario = None
        return "Recuperação concluída. Status e métricas anteriores restaurados."

    def reset(self, silent=False):
        self.buildings.clear()
        self._seed()
        self.resolved_steps = []
        if not silent: return "Distrito reiniciado."

    def tick(self):
        if self.active_scenario: return 
        for b in self.buildings.values():
            if b.status in ("warning", "critical"):
                b.health = min(100, b.health + 1.0)
                if b.health > 80: b.status, b.last_event = "healthy", None

district = DistrictState()

async def simulation_loop():
    while True:
        district.tick()
        await asyncio.sleep(2)

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(simulation_loop())
    yield
    task.cancel()

app = FastAPI(lifespan=lifespan)

@app.get("/api/district")
def get_district(): return district.snapshot()

class CommandPayload(BaseModel): command: str

@app.post("/api/command")
def run_command(payload: CommandPayload):
    parts = payload.command.strip().split()
    if not parts: return {"output": ""}
    base = parts[0].lower()
    args = [re.sub(r'[<>]', '', arg) for arg in parts[1:]]

    if base in ["help", "ajuda", "?"]:
        return {"output": (
            "listar   status <serviço>   abrir <serviço>   iniciar <serviço>   parar <serviço>\n"
            "metricas <serviço>   custos   limpar\n"
            "cenarios   simular sobrecarga|banco|fila|cascata|permissao   recuperar\n"
            "solucoes   resolver <ação>\n"
            "Serviços: " + ", ".join(district.buildings.keys())
        )}

    if base == "listar": return {"output": "Serviços: " + ", ".join(district.buildings.keys())}
    
    if base == "status":
        if args and args[0] in district.buildings:
            b = district.buildings[args[0]]
            return {"output": f"{b.name} ({b.id}): {b.status.upper()} | Health: {b.health:.1f}% | CPU: {b.metrics['cpu']:.0f}%"}
        return {"output": "Uso: status <serviço>"}
        
    if base == "iniciar" and args:
        b = district.buildings.get(args[0])
        if b: b.status = "healthy"; b.health = 100; return {"output": f"Serviço {b.id} iniciado."}
        
    if base == "parar" and args:
        b = district.buildings.get(args[0])
        if b: b.status = "destroyed"; b.health = 0; return {"output": f"Serviço {b.id} parado."}
        
    if base == "metricas" and args:
        b = district.buildings.get(args[0])
        if b: return {"output": f"{b.id}: CPU {b.metrics['cpu']:.0f}% | Memória {b.metrics['memory']:.0f}MB | Reqs {b.metrics['requests']}"}
        
    if base == "custos":
        return {"output": f"Custo estimado mensal: US$ {(len(district.buildings) * 5.89):.2f}"}
        
    if base == "cenarios": return {"output": "Cenários: sobrecarga, banco, fila, cascata, permissao"}
    
    if base in ["simular", "chaos"]:
        if not args: return {"output": "Uso: simular <cenário>"}
        sc_id = args[0]
        mapping = {
            "sobrecarga": "traffic_spike", "banco": "database_down",
            "fila": "database_down", "cascata": "cascade", "permissao": "identity_crisis",
            "traffic_spike": "traffic_spike", "database_down": "database_down", 
            "cascade": "cascade", "identity_crisis": "identity_crisis"
        }
        target = mapping.get(sc_id, sc_id)
        if target in SCENARIOS:
            return {"output": district.apply_scenario(target)}
        return {"output": "Cenário inválido."}

    if base in ["recover", "recuperar"]: return {"output": district.recover()}
    
    if base == "solucoes": 
        if not district.active_scenario: return {"output": "Nenhum incidente ativo."}
        return {"output": "Plano disponível. Use 'resolver <0, 1...>'"}
        
    if base in ["resolver", "resolve"] and args:
        try: return {"output": district.resolve_step(int(args[0]))}
        except: return {"output": "Índice inválido."}
    
    return {"output": f"Comando '{base}' desconhecido."}

class StatusPayload(BaseModel): status: str

@app.post("/api/status/{building_id}")
def update_status(building_id: str, payload: StatusPayload):
    b = district.buildings.get(building_id)
    if b:
        b.status = payload.status
        b.health = 100 if payload.status == "healthy" else (40 if payload.status == "warning" else 0)
        district.active_scenario = None 
        return {"ok": True}
    return {"ok": False}

@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            await ws.send_json(district.snapshot())
            await asyncio.sleep(1.5)
    except WebSocketDisconnect: 
        pass