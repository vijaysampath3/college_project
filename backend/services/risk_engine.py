from typing import Dict, Any, Tuple
from config import risk_thresholds as thresholds

def _calculate_score_from_thresholds(value: float, low_threshold: float, moderate_threshold: float, invert: bool = False) -> Tuple[str, int, int]:
    """
    Helper to calculate risk level, probability and confidence.
    If invert is True, a lower value means higher risk (e.g. accuracy).
    If invert is False, a higher value means higher risk (e.g. error rate).
    """
    probability = 0
    
    if invert:
        if value >= low_threshold:
            level = "Low"
            probability = int(100 - value)
        elif value >= moderate_threshold:
            level = "Moderate"
            probability = int(100 - (value - moderate_threshold))
        else:
            level = "High"
            probability = int(100 - value)
            if probability < 70: probability = 85 # ensure high baseline
    else:
        if value <= low_threshold:
            level = "Low"
            probability = int(value * 100) if value <= 1.0 else int(value)
        elif value <= moderate_threshold:
            level = "Moderate"
            probability = int(value * 100) if value <= 1.0 else int(value)
        else:
            level = "High"
            probability = int(value * 100) if value <= 1.0 else int(value)

    # Cap probability between 5 and 95
    probability = max(5, min(95, probability))
    
    # Confidence is determined by whether we had valid data (will be adjusted by caller)
    confidence = 80 
    
    return level, probability, confidence

class RiskEngine:
    @staticmethod
    def calculate_all_risks(snapshot: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "learning_difficulties": RiskEngine.calculate_learning_difficulties_risk(snapshot),
            "dyslexia_indicators": RiskEngine.calculate_dyslexia_risk(snapshot),
            "reading_fluency": RiskEngine.calculate_reading_fluency_risk(snapshot),
            "attention_inconsistency": RiskEngine.calculate_attention_risk(snapshot),
            "concentration": RiskEngine.calculate_concentration_risk(snapshot),
            "cognitive_overload": RiskEngine.calculate_cognitive_overload_risk(snapshot),
            "learning_engagement": RiskEngine.calculate_learning_engagement_risk(snapshot)
        }

    @staticmethod
    def calculate_learning_difficulties_risk(snapshot: Dict[str, Any]) -> Dict[str, Any]:
        reading = snapshot.get("reading", {})
        comp = snapshot.get("comprehension", {})
        
        reading_acc = reading.get("metrics", {}).get("accuracy", None)
        comp_score = comp.get("metrics", {}).get("totalScore", None)
        
        if reading_acc is None and comp_score is None:
            return {"level": "Low", "probability": 10, "confidence": 10} # No data
            
        acc1 = reading_acc if reading_acc is not None else (comp_score if comp_score is not None else 100)
        acc2 = comp_score if comp_score is not None else (reading_acc if reading_acc is not None else 100)
        avg_acc = (acc1 + acc2) / 2
        
        level, prob, conf = _calculate_score_from_thresholds(
            avg_acc, 
            thresholds.LEARNING_DIFFICULTY_LOW_ACCURACY, 
            thresholds.LEARNING_DIFFICULTY_MODERATE_ACCURACY, 
            invert=True
        )
        
        # Adjust confidence based on missing data
        if reading_acc is None or comp_score is None:
            conf = 40
            
        return {"level": level, "probability": prob, "confidence": conf}

    @staticmethod
    def calculate_dyslexia_risk(snapshot: Dict[str, Any]) -> Dict[str, Any]:
        typing = snapshot.get("typing", {})
        reading = snapshot.get("reading", {})
        comp = snapshot.get("comprehension", {})
        
        typing_acc = typing.get("metrics", {}).get("accuracy", 100)
        typing_error_rate = 1.0 - (typing_acc / 100.0)
        reading_wpm = reading.get("metrics", {}).get("wpm", 150)
        comp_score = comp.get("metrics", {}).get("totalScore", 0)
        
        confidence = 85
        if not typing or not reading or not comp:
            confidence = 30
            
        probability = 15
        level = "Low"
        
        if typing_error_rate >= thresholds.DYSLEXIA_TYPING_ERROR_RATE_HIGH:
            probability += 40
        elif typing_error_rate >= thresholds.DYSLEXIA_TYPING_ERROR_RATE_MODERATE:
            probability += 20
            
        if reading_wpm < thresholds.DYSLEXIA_READING_WPM_LOW and comp_score > thresholds.DYSLEXIA_COMPREHENSION_HIGH:
            # Classic indicator: slow reading but good comprehension
            probability += 35
            
        if probability >= 65:
            level = "High"
        elif probability >= 35:
            level = "Moderate"
            
        return {"level": level, "probability": min(95, probability), "confidence": confidence}

    @staticmethod
    def calculate_reading_fluency_risk(snapshot: Dict[str, Any]) -> Dict[str, Any]:
        reading = snapshot.get("reading", {})
        reading_wpm = reading.get("metrics", {}).get("wpm", None)
        
        if reading_wpm is None:
            return {"level": "Low", "probability": 10, "confidence": 10}
            
        level, prob, conf = _calculate_score_from_thresholds(
            reading_wpm, 
            thresholds.READING_FLUENCY_WPM_MODERATE, 
            thresholds.READING_FLUENCY_WPM_LOW, 
            invert=True
        )
        return {"level": level, "probability": prob, "confidence": 90}

    @staticmethod
    def calculate_attention_risk(snapshot: Dict[str, Any]) -> Dict[str, Any]:
        attention = snapshot.get("attention", {})
        cpt = snapshot.get("cpt", {})
        
        att_score = attention.get("scores", {}).get("overallAttention", None)
        # We don't have direct omissions/commissions easily parsed, we'll use DPrime or probability if available
        cpt_prob = cpt.get("inference", {}).get("predictionProbability", None)
        
        if att_score is None and cpt_prob is None:
            return {"level": "Low", "probability": 10, "confidence": 10}
            
        confidence = 80
        if att_score is None or cpt_prob is None:
            confidence = 45
            
        probability = 20
        level = "Low"
        
        if att_score is not None:
            if att_score < thresholds.ATTENTION_INCONSISTENCY_LOW_SCORE:
                probability += 40
            elif att_score < thresholds.ATTENTION_INCONSISTENCY_MODERATE_SCORE:
                probability += 20
                
        if cpt_prob is not None:
            probability += int(cpt_prob * 50) # cpt_prob is 0-1
            
        if probability >= 70:
            level = "High"
        elif probability >= 40:
            level = "Moderate"
            
        return {"level": level, "probability": min(95, probability), "confidence": confidence}

    @staticmethod
    def calculate_concentration_risk(snapshot: Dict[str, Any]) -> Dict[str, Any]:
        focus = snapshot.get("focus", {})
        focus_score = focus.get("scores", {}).get("engagementScore", None)
        
        if focus_score is None:
            return {"level": "Low", "probability": 10, "confidence": 10}
            
        level, prob, conf = _calculate_score_from_thresholds(
            focus_score, 
            thresholds.CONCENTRATION_MODERATE_ENGAGEMENT, 
            thresholds.CONCENTRATION_LOW_ENGAGEMENT, 
            invert=True
        )
        return {"level": level, "probability": prob, "confidence": 90}

    @staticmethod
    def calculate_cognitive_overload_risk(snapshot: Dict[str, Any]) -> Dict[str, Any]:
        lb = snapshot.get("learning-behaviour", {})
        persistence = lb.get("scores", {}).get("persistenceScore", None)
        
        if persistence is None:
            return {"level": "Low", "probability": 10, "confidence": 10}
            
        level, prob, conf = _calculate_score_from_thresholds(
            persistence, 
            thresholds.COGNITIVE_OVERLOAD_MODERATE_PERSISTENCE, 
            thresholds.COGNITIVE_OVERLOAD_LOW_PERSISTENCE, 
            invert=True
        )
        return {"level": level, "probability": prob, "confidence": 85}

    @staticmethod
    def calculate_learning_engagement_risk(snapshot: Dict[str, Any]) -> Dict[str, Any]:
        lb = snapshot.get("learning-behaviour", {})
        focus = snapshot.get("focus", {})
        
        lb_score = lb.get("scores", {}).get("learningBehaviourScore", None)
        focus_score = focus.get("scores", {}).get("focusScore", None)
        
        if lb_score is None and focus_score is None:
            return {"level": "Low", "probability": 10, "confidence": 10}
            
        confidence = 85
        if lb_score is None or focus_score is None:
            confidence = 45
            
        avg = 0
        if lb_score is not None and focus_score is not None:
            avg = (lb_score + focus_score) / 2
        elif lb_score is not None:
            avg = lb_score
        else:
            avg = focus_score
            
        level, prob, conf = _calculate_score_from_thresholds(
            avg, 
            thresholds.ENGAGEMENT_MODERATE_SCORE, 
            thresholds.ENGAGEMENT_LOW_SCORE, 
            invert=True
        )
        return {"level": level, "probability": prob, "confidence": confidence}
