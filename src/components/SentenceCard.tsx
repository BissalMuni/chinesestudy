import React, { useState } from 'react';
import { Sentence } from '../types';
import WordCard from './WordCard';

interface SentenceCardProps {
  sentence: Sentence;
}

const SentenceCard: React.FC<SentenceCardProps> = ({ sentence }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showWords, setShowWords] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleWords = () => {
    setShowWords(!showWords);
  };

  const playAudio = async (event: React.MouseEvent) => {
    event.stopPropagation(); // 부모 클릭 이벤트 방지
    
    const text = sentence.sentence;
    
    try {
      // 1. ResponsiveVoice API 시도 (네이버 앱 브라우저 지원)
      if ((window as any).responsiveVoice) {
        (window as any).responsiveVoice.speak(text, "Chinese Female", {
          rate: 0.9,
          pitch: 1,
          volume: 1
        });
        return;
      }
      
      // 2. Web Speech API 시도
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        return;
      }
      
      // 3. 모든 방법이 실패하면 Google Translate 페이지로 이동
      const googleTranslateUrl = `https://translate.google.com/?sl=zh-CN&tl=ko&text=${encodeURIComponent(text)}&op=translate`;
      
      // 새 창으로 열기 (사용자가 직접 스피커 버튼 클릭 가능)
      const userConfirmed = (window as any).confirm('음성 재생이 지원되지 않습니다. Google 번역 페이지로 이동하시겠습니까?');
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
          onClick={playAudio}
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
      </div>
    </div>
  );
};

export default SentenceCard;