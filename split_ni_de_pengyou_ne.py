import jieba
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '你的朋友呢'
words = list(jieba.cut(sentence))
print(words)