import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '我有三本书'
words = list(jieba.cut(sentence))
print(words)