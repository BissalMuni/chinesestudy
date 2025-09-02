import jieba
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '我们要努力学习'
words = list(jieba.cut(sentence))
print(words)