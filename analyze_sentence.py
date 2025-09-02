import jieba
jieba.setLogLevel(jieba.logging.INFO)

sentence = '我不想工作'
words = list(jieba.cut(sentence))
print(words)