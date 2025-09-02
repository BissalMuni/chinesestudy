import json
import subprocess

# Load the JSON file
with open('public/data/integrated/05_패턴_제1-90과_enhanced.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Loop through sentences with counter
count = 0
max_count = 10

for content in data['contents']:    
    for lesson_content in content['content']:        
        for subcategory in lesson_content['subcategories']:            
            for sentence in subcategory['sentences']:
                # if count >= max_count:
                    # break
                print(f"ID: {sentence['id']}")
                print(f"Chinese: {sentence['sentence']}")



                sentence_text = sentence['sentence']
                # question = f"Translate this Chinese sentence to korean: {sentence_text}. return just one korean sentence. other character removed"
                question = f"split the sentence of {sentence_text} into word or vocaburary. and return the words like [他是我哥哥 > ['他','是','我','哥哥']"

                try:
                    result = subprocess.run(['claude.cmd', '-p', question],
                                            capture_output=True, text=True, shell=True,
                                            encoding='utf-8', errors='ignore')
                    if result.stdout:
                        output = result.stdout.strip()
                        print(f"{output}")
                        # Update the pinyin in the data structure
                        sentence['korean'] = output
                    else:
                        print(f"Pinyin: error: No output received")
                except (FileNotFoundError, UnicodeDecodeError) as e:
                    print(f"Error: {e}")
                    print(f"Pinyin: {sentence['pinyin']}")                
                print("---")

           

# Save the updated data back to the JSON file
with open('public/data/integrated/05_패턴_제1-90과_enhanced.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)
    
print("File updated successfully!")