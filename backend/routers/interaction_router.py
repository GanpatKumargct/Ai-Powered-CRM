from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models import models
from schemas import schemas
from database.database import get_db

router = APIRouter(prefix="/interaction", tags=["interaction"])

@router.post("/", response_model=schemas.InteractionResponse)
def create_interaction(interaction: schemas.InteractionCreate, db: Session = Depends(get_db)):
    db_interaction = models.Interaction(**interaction.model_dump())
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

@router.put("/{id}", response_model=schemas.InteractionResponse)
def update_interaction(id: int, interaction: schemas.InteractionUpdate, db: Session = Depends(get_db)):
    db_interaction = db.query(models.Interaction).filter(models.Interaction.id == id).first()
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    
    update_data = interaction.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_interaction, key, value)
        
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

@router.delete("/{id}")
def delete_interaction(id: int, db: Session = Depends(get_db)):
    db_interaction = db.query(models.Interaction).filter(models.Interaction.id == id).first()
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    
    db.delete(db_interaction)
    db.commit()
    return {"status": "success", "message": f"Interaction {id} deleted successfully"}


@router.get("/", response_model=List[schemas.InteractionResponse])
def get_all_interactions(db: Session = Depends(get_db)):
    try:
        # Return all interactions sorted by date and time (descending)
        return db.query(models.Interaction).order_by(models.Interaction.date.desc(), models.Interaction.time.desc()).all()
    except Exception as e:
        print(f"Error in get_all_interactions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch history")

@router.get("/{hcp}", response_model=List[schemas.InteractionResponse])
def get_interaction_history(hcp: str, db: Session = Depends(get_db)):
    interactions = db.query(models.Interaction).filter(models.Interaction.hcp_name == hcp).all()
    return interactions
