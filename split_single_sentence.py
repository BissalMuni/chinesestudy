import jieba
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '他正在看书'
words = list(jieba.cut(sentence))
print(words)