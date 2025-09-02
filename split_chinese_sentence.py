import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '孩子们喜欢玩游戏'
words = list(jieba.cut(sentence))
print(words)