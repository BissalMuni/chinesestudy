import jieba
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '你喝茶还是喝咖啡'
words = list(jieba.cut(sentence))
print(words)