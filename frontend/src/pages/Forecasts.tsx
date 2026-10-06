import React from 'react';
import { ForecastStudio } from '../components/forecast/ForecastStudio';
import { GlobalFilterState } from '../types';

interface ForecastsProps {
  filters: GlobalFilterState;
}

export const Forecasts: React.FC<ForecastsProps> = ({ filters }) => {
  return <ForecastStudio filters={filters} />;
};

export default Forecasts;
