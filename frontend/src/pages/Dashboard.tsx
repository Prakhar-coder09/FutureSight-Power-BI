import React from 'react';
import { ExecutiveControlRoom } from '../components/executive/ExecutiveControlRoom';
import { GlobalFilterState } from '../types';

interface DashboardProps {
  filters: GlobalFilterState;
  onNavigateToScenario: () => void;
  onNavigateToRisk: () => void;
  onOpenWarRoom: () => void;
}

export const Dashboard: React.FC<DashboardProps> = (props) => {
  return <ExecutiveControlRoom {...props} />;
};

export default Dashboard;
