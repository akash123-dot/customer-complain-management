import io
import asyncio
from pypdf import PdfReader
from fastapi import HTTPException, status

def parse_pdf(pdf_bytes: bytes) -> str:
    
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        
        extracted_text = []
        for page_num, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                extracted_text.append(f"--- Page {page_num + 1} ---\n{text}")
                
        full_text = "\n\n".join(extracted_text).strip()
        if not full_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded PDF contains no readable text."
            )
        return full_text
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse PDF document: {str(e)}"
        )

async def parse_pdf_bytes(pdf_bytes: bytes) -> str:
    
    return await asyncio.to_thread(parse_pdf, pdf_bytes)