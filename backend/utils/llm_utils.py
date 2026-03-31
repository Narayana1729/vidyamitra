import os
import json
import time
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

# Use the same model as roadmap_engine for consistency
LLM_MODEL = os.getenv("LLM_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")


def _extract_json(content: str) -> dict:
    """Robustly extract JSON from LLM response that may include markdown fences."""
    content = content.strip()

    # Strip markdown code fences
    if content.startswith("```json"):
        content = content[7:]
    elif content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    content = content.strip()

    # Try direct parse first
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass

    # Fallback: find outermost { ... }
    start_idx = content.find('{')
    end_idx = content.rfind('}')
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        try:
            return json.loads(content[start_idx:end_idx + 1])
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not parse JSON from LLM response: {content[:200]}")


def call_llm_json(prompt: str, model: str = None, fallback: dict = None, max_retries: int = 2) -> dict:
    """Call LLM and parse response as JSON. Retries on failure."""
    if fallback is None:
        fallback = {}
    if model is None:
        model = LLM_MODEL

    for attempt in range(max_retries):
        try:
            res = client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a rigorous data extraction AI. You MUST respond ONLY "
                            "with valid JSON exactly matching the requested schema. "
                            "No conversational text, no markdown wrappers, no explanations."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=2048,
            )
            content = res.choices[0].message.content.strip()
            return _extract_json(content)

        except Exception as e:
            print(f"[LLM JSON] Attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(1)  # brief backoff before retry

    print("[LLM JSON] All retries exhausted, returning fallback.")
    return fallback


def call_llm_text(prompt: str, model: str = None, fallback: str = "") -> str:
    """Call LLM and return plain text response."""
    if model is None:
        model = LLM_MODEL

    try:
        res = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=512,
        )
        return res.choices[0].message.content.strip()
    except Exception as e:
        print(f"[LLM Text Error] {e}")
        return fallback
