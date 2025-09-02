# -*- coding: utf-8 -*-
import jieba
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '我昨天没睡好'
jieba.setLogLevel(jieba.logging.INFO)
words = list(jieba.cut(sentence))
print(words)