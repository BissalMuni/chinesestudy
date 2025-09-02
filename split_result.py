import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '他喜欢看电影'
words = list(jieba.cut(sentence))
print(words)