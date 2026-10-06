import React from 'react';
import { History, Activity } from 'lucide-react';
import { WarRoomEvent } from '../../types';

interface WarRoomTimelineProps {
  events: WarRoomEvent[];
}

export const WarRoomTimeline: React.FC<WarRoomTimelineProps> = ({ events }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          War Room Operating Lifecycle Timeline
        </h3>
        <span className="text-xs font-mono text-slate-400">{events.length} Historical Events</span>
      </div>

      <div className="space-y-3">
        {events.map((ev, i) => (
          <div key={ev.event_id || i} className="flex items-start gap-3 p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
            <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md shrink-0 mt-0.5">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{ev.summary}</span>
                <span className="text-[10px] font-mono text-slate-400">{ev.timestamp}</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{ev.details}</p>
              <div className="text-[10px] font-mono text-slate-500 mt-1">Actor: {ev.actor}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
