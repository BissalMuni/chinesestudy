import jieba
import sys

sys.stdout.reconfigure(encoding='utf-8')
result = list(jieba.cut('我能帮你'))
print(result)