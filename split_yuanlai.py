import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '原来是你啊'
words = list(jieba.cut(sentence))
print(words)