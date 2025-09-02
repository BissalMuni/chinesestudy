import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '你可以帮我吗'
words = list(jieba.cut(sentence))
print(words)