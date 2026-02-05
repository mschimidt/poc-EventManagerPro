import React from 'react';
import { formatCurrency } from '../utils/format';

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      color: string;
    }[];
  };
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.datasets.flatMap(ds => ds.data));
  const scale = maxValue > 0 ? maxValue * 1.2 : 1; // Add 20% buffer

  return (
    <div className="h-64 space-y-4">
      <div className="flex h-full w-full gap-4 items-end">
        {data.labels.map((label, index) => (
          <div key={label} className="flex-1 flex flex-col items-center h-full">
            <div className="flex-1 w-full flex items-end justify-center gap-1">
              {data.datasets.map(dataset => (
                <div
                  key={dataset.label}
                  className="w-1/2 rounded-t-sm transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${(dataset.data[index] / scale) * 100}%`,
                    backgroundColor: dataset.color,
                  }}
                  title={`${dataset.label}: ${formatCurrency(dataset.data[index])}`}
                ></div>
              ))}
            </div>
            <span className="text-xs text-slate-500 mt-2">{label}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4 text-sm">
        {data.datasets.map(dataset => (
          <div key={dataset.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: dataset.color }}></span>
            <span>{dataset.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
