import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '这么多啊'
words = list(jieba.cut(sentence))
print(words)