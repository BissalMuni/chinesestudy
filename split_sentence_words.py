import jieba
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '我们班有二十个学生'
words = list(jieba.cut(sentence))
print(words)