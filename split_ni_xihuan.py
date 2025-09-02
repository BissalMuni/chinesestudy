import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '你喜欢中国菜吗'
words = list(jieba.cut(sentence))
print(words)