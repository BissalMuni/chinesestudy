import jieba
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '明天下雨吗'
words = list(jieba.cut(sentence))
print(words)