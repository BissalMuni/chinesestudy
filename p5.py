import json
import subprocess
import sys

# Configuration
START_INDEX = 0  # 시작할 문장 인덱스 (예: 50번째부터 시작하려면 49로 설정)

# Load the JSON file
with open('public/data/integrated/05_패턴_제1-90과_enhanced.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Loop through sentences with counter
count = 0
sentence_index = 0
should_exit = False

for content in data['contents']:
    if should_exit:
        break
    for lesson_content in content['content']:
        if should_exit:
            break
        for subcategory in lesson_content['subcategories']:
            if should_exit:
                break
            for sentence in subcategory['sentences']:
                # Skip sentences before START_INDEX
                if sentence_index < START_INDEX:
                    sentence_index += 1
                    continue
                
                print(f"\n[Sentence #{sentence_index + 1}] Chinese: {sentence['sentence']}")
                
                # Get the words array
                words_list = sentence['words']['words']
                print(f"Words: {words_list}")
                
                # Send entire array to Claude for Korean translation
                question = f"Convert this Chinese word array to korean array: {words_list}. Return ONLY the korean array in the exact same format, like ['한국어1', '한국어2', '한국어3']. No other text."
                
                try:
                    result = subprocess.run(['claude.cmd', '-p', question],
                                            capture_output=True, text=True, shell=True,
                                            encoding='utf-8', errors='ignore')
                    if result.stdout:
                        output = result.stdout.strip()
                        print(f"Claude output: {output}")
                        
                        # Check for rate limit message
                        if "5-hour limit reached" in output or "resets" in output:
                            print(f"\n⚠️ Rate limit reached at sentence index {sentence_index}")
                            print(f"Resume from index {sentence_index} by setting START_INDEX = {sentence_index}")
                            should_exit = True
                            break
                        
                        # Try to extract list from the output
                        import re
                        match = re.search(r"\[.*?\]", output)
                        if match:
                            try:
                                # Convert string to actual list
                                korean_list = eval(match.group())
                                print(f"Extracted korean list: {korean_list}")
                            except:
                                print("Failed to parse korean list")
                                korean_list = []
                        else:
                            print("No valid list found in output")
                            korean_list = []
                    else:
                        print("Error: No output received")
                        korean_list = []
                except (FileNotFoundError, UnicodeDecodeError) as e:
                    print(f"Error: {e}")
                    korean_list = []
                
                if should_exit:
                    break
                
                # Update the korean in the data structure
                sentence['words']['korean'] = korean_list
                print(f"Updated korean: {korean_list}")
                print("---")
                
                sentence_index += 1
                count += 1

# Save the updated data back to the JSON file
with open('public/data/integrated/05_패턴_제1-90과_enhanced.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

if should_exit:
    print(f"\n❗ Execution stopped due to rate limit.")
    print(f"📌 To resume, set START_INDEX = {sentence_index} in the script")
else:
    print(f"\n✅ File updated successfully! Processed {count} sentences.")