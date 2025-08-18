import React from 'react';
import { SentenceData, isCategoryContent } from '../types';

interface NavigationProps {
  availableDates: string[];
  pastMonths: string[];
  presentMonths: string[];
  selectedMonth: string;
  selectedDate: string;
  selectedCategory: string;
  sentenceData: SentenceData | null;
  isDateBased: boolean;
  lastSelectedFolder: string;
  lastSelectedMonth: string;
  onMonthChange: (month: string) => void;
  onDateChange: (date: string) => void;
  onCategoryChange: (category: string) => void;
  onPastMonthChange: (month: string) => void;
  onPresentMonthChange: (month: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  availableDates,
  pastMonths,
  presentMonths,
  selectedMonth,
  selectedDate,
  selectedCategory,
  sentenceData,
  isDateBased,
  lastSelectedFolder,
  lastSelectedMonth,
  onMonthChange,
  onDateChange,
  onCategoryChange,
  onPastMonthChange,
  onPresentMonthChange,
}) => {
  const currentMonthDates = availableDates.filter(date => date.startsWith(selectedMonth));

  // Get categories for category-based structure
  const categories = sentenceData?.contents
    .filter(isCategoryContent)
    .map(content => content.category) || [];

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
      <div className="selectors-container">
        {pastMonths.length > 0 && (
          <div className="past-month-selector">
            <label htmlFor="past-month-select" className="visually-hidden">과거 자료</label>
            <select
              id="past-month-select"
              value={lastSelectedFolder === 'past' ? lastSelectedMonth : ""}
              onChange={(e) => e.target.value && onPastMonthChange(e.target.value)}
            >
              <option value="">과거 자료</option>
              {pastMonths.map(month => (
                <option key={month} value={month}>
                  {formatMonth(month)}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {presentMonths.length > 0 && (
          <div className="present-month-selector">
            <label htmlFor="present-month-select" className="visually-hidden">현재 학습</label>
            <select
              id="present-month-select"
              value={lastSelectedFolder === 'present' ? lastSelectedMonth : ""}
              onChange={(e) => e.target.value && onPresentMonthChange(e.target.value)}
            >
              <option value="">현재 학습</option>
              {presentMonths.map(month => (
                <option key={month} value={month}>
                  {formatMonth(month)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isDateBased ? (
        // Date-based navigation (old format)
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
      ) : (
        // Category-based navigation (new format)
        <div className="category-tabs">
          <button
            className={`category-tab ${selectedCategory === '전체' ? 'active' : ''}`}
            onClick={() => onCategoryChange('전체')}
          >
            전체
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navigation;