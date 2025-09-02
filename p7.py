import json
import subprocess
import sys

# Configuration
START_INDEX = 0  # 시작할 문장 인덱스 (예: 50번째부터 시작하려면 49로 설정)
INPUT_FILE = 'public/data/integrated/05_패턴_제1-90과_enhanced.json'
OUTPUT_FILE = 'public/data/integrated/05_패턴_제1-90과_enhanced.json'

# Load the JSON file
with open(INPUT_FILE, 'r', encoding='utf-8') as f:
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
                
                # Get the traditional characters array
                traditional_list = sentence['words'].get('traditional', [])
                if not traditional_list:
                    print(f"No traditional characters found for sentence #{sentence_index + 1}")
                    sentence_index += 1
                    continue
                    
                print(f"Traditional: {traditional_list}")
                
                # Create prompt for Claude to get meaning_and_reading
                prompt = f"""For these Chinese characters {traditional_list}, provide Korean meaning and reading in format '뜻 음'.
Example input: ['他', '是', '我', '哥哥']
Example output: ['그 타', '이다 시', '나 아', '형 가']
Return ONLY the array format."""
                
                try:
                    result = subprocess.run(['claude.cmd', '-p', prompt],
                                            capture_output=True, text=True, shell=True,
                                            encoding='utf-8', errors='ignore')
                    if result.stdout:
                        output = result.stdout.strip()
                        print(f"Claude raw output: {output}")
                        print(f"Output length: {len(output)}")
                        
                        # Check for rate limit message
                        if "5-hour limit reached" in output or "resets" in output:
                            print(f"\n⚠️ Rate limit reached at sentence index {sentence_index}")
                            print(f"Resume from index {sentence_index} by setting START_INDEX = {sentence_index}")
                            should_exit = True
                            break
                        
                        # Try to extract list from the output
                        import re
                        # First try to find a proper Python list
                        match = re.search(r"\[.*?\]", output, re.DOTALL)
                        if match and "'" in match.group():
                            try:
                                list_str = match.group()
                                print(f"Found list string: {list_str}")
                                # Convert string to actual list
                                meaning_and_reading_list = eval(list_str)
                                print(f"Extracted meaning_and_reading: {meaning_and_reading_list}")
                            except Exception as e:
                                print(f"Failed to parse meaning_and_reading list: {e}")
                                meaning_and_reading_list = []
                        else:
                            # If no list format, try to parse from Claude's descriptive output
                            print("No list format found - parsing descriptive output")
                            meaning_and_reading_list = []
                            
                            # Parse different patterns from Claude's output
                            # Pattern 1: "**한자** - 뜻 음" or "한자: 뜻 음"
                            pattern1 = re.findall(r'\*\*.*?\*\*\s*[-:]\s*([가-힣]+)\s+([가-힣]+)', output)
                            # Pattern 2: "數字: 뜻 음" format
                            pattern2 = re.findall(r'[一-龥]+:\s*([가-힣]+)\s+([가-힣]+)', output)
                            # Pattern 3: Just "뜻 음" after a dash or colon
                            pattern3 = re.findall(r'[-:]\s*([가-힣]+)\s+([가-힣]+)(?:\s|$|\n|,|\))', output)
                            
                            # Combine all patterns
                            all_matches = []
                            if pattern1:
                                all_matches.extend([(m[0], m[1]) for m in pattern1])
                            if pattern2 and not pattern1:
                                all_matches.extend([(m[0], m[1]) for m in pattern2])
                            if pattern3 and not pattern1 and not pattern2:
                                all_matches.extend([(m[0], m[1]) for m in pattern3])
                            
                            if all_matches:
                                # Create meaning_and_reading list
                                for meaning, reading in all_matches:
                                    meaning_and_reading_list.append(f"{meaning} {reading}")
                                print(f"Extracted from descriptive text: {meaning_and_reading_list}")
                            else:
                                # Try simpler pattern for cases like "형 (오빠/형)"
                                simple_pattern = re.findall(r'([가-힣]+)\s*\(([가-힣/]+)\)', output)
                                if simple_pattern:
                                    for match in simple_pattern:
                                        meaning_and_reading_list.append(match[0])
                                    print(f"Extracted simple format: {meaning_and_reading_list}")
                                else:
                                    print("Could not extract Korean readings from output")
                                    meaning_and_reading_list = []
                    else:
                        print("Error: No output received")
                        meaning_and_reading_list = []
                except (FileNotFoundError, UnicodeDecodeError) as e:
                    print(f"Error: {e}")
                    meaning_and_reading_list = []
                
                if should_exit:
                    break
                
                # Update the meaning_and_reading in the data structure
                sentence['words']['meaning_and_reading'] = meaning_and_reading_list
                print(f"Updated meaning_and_reading: {meaning_and_reading_list}")
                print("---")
                
                sentence_index += 1
                count += 1

# Save the updated data back to the JSON file
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

if should_exit:
    print(f"\n❗ Execution stopped due to rate limit.")
    print(f"📌 To resume, set START_INDEX = {sentence_index} in the script")
else:
    print(f"\n✅ File updated successfully! Processed {count} sentences.")
    
    # Shutdown computer after completion (optional)
    import os
    print("\n🔴 Shutting down computer in 10 seconds...")
    print("Press Ctrl+C to cancel shutdown")
    try:
        import time
        time.sleep(10)
        os.system("shutdown /s /t 0")  # Windows shutdown command
    except KeyboardInterrupt:
        print("\n✋ Shutdown cancelled by user")