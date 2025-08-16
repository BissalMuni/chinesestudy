export interface Word {
  chinese: string;
  pinyin: string;
  korean: string;
  english: string;
  type: string;
}

export interface Sentence {
  id: number;
  sentence: string;
  pinyin: string;
  'meaning-korean': string;
  'meaning-english': string;
  words: Word[];
}

export interface SentenceData {
  month: string;
  language: string;
  contents: Array<{
    date: string;
    sentences: Sentence[];
  }>;
}