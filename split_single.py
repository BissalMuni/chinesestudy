import jieba
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '我没吃过这个菜'
words = list(jieba.cut(sentence))
print(words)