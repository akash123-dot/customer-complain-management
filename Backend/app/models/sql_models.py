from sqlalchemy import Column, Integer, JSON,DateTime
from app.core.database import Base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from uuid import uuid4


class ComplainManagement(Base):
    __tablename__ = "complain_management"

    id = Column(Integer, primary_key=True, index=True)
    complaint_data = Column(JSON, nullable=False) 
    defect_analysis = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())