import jieba
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '门开着'
words = list(jieba.cut(sentence))
print(words)