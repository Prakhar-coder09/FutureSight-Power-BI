import React from 'react';
import { ListTodo, PlusCircle } from 'lucide-react';
import { WarRoomTask } from '../../types';

interface TeamCommandCenterProps {
  tasks: WarRoomTask[];
  onOpenTaskModal: () => void;
}

export const TeamCommandCenter: React.FC<TeamCommandCenterProps> = ({ tasks, onOpenTaskModal }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-indigo-400" />
            Cross-Functional Team Command Board
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track operational and commercial assignments across Operations, Marketing, Sales, Procurement, and Finance.
          </p>
        </div>
        <button
          onClick={onOpenTaskModal}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Assign New Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map(task => (
          <div
            key={task.task_id}
            className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-slate-400 text-[10px]">{task.task_id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  task.priority === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : task.priority === 'HIGH'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {task.priority}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{task.title}</h4>
              <p className="text-xs text-slate-400 mb-2">{task.notes}</p>
              <div className="text-[11px] text-emerald-400 font-mono mb-3">
                Impact: {task.expected_impact}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">{task.department}</div>
                <div className="text-slate-200 font-medium">{task.owner}</div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                task.status === 'Completed'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : task.status === 'In Progress'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {task.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
