from sqlalchemy import Column, Integer, String, Date, Time, Text
from database.database import Base

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_name = Column(String, index=True)
    interaction_type = Column(String)
    date = Column(Date)
    time = Column(String)
    attendees = Column(String)
    topics_discussed = Column(Text)
    materials_shared = Column(String)
    samples_distributed = Column(String)
    sentiment = Column(String)
    outcomes = Column(Text)
    follow_up_actions = Column(Text)
