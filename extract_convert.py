#!/usr/bin/env python3
import json
import sys

def extract_word_breakdown(words):
    """Extract Chinese characters from words list for parentheses format"""
    word_list = []
    for word in words:
        word_list.append(word['chinese'])
    return ', '.join(word_list)

def convert_to_lesson_format(data):
    """Convert JSON data to lesson format"""
    output_lines = []
    
    # Process each day as a separate lesson
    for day_data in data['contents']:
        day = day_data['day']
        output_lines.append(f"제{day}과")
        output_lines.append("")
        
        # Process each category
        for category in day_data['content']:
            category_name = category['category']
            output_lines.append(f"대주제: {category_name}")
            output_lines.append("")
            
            # Process each subcategory
            for subcategory in category['subcategories']:
                subcategory_name = subcategory['subcategory']
                output_lines.append(f"소주제: {subcategory_name}")
                output_lines.append("")
                
                # Process each sentence
                for sentence in subcategory['sentences']:
                    chinese_sentence = sentence['sentence']
                    words = sentence.get('words', [])
                    word_breakdown = extract_word_breakdown(words)
                    
                    output_lines.append(f"{chinese_sentence} ({word_breakdown})")
                    output_lines.append("")
        
        output_lines.append("=" * 60)
        output_lines.append("")
    
    return '\n'.join(output_lines)

def main():
    # Read the JSON file
    json_file_path = r"D:\Coding\chinesestudy\public\data\present\202508.json"
    
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Convert to lesson format
        converted_text = convert_to_lesson_format(data)
        
        # Write to output file
        output_file_path = r"D:\Coding\chinesestudy\202508_converted.txt"
        with open(output_file_path, 'w', encoding='utf-8') as f:
            f.write(converted_text)
        
        print(f"Conversion completed successfully!")
        print(f"Output saved to: {output_file_path}")
        
        # Also show some statistics
        print(f"\nStatistics:")
        lines = converted_text.split('\n')
        print(f"Total lines: {len(lines)}")
        sentence_count = converted_text.count('(')  # Each sentence has parentheses
        print(f"Total sentences with word breakdowns: {sentence_count}")
        lesson_count = converted_text.count('제')  # Count lessons
        print(f"Total lessons: {lesson_count}")
            
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())