import React from 'react';
import { Word } from '../types';

interface WordCardProps {
  word: Word;
}

const WordCard: React.FC<WordCardProps> = ({ word }) => {
  return (
    <div className="word-card">
      <div className="word-chinese">{word.chinese}</div>
      <div className="word-pinyin">{word.pinyin}</div>
      <div className="word-meaning">🇰🇷 {word.korean}</div>
      <div className="word-meaning">🇺🇸 {word.english}</div>
      <span className="word-type">{word.type}</span>
    </div>
  );
};

export default WordCard;