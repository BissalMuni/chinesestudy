import React, { useState, useEffect, useCallback } from 'react';
import Navigation from './components/Navigation';
import SentenceCard from './components/SentenceCard';
import { SentenceData, Sentence, isDateBasedContent, isCategoryContent, ContentSection } from './types';
import './styles/App.css';

const App: React.FC = () => {
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [pastMonths, setPastMonths] = useState<string[]>([]);
  const [presentMonths, setPresentMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-08');
  const [selectedDate, setSelectedDate] = useState<string>('2025-08-07');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory] = useState<string>(''); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [lastSelectedFolder, setLastSelectedFolder] = useState<string>(() => {
    return localStorage.getItem('lastSelectedFolder') || '';
  });
  const [lastSelectedMonth, setLastSelectedMonth] = useState<string>(() => {
    return localStorage.getItem('lastSelectedMonth') || '';
  });
  const [sentenceData, setSentenceData] = useState<SentenceData | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isDateBased, setIsDateBased] = useState<boolean>(false);

  // 폴더에서 데이터 로드하는 공통 함수
  const loadDataFromFolder = useCallback(async (folder: 'past' | 'present', month: string) => {
    setLoading(true);
    setError('');
    
    try {
      // 폴더에서 데이터 로드 (202201.json 형식)
      const monthCode = month.replace('-', '');
      const response = await fetch(`/data/${folder}/${monthCode}.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SentenceData = await response.json();
      console.log(`${folder} data loaded successfully:`, data);
      
      if (!data || !data.contents || !Array.isArray(data.contents) || data.contents.length === 0) {
        throw new Error('Invalid data structure');
      }
      
      setSentenceData(data);
      
      // Check format and set initial data
      const firstContent = data.contents[0];
      if (isDateBasedContent(firstContent)) {
        setIsDateBased(true);
        setSentences(firstContent.sentences);
        const actualDates = data.contents
          .filter(isDateBasedContent)
          .map(content => content.date);
        setAvailableFiles(actualDates);
        if (actualDates.length > 0) {
          setSelectedMonth(month);
          setSelectedDate(actualDates[0]);
        }
      } else if (isCategoryContent(firstContent)) {
        setIsDateBased(false);
        setSelectedCategory('전체');
        // createContentSections will be called in a separate useEffect
      }
    } catch (err) {
      console.error(`Error loading ${folder} data:`, err);
      setError(err instanceof Error ? err.message : `${folder} 데이터를 불러올 수 없습니다.`);
      setSentences([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 컨텐츠 섹션 생성 (서브카테고리 구분선 포함)
  const createContentSections = useCallback((category: string) => {
    if (!sentenceData || !sentenceData.contents) return [];
    
    const sections: ContentSection[] = [];
    let idCounter = 1;
    
    if (category === '전체') {
      // 전체 선택 시 모든 카테고리와 서브카테고리 표시
      sentenceData.contents
        .filter(isCategoryContent)
        .forEach(categoryContent => {
          // 카테고리 구분선
          sections.push({
            type: 'divider',
            dividerText: categoryContent.category
          });
          
          categoryContent.subcategories.forEach(subcategory => {
            // 서브카테고리 구분선
            sections.push({
              type: 'divider',
              dividerText: subcategory.subcategory
            });
            
            // 문장들
            subcategory.sentences.forEach(sentence => {
              sections.push({
                type: 'sentence',
                sentence: {
                  ...sentence,
                  id: idCounter++
                }
              });
            });
          });
        });
    } else {
      // 특정 카테고리 선택 시
      const categoryData = sentenceData.contents
        .filter(isCategoryContent)
        .find(content => content.category === category);
      
      if (categoryData) {
        categoryData.subcategories.forEach(subcategory => {
          // 서브카테고리 구분선
          sections.push({
            type: 'divider',
            dividerText: subcategory.subcategory
          });
          
          // 문장들
          subcategory.sentences.forEach(sentence => {
            sections.push({
              type: 'sentence',
              sentence: {
                ...sentence,
                id: idCounter++
              }
            });
          });
        });
      }
    }
    
    return sections;
  }, [sentenceData]);

  // 과거 및 현재 월 목록 로드
  useEffect(() => {
    const loadAllMonths = async () => {
      try {
        // 과거 파일 목록 로드
        const pastManifestResponse = await fetch('/data/past/manifest.json');
        if (pastManifestResponse.ok) {
          const pastManifest = await pastManifestResponse.json();
          const pastFiles = pastManifest.files || [];
          
          // 파일명에서 월 정보 추출 (202201.json -> 2022-01)
          const pastMonths = pastFiles.map((filename: string) => {
            const match = filename.match(/(\d{4})(\d{2})\.json/);
            if (match) {
              return `${match[1]}-${match[2]}`;
            }
            return null;
          }).filter(Boolean);
          
          setPastMonths(pastMonths);
          console.log('Past months loaded:', pastMonths);
        }
        
        // 현재 파일 목록 로드
        const presentManifestResponse = await fetch('/data/present/manifest.json');
        if (presentManifestResponse.ok) {
          const presentManifest = await presentManifestResponse.json();
          const presentFiles = presentManifest.files || [];
          
          // 파일명에서 월 정보 추출 (202508.json -> 2025-08)
          const presentMonths = presentFiles.map((filename: string) => {
            const match = filename.match(/(\d{4})(\d{2})\.json/);
            if (match) {
              return `${match[1]}-${match[2]}`;
            }
            return null;
          }).filter(Boolean);
          
          setPresentMonths(presentMonths);
          console.log('Present months loaded:', presentMonths);
        }
      } catch (err) {
        console.error('Error loading months:', err);
      }
    };
    loadAllMonths();
  }, []);

  // 카테고리 기반 데이터일 때 기본 컨텐츠 섹션 설정
  useEffect(() => {
    if (sentenceData && !isDateBased && selectedCategory === '전체') {
      const sections = createContentSections('전체');
      setContentSections(sections);
      
      const sentencesOnly = sections
        .filter(section => section.type === 'sentence')
        .map(section => section.sentence!)
        .filter(Boolean);
      setSentences(sentencesOnly);
    }
  }, [sentenceData, isDateBased, selectedCategory, createContentSections]);


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

  // 과거 월 선택 핸들러
  const handlePastMonthChange = async (month: string) => {
    console.log('Past month selected:', month);
    localStorage.setItem('lastSelectedFolder', 'past');
    localStorage.setItem('lastSelectedMonth', month);
    setLastSelectedFolder('past');
    setLastSelectedMonth(month);
    await loadDataFromFolder('past', month);
  };
  
  // 현재 월 선택 핸들러
  const handlePresentMonthChange = async (month: string) => {
    console.log('Present month selected:', month);
    localStorage.setItem('lastSelectedFolder', 'present');
    localStorage.setItem('lastSelectedMonth', month);
    setLastSelectedFolder('present');
    setLastSelectedMonth(month);
    await loadDataFromFolder('present', month);
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: string) => {
    console.log('Category changed to:', category);
    setSelectedCategory(category);
    
    // 컨텐츠 섹션 생성 (서브카테고리 구분선 포함)
    const sections = createContentSections(category);
    setContentSections(sections);
    
    // 기존 sentences도 업데이트 (호환성을 위해 유지)
    const sentencesOnly = sections
      .filter(section => section.type === 'sentence')
      .map(section => section.sentence!)
      .filter(Boolean);
    setSentences(sentencesOnly);
  };


  // 날짜 변경 핸들러
  const handleDateChange = (date: string) => {
    console.log('Date changed to:', date);
    setSelectedDate(date);
    
    // 선택된 날짜에 해당하는 문장 데이터 찾기
    if (sentenceData && sentenceData.contents) {
      const selectedDateData = sentenceData.contents
        .filter(isDateBasedContent)
        .find(content => content.date === date);
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

      {(availableFiles.length > 0 || sentenceData || pastMonths.length > 0 || presentMonths.length > 0) && (
        <Navigation
          availableDates={availableFiles}
          pastMonths={pastMonths}
          presentMonths={presentMonths}
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
          selectedCategory={selectedCategory}
          sentenceData={sentenceData}
          isDateBased={isDateBased}
          lastSelectedFolder={lastSelectedFolder}
          lastSelectedMonth={lastSelectedMonth}
          onMonthChange={handleMonthChange}
          onDateChange={handleDateChange}
          onCategoryChange={handleCategoryChange}
          onPastMonthChange={handlePastMonthChange}
          onPresentMonthChange={handlePresentMonthChange}
        />
      )}

      <main className="content">
        {contentSections.length > 0 ? (
          <div className="content-container">
            {contentSections.map((section, index) => (
              section.type === 'divider' ? (
                <div key={`divider-${index}`} className="subcategory-divider">
                  <h3>{section.dividerText}</h3>
                </div>
              ) : (
                section.sentence && (
                  <SentenceCard key={section.sentence.id} sentence={section.sentence} />
                )
              )
            ))}
          </div>
        ) : sentences.length > 0 ? (
          <div className="sentences-container">
            {sentences.map((sentence) => (
              <SentenceCard key={sentence.id} sentence={sentence} />
            ))}
          </div>
        ) : (
          <div className="error">
            <h2>환영합니다!</h2>
            <p>위에서 학습할 자료를 선택해주세요.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;