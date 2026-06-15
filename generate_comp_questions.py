import os
import json
import time
from dotenv import load_dotenv

try:
    from openai import OpenAI
except ImportError:
    print("Please install openai: pip install openai")
    exit(1)

load_dotenv(dotenv_path="backend/.env")

def main():
    token = os.environ.get("GITHUB_TOKEN")
    if not token or token == "your_token_here":
        print("GITHUB_TOKEN is missing!")
        return

    client = OpenAI(
        base_url="https://models.inference.ai.azure.com",
        api_key=token,
    )

    with open('src/data/reading-passages.json', 'r') as f:
        passages = json.load(f)

    for i, p in enumerate(passages):
        if len(p.get("comprehensionQuestions", [])) == 5:
            print(f"Skipping {p['id']}, already has questions.")
            continue

        print(f"Generating for {p['id']} ({i+1}/{len(passages)})...")
        
        difficulty = p['difficulty']
        text = p['text']

        system_prompt = f"""
You are an expert reading comprehension test designer.
Generate exactly 5 multiple-choice reading comprehension questions based ONLY on the provided passage.
The questions must be appropriate for middle/high school students at a '{difficulty}' difficulty level. No kindergarten-style questions.

You must include exactly one question for each of the following categories:
1. MainIdea
2. Vocabulary
3. DetailRecall
4. Inference
5. CriticalThinking

Return ONLY JSON. Format:
{{
  "questions": [
    {{
      "id": "q1",
      "category": "MainIdea",
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "string (must exactly match one of the options)",
      "explanation": "Brief explanation"
    }}
  ]
}}
"""

        try:
            response = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Passage text:\n\n{text}"}
                ],
                model="gpt-4o-mini",
                response_format={"type": "json_object"},
            )
            
            content = response.choices[0].message.content
            parsed = json.loads(content)
            
            questions = parsed.get("questions", [])
            if len(questions) == 5:
                # Add unique IDs
                for idx, q in enumerate(questions):
                    q['id'] = f"{p['id']}_q{idx+1}"
                
                p["comprehensionQuestions"] = questions
                
                # Save immediately after each success
                with open('src/data/reading-passages.json', 'w') as f:
                    json.dump(passages, f, indent=2)
                print(f"  Success! Added 5 questions.")
            else:
                print(f"  Failed: Returned {len(questions)} questions instead of 5.")
                
            time.sleep(1) # rate limiting
            
        except Exception as e:
            print(f"Error: {e}")
            break

if __name__ == "__main__":
    main()
