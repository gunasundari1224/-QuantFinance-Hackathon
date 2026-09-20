from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.quant.ai_assistant import ask_gemini_assistant

router = APIRouter(prefix="/ai", tags=["AI Quant Assistant"])

class AIQuestionRequest(BaseModel):
    question: str = Field(..., description="User question about backtest results")
    context: dict = Field(default={}, description="Calculated application data context")

@router.post("/ask")
def ask_ai_assistant(req: AIQuestionRequest):
    """
    Submits user query + application quantitative context to Google Gemini API.
    """
    if not req.question or not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    result = ask_gemini_assistant(question=req.question.strip(), context=req.context)
    return result
