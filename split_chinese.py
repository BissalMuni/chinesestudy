import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '你能等我一下吗'
words = list(jieba.cut(sentence))
print(words)