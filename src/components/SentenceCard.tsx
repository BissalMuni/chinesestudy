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
    
    const audioUrl = `/audio/sentence_${sentence.id}.mp3`;
    
    try {
      const audio = new Audio(audioUrl);
      
      // 파일 존재 여부 확인
      const response = await fetch(audioUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('File not found');
      }
      
      await audio.play();
    } catch (error) {
      alert('MP3 파일이 없습니다.');
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