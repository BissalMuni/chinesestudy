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

// For date-based structure (old format)
export interface DateBasedContent {
  date: string;
  sentences: Sentence[];
}

// For category-based structure (new format)
export interface Subcategory {
  subcategory: string;
  sentences: Sentence[];
}

export interface CategoryContent {
  category: string;
  subcategories: Subcategory[];
}

// For new day-based structure with categories
export interface DayContent {
  day: number;
  content: CategoryContent[];
}

// Main data structure that supports all formats
export interface SentenceData {
  month: string;
  language: string;
  contents: Array<DateBasedContent | CategoryContent | DayContent>;
}

// Type guards to check content type
export function isDateBasedContent(content: DateBasedContent | CategoryContent | DayContent): content is DateBasedContent {
  return 'date' in content;
}

export function isCategoryContent(content: CategoryContent | DateBasedContent | DayContent): content is CategoryContent {
  return 'category' in content;
}

export function isDayContent(content: DateBasedContent | CategoryContent | DayContent): content is DayContent {
  return 'day' in content;
}

// For organizing content with subcategory dividers
export interface ContentSection {
  type: 'divider' | 'sentence';
  dividerText?: string;
  sentence?: Sentence;
}