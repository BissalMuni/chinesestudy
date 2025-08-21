import React from 'react';
import { Word } from '../types';

interface WordCardProps {
  word: Word;
}

const WordCard: React.FC<WordCardProps> = ({ word }) => {
  const playAudio = async (text: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        return;
      }
      
      const googleTranslateUrl = `https://translate.google.com/?sl=zh-CN&tl=ko&text=${encodeURIComponent(text)}&op=translate`;
      const userConfirmed = (window as any).confirm('Chrome이나 Safari, EDGE에서 접속하세요. 다른 브라우저에서는 음성 재생이 지원되지 않습니다. Google 번역 페이지로 이동하여 음성을 재생하시겠습니까?');
      if (userConfirmed) {
        (window as any).open(googleTranslateUrl, '_blank');
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  return (
    <div className="word-card">
      <div className="word-header">
        <div className="word-chinese-group">
          <div className="word-chinese">{word.chinese}</div>
          {word.chinese_trad && (
            <div className="word-chinese-complex">({word.chinese_trad})</div>
          )}
        </div>
        <button 
          type="button"
          className="audio-button-small" 
          onClick={(e) => playAudio(word.chinese, e)}
          title="음성 재생"
        >
          🔊
        </button>
      </div>
      <div className="word-pinyin">{word.pinyin}</div>
      <div className="word-meaning-group">
        <div className="word-meaning">🇰🇷 {word.korean}</div>
        {word.chinese_trad_m && (
          <div className="word-meaning-detail">({word.chinese_trad_m})</div>
        )}
      </div>
      <div className="word-meaning">🇺🇸 {word.english}</div>
      <span className="word-type">{word.type}</span>
    </div>
  );
};

export default WordCard;