import jieba
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '很热，对吧'
words = list(jieba.cut(sentence))
print(words)