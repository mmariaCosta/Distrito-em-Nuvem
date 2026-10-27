import { useEffect, useState } from 'react';
import type { BuildingData } from '../types';

export function useDistrict() {
  const [buildings, setBuildings] = useState<BuildingData[]>([]);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [resolvedSteps, setResolvedSteps] = useState<number[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const mappedBuildings = data.buildings.map((b: any) => ({
        ...b,
        dependsOn: b.depends_on
      }));
      setBuildings(mappedBuildings);
      setActiveScenario(data.activeScenario);
      setResolvedSteps(data.resolvedSteps || []);
    };

    return () => ws.close();
  }, []);

  return { buildings, activeScenario, resolvedSteps, connected };
}