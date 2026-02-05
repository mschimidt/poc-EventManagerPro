import React, { useState } from 'react';
import { Budget, BudgetStatus } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  events: Budget[];
}

export const Calendar: React.FC<CalendarProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getStatusColor = (status: string) => {
    switch (status) {
      case BudgetStatus.COMPLETED: return 'bg-green-500';
      case BudgetStatus.SCHEDULED: return 'bg-blue-500';
      case BudgetStatus.DECLINED: return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    // Previous month's days
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ key: `prev-${i}`, day: null, isCurrentMonth: false });
    }
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ key: `${year}-${month}-${i}`, day: i, isCurrentMonth: true, date: new Date(year, month, i) });
    }
    return days;
  };

  const days = generateDays();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 rounded-full hover:bg-slate-100">
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-semibold text-lg capitalize">
          {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 rounded-full hover:bg-slate-100">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map(day => <div key={day} className="font-medium text-xs text-slate-500 py-2">{day}</div>)}
        
        {days.map(({ key, day, isCurrentMonth, date }) => (
          <div key={key} className={`h-24 p-1 border border-slate-100 text-left overflow-hidden ${isCurrentMonth ? 'bg-white' : 'bg-slate-50'}`}>
            {day && <span className={`text-xs ${new Date().toDateString() === date?.toDateString() ? 'bg-indigo-600 text-white rounded-full px-1.5 py-0.5' : ''}`}>{day}</span>}
            <div className="mt-1 space-y-1">
              {date && events.filter(e => new Date(e.eventDate).toDateString() === date.toDateString()).map(event => (
                <div key={event.id} className="text-xs text-white p-1 rounded-md truncate" style={{ backgroundColor: getStatusColor(event.status).replace('bg-', '') }}>
                  {event.eventName}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
