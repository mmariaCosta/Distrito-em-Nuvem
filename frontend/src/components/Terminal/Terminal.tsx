import { useState, useRef, useEffect } from 'react';
import { Minus, Square, X, Trash2 } from 'lucide-react';

export default function Terminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ text: string, type: 'info' | 'error' | 'success' | 'command' }[]>([
    { text: 'Distrito em Nuvem [versão 1.0.0]', type: 'info' },
    { text: 'Conectado ao ambiente de simulação. Nenhum recurso AWS real será alterado.', type: 'info' },
    { text: "Digite ajuda para explorar os comandos disponíveis.", type: 'info' },
  ]);
  
  const [windowState, setWindowState] = useState<'normal' | 'minimized' | 'maximized' | 'closed'>('normal');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, windowState]);

  useEffect(() => {
    const handleExternalLog = (e: CustomEvent) => {
      const { text, type } = e.detail;
      setHistory((prev) => [...prev, { text, type: type || 'info' }]);
    };
    window.addEventListener('terminal-log' as any, handleExternalLog);
    return () => window.removeEventListener('terminal-log' as any, handleExternalLog);
  }, []);

  const handleCommand = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim() !== '') {
      const cmd = input.trim();
      setHistory((prev) => [...prev, { text: `visitante@distrito:~ $ ${cmd}`, type: 'command' }]);
      setInput('');

      if (cmd === 'clear' || cmd === 'limpar') {
        setHistory([]);
        return;
      }

      try {
        const res = await fetch('/api/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: cmd }),
        });
        const data = await res.json();
        setHistory((prev) => [...prev, { text: data.output, type: 'info' }]);
      } catch (err) {
        setHistory((prev) => [...prev, { text: 'Erro: Back-end offline.', type: 'error' }]);
      }
    }
  };

  const getHeightClass = () => {
    if (windowState === 'closed') return 'hidden';
    if (windowState === 'minimized') return 'h-[38px]';
    if (windowState === 'maximized') return 'h-[60vh]'; 
    return 'h-full'; 
  };

  if (windowState === 'closed') return null;

  return (
    <div className={`flex flex-col w-full bg-[#181818] text-[#cccccc] font-mono text-[12px] border border-[#333] rounded-md overflow-hidden transition-all duration-300 ${getHeightClass()}`}>
      
      {/* HEADER IDÊNTICO */}
      <div className="flex items-center justify-between bg-[#252526] px-3 h-[38px] border-b border-[#333] select-none flex-none">
        <div className="flex items-center gap-4 h-full">
          <div className="flex items-center gap-1 text-[#cccccc]">
            <span className="text-[10px] font-bold font-mono">{'>'}_</span>
            <span className="text-slate-300 font-sans text-[11px] font-medium ml-1">Terminal do distrito</span>
          </div>
          
          <div className="flex items-center h-[38px] bg-[#181818] px-3 border-t-2 border-transparent border-b-2 border-b-[#007acc] mt-[1px]">
            <span className="text-slate-300 text-[10px] font-sans">bash</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-slate-400">
          <Trash2 size={13} className="hover:text-white cursor-pointer" onClick={() => setHistory([])} />
          <Minus size={14} className="hover:text-white cursor-pointer" onClick={() => setWindowState('minimized')} />
          <Square size={11} className="hover:text-white cursor-pointer" onClick={() => setWindowState(windowState === 'maximized' ? 'normal' : 'maximized')} />
          <X size={15} className="hover:text-white cursor-pointer" onClick={() => setWindowState('closed')} />
        </div>
      </div>
      
      {/* BODY SEM ESPAÇAMENTOS, TUDO COLADO IGUAL AO PRINT */}
      {windowState !== 'minimized' && (
        <div className="flex-1 overflow-y-auto p-3 font-mono text-[12px] leading-[1.6]">
          {history.map((line, i) => (
            <div key={i} className={`whitespace-pre-wrap ${line.type === 'command' ? 'text-white' : 'text-[#cccccc]'}`}>
              {line.text}
            </div>
          ))}
          
          {/* PROMPT IDÊNTICO */}
          <div className="flex items-center mt-1">
            <span className="text-[#4ec9b0]">visitante@distrito</span>
            <span className="text-[#cccccc]">:~ $</span>
            <input
              type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleCommand}
              placeholder="Digite um comando..."
              className="flex-1 bg-transparent outline-none border-none text-[#cccccc] focus:ring-0 p-0 ml-2 placeholder:text-slate-600"
              autoFocus autoComplete="off" spellCheck="false"
            />
          </div>
          <div ref={endRef} />
        </div>
      )}

      {/* SEM FOOTER! TERMINA AQUI. */}
    </div>
  );
}