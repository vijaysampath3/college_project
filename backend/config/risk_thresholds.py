# backend/config/risk_thresholds.py

# ==========================================
# Learning Difficulties Risk
# Based on combined Reading + Comprehension accuracy
# ==========================================
LEARNING_DIFFICULTY_LOW_ACCURACY = 85
LEARNING_DIFFICULTY_MODERATE_ACCURACY = 65

# ==========================================
# Dyslexia Indicators Risk
# Based on typing errors and reading speed vs comprehension
# ==========================================
DYSLEXIA_TYPING_ERROR_RATE_MODERATE = 0.15  # 15% error rate
DYSLEXIA_TYPING_ERROR_RATE_HIGH = 0.30      # 30% error rate
DYSLEXIA_READING_WPM_LOW = 100              # wpm
DYSLEXIA_COMPREHENSION_HIGH = 80            # Good comprehension despite low reading speed

# ==========================================
# Reading Fluency Problems
# Based on Words Per Minute (WPM)
# ==========================================
READING_FLUENCY_WPM_MODERATE = 120
READING_FLUENCY_WPM_LOW = 80

# ==========================================
# Attention Inconsistency
# Based on CPT omissions/commissions and Attention Task reaction times
# ==========================================
ATTENTION_INCONSISTENCY_MODERATE_SCORE = 65
ATTENTION_INCONSISTENCY_LOW_SCORE = 40

# ==========================================
# Concentration Problems
# Based on Focus & Engagement lookaway events and engagement score
# ==========================================
CONCENTRATION_MODERATE_ENGAGEMENT = 70
CONCENTRATION_LOW_ENGAGEMENT = 40

# ==========================================
# Cognitive Overload
# Based on Learning Behaviour persistence, skips, abandons
# ==========================================
COGNITIVE_OVERLOAD_MODERATE_PERSISTENCE = 60
COGNITIVE_OVERLOAD_LOW_PERSISTENCE = 35

# ==========================================
# Learning Engagement Risk
# Based on general engagement across tasks
# ==========================================
ENGAGEMENT_MODERATE_SCORE = 75
ENGAGEMENT_LOW_SCORE = 50
