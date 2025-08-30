import React, { useState, useEffect } from 'react';
import './styles/App.css';
import LegacyApp from './components/LegacyApp';

type ViewMode = 'legacy' | 'new';
type DataCategory = 'currently' | 'integrated';
type IntegratedType = '01_초급반_제1-10과' | '02_중급반_제11-25과' | '03_고급반_제26-40과' | '04_실전회화_제41-50과' | '05_패턴_제1-30과';
type CurrentlyType = '202508';
type DisplayMode = 'chinese' | 'translations' | 'others' | 'words';

interface LessonData {
  id: number;
  lesson?: string;
  sentence?: string;
  pinyin?: string;
  korean?: string;
  english?: string;
  japanese?: string;
  japanese_romaji?: string;
  words?: any[];
}

function App() {
  const [viewMode, setViewMode] = useState<ViewMode | null>(null);
  const [dataCategory, setDataCategory] = useState<DataCategory | null>(null);
  const [selectedType, setSelectedType] = useState<IntegratedType | CurrentlyType | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonData[] | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('chinese');
  const [lessonData, setLessonData] = useState<any>(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [allSentences, setAllSentences] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // localStorage에서 상태 복원
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('chineseStudy_darkMode');
    const savedViewMode = localStorage.getItem('chineseStudy_viewMode');
    const savedDataCategory = localStorage.getItem('chineseStudy_dataCategory');
    const savedSelectedType = localStorage.getItem('chineseStudy_selectedType');
    const savedSelectedLesson = localStorage.getItem('chineseStudy_selectedLesson');
    const savedLessonData = localStorage.getItem('chineseStudy_lessonData');
    const savedAllSentences = localStorage.getItem('chineseStudy_allSentences');
    const savedCurrentSentenceIndex = localStorage.getItem('chineseStudy_currentSentenceIndex');
    const savedDisplayMode = localStorage.getItem('chineseStudy_displayMode');

    if (savedDarkMode) setIsDarkMode(savedDarkMode === 'true');
    if (savedViewMode) setViewMode(savedViewMode as ViewMode);
    if (savedDataCategory) setDataCategory(savedDataCategory as DataCategory);
    if (savedSelectedType) setSelectedType(savedSelectedType as IntegratedType | CurrentlyType);
    if (savedSelectedLesson) {
      try {
        setSelectedLesson(JSON.parse(savedSelectedLesson));
      } catch (error) {
        console.error('Failed to parse savedSelectedLesson:', error);
      }
    }
    if (savedLessonData) {
      try {
        setLessonData(JSON.parse(savedLessonData));
      } catch (error) {
        console.error('Failed to parse savedLessonData:', error);
      }
    }
    if (savedAllSentences) {
      try {
        setAllSentences(JSON.parse(savedAllSentences));
      } catch (error) {
        console.error('Failed to parse savedAllSentences:', error);
      }
    }
    if (savedCurrentSentenceIndex) setCurrentSentenceIndex(parseInt(savedCurrentSentenceIndex));
    if (savedDisplayMode) setDisplayMode(savedDisplayMode as DisplayMode);
  }, []);

  // 상태 변경시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('chineseStudy_darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    if (viewMode) localStorage.setItem('chineseStudy_viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (dataCategory) localStorage.setItem('chineseStudy_dataCategory', dataCategory);
  }, [dataCategory]);

  useEffect(() => {
    if (selectedType) localStorage.setItem('chineseStudy_selectedType', selectedType);
  }, [selectedType]);

  useEffect(() => {
    localStorage.setItem('chineseStudy_currentSentenceIndex', currentSentenceIndex.toString());
  }, [currentSentenceIndex]);

  useEffect(() => {
    localStorage.setItem('chineseStudy_displayMode', displayMode);
  }, [displayMode]);

  useEffect(() => {
    if (selectedLesson) {
      localStorage.setItem('chineseStudy_selectedLesson', JSON.stringify(selectedLesson));
    } else {
      localStorage.removeItem('chineseStudy_selectedLesson');
    }
  }, [selectedLesson]);

  useEffect(() => {
    if (lessonData) {
      localStorage.setItem('chineseStudy_lessonData', JSON.stringify(lessonData));
    } else {
      localStorage.removeItem('chineseStudy_lessonData');
    }
  }, [lessonData]);

  useEffect(() => {
    if (allSentences.length > 0) {
      localStorage.setItem('chineseStudy_allSentences', JSON.stringify(allSentences));
    } else {
      localStorage.removeItem('chineseStudy_allSentences');
    }
  }, [allSentences]);

  // Auto-load data when selectedType changes (including localStorage restoration)
  useEffect(() => {
    if (selectedType && !selectedLesson && !lessonData) {
      loadLessonData(selectedType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, selectedLesson, lessonData]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // TTS 기능
  const playAudio = async (text: string, lang?: string) => {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);

        // 언어별 설정
        if (lang === 'chinese') {
          utterance.lang = 'zh-CN';
        } else if (lang === 'korean') {
          utterance.lang = 'ko-KR';
        } else if (lang === 'english') {
          utterance.lang = 'en-US';
        } else if (lang === 'japanese') {
          utterance.lang = 'ja-JP';
        } else {
          utterance.lang = 'zh-CN'; // 기본값
        }

        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        return;
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const goBack = () => {
    if (selectedLesson) {
      setSelectedLesson(null);
      setDisplayMode('chinese');
      // Clear lesson-related localStorage
      localStorage.removeItem('chineseStudy_selectedLesson');
      localStorage.removeItem('chineseStudy_allSentences');
    } else if (selectedType) {
      setSelectedType(null);
      setLessonData(null);
      // Clear type-related localStorage
      localStorage.removeItem('chineseStudy_selectedType');
      localStorage.removeItem('chineseStudy_lessonData');
    } else if (dataCategory) {
      setDataCategory(null);
      // Clear category-related localStorage
      localStorage.removeItem('chineseStudy_dataCategory');
    } else if (viewMode) {
      // Clear all localStorage when going back to main screen
      localStorage.removeItem('chineseStudy_viewMode');
      localStorage.removeItem('chineseStudy_dataCategory');
      localStorage.removeItem('chineseStudy_selectedType');
      localStorage.removeItem('chineseStudy_selectedLesson');
      localStorage.removeItem('chineseStudy_lessonData');
      localStorage.removeItem('chineseStudy_allSentences');
      setViewMode(null);
      setDataCategory(null);
      setSelectedType(null);
      setSelectedLesson(null);
      setLessonData(null);
      setAllSentences([]);
    }
  };

  const loadLessonData = async (type: IntegratedType | CurrentlyType) => {
    try {
      let url;
      if (type === '05_패턴_제1-30과') {
        url = `/data/integrated/${type}_complete.json`;
      } else if (type === '202508') {
        url = `/data/currently/${type}.json`;
      } else {
        url = `/data/integrated/${type}.json`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setLessonData(data);

      // Extract unique lessons for lesson selection
      if (data.contents && Array.isArray(data.contents)) {
        const lessons = data.contents.reduce((acc: any[], item: any) => {
          const lessonNum = item.lesson || `Lesson ${item.lesson || item.id}`;
          if (!acc.find(l => l.lesson === lessonNum)) {
            acc.push({ lesson: lessonNum, id: item.lesson || item.id });
          }
          return acc;
        }, []);

        if (lessons.length === 1) {
          // If only one lesson, go directly to content
          setSelectedLesson(data.contents);
          extractAllSentences(data.contents);
        }
      } else {
        // If no contents array, treat the whole data as lesson content
        setSelectedLesson([data]);
      }
    } catch (error) {
      console.error('Failed to load lesson data:', error);
    }
  };

  const extractAllSentences = (contents: any[]) => {
    const sentences: any[] = [];
    contents.forEach((lessonItem: any) => {
      if (lessonItem.content) {
        lessonItem.content.forEach((categoryItem: any) => {
          if (categoryItem.subcategories) {
            categoryItem.subcategories.forEach((subcat: any) => {
              if (subcat.sentences) {
                sentences.push(...subcat.sentences);
              }
            });
          }
        });
      }
    });
    setAllSentences(sentences);
    setCurrentSentenceIndex(0);
  };

  const selectLesson = (lessonName: string) => {
    if (lessonData && lessonData.contents) {
      const lessonContent = lessonData.contents.filter((item: any) =>
        item.lesson === lessonName || `Lesson ${item.lesson || item.id}` === lessonName
      );
      console.log('selectedLesson 예시 3개:', lessonContent.slice(0, 3));
      setSelectedLesson(lessonContent);
      extractAllSentences(lessonContent);
    }
  };

  // Initial view mode selection
  if (!viewMode) {
    return (
      <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
        <button
          className="theme-toggle-top"
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <div className="view-mode-selection">
          <h1>중국어 학습</h1>
          <div className="view-mode-buttons">
            <button onClick={() => setViewMode('legacy')} className="view-mode-btn">
              Past/Present
            </button>
            <button onClick={() => setViewMode('new')} className="view-mode-btn">
              Currently/Integrated
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Legacy UI (기존 UI 그대로 유지)
  if (viewMode === 'legacy') {
    return <LegacyApp onBackClick={goBack} isDarkMode={isDarkMode} />;
  }

  // New UI
  if (viewMode === 'new') {
    // Data category selection
    if (!dataCategory) {
      return (
        <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className="header-with-center">
            <button onClick={goBack} className="back-btn">🔙</button>
            <h2 className="header-title-center">새 UI</h2>
            <div className="header-spacer"></div>
          </div>
          <div className="data-category-selection">
            <button onClick={() => setDataCategory('currently')} className="category-btn">
              Currently
            </button>
            <button onClick={() => setDataCategory('integrated')} className="category-btn">
              Integrated
            </button>
          </div>
        </div>
      );
    }

    // Type selection
    if (!selectedType) {
      return (
        <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className="header-with-center">
            <button onClick={goBack} className="back-btn">🔙</button>
            <h2 className="header-title-center">{dataCategory === 'currently' ? 'Currently' : 'Integrated'}</h2>
            <div className="header-spacer"></div>
          </div>
          <div className="type-selection">
            {dataCategory === 'integrated' ? (
              <>
                <button onClick={() => { setSelectedType('01_초급반_제1-10과'); loadLessonData('01_초급반_제1-10과'); }} className="type-btn">초급반 (제1-10과)</button>
                <button onClick={() => { setSelectedType('02_중급반_제11-25과'); loadLessonData('02_중급반_제11-25과'); }} className="type-btn">중급반 (제11-25과)</button>
                <button onClick={() => { setSelectedType('03_고급반_제26-40과'); loadLessonData('03_고급반_제26-40과'); }} className="type-btn">고급반 (제26-40과)</button>
                <button onClick={() => { setSelectedType('04_실전회화_제41-50과'); loadLessonData('04_실전회화_제41-50과'); }} className="type-btn">실전회화 (제41-50과)</button>
                <button onClick={() => { setSelectedType('05_패턴_제1-30과'); loadLessonData('05_패턴_제1-30과'); }} className="type-btn">패턴회화 (제1-30과)</button>
              </>
            ) : (
              <button onClick={() => { setSelectedType('202508'); loadLessonData('202508' as any); }} className="type-btn">202508</button>
            )}
          </div>
        </div>
      );
    }

    // Lesson selection (if multiple lessons exist)
    if (selectedType && !selectedLesson && lessonData && lessonData.contents) {
      const lessons = lessonData.contents.reduce((acc: any[], item: any) => {
        const lessonNum = item.lesson || `Lesson ${item.lesson || item.id}`;
        const category = item.content?.[0]?.category || '';
        if (!acc.find(l => l.lesson === lessonNum)) {
          acc.push({
            lesson: lessonNum,
            id: item.lesson || item.id,
            category: category
          });
        }
        return acc;
      }, []);

      if (lessons.length > 1) {
        return (
          <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
            <div className="header-with-center">
              <button onClick={goBack} className="back-btn">🔙</button>
              <h2 className="header-title-center">레슨 선택</h2>
              <div className="header-spacer"></div>
            </div>
            <div className="lesson-selection">
              {lessons.map((lesson: any, index: number) => (
                <button
                  key={index}
                  onClick={() => selectLesson(lesson.lesson)}
                  className="lesson-btn"
                >
                  <div className="lesson-btn-content">

                    <span className="lesson-category">{lesson.category}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      }
    }

    // Content display
    if (selectedLesson) {
      return (
        <div className={`app full-height ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className="header-with-center">
            <button onClick={goBack} className="back-btn">🔙</button>
            <h2 className="header-title-center">{selectedLesson?.[0]?.lesson ? `${(selectedLesson[0] as any)?.content?.[0]?.category}` : selectedType}</h2>
            <div className="header-spacer"></div>
          </div>

          {/* Content area - 90% */}
          <div className="content-area">
            {allSentences.length > 0 && (
              <div className="single-sentence-view">
                <div className="sentence-header">
                  <span className="sentence-id">ID: {allSentences[currentSentenceIndex]?.id}</span>
                  <span className="sentence-counter">{currentSentenceIndex + 1} / {allSentences.length}</span>
                </div>

                <div className="sentence-content">
                  {displayMode === 'chinese' && (
                    <div className="chinese-display">
                      <p className="main-sentence">{allSentences[currentSentenceIndex]?.sentence}</p>
                      <button
                        className="tts-button-center"
                        onClick={() => playAudio(allSentences[currentSentenceIndex]?.sentence, 'chinese')}
                        title="중국어 음성 재생"
                      >
                        🔊
                      </button>
                    </div>
                  )}

                  {displayMode === 'translations' && (
                    <div className="translations-display">
                      <div className="translation-item">
                        <span className="content">{allSentences[currentSentenceIndex]?.sentence}</span>
                        <button
                          className="tts-button-inline"
                          onClick={() => playAudio(allSentences[currentSentenceIndex]?.sentence, 'chinese')}
                          title="중국어 음성 재생"
                        >
                          🔊
                        </button>
                      </div>
                      <div className="translation-item">
                        <span className="content">{allSentences[currentSentenceIndex]?.pinyin}</span>
                      </div>
                      <div className="translation-item">
                        <span className="content">{allSentences[currentSentenceIndex]?.korean}</span>
                        <button
                          className="tts-button-inline"
                          onClick={() => playAudio(allSentences[currentSentenceIndex]?.korean, 'korean')}
                          title="한국어 음성 재생"
                        >
                          🔊
                        </button>
                      </div>
                    </div>
                  )}

                  {displayMode === 'others' && (
                    <div className="translations-display">
                      <div className="translation-item">
                        <span className="content">{allSentences[currentSentenceIndex]?.english}</span>
                        <button
                          className="tts-button-inline"
                          onClick={() => playAudio(allSentences[currentSentenceIndex]?.english, 'english')}
                          title="영어 음성 재생"
                        >
                          🔊
                        </button>
                      </div>
                      <div className="translation-item">
                        <span className="content">{allSentences[currentSentenceIndex]?.japanese}</span>
                        <button
                          className="tts-button-inline"
                          onClick={() => playAudio(allSentences[currentSentenceIndex]?.japanese, 'japanese')}
                          title="일본어 음성 재생"
                        >
                          🔊
                        </button>
                      </div>
                      <div className="translation-item">
                        <span className="content">{allSentences[currentSentenceIndex]?.japanese_romaji}</span>
                      </div>
                    </div>
                  )}

                  {displayMode === 'words' && (
                    <div className="words-display">
                      {allSentences[currentSentenceIndex]?.words && allSentences[currentSentenceIndex].words.words ?
                        allSentences[currentSentenceIndex].words.words.map((word: any, wIndex: number) => (
                          <div key={wIndex} className="word-item-detail">
                            <div className="word-row-main">
                              <div className="word-chinese">
                                {word}
                                <button
                                  className="tts-button-word"
                                  onClick={() => playAudio(word, 'chinese')}
                                  title="단어 음성 재생"
                                >
                                  🔊
                                </button>
                              </div>
                              <div className="word-pinyin">{allSentences[currentSentenceIndex].words.pinyin?.[wIndex]}</div>
                              <div className="word-korean">{allSentences[currentSentenceIndex].words.korean?.[wIndex]}</div>
                            </div>
                            <div className="word-row-sub">
                              <div className="word-traditional">{allSentences[currentSentenceIndex].words.traditional?.[wIndex]}</div>
                              <div className="word-meaning">{allSentences[currentSentenceIndex].words.meaning_and_reading?.[wIndex]}</div>
                            </div>
                          </div>
                        )) : (
                          <div className="no-words">이 문장에는 단어 정보가 없습니다.</div>
                        )
                      }
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Control buttons - 10% */}
          <div className="control-buttons">
            <button
              onClick={() => setCurrentSentenceIndex(Math.max(0, currentSentenceIndex - 1))}
              className={`control-btn ${currentSentenceIndex === 0 ? 'disabled' : ''}`}
              disabled={currentSentenceIndex === 0}
            >
              ◀️
            </button>
            <button
              onClick={() => setDisplayMode('chinese')}
              className={`control-btn ${displayMode === 'chinese' ? 'active' : ''}`}
            >
              中
            </button>
            <button
              onClick={() => setDisplayMode('translations')}
              className={`control-btn ${displayMode === 'translations' ? 'active' : ''}`}
            >
              한
            </button>
            <button
              onClick={() => setDisplayMode('words')}
              className={`control-btn ${displayMode === 'words' ? 'active' : ''}`}
            >
              🔤
            </button>
            <button
              onClick={() => setDisplayMode('others')}
              className={`control-btn ${displayMode === 'others' ? 'active' : ''}`}
            >
              🌐
            </button>

            <button
              onClick={() => setCurrentSentenceIndex(Math.min(allSentences.length - 1, currentSentenceIndex + 1))}
              className={`control-btn ${currentSentenceIndex >= allSentences.length - 1 ? 'disabled' : ''}`}
              disabled={currentSentenceIndex >= allSentences.length - 1}
            >
              ▶️
            </button>
          </div>
        </div>
      );
    }
  }

  return <div>Loading...</div>;
}

export default App;