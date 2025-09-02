import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '今天热吗'
words = list(jieba.cut(sentence))
print(words)