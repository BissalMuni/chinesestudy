import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '你是学生吗'
words = list(jieba.cut(sentence))
print(words)