from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas import schemas
from models import models
from database.database import get_db
from services.agent import process_chat
import datetime

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/")
def chat_with_agent(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    result = process_chat(request.message)
    structured_data = result.get("structured_data")
    
    if structured_data:
        action = structured_data.get("action")
        data = structured_data.get("data", {})
        
        if action == "log":
            # Optional: parse date string to real date if needed
            # For simplicity, passing directly because sqllite / postgres will attempt coercion
            import datetime
            date_str = data.get("date")
            parsed_date = None
            if date_str and isinstance(date_str, str) and date_str.strip():
                try:
                    # attempt to parse YYYY-MM-DD
                    parsed_date = datetime.datetime.strptime(date_str.strip()[:10], "%Y-%m-%d").date()
                except ValueError:
                    parsed_date = None

            new_interaction = models.Interaction(
                hcp_name=data.get("hcp_name") or "Unknown",
                interaction_type=data.get("interaction_type") or "Meeting",
                date=parsed_date,
                time=data.get("time") or "",
                attendees=data.get("attendees") or "",
                topics_discussed=data.get("topics_discussed") or "",
                materials_shared=data.get("materials_shared") or "",
                samples_distributed=data.get("samples_distributed") or "",
                sentiment=data.get("sentiment") or "",
                outcomes=data.get("outcomes") or "",
                follow_up_actions=data.get("follow_up_actions") or ""
            )
            db.add(new_interaction)
            db.commit()
            db.refresh(new_interaction)
            structured_data["id"] = new_interaction.id

    return {
        "message": result["text_response"],
        "data": structured_data
    }
