import jieba
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '这里可以停车'
result = list(jieba.cut(sentence))
print(result)