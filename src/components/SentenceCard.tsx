import React, { useState } from 'react';
import { Sentence } from '../types';
import WordCard from './WordCard';

interface SentenceCardProps {
  sentence: Sentence;
}

const SentenceCard: React.FC<SentenceCardProps> = ({ sentence }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showWords, setShowWords] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleWords = () => {
    setShowWords(!showWords);
  };

  const toggleExamples = () => {
    setShowExamples(!showExamples);
  };

  const playAudio = async (text: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation(); // 부모 클릭 이벤트 방지
    }
    
    try {
      // Web Speech API 사용
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        return;
      }
      
      // Web Speech API를 지원하지 않으면 Google Translate 페이지로 이동
      const googleTranslateUrl = `https://translate.google.com/?sl=zh-CN&tl=ko&text=${encodeURIComponent(text)}&op=translate`;
      
      // 새 창으로 열기 (사용자가 직접 스피커 버튼 클릭 가능)
      const userConfirmed = (window as any).confirm('Chrome이나 Safari, EDGE에서 접속하세요. 다른 브라우저에서는 음성 재생이 지원되지 않습니다. Google 번역 페이지로 이동하여 음성을 재생하시겠습니까?');
      if (userConfirmed) {
        (window as any).open(googleTranslateUrl, '_blank');
      }
      
    } catch (error) {
      console.error('Audio playback error:', error);
      // alert 대신 console.error 사용 (또는 사용자 정의 알림 컴포넌트)
      console.error('음성 재생에 실패했습니다. 브라우저를 Chrome이나 Safari로 변경해보세요.');
    }
  };

  return (
    <div className="sentence-card">
      <span className="sentence-number"> {sentence.id}</span>
      <div className="chinese-sentence-container">
        <div className="chinese-sentence" onClick={toggleDetails} style={{cursor: 'pointer'}}>
          {sentence.sentence}
        </div>
        <button 
          type="button"
          className="audio-button" 
          onClick={(e) => playAudio(sentence.sentence, e)}
          title="음성 재생"
        >
          🔊
        </button>
      </div>
      
      <div className={`sentence-details ${showDetails ? 'expanded' : ''}`}>
        <div className="pinyin">{sentence.pinyin}</div>
        
        <div className="meanings">
          <div className="meaning-item">
            <div className="meaning-label">🇰🇷 한국어</div>
            <div className="meaning-text">{sentence['meaning-korean']}</div>
          </div>
          <div className="meaning-item">
            <div className="meaning-label">🇺🇸 English</div>
            <div className="meaning-text">{sentence['meaning-english']}</div>
          </div>
        </div>
        
        <div className="words-section">
          <div className="words-toggle" onClick={toggleWords}>
            <div className="words-title">📚 단어 학습 ({sentence.words.length}개)</div>
            <span className={`toggle-arrow ${showWords ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          <div className={`words-content ${showWords ? 'expanded' : ''}`}>
            <div className="words-grid">
              {sentence.words.map((word, index) => (
                <WordCard key={index} word={word} />
              ))}
            </div>
          </div>
        </div>
        
        {sentence.examples && sentence.examples.length > 0 && (
          <div className="examples-section">
            <div className="examples-toggle" onClick={toggleExamples}>
              <div className="examples-title">💡 예제 문장 ({sentence.examples.length}개)</div>
              <span className={`toggle-arrow ${showExamples ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            <div className={`examples-content ${showExamples ? 'expanded' : ''}`}>
              <div className="examples-list">
                {sentence.examples.map((example, index) => (
                  <div key={index} className="example-card">
                    <div className="example-sentence-container">
                      <div className="example-sentence">{example.sentence}</div>
                      <button 
                        type="button"
                        className="audio-button-small" 
                        onClick={(e) => playAudio(example.sentence, e)}
                        title="음성 재생"
                      >
                        🔊
                      </button>
                    </div>
                    <div className="example-pinyin">{example.pinyin}</div>
                    <div className="example-meanings">
                      <div className="example-meaning">🇰🇷 {example.korean}</div>
                      <div className="example-meaning">🇺🇸 {example.english}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentenceCard;