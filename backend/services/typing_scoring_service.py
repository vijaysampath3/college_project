from pydantic import BaseModel
from typing import List, Dict, Any
import math

class KeystrokeLog(BaseModel):
    key: str
    timestamp: str
    expectedCharacter: str
    isCorrect: bool
    timeSinceLastKeyMs: float

class FocusLossEvent(BaseModel):
    type: str
    timestamp: str
    durationMs: float

class TypingScoreRequest(BaseModel):
    keystrokes: List[KeystrokeLog]
    focusLossEvents: List[FocusLossEvent]
    startTime: float
    endTime: float
    expectedText: str

def calculate_typing_metrics(data: TypingScoreRequest) -> Dict[str, Any]:
    duration_mins = (data.endTime - data.startTime) / 60000.0
    duration_secs = (data.endTime - data.startTime) / 1000.0
    
    total_keystrokes = 0
    backspace_count = 0
    error_count = 0
    pauses = 0
    total_pause_time = 0
    longest_pause = 0
    
    omissions = 0
    insertions = 0
    substitutions = 0
    transpositions = 0
    repeated_letters = 0
    capitalization_errors = 0
    punctuation_errors = 0
    word_boundary_errors = 0
    
    pause_threshold = 1500  # 1.5s
    
    for k in data.keystrokes:
        total_keystrokes += 1
        
        if k.timeSinceLastKeyMs > pause_threshold:
            pauses += 1
            total_pause_time += k.timeSinceLastKeyMs
            if k.timeSinceLastKeyMs > longest_pause:
                longest_pause = k.timeSinceLastKeyMs
                
        if k.key == 'Backspace':
            backspace_count += 1
        elif not k.isCorrect:
            error_count += 1
            
            # Simple categorization
            if k.expectedCharacter.lower() == k.key.lower():
                capitalization_errors += 1
            elif k.key == ' ' or k.expectedCharacter == ' ':
                word_boundary_errors += 1
            elif k.expectedCharacter in '.,!?':
                punctuation_errors += 1
            else:
                substitutions += 1
                
    corrected_errors = min(error_count, backspace_count)
    uncorrected_errors = max(0, error_count - corrected_errors)
    
    wpm = 0
    if duration_mins > 0:
        wpm = max(0, round(((total_keystrokes - uncorrected_errors) / 5.0) / duration_mins))
        
    accuracy = 0
    if total_keystrokes > 0:
        accuracy = max(0, round(((total_keystrokes - error_count) / total_keystrokes) * 100))
        
    return {
        "wpm": wpm,
        "accuracy": accuracy,
        "totalKeystrokes": total_keystrokes,
        "backspaceCount": backspace_count,
        "errorCount": error_count,
        "correctedErrors": corrected_errors,
        "uncorrectedErrors": uncorrected_errors,
        "completionTimeSeconds": round(duration_secs),
        "pauseEvents": pauses,
        "averagePauseDurationMs": round(total_pause_time / pauses) if pauses > 0 else 0,
        "longestPauseDurationMs": longest_pause,
        "omissions": omissions,
        "insertions": insertions,
        "substitutions": substitutions,
        "transpositions": transpositions,
        "repeatedLetters": repeated_letters,
        "capitalizationErrors": capitalization_errors,
        "punctuationErrors": punctuation_errors,
        "wordBoundaryErrors": word_boundary_errors
    }
