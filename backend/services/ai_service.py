# ai_service.py — Legacy module, kept for backwards compatibility.
# All LLM calls now go through utils/llm_utils.py.
# This module re-exports the shared client for any code that may import it.

from utils.llm_utils import call_llm_text

def improve_bullet(text: str) -> str:
    """Improve a resume bullet point using AI."""
    prompt = (
        "Improve this resume bullet point using strong action verbs, "
        "measurable impact, and clarity. Return ONLY the improved sentence, "
        "no conversational text.\n\n"
        f"Input: {text}"
    )
    return call_llm_text(prompt, fallback=text)