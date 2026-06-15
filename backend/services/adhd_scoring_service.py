import math
from typing import List, Dict, Any
from pydantic import BaseModel
import scipy.stats as stats
import numpy as np

class CPTEvent(BaseModel):
    trial: int
    stimulus: str
    isTarget: bool
    responded: bool
    reactionTime: float
    timestamp: float
    block: int
    isi: int

class CPTScoreRequest(BaseModel):
    events: List[CPTEvent]
    durationMinutes: float

def _safe_mean(values: List[float]) -> float:
    if not values:
        return 0.0
    return float(np.mean(values))

def _safe_se(values: List[float]) -> float:
    if len(values) < 2:
        return 0.0
    return float(np.std(values, ddof=1) / math.sqrt(len(values)))

def calculate_cpt_metrics(request: CPTScoreRequest) -> Dict[str, Any]:
    events = request.events
    duration_mins = request.durationMinutes
    
    targets = [e for e in events if e.isTarget]
    non_targets = [e for e in events if not e.isTarget]
    
    hits = [e for e in targets if e.responded]
    omissions = [e for e in targets if not e.responded]
    commissions = [e for e in non_targets if e.responded]
    
    # Perseverations: Responses with RT < 100ms (often anticipatory or random pressing)
    perseverations = len([e for e in events if e.responded and e.reactionTime < 100])
    
    hit_rts = [e.reactionTime for e in hits if e.reactionTime >= 100]  # Excluding perseverations from HitRT
    
    hit_rt = _safe_mean(hit_rts)
    hit_se = _safe_se(hit_rts)
    
    # VarSE: Standard error of the variance. 
    # Approximation: var * sqrt(2/(N-1))
    var_se = 0.0
    if len(hit_rts) > 1:
        var = np.var(hit_rts, ddof=1)
        var_se = float(var * math.sqrt(2 / (len(hit_rts) - 1)))
        
    # SDT Metrics: DPrime and Beta
    hit_rate = len(hits) / len(targets) if targets else 0.0
    fa_rate = len(commissions) / len(non_targets) if non_targets else 0.0
    
    # Adjust extreme values for z-score calculation
    adj_hit_rate = min(max(hit_rate, 0.01), 0.99)
    adj_fa_rate = min(max(fa_rate, 0.01), 0.99)
    
    z_hr = stats.norm.ppf(adj_hit_rate)
    z_fa = stats.norm.ppf(adj_fa_rate)
    
    d_prime = float(z_hr - z_fa)
    beta = float(math.exp((z_fa**2 - z_hr**2) / 2))
    
    # Block calculations (4 blocks)
    blocks = {1: [], 2: [], 3: [], 4: []}
    for e in hits:
        if e.reactionTime >= 100 and e.block in blocks:
            blocks[e.block].append(e.reactionTime)
            
    block_means = [_safe_mean(blocks[b]) for b in range(1, 5) if blocks[b]]
    block_ses = [_safe_se(blocks[b]) for b in range(1, 5) if blocks[b]]
    
    hit_rt_block = _safe_se(block_means) if len(block_means) > 1 else 0.0
    hit_se_block = _safe_se(block_ses) if len(block_ses) > 1 else 0.0
    
    # ISI calculations (e.g. 1000, 2000, 4000)
    isi_dict = {}
    for e in hits:
        if e.reactionTime >= 100:
            if e.isi not in isi_dict:
                isi_dict[e.isi] = []
            isi_dict[e.isi].append(e.reactionTime)
            
    isi_means = [_safe_mean(rts) for rts in isi_dict.values()]
    isi_ses = [_safe_se(rts) for rts in isi_dict.values()]
    
    hit_rt_isi = _safe_se(isi_means) if len(isi_means) > 1 else 0.0
    hit_se_isi = _safe_se(isi_ses) if len(isi_ses) > 1 else 0.0
    
    # Adhd Confidence Index Proxy
    # Normalizing raw metrics using assumed typical bounds.
    # High Omissions/Commissions/Variability -> higher index.
    norm_omissions = min(len(omissions) / 10.0, 1.0) # Assume 10+ is very high
    norm_commissions = min(len(commissions) / 15.0, 1.0)
    
    # Normal RT is ~350-450. Slow RT > 600
    norm_rt = max(0.0, min((hit_rt - 400) / 300.0, 1.0)) 
    norm_var = min(hit_se / 50.0, 1.0) if hit_se else 0.0
    
    # Combined proxy confidence (0.0 to 100.0)
    confidence_index = (norm_omissions * 0.35 + norm_commissions * 0.35 + norm_rt * 0.15 + norm_var * 0.15) * 100.0
    
    metrics = {
        "Assessment Duration": float(duration_mins),
        "Raw Score Omissions": float(len(omissions)),
        "Raw Score Commissions": float(len(commissions)),
        "Raw Score HitRT": float(hit_rt),
        "Raw Score HitSE": float(hit_se),
        "Raw Score VarSE": float(var_se),
        "Raw Score DPrime": float(d_prime),
        "Raw Score Beta": float(beta),
        "Raw Score Perseverations": float(perseverations),
        "Raw Score HitRTBlock": float(hit_rt_block),
        "Raw Score HitSEBlock": float(hit_se_block),
        "Raw Score HitRTIsi": float(hit_rt_isi),
        "Raw Score HitSEIsi": float(hit_se_isi),
        "Adhd Confidence Index": float(confidence_index)
    }
    
    return metrics
