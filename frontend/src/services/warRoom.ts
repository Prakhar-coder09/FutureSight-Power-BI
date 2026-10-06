import { api } from './api';
import {
  WarRoomState,
  ImpactGraph,
  CopilotResponse,
  WarRoomTask,
  WarRoomDecision,
  PostmortemData,
  WarRoomResponse
} from '../types';

export const warRoomService = {
  getCurrentState: (): Promise<WarRoomState> => api.getWarRoomCurrent(),
  getImpactMap: (): Promise<ImpactGraph> => api.getWarRoomImpactMap(),
  queryCopilot: (query: string): Promise<CopilotResponse> => api.postWarRoomCopilot(query),
  updateStatus: (status: WarRoomState['status'], user?: string) => api.postWarRoomStatus(status, user),
  addTask: (task: Partial<WarRoomTask>) => api.postWarRoomTask(task),
  addDecision: (decision: Partial<WarRoomDecision>) => api.postWarRoomDecision(decision),
  runSimulation: (params: any): Promise<WarRoomResponse> => api.postWarRoomSimulation(params),
  getPostmortem: (): Promise<PostmortemData> => api.getWarRoomPostmortem()
};

export default warRoomService;
