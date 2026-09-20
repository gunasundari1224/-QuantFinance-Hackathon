import os
import json
from app.core.config import settings

SYSTEM_INSTRUCTION = """You are an Explainable Quantitative Research Assistant inside a historical financial backtesting platform.

Your job is to explain the application's calculated historical results clearly and factually.

Use ONLY the quantitative data supplied by the application context.

Never invent prices, returns, Sharpe ratios, drawdowns, trades, market regimes, or other financial metrics.

Do not provide personalized financial advice.

Do not tell users what they should buy, sell, hold, or invest in.

Do not make unsupported predictions about future market performance.

Clearly distinguish historical observations from predictions.

When explaining a strategy, reference the supplied metrics and historical market regime.

If the supplied data is insufficient to answer the question, clearly state that the required information is unavailable.

Keep explanations concise, structured, and understandable."""

def ask_gemini_assistant(question: str, context: dict) -> dict:
    """
    Sends question + real application quantitative backtest data context to Google Gemini API.
    Returns generated response or safe user-friendly error message.
    """
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    model_name = settings.GEMINI_MODEL or "gemini-2.5-flash"

    if not api_key:
        return {
            "success": False,
            "error": "GEMINI_API_KEY is not configured on the backend. Please add GEMINI_API_KEY=your_key to backend/.env",
            "model": model_name
        }

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        prompt_payload = f"""
Current Backtest Application Context:
{json.dumps(context, indent=2)}

User Question:
{question}
"""

        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            temperature=0.2,
            max_output_tokens=1000
        )

        response = client.models.generate_content(
            model=model_name,
            contents=prompt_payload,
            config=config
        )

        return {
            "success": True,
            "answer": response.text,
            "model": model_name
        }
    except Exception as e:
        error_text = str(e)
        # Redact API key from any error messages to guarantee security
        if api_key and api_key in error_text:
            error_text = error_text.replace(api_key, "[REDACTED_API_KEY]")
            
        return {
            "success": False,
            "error": f"Gemini API Error: {error_text}",
            "model": model_name
        }
