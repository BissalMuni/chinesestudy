import sys
sys.stdout.reconfigure(encoding='utf-8')

sentence = '他学过韩语'
# Manual word segmentation based on grammatical structure
# 他 = he/him (pronoun)
# 学过 = have studied (verb + aspect marker)
# 韩语 = Korean language (noun)
words = ['他', '学过', '韩语']
print(words)