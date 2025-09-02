# -*- coding: utf-8 -*-
import jieba
import sys

# Set encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '这个房间太小了'
words = list(jieba.cut(sentence))
print(words)