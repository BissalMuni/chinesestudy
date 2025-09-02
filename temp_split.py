import jieba
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '今天是几号'
result = list(jieba.cut(sentence))
print(result)