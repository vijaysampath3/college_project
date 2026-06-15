import jiwer
import re

def clean_text(text: str) -> str:
    """Normalize text for fair comparison: lowercase, remove punctuation."""
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    return text.strip()

def analyze_transcript(expected_text: str, actual_text: str, duration_seconds: float) -> dict:
    """
    Compares the expected text against the actual transcript.
    Calculates WER, Missing Words, Extra Words, Substituted Words, Accuracy, and WPM.
    """
    ref = clean_text(expected_text)
    hyp = clean_text(actual_text)
    
    # Use jiwer to calculate the detailed metrics
    out = jiwer.process_words(ref, hyp)
    
    # out gives us substitutions, deletions (missing), insertions (extra), hits
    substitutions = out.substitutions
    deletions = out.deletions      # Missing words
    insertions = out.insertions    # Extra words
    hits = out.hits                # Correct words
    
    wer = out.wer
    
    # Calculate Accuracy (100 - WER%), bounded at 0
    accuracy = max(0, round((1 - wer) * 100, 1))
    
    # Calculate WPM
    transcript_words = len(hyp.split())
    wpm = round((transcript_words / duration_seconds) * 60) if duration_seconds > 0 else 0
    
    # Calculate Coverage
    expected_words_count = len(ref.split())
    coverage = round((hits / expected_words_count) * 100, 1) if expected_words_count > 0 else 0
    
    # Serialize alignment
    # alignment chunks can be over the list of characters or words
    # jiwer process_words alignments is word-based
    alignment_data = []
    ref_words = ref.split()
    hyp_words = hyp.split()
    
    if out.alignments:
        for chunk in out.alignments[0]:
            if chunk.type == 'equal':
                alignment_data.append({
                    "type": "equal",
                    "expected": " ".join(ref_words[chunk.ref_start_idx:chunk.ref_end_idx]),
                    "actual": " ".join(hyp_words[chunk.hyp_start_idx:chunk.hyp_end_idx])
                })
            elif chunk.type == 'substitute':
                alignment_data.append({
                    "type": "substitute",
                    "expected": " ".join(ref_words[chunk.ref_start_idx:chunk.ref_end_idx]),
                    "actual": " ".join(hyp_words[chunk.hyp_start_idx:chunk.hyp_end_idx])
                })
            elif chunk.type == 'delete':
                alignment_data.append({
                    "type": "missing",
                    "expected": " ".join(ref_words[chunk.ref_start_idx:chunk.ref_end_idx]),
                    "actual": ""
                })
            elif chunk.type == 'insert':
                alignment_data.append({
                    "type": "extra",
                    "expected": "",
                    "actual": " ".join(hyp_words[chunk.hyp_start_idx:chunk.hyp_end_idx])
                })

    import difflib
    similarity = round(difflib.SequenceMatcher(None, ref, hyp).ratio() * 100, 1)

    return {
        "accuracy": accuracy,
        "wpm": wpm,
        "wordErrors": substitutions + deletions + insertions,
        "wer": round(wer, 3),
        "coverage": coverage,
        "details": {
            "missingWords": deletions,
            "extraWords": insertions,
            "substitutedWords": substitutions,
            "correctWords": hits,
            "matchedWords": hits, # alias for matched
            "expectedWords": expected_words_count,
            "alignment": alignment_data
        },
        "similarity": similarity
    }
