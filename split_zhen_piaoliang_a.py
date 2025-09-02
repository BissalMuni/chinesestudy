import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '真漂亮啊'
words = list(jieba.cut(sentence))
print(words)