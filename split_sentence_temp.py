import jieba
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '我没看电影'
words = list(jieba.cut(sentence))
print(words)