import json
import subprocess

# Load the JSON file
with open('public/data/integrated/05_패턴_제1-90과_enhanced.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Loop through sentences with counter
count = 0
# max_count = 10

for content in data['contents']:    
    for lesson_content in content['content']:        
        for subcategory in lesson_content['subcategories']:            
            for sentence in subcategory['sentences']:                
                print(f"Chinese: {sentence['sentence']}")
                print(f"Current words: {sentence['words']['words']}")

                sentence_text = sentence['sentence']
                question = f"Split the Chinese sentence '{sentence_text}' into individual words and return only the list in this exact format: ['word1', 'word2', 'word3']. No other text or explanation."

                try:
                    result = subprocess.run(['claude.cmd', '-p', question],
                                            capture_output=True, text=True, shell=True,
                                            encoding='utf-8', errors='ignore')
                    if result.stdout:
                        output = result.stdout.strip()
                        print(f"Claude output: {output}")
                        
                        # Try to extract list from the output
                        import re
                        match = re.search(r"\[.*?\]", output)
                        if match:
                            try:
                                # Convert string to actual list
                                word_list = eval(match.group())
                                sentence['words']['words'] = word_list
                                print(f"Updated words: {word_list}")
                            except:
                                print("Failed to parse word list")
                        else:
                            print("No valid list found in output")
                    else:
                        print("Error: No output received")
                except (FileNotFoundError, UnicodeDecodeError) as e:
                    print(f"Error: {e}")
                    
                print("---")
                # count += 1

# Save the updated data back to the JSON file
with open('public/data/integrated/05_패턴_제1-90과_enhanced.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)
    
print("File updated successfully!")