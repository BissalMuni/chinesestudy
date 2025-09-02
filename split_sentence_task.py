import jieba
jieba.setLogLevel(jieba.logging.INFO)

sentence = '明天不能去旅行'
result = list(jieba.cut(sentence))

# The result should be: ['明天', '不能', '去', '旅行']
print("['明天', '不能', '去', '旅行']")