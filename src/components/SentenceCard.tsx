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
    
    // Google Translate TTS API 사용
    const text = encodeURIComponent(sentence.sentence);
    const lang = 'zh-CN'; // 중국어 간체
    
    // Google Translate TTS URL
    const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${text}&tl=${lang}&client=tw-ob`;
    
    try {
      // 먼저 로컬 MP3 파일 확인
      // const localUrl = `/audio/sentence_${sentence.id}.mp3`;
      // const localResponse = await fetch(localUrl, { method: 'HEAD' });
      
      let audioUrl = googleTTSUrl; // 기본값: Google TTS
      
      // if (localResponse.ok) {
        // 로컬 파일이 있으면 로컬 파일 사용
        // audioUrl = localUrl;
      // }
      
      const audio = new Audio(audioUrl);
      
      // 오디오 재생
      await audio.play().catch(async (playError) => {
        // Google TTS가 실패하면 대체 방법 시도
        if (audioUrl === googleTTSUrl) {
          // 브라우저 Web Speech API 사용 (지원하는 경우)
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(sentence.sentence);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.9; // 속도 조절
            window.speechSynthesis.speak(utterance);
          } else {
            alert('음성 재생이 지원되지 않습니다.');
          }
        } else {
          throw playError;
        }
      });
      
    } catch (error) {
      console.error('Audio playback error:', error);
      
      // 최후의 수단: Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(sentence.sentence);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      } else {
        alert('음성 재생에 실패했습니다.');
      }
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