import jieba
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '桌子上有一杯茶'
words = list(jieba.cut(sentence))
print(words)