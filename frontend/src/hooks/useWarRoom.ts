import { useState, useEffect } from 'react';
import { WarRoomState, ImpactGraph, PostmortemData } from '../types';
import { warRoomService } from '../services/warRoom';

export function useWarRoom() {
  const [state, setState] = useState<WarRoomState | null>(null);
  const [impactGraph, setImpactGraph] = useState<ImpactGraph | null>(null);
  const [postmortem, setPostmortem] = useState<PostmortemData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchState() {
      setLoading(true);
      try {
        const [curr, graph, pm] = await Promise.all([
          warRoomService.getCurrentState(),
          warRoomService.getImpactMap(),
          warRoomService.getPostmortem()
        ]);
        setState(curr);
        setImpactGraph(graph);
        setPostmortem(pm);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch War Room state');
      } finally {
        setLoading(false);
      }
    }
    fetchState();
  }, []);

  return { state, impactGraph, postmortem, loading, error, setState };
}
