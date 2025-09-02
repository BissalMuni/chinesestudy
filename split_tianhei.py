import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '天黑了'
words = list(jieba.cut(sentence))
print(words)