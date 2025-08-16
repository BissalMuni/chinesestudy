import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import SentenceCard from './components/SentenceCard';
import { SentenceData, Sentence } from './types';
import './styles/App.css';

const App: React.FC = () => {
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-08');
  const [selectedDate, setSelectedDate] = useState<string>('2025-08-07');
  const [sentenceData, setSentenceData] = useState<SentenceData | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('Fetching data from /data/sentences202508.json');
        const response = await fetch('/data/sentences202508.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: SentenceData = await response.json();
        console.log('Data loaded successfully:', data);
        console.log('Contents array:', data.contents);
        
        if (!data || !data.contents || !Array.isArray(data.contents) || data.contents.length === 0) {
          throw new Error('Invalid data structure');
        }
        
        // 첫 번째 날짜의 문장들 가져오기
        const firstDateData = data.contents[0];
        console.log('First date data:', firstDateData);
        console.log('Sentences:', firstDateData.sentences);
        
        setSentenceData(data);
        setSentences(firstDateData.sentences);
        
        // 실제 JSON 파일의 날짜들로 설정
        const actualDates = data.contents.map(content => content.date);
        console.log('Actual dates from JSON:', actualDates);
        
        setAvailableFiles(actualDates);
        if (actualDates.length > 0) {
          const firstDate = actualDates[0];
          const month = firstDate.substring(0, 7); // 2025-08
          setSelectedMonth(month);
          setSelectedDate(firstDate);
        }
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : '데이터를 불러올 수 없습니다.');
        setSentences([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // 월 변경 핸들러
  const handleMonthChange = (month: string) => {
    console.log('Month changed to:', month);
    setSelectedMonth(month);
    
    // 해당 월의 첫 번째 날짜 선택
    const monthDates = availableFiles.filter(date => date.startsWith(month));
    if (monthDates.length > 0) {
      setSelectedDate(monthDates[0]);
      // 여기서 새로운 데이터를 로드해야 함 (현재는 2025-08만 있음)
    }
  };

  // 날짜 변경 핸들러
  const handleDateChange = (date: string) => {
    console.log('Date changed to:', date);
    setSelectedDate(date);
    
    // 선택된 날짜에 해당하는 문장 데이터 찾기
    if (sentenceData && sentenceData.contents) {
      const selectedDateData = sentenceData.contents.find(content => content.date === date);
      if (selectedDateData) {
        console.log('Found data for date:', date, selectedDateData);
        setSentences(selectedDateData.sentences);
      } else {
        console.log('No data found for date:', date);
        setSentences([]);
      }
    }
  };


  // 다크 모드 토글
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('isDarkMode', JSON.stringify(newMode));
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>오류 발생</h2>
          <p>{error}</p>
          <p>브라우저 콘솔(F12)을 확인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
      <header className="app-header">
        <div className="header-title">
          <h1>진차이린 중국어</h1>
          <button 
            type="button"
            className="theme-toggle" 
            onClick={toggleDarkMode}
            title={isDarkMode ? "라이트 모드로 변경" : "다크 모드로 변경"}
          >
            {isDarkMode ? '☀️' : '💡'}
          </button>
        </div>
        {/* <div className="date-info">{formatDateDisplay()}</div> */}
      </header>

      {availableFiles.length > 0 && (
        <Navigation
          availableDates={availableFiles}
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
          onMonthChange={handleMonthChange}
          onDateChange={handleDateChange}
        />
      )}

      <main className="content">
        {sentences.length > 0 ? (
          <div className="sentences-container">
            {sentences.map((sentence) => (
              <SentenceCard key={sentence.id} sentence={sentence} />
            ))}
          </div>
        ) : (
          <div className="error">
            <h2>데이터 없음</h2>
            <p>표시할 문장이 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;