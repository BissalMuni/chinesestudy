import jieba
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '红色还是蓝色'
words = list(jieba.cut(sentence))
print(words)