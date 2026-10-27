import { useEffect, useRef, useState } from 'react';
import { ChevronRight, Maximize2, Minus, Terminal as TerminalIcon, Trash2, X } from 'lucide-react';
import { runCommand, type CommandResult, type Service, type ResolutionContext } from '../lib/district';

export function DistrictTerminal({
  services, onResult, incident = 'idle', event, resolution,
}: {
  services: Service[];
  onResult: (result: CommandResult) => void;
  incident?: 'idle' | 'active' | 'recovering';
  event?: { text: string; id: number } | undefined;
  resolution?: ResolutionContext | undefined;
}) {
  const [lines, setLines] = useState([
    { text: 'Distrito em Nuvem [versão 1.0.0]', type: 'info' },
    { text: 'Conectado ao ambiente de simulação. Nenhum recurso AWS real será alterado.', type: 'muted' },
    { text: 'Digite ajuda para explorar os comandos disponíveis.', type: 'muted' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const output = useRef<HTMLDivElement>(null);

  useEffect(() => {
    output.current?.scrollTo({ top: output.current.scrollHeight });
  }, [lines]);

  useEffect(() => {
    if (event) setLines((prev) => [...prev, { text: `[simulação] ${event.text}`, type: 'info' }]);
  }, [event]);

  function submit(command: string) {
    if (!command.trim()) return;
    const result = runCommand(command, services, incident, resolution);

    setLines((previous) =>
      result.clear ? [] : [
        ...previous,
        { text: `visitante@distrito:~ $ ${command}`, type: 'command' },
        ...result.lines.map((text) => ({ text, type: 'info' })),
      ]
    );

    setHistory((previous) => [...previous, command]);
    setCursor(history.length + 1);
    setInput('');
    onResult(result);
  }

  // MÁGICA AQUI: Escuta comandos vindos da UI e os executa como se fossem digitados
  const submitRef = useRef(submit);
  useEffect(() => { submitRef.current = submit; });

  useEffect(() => {
    const handleUICommand = (e: CustomEvent) => {
      submitRef.current(e.detail);
    };
    window.addEventListener('ui-command', handleUICommand as EventListener);
    return () => window.removeEventListener('ui-command', handleUICommand as EventListener);
  }, []);

  return (
    <section className={`terminal ${expanded ? 'terminal-expanded' : ''}`}>
      <header className="terminal-header">
        <div className="flex items-center gap-3">
          <TerminalIcon size={16} />
          <span className="font-medium text-[11px]">Terminal do distrito</span>
          <span className="terminal-shell">bash</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setLines([])} className="p-1 hover:text-white"><Trash2 size={14} /></button>
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:text-white"><Minus size={14} /></button>
          <button onClick={() => { setExpanded(!expanded); setCollapsed(false); }} className="p-1 hover:text-white"><Maximize2 size={14} /></button>
          <button onClick={() => setCollapsed(true)} className="p-1 hover:text-white"><X size={15} /></button>
        </div>
      </header>

      {!collapsed && (
        <>
          <div className="terminal-output" ref={output}>
            {lines.map((line, i) => (
              <div className={`terminal-line ${line.type}`} key={i}>{line.text}</div>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); submit(input); }} className="terminal-input">
            <span>visitante<span className="terminal-at">@distrito</span><span className="terminal-path">:~</span> $</span>
            <input
              value={input} onChange={(e) => setInput(e.target.value)} autoComplete="off" spellCheck={false} placeholder="Digite um comando..."
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  const next = Math.max(0, Math.min(history.length, cursor + (e.key === 'ArrowUp' ? -1 : 1)));
                  setCursor(next); setInput(history[next] ?? '');
                }
              }}
            />
            <button type="submit" className="p-1 hover:text-white"><ChevronRight size={16} /></button>
          </form>

          <div className="terminal-footer">
            <span><i className="status-dot" /> Sessão local</span>
            <span>us-east-1 <span className="mx-2">/</span> ambiente simulado</span>
          </div>
        </>
      )}
    </section>
  );
}