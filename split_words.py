import jieba
import sys
sys.stdout.reconfigure(encoding='utf-8')
jieba.setLogLevel(60)
result = list(jieba.cut('上午十点开会'))
print(result)