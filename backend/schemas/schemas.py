from pydantic import BaseModel, ConfigDict, field_validator, Field, AliasChoices
from typing import Optional, Any, Union, List
from datetime import date as dt_date

class InteractionBase(BaseModel):
    hcp_name: Optional[str] = None
    interaction_type: Optional[str] = None
    date: Optional[dt_date] = None
    time: Optional[str] = None
    attendees: Optional[Union[str, List[str]]] = None
    topics_discussed: Optional[str] = None
    materials_shared: Optional[str] = None
    samples_distributed: Optional[str] = None
    sentiment: Optional[str] = None
    outcomes: Optional[str] = None
    follow_up_actions: Optional[str] = Field(
        default=None, 
        validation_alias=AliasChoices("follow_up_actions", "follow_up"),
        serialization_alias="follow_up_actions"
    )

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )

    @field_validator('attendees', mode='before')
    @classmethod
    def format_attendees(cls, v: Any) -> Any:
        if isinstance(v, list):
            return ", ".join(filter(None, [str(i) for i in v]))
        return v

    @field_validator('*', mode='before')
    @classmethod
    def empty_string_to_none(cls, v: Any) -> Any:
        if v == "":
            return None
        return v

class InteractionCreate(InteractionBase):
    pass

class InteractionUpdate(InteractionBase):
    pass

class InteractionResponse(InteractionBase):
    id: int

class ChatRequest(BaseModel):
    message: str


