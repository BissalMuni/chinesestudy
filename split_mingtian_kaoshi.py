import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '明天考试，对吧'
words = list(jieba.cut(sentence))
print(words)