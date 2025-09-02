import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '电视开着呢'
words = list(jieba.cut(sentence))
print(words)