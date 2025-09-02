import jieba
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '妈妈做了韩国菜'
words = list(jieba.cut(sentence))
print(words)