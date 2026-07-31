from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime

class ExtractedComplaintData(BaseModel):
   
    complaint_source: Optional[str] = Field(None, description="e.g., Pharmacy, Email, Direct, Hospital")
    customer_name: Optional[str] = Field(None, description="Name of the customer or healthcare facility")

    
    product_name: Optional[str] = Field(None, description="Name of the drug or product")
    product_strength: Optional[str] = Field(None, description="Dosage strength e.g., 500 mg")
    batch_lot_number: Optional[str] = Field(None, description="Batch or Lot identification code")
    affected_quantity: Optional[str] = Field(None, description="Quantity affected e.g., 12 capsules, 50 vials")
    manufacturing_date: Optional[str] = Field(None, description="Manufacturing date if present")
    expiry_date: Optional[str] = Field(None, description="Expiry date if present")

    complaint_category: Optional[str] = Field(None, description="e.g., Product Defect - Discoloration, Packaging, Inefficacy")
    complaint_description: Optional[str] = Field(None, description="Detailed description of the issue reported")
    complaint_date: Optional[str] = Field(None, description="Date of the complaint")


class DefectAnalysis(BaseModel):
    
    severity: Optional[str] = Field(None, description="Severity of the issue, e.g., Minor, Moderate, Severe")
    risk_level: Optional[str] = Field(None, description="Risk level of the issue, e.g., Low, Medium, High")
    suggested_next_action: Optional[str] = Field(None, description="Suggested next action based on the severity and risk level")
    initial_risk_assessment: Optional[str] = Field(None, description="Initial risk assessment based on severity and risk level")
    prioritized_action: Optional[str] = Field(None, description="Prioritized action based on severity and risk level")

class ComplaintCreateRequest(BaseModel):
    complaint_data: ExtractedComplaintData
    defect_analysis: Optional[DefectAnalysis] = None

class OnlyComplain(BaseModel):
    complaint_data: ExtractedComplaintData


class OnlyRiskData(BaseModel):
    defect_analysis: Optional[DefectAnalysis] = None



class NextCursorSchema(BaseModel):
    cursor: datetime | None
    cursor_id: int | None

class ComplaintItemSchema(BaseModel):
    id: int
    complaint_data: Any  
    defect_analysis: Any | None
    created_at: datetime

    class Config:
        from_attributes = True  

class PaginatedComplaintResponse(BaseModel):
    items: list[ComplaintItemSchema]
    has_next: bool
    next_cursor: NextCursorSchema | None


class FinalResult(BaseModel):
    extractor: ExtractedComplaintData | None
    editor: ExtractedComplaintData | None
    risk_insights: DefectAnalysis | None