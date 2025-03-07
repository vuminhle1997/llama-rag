from fastapi import APIRouter, UploadFile, File, Form, Depends
from pydantic import BaseModel, model_validator
from models import chat
# from dependencies import SessionDep
import json

router = APIRouter(
    prefix="/uploads",
    tags=["uploads"],
    responses={404: {"description": "Not found"}},
)

@router.get("/{file_id}")
async def read_file(file_id: str):
    return {"file_id": file_id}

@router.post("/")
async def upload_file(file: UploadFile = File(...), payload: str = Form(...),
                      # session: SessionDep = Depends(SessionDep)
                      ):
    # uploads file to a chat
    model = chat.ChatBase.model_validate(payload)
    return {"file_id": file.filename}

@router.delete("/{file_id}")
async def delete_file(file_id: str):
    # TODO: deletes file and change chat by deleting file
    return {"file_id": file_id}