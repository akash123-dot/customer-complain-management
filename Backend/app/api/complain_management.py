from fastapi import APIRouter, Depends, HTTPException, status, Body, Query, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_async_session
# from app.models.sql_models import ComplainManagement
from app.services.save_complain import SaveComplainData
from app.graph import main
from app.state import UserMessage
from app.schemas import ComplaintCreateRequest, PaginatedComplaintResponse, FinalResult
from datetime import datetime
from app.services.pdf_helper import parse_pdf_bytes
from typing import Optional
# from pydantic import Json
import json
from app.services.exceptions import NotFoundException, BadRequestException, InvalidCredentialsException


router = APIRouter(prefix="/complain", tags=["Complain Management"])


@router.post("/generate_response", status_code=status.HTTP_200_OK, response_model=FinalResult)
async def generate_response(user_query: str = Form(...),
                            user_data: Optional[str] = Form(None),  
                            pdf_file: Optional[UploadFile] = File(None)
                            ):

    final_user_data = None

    if pdf_file:
        if not pdf_file.filename.endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only .pdf files are allowed."
            )
        pdf_bytes = await pdf_file.read()
        final_user_data = await parse_pdf_bytes(pdf_bytes)

    elif user_data:
        try:
           
            final_user_data = json.loads(user_data)
        except json.JSONDecodeError:
           
            final_user_data = user_data

    final_user_message = UserMessage(user_query=user_query, user_data=final_user_data)
    response = await main(final_user_message)
    return response


@router.post("/save_data", status_code=status.HTTP_201_CREATED)
async def start_complain(
    user_message: ComplaintCreateRequest,
    session: AsyncSession = Depends(get_async_session)
) -> bool:

    try:
        session_data = SaveComplainData(session)
        result = await session_data.save_complain_data(complain_data=user_message.complaint_data, risk_analysis=user_message.defect_analysis)
        if not result:
            raise BadRequestException
        return True
    except Exception as e:
        raise 



# show all data 

@router.get("/show_data", status_code=status.HTTP_200_OK, response_model=PaginatedComplaintResponse)
async def show_data(
    limit: int = Query(20, ge=1, le=100),
    cursor: datetime | None = Query(None),
    cursor_id: int | None = Query(None),
    session: AsyncSession = Depends(get_async_session)
):
    try:
        session_data = SaveComplainData(session)
        result = await session_data.show_complain_data(limit, cursor, cursor_id)
        return result
    except Exception as e:
        raise 


#delete data

@router.delete("/delete_data/{complain_id}", status_code=status.HTTP_200_OK)
async def delete_data(
    complain_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    try:
        session_data = SaveComplainData(session)
        
        result = await session_data.delete_complain_data(complain_id)
        if not result:
            raise NotFoundException
        return True
    except Exception as e:
        raise 