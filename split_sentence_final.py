import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '灯亮着'
words = list(jieba.cut(sentence))
print(words)