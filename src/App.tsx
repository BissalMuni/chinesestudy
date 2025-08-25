import React, { useState, useEffect, useCallback } from 'react';
import Navigation from './components/Navigation';
import SentenceCard from './components/SentenceCard';
import { SentenceData, Sentence, isDateBasedContent, isCategoryContent, isDayContent, ContentSection, DayContent } from './types';
import './styles/App.css';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'recently' | 'integrated'>('home');
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [pastMonths, setPastMonths] = useState<string[]>([]);
  const [presentMonths, setPresentMonths] = useState<string[]>([]);
  const [integratedFiles, setIntegratedFiles] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return localStorage.getItem('selectedMonth') || '2025-08';
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return localStorage.getItem('selectedDate') || '2025-08-07';
  });
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    return localStorage.getItem('selectedCategory') || '';
  });
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
  const [isDateBased, setIsDateBased] = useState<boolean>(() => {
    const saved = localStorage.getItem('isDateBased');
    return saved ? JSON.parse(saved) : false;
  });

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
      
      // 새로운 JSON 구조 처리
      const firstContent = data.contents[0];
      if (isDayContent(firstContent)) {
        // 새로운 구조: day와 content를 가진 형식
        setIsDateBased(false); // 카테고리 기반으로 처리
        localStorage.setItem('isDateBased', JSON.stringify(false));
        
        // 사용 가능한 날짜들 설정
        const days = data.contents
          .filter((content: any) => content.day)
          .map((content: any) => content.day);
        
        if (days.length > 0) {
          setSelectedMonth(month);
          localStorage.setItem('selectedMonth', month);
          
          // 첫 번째 날짜 선택
          const firstDay = days[0];
          const dateStr = `${month}-${String(firstDay).padStart(2, '0')}`;
          setSelectedDate(dateStr);
          localStorage.setItem('selectedDate', dateStr);
          
          // 첫 번째 날짜의 데이터로 초기화
          const firstDayContent = data.contents[0];
          if (isDayContent(firstDayContent) && firstDayContent.content && firstDayContent.content.length > 0) {
            const savedCategory = localStorage.getItem('selectedCategory') || '전체';
            setSelectedCategory(savedCategory);
            localStorage.setItem('selectedCategory', savedCategory);
          }
        }
      } else if (isDateBasedContent(firstContent)) {
        // 기존 날짜 기반 구조
        setIsDateBased(true);
        localStorage.setItem('isDateBased', JSON.stringify(true));
        setSentences(firstContent.sentences);
        const actualDates = data.contents
          .filter(isDateBasedContent)
          .map(content => content.date);
        setAvailableFiles(actualDates);
        if (actualDates.length > 0) {
          setSelectedMonth(month);
          localStorage.setItem('selectedMonth', month);
          const savedDate = localStorage.getItem('selectedDate');
          const dateToSelect = savedDate && actualDates.includes(savedDate) ? savedDate : actualDates[0];
          setSelectedDate(dateToSelect);
          localStorage.setItem('selectedDate', dateToSelect);
        }
      } else if (isCategoryContent(firstContent)) {
        // 기존 카테고리 기반 구조
        setIsDateBased(false);
        localStorage.setItem('isDateBased', JSON.stringify(false));
        const savedCategory = localStorage.getItem('selectedCategory') || '전체';
        setSelectedCategory(savedCategory);
        localStorage.setItem('selectedCategory', savedCategory);
      }
    } catch (err) {
      console.error(`Error loading ${folder} data:`, err);
      setError(err instanceof Error ? err.message : `${folder} 데이터를 불러올 수 없습니다.`);
      setSentences([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 특정 날짜의 컨텐츠 섹션 생성
  const createContentSectionsForDay = useCallback((dayContent: DayContent) => {
    const sections: ContentSection[] = [];
    let idCounter = 1;
    
    if (dayContent.content) {
      dayContent.content.forEach((categoryData: any) => {
        // 카테고리 구분선
        sections.push({
          type: 'divider',
          dividerText: categoryData.category
        });
        
        categoryData.subcategories.forEach((subcategory: any) => {
          // 서브카테고리 구분선
          sections.push({
            type: 'divider',
            dividerText: subcategory.subcategory
          });
          
          // 문장들
          subcategory.sentences.forEach((sentence: any) => {
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
    }
    
    return sections;
  }, []);

  // 컨텐츠 섹션 생성 (카테고리별)
  const createContentSections = useCallback((category: string) => {
    if (!sentenceData || !sentenceData.contents) return [];
    
    const sections: ContentSection[] = [];
    let idCounter = 1;
    
    // 선택된 날짜의 데이터 가져오기
    const day = parseInt(selectedDate.split('-')[2]);
    const dayContent = sentenceData.contents.find((content): content is DayContent => isDayContent(content) && content.day === day);
    
    if (!dayContent || !dayContent.content) return [];
    
    if (category === '전체') {
      // 전체 선택 시 해당 날짜의 모든 카테고리 표시
      return createContentSectionsForDay(dayContent);
    } else {
      // 특정 카테고리 선택 시
      const categoryData = dayContent.content.find((cat: any) => cat.category === category);
      
      if (categoryData) {
        categoryData.subcategories.forEach((subcategory: any) => {
          // 서브카테고리 구분선
          sections.push({
            type: 'divider',
            dividerText: subcategory.subcategory
          });
          
          // 문장들
          subcategory.sentences.forEach((sentence: any) => {
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
  }, [sentenceData, selectedDate, createContentSectionsForDay]);

  // 과거 및 현재 월 목록 로드, 통합 파일 목록 로드
  useEffect(() => {
    const loadAllMonths = async () => {
      try {
        // Past months 로드
        const pastResponse = await fetch('/data/past/manifest.json');
        if (pastResponse.ok) {
          const pastData = await pastResponse.json();
          const pastMonths = pastData.files.map((file: string) => {
            const match = file.match(/(\d{4})(\d{2})\.json$/);
            if (match) {
              return `${match[1]}-${match[2]}`;
            }
            return null;
          }).filter(Boolean);
          
          setPastMonths(pastMonths);
          console.log('Past months loaded:', pastMonths);
        }
        
        // Present months 로드
        const presentResponse = await fetch('/data/present/manifest.json');
        if (presentResponse.ok) {
          const presentData = await presentResponse.json();
          const presentMonths = presentData.files.map((file: string) => {
            const match = file.match(/(\d{4})(\d{2})\.json$/);
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
    
    const loadIntegratedFiles = () => {
      // 통합 폴더의 파일 목록 (수동으로 설정)
      const files = [
        '01_초급반_제1-10과.txt',
        '02_중급반_제11-25과.txt', 
        '03_고급반_제26-40과.txt',
        '04_실전회화_제41-50과.txt',
        '05_패턴.txt',
        '05_패턴_제1-90과.txt',
        'reorganized_chinese_materials.txt',
        '패런_원본.txt'
      ];
      setIntegratedFiles(files);
      console.log('Integrated files loaded:', files);
    };
    
    loadAllMonths();
    loadIntegratedFiles();
  }, []);

  // 통합 파일 로드 함수
  const loadIntegratedFile = useCallback(async (fileName: string) => {
    setLoading(true);
    setError('');
    
    try {
      // txt 파일을 import로 불러올 수 없으므로 임시로 빈 데이터 설정
      console.log('Loading integrated file:', fileName);
      
      // TODO: 실제 파일 로딩 로직 구현 필요
      // 임시로 빈 SentenceData 객체 생성
      const mockData: SentenceData = {
        month: '통합',
        language: '중국어',
        contents: []
      };
      
      setSentenceData(mockData);
      setIsDateBased(false);
      localStorage.setItem('isDateBased', JSON.stringify(false));
      
      // 임시 문장 데이터 (실제 파일 파싱 후 교체 예정)
      const mockSentences: Sentence[] = [
        {
          id: 1,
          sentence: '你好',
          'meaning-korean': '안녕하세요',
          'meaning-english': 'Hello',
          pinyin: 'nǐ hào',
          words: [
            {
              chinese: '你好',
              pinyin: 'nǐ hào',
              korean: '안녕하세요',
              english: 'hello',
              type: 'greeting'
            }
          ]
        }
      ];
      
      setSentences(mockSentences);
      setContentSections([]);
      
    } catch (err) {
      console.error('Error loading integrated file:', err);
      setError(err instanceof Error ? err.message : '통합 파일을 불러올 수 없습니다.');
      setSentences([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 페이지 로드 시 저장된 상태 복원
  useEffect(() => {
    const loadSavedState = async () => {
      const savedFolder = localStorage.getItem('lastSelectedFolder');
      const savedMonth = localStorage.getItem('lastSelectedMonth');
      
      if (savedFolder && savedMonth && (savedFolder === 'past' || savedFolder === 'present')) {
        try {
          console.log('Restoring saved state:', savedFolder, savedMonth);
          await loadDataFromFolder(savedFolder, savedMonth);
        } catch (error) {
          console.error('Error restoring saved state:', error);
        }
      }
    };
    
    loadSavedState();
  }, [loadDataFromFolder]);

  // 날짜 기반 데이터일 때 저장된 날짜로 복원
  useEffect(() => {
    if (sentenceData && isDateBased && selectedDate) {
      const selectedDateData = sentenceData.contents
        .filter(isDateBasedContent)
        .find(content => content.date === selectedDate);
      if (selectedDateData) {
        setSentences(selectedDateData.sentences);
      }
    }
  }, [sentenceData, isDateBased, selectedDate]);

  // 카테고리 기반 데이터일 때 컨텐츠 섹션 설정
  useEffect(() => {
    if (sentenceData && !isDateBased && selectedCategory) {
      const sections = createContentSections(selectedCategory);
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
    localStorage.setItem('selectedMonth', month);
    
    // 해당 월의 첫 번째 날짜 선택
    const monthDates = availableFiles.filter(date => date.startsWith(month));
    if (monthDates.length > 0) {
      setSelectedDate(monthDates[0]);
      localStorage.setItem('selectedDate', monthDates[0]);
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
    setCurrentScreen('recently'); // Stay on recently screen to show study interface
  };
  
  // 현재 월 선택 핸들러
  const handlePresentMonthChange = async (month: string) => {
    console.log('Present month selected:', month);
    localStorage.setItem('lastSelectedFolder', 'present');
    localStorage.setItem('lastSelectedMonth', month);
    setLastSelectedFolder('present');
    setLastSelectedMonth(month);
    await loadDataFromFolder('present', month);
    setCurrentScreen('recently'); // Stay on recently screen to show study interface
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: string) => {
    console.log('Category changed to:', category);
    setSelectedCategory(category);
    localStorage.setItem('selectedCategory', category);
    
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


  // 날짜 변경 핸들러 (새로운 JSON 구조 지원)
  const handleDateChange = (date: string) => {
    console.log('Date changed to:', date);
    setSelectedDate(date);
    localStorage.setItem('selectedDate', date);
    
    // 새로운 JSON 구조에서 day로 데이터 찾기
    if (sentenceData && sentenceData.contents) {
      const day = parseInt(date.split('-')[2]);
      const dayContent = sentenceData.contents.find((content): content is DayContent => isDayContent(content) && content.day === day);
      
      if (dayContent && dayContent.content) {
        // 첫 번째 카테고리를 기본으로 선택
        const firstCategory = dayContent.content[0]?.category || '전체';
        setSelectedCategory(firstCategory);
        localStorage.setItem('selectedCategory', firstCategory);
        
        // 해당 날짜의 모든 문장을 contentSections로 설정
        const sections = createContentSectionsForDay(dayContent);
        setContentSections(sections);
        
        const sentencesOnly = sections
          .filter(section => section.type === 'sentence')
          .map(section => section.sentence!)
          .filter(Boolean);
        setSentences(sentencesOnly);
      } else {
        console.log('No data found for day:', day);
        setSentences([]);
        setContentSections([]);
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
        <div className="error-message">
          오류: {error}
        </div>
      </div>
    );
  }

  // 홈 화면 렌더링
  const renderHomeScreen = () => (
    <div className="home-screen">
      <header className="app-header">
        <h1 className="app-title">中文学习</h1>
        <button 
          className="dark-mode-toggle"
          onClick={toggleDarkMode}
          aria-label="다크 모드 토글"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </header>
      
      <main className="main-content">
        <div className="home-buttons">
          <button 
            className="data-source-button recently-button"
            onClick={() => setCurrentScreen('recently')}
          >
            Recently
            <span className="button-description">최근 학습 데이터</span>
          </button>
          
          <button 
            className="data-source-button integrated-button"
            onClick={() => setCurrentScreen('integrated')}
          >
            Integrated  
            <span className="button-description">통합 학습 데이터</span>
          </button>
        </div>
      </main>
    </div>
  );

  // Recently 화면 렌더링
  const renderRecentlyScreen = () => (
    <div className="file-selection-screen">
      <header className="app-header">
        <button 
          className="back-button"
          onClick={() => setCurrentScreen('home')}
        >
          ← Back
        </button>
        <h1 className="app-title">Recently Files</h1>
        <button 
          className="dark-mode-toggle"
          onClick={toggleDarkMode}
          aria-label="다크 모드 토글"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </header>
      
      <main className="main-content">
        <div className="file-grid">
          <div className="file-category">
            <h2>Past Data</h2>
            <div className="file-buttons">
              {pastMonths.map((month) => (
                <button
                  key={month}
                  className="file-button"
                  onClick={() => handlePastMonthChange(month)}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
          
          <div className="file-category">
            <h2>Present Data</h2>
            <div className="file-buttons">
              {presentMonths.map((month) => (
                <button
                  key={month}
                  className="file-button"
                  onClick={() => handlePresentMonthChange(month)}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  // Integrated 화면 렌더링
  const renderIntegratedScreen = () => (
    <div className="file-selection-screen">
      <header className="app-header">
        <button 
          className="back-button"
          onClick={() => setCurrentScreen('home')}
        >
          ← Back
        </button>
        <h1 className="app-title">Integrated Files</h1>
        <button 
          className="dark-mode-toggle"
          onClick={toggleDarkMode}
          aria-label="다크 모드 토글"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </header>
      
      <main className="main-content">
        <div className="file-grid">
          <div className="file-category">
            <h2>통합 학습 자료</h2>
            <div className="file-buttons">
              {integratedFiles.map((file) => (
                <button
                  key={file}
                  className="file-button"
                  onClick={() => loadIntegratedFile(file)}
                >
                  {file.replace('.txt', '').replace(/^\d+_/, '')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  // 학습 화면 렌더링
  const renderStudyScreen = () => (
    <div className="study-screen">
      <header className="app-header">
        <button 
          className="back-button"
          onClick={() => setCurrentScreen(lastSelectedFolder === 'past' || lastSelectedFolder === 'present' ? 'recently' : 'home')}
        >
          ← Back
        </button>
        <h1 className="app-title">中文学习</h1>
        <button 
          className="dark-mode-toggle"
          onClick={toggleDarkMode}
          aria-label="다크 모드 토글"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </header>
      
      <Navigation
        availableDates={availableFiles}
        pastMonths={pastMonths}
        presentMonths={presentMonths}
        selectedMonth={selectedMonth}
        selectedDate={selectedDate}
        selectedCategory={selectedCategory}
        sentenceData={sentenceData}
        lastSelectedFolder={lastSelectedFolder}
        lastSelectedMonth={lastSelectedMonth}
        onMonthChange={handleMonthChange}
        onDateChange={handleDateChange}
        onCategoryChange={handleCategoryChange}
        onPastMonthChange={handlePastMonthChange}
        onPresentMonthChange={handlePresentMonthChange}
      />
      
      <main className="main-content">
        <div className="sentences-container">
          {!isDateBased && contentSections.length > 0 ? (
            // 카테고리 기반 렌더링 (서브카테고리 구분선 포함)
            contentSections.map((section, index) => (
              section.type === 'divider' ? (
                <div key={`divider-${index}`} className="subcategory-divider">
                  <h3>{section.dividerText}</h3>
                </div>
              ) : (
                <SentenceCard
                  key={`sentence-${section.sentence?.id || index}`}
                  sentence={section.sentence!}
                />
              )
            ))
          ) : (
            // 날짜 기반 렌더링 또는 빈 상태
            sentences.length > 0 ? (
              sentences.map((sentence) => (
                <SentenceCard
                  key={sentence.id}
                  sentence={sentence}
                />
              ))
            ) : (
              <div className="no-data">
                <p>표시할 문장이 없습니다.</p>
                <p>날짜 또는 카테고리를 선택해주세요.</p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );

  // 현재 화면에 따라 적절한 컴포넌트 렌더링
  const renderCurrentScreen = () => {
    if (currentScreen === 'home') {
      return renderHomeScreen();
    } else if (currentScreen === 'recently') {
      // Recently 화면에서 데이터가 로드되면 study 화면 표시
      if (sentenceData) {
        return renderStudyScreen();
      }
      return renderRecentlyScreen();
    } else if (currentScreen === 'integrated') {
      // Integrated 화면에서 데이터가 로드되면 study 화면 표시
      if (sentenceData) {
        return renderStudyScreen();
      }
      return renderIntegratedScreen();
    }
    return renderHomeScreen();
  };

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
      {renderCurrentScreen()}
    </div>
  );
};

export default App;