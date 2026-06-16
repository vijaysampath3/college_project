from typing import Dict, Any
import logging
from services.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

class PathAdaptationService:
    @staticmethod
    def adapt_path_after_activity(student_id: str, activity_code: str, score: int):
        try:
            supabase = get_supabase_client()
            
            # Find active path
            path_resp = supabase.table("student_learning_paths").select("*").eq("student_id", student_id).eq("status", "active").execute()
            if not path_resp.data:
                return

            path = path_resp.data[0]
            path_id = path["id"]
            
            # Get upcoming items of the same category
            # (We only adapt items that haven't been completed yet)
            items_resp = supabase.table("learning_path_items").select("*").eq("path_id", path_id).eq("completed", False).execute()
            items = items_resp.data
            
            if not items:
                return
            
            # Very simple adaptation: 
            # If they scored very well (> 85), find an 'Easy' item with the same code or category and make it 'Medium', or 'Medium' to 'Hard'.
            # If they scored poorly (< 60), find a 'Hard' item and make it 'Medium', or 'Medium' to 'Easy'.
            
            for item in items:
                if item["activity_code"] == activity_code:
                    new_diff = item["difficulty"]
                    if score > 85:
                        if item["difficulty"] == "Easy": new_diff = "Medium"
                        elif item["difficulty"] == "Medium": new_diff = "Hard"
                    elif score < 60:
                        if item["difficulty"] == "Hard": new_diff = "Medium"
                        elif item["difficulty"] == "Medium": new_diff = "Easy"
                    
                    if new_diff != item["difficulty"]:
                        supabase.table("learning_path_items").update({"difficulty": new_diff}).eq("id", item["id"]).execute()
                        logger.info(f"Adapted {item['id']} difficulty to {new_diff} based on score {score}")

        except Exception as e:
            logger.error(f"Failed to adapt path: {e}")
