import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navigation from './Navigation';
import SentenceCard from './SentenceCard';
import { SentenceData, ContentSection, isDateBasedContent, isCategoryContent, isDayContent } from '../types';

interface LegacyAppProps {
  onBackClick: () => void;
  isDarkMode: boolean;
}

const LegacyApp: React.FC<LegacyAppProps> = ({ onBackClick, isDarkMode }) => {
  const [sentenceData, setSentenceData] = useState<SentenceData | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [pastMonths, setPastMonths] = useState<string[]>([]);
  const [presentMonths, setPresentMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [lastSelectedFolder, setLastSelectedFolder] = useState<string>('');
  const [lastSelectedMonth, setLastSelectedMonth] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef<boolean>(false);

  // Define callback functions first
  const loadMonthData = useCallback(async (month: string, folder: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/data/${folder}/${month}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load data for ${month}`);
      }
      
      const data: SentenceData = await response.json();
      setSentenceData(data);
      
      // Extract available dates
      const dates: string[] = [];
      data.contents.forEach(content => {
        if (isDateBasedContent(content)) {
          dates.push(content.date);
        } else if (isDayContent(content)) {
          // Keep month format as-is for date generation
          dates.push(`${month}-${String(content.day).padStart(2, '0')}`);
        }
      });
      
      console.log('Extracted dates:', dates);
      setAvailableDates(dates.sort());
      
      // Set first available date as selected
      if (dates.length > 0) {
        console.log('Setting selected date to:', dates[0]);
        setSelectedDate(dates[0]);
      }
      
      setSelectedCategory('전체');
    } catch (error) {
      console.error('Error loading month data:', error);
      setError(`Failed to load data for ${month}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePastMonthChange = useCallback(async (month: string) => {
    await loadMonthData(month, 'past');
    setSelectedMonth(month);
    setLastSelectedFolder('past');
    setLastSelectedMonth(month);
  }, [loadMonthData]);

  const handlePresentMonthChange = useCallback(async (month: string) => {
    await loadMonthData(month, 'present');
    setSelectedMonth(month);
    setLastSelectedFolder('present');
    setLastSelectedMonth(month);
  }, [loadMonthData]);

  // Initialize component - load available months
  useEffect(() => {
    const loadAvailableMonths = async () => {
      try {
        // Load past months
        const pastResponse = await fetch('/data/past/manifest.json');
        if (pastResponse.ok) {
          const pastManifest = await pastResponse.json();
          const pastFiles = pastManifest.files || [];
          const pastMonthList = pastFiles.map((file: string) => file.replace('.json', ''));
          setPastMonths(pastMonthList);
        }

        // Load present months
        const presentResponse = await fetch('/data/present/manifest.json');
        if (presentResponse.ok) {
          const presentManifest = await presentResponse.json();
          const presentFiles = presentManifest.files || [];
          const presentMonthList = presentFiles.map((file: string) => file.replace('.json', ''));
          setPresentMonths(presentMonthList);
        }
      } catch (error) {
        console.error('Failed to load manifests:', error);
      }
    };

    loadAvailableMonths();
  }, []);

  // Set default month when months are loaded
  useEffect(() => {
    const initializeDefaultMonth = async () => {
      if (!initializedRef.current && !loading && (presentMonths.length > 0 || pastMonths.length > 0) && !selectedMonth) {
        initializedRef.current = true;
        
        if (presentMonths.length > 0) {
          const latestMonth = [...presentMonths].sort().pop() || '';
          setSelectedMonth(latestMonth);
          setLastSelectedFolder('present');
          setLastSelectedMonth(latestMonth);
          await loadMonthData(latestMonth, 'present');
        } else if (pastMonths.length > 0) {
          const latestMonth = [...pastMonths].sort().pop() || '';
          setSelectedMonth(latestMonth);
          setLastSelectedFolder('past');
          setLastSelectedMonth(latestMonth);
          await loadMonthData(latestMonth, 'past');
        }
      }
    };

    initializeDefaultMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentMonths, pastMonths, selectedMonth, loading]);

  const handleMonthChange = (month: string) => {
    if (pastMonths.includes(month)) {
      handlePastMonthChange(month);
    } else {
      handlePresentMonthChange(month);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedCategory('전체');
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Get sentences for display
  const getDisplaySentences = (): ContentSection[] => {
    if (!sentenceData) {
      console.log('No sentence data available');
      return [];
    }

    console.log('Getting display sentences for:', { selectedDate, selectedCategory });
    console.log('Sentence data contents:', sentenceData.contents);

    const sections: ContentSection[] = [];
    
    // Find the content for the selected date
    const dateParts = selectedDate ? selectedDate.split('-') : [];
    console.log('Date parts:', dateParts);
    const selectedDay = dateParts.length >= 3 ? parseInt(dateParts[2]) : (dateParts.length === 2 ? parseInt(dateParts[1]) : 1);
    console.log('Selected day:', selectedDay);
    
    sentenceData.contents.forEach((content, index) => {
      console.log(`Content ${index}:`, content);
      if (isDateBasedContent(content) && content.date === selectedDate) {
        // Old date-based format
        content.sentences.forEach(sentence => {
          sections.push({ type: 'sentence', sentence });
        });
      } else if (isDayContent(content) && content.day === selectedDay) {
        // New day-based format with categories
        content.content.forEach(categoryContent => {
          if (selectedCategory === '전체' || categoryContent.category === selectedCategory) {
            categoryContent.subcategories.forEach(subcategory => {
              if (subcategory.subcategory) {
                sections.push({ 
                  type: 'divider', 
                  dividerText: subcategory.subcategory 
                });
              }
              subcategory.sentences.forEach(sentence => {
                sections.push({ type: 'sentence', sentence });
              });
            });
          }
        });
      } else if (isCategoryContent(content)) {
        // Category-based format
        if (selectedCategory === '전체' || content.category === selectedCategory) {
          content.subcategories.forEach(subcategory => {
            if (subcategory.subcategory) {
              sections.push({ 
                type: 'divider', 
                dividerText: subcategory.subcategory 
              });
            }
            subcategory.sentences.forEach(sentence => {
              sections.push({ type: 'sentence', sentence });
            });
          });
        }
      }
    });

    return sections;
  };

  const displaySections = getDisplaySentences();

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <header className="app-header">
        <div className="header-title">
          <button onClick={onBackClick} className="back-button">
            🔙
          </button>
          <h1>중국어 학습</h1>
        </div>
      </header>

      {/* Navigation */}
      <Navigation
        availableDates={availableDates}
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

      {/* Content */}
      <main className="content">
        {loading && (
          <div className="loading">데이터를 불러오는 중...</div>
        )}
        
        {error && (
          <div className="error">
            <h2>오류가 발생했습니다</h2>
            <p>{error}</p>
          </div>
        )}
        
        {!loading && !error && (
          <div className="content-container">
            {displaySections.length === 0 ? (
              <div className="loading">선택된 날짜에 데이터가 없습니다.</div>
            ) : (
              displaySections.map((section, index) => (
                section.type === 'divider' ? (
                  <div key={index} className="subcategory-divider">
                    <h3>{section.dividerText}</h3>
                  </div>
                ) : (
                  <SentenceCard 
                    key={`${section.sentence?.id}-${index}`} 
                    sentence={section.sentence!} 
                  />
                )
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default LegacyApp;