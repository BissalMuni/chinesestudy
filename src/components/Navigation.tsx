import React from 'react';

interface NavigationProps {
  availableDates: string[];
  selectedMonth: string;
  selectedDate: string;
  onMonthChange: (month: string) => void;
  onDateChange: (date: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  availableDates,
  selectedMonth,
  selectedDate,
  onMonthChange,
  onDateChange,
}) => {
  const months = [...new Set(availableDates.map(date => date.substring(0, 7)))]; // 2025-08
  const currentMonthDates = availableDates.filter(date => date.startsWith(selectedMonth));

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    return `${year}년 ${monthNum}월`;
  };

  const formatDate = (date: string) => {
    const day = date.split('-')[2];
    return `${day}일`;
  };

  return (
    <nav className="navigation">
      <div className="month-selector">
        <label htmlFor="month-select">Month</label>
        <select 
          id="month-select"
          value={selectedMonth} 
          onChange={(e) => onMonthChange(e.target.value)}
        >
          {months.map(month => (
            <option key={month} value={month}>
              {formatMonth(month)}
            </option>
          ))}
        </select>
      </div>
      
      <div className="date-tabs">
        {currentMonthDates.map(date => (
          <button
            key={date}
            className={`date-tab ${selectedDate === date ? 'active' : ''}`}
            onClick={() => onDateChange(date)}
          >
            {formatDate(date)}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;