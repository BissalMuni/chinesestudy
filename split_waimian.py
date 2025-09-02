import jieba

sentence = '外面下着雨'
words = list(jieba.cut(sentence))
print(words)