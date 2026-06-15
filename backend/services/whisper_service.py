import os
from faster_whisper import WhisperModel

# Load the model at startup to avoid cold starts
# We use the "base" model as requested
MODEL_SIZE = "base"
# Optional: can specify device="cpu" or "cuda" and compute_type="int8"
# Let faster-whisper decide based on availability (usually CPU by default if no GPU)
try:
    model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
except Exception as e:
    print(f"Error loading whisper model: {e}")
    model = None

def transcribe_audio(file_path: str) -> dict:
    """
    Transcribes an audio file and returns the text and confidence.
    """
    if not model:
        raise Exception("Whisper model not initialized")
    
    segments, info = model.transcribe(file_path, beam_size=5)
    
    transcript = ""
    # info.language_probability provides a sort of confidence, 
    # but we can also average the no_speech_prob of segments or use segment avg_logprob
    
    total_logprob = 0
    segment_count = 0
    
    for segment in segments:
        transcript += segment.text + " "
        total_logprob += segment.avg_logprob
        segment_count += 1
        
    transcript = transcript.strip()
    
    # Calculate a rough confidence percentage from avg_logprob (closer to 0 is better, highly negative is worse)
    # A simple heuristic: exp(avg_logprob) gives a probability between 0 and 1
    import math
    avg_logprob = (total_logprob / segment_count) if segment_count > 0 else 0
    confidence = math.exp(avg_logprob) * 100 if segment_count > 0 else 0.0

    return {
        "text": transcript,
        "confidence": round(confidence, 2)
    }
