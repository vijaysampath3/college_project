import json

categories = ['technology', 'science', 'environment', 'education', 'innovation']
difficulties = ['easy', 'easy', 'medium', 'medium', 'hard']

# Generate dummy text of approximately 180-250 words
def gen_text(cat, diff, idx):
    base_word = f"{cat} "
    multiplier = 200 // len(base_word.split())
    # A generic academic sounding paragraph
    text = f"The field of {cat} has seen unprecedented growth over the last decade. Researchers and practitioners alike have focused their efforts on understanding the complex mechanisms that drive innovation in this domain. This {diff} level overview highlights key concepts. " * 5
    return text.strip()

passages = []

for c_idx, cat in enumerate(categories):
    for d_idx, diff in enumerate(difficulties):
        pid = f"{cat}_{d_idx+1}"
        
        # Word count logic
        text = gen_text(cat, diff, d_idx)
        wc = len(text.split())
        ert = wc // 130 * 60 + 30 # roughly expected reading time in seconds
        
        passage = {
            "id": pid,
            "category": cat,
            "title": f"The Evolution of {cat.capitalize()} - Part {d_idx+1}",
            "difficulty": diff,
            "wordCount": wc,
            "expectedReadingTime": ert,
            "targetWPM": 130 if diff == 'easy' else (150 if diff == 'medium' else 170),
            "text": text,
            "comprehensionQuestions": []
        }
        passages.append(passage)

with open('src/data/reading-passages.json', 'w') as f:
    json.dump(passages, f, indent=2)

print("Generated 25 passages successfully.")
