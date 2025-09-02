import jieba

sentence = '你喜欢，是不是'
words = list(jieba.cut(sentence))
result = [word for word in words if word.strip() and word not in ['，', '。', '！', '？', '、']]
print(result)