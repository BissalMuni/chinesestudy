import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '买还是不买'
words = list(jieba.cut(sentence))
print(words)