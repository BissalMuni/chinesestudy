import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '在家吃还是出去吃'
words = list(jieba.cut(sentence))
print(words)