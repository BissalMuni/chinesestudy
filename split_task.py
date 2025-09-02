import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '她很漂亮'
words = list(jieba.cut(sentence))
print(words)