import React, { useState } from 'react';
import { Budget, BudgetStatus } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  events: Budget[];
}

export const Calendar: React.FC<CalendarProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const changeMonth = (offset: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

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
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay();

    const days = [];
    // Adiciona células em branco para os dias do mês anterior
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ key: `prev-${i}`, day: null, isCurrentMonth: false, date: null });
    }

    // Adiciona células para cada dia do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      // Usa UTC para criar uma string de data 'YYYY-MM-DD' estável, independentemente do fuso horário do usuário.
      const date = new Date(Date.UTC(year, month, i));
      days.push({ key: date.toISOString(), day: i, isCurrentMonth: true, date });
    }
    return days;
  };

  const days = generateDays();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Obtém a data de hoje como uma string 'YYYY-MM-DD' a partir da hora local.
  const today = new Date();
  const todayUTCString = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())).toISOString().slice(0, 10);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100">
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-semibold text-lg capitalize">
          {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map(day => <div key={day} className="font-medium text-xs text-slate-500 py-2">{day}</div>)}
        
        {days.map(({ key, day, isCurrentMonth, date }) => {
          const dateUTCString = date ? date.toISOString().slice(0, 10) : null;
          const isToday = dateUTCString === todayUTCString;
          
          return (
            <div key={key} className={`h-24 p-1 border border-slate-100 text-left overflow-hidden ${isCurrentMonth ? 'bg-white' : 'bg-slate-50'}`}>
              {day && <span className={`text-xs ${isToday ? 'bg-indigo-600 text-white rounded-full px-1.5 py-0.5' : ''}`}>{day}</span>}
              <div className="mt-1 space-y-1">
                {dateUTCString && events.filter(e => e.eventDate === dateUTCString).map(event => (
                  <div key={event.id} className={`text-xs text-white p-1 rounded-md truncate ${getStatusColor(event.status)}`}>
                    {event.eventName}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};