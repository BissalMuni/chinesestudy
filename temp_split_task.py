# -*- coding: utf-8 -*-
import jieba
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '他买了两斤苹果'
words = list(jieba.cut(sentence))
print(words)