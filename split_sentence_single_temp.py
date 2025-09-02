import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sentence = '可以借你的笔吗'
# Split into words: 可以(can), 借(borrow), 你的(your), 笔(pen), 吗(question particle)
words = ['可以', '借', '你的', '笔', '吗']
print(words)