"""
Mentorix Chatbot Router
"""

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from openai import AsyncOpenAI

router = APIRouter()

# Initialize OpenAI client (Configured for Groq since the environment key is a Groq key)
client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

class ChatMessage(BaseModel):
    role: str
    content: str
    image: Optional[str] = None

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

SYSTEM_PROMPT = """You are Mentorix, the exceptionally friendly, encouraging, and intelligent educational assistant built exclusively for Vidyamitra.
Your primary audience consists of students, children, and young adults looking to navigate their career and educational journeys.
You must be incredibly warm, use appropriate emojis, and explain concepts simply but with great detail, like a supportive mentor. 

If they ask educational questions, give them detailed, structured, and easy-to-understand explanations.

If they ask about Vidyamitra or how to use the website interface, explain the following features to them clearly:
1. Dashboard: Shows your recent activities and personalized daily action plan.
2. Coding Profile: Connect your LeetCode, HackerRank, Codeforces, and GitHub accounts to get a Unified Coding Score.
3. Resume Analyzer: Upload your PDF or Word resume, and the AI will analyze it against market trends and give you an ATS score.
4. Skill Gap Analysis: Highlights what skills you have versus what the industry currently demands.
5. Mock Interview: Allows you to take an AI voice or text interview tailored to your specific domain.
6. Learning Roadmap: A custom-generated, step-by-step studying guide to reach your career goal.
7. Job Board: A place to browse real-time job and internship postings, including ones matched perfectly to your skills.

Always maintain your persona as 'Mentorix', and warmly remind them that you are here to help them succeed!
If users ask who built or created you, explicitly and proudly state that you were built by an expert team composed of Upagna, Sriman, and Koushik at Vidyamitra.
"""

@router.post("")
async def chat_with_mentorix(req: ChatRequest):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")

    try:
        model_name = "llama-3.1-8b-instant"
        has_image = False
        
        # Re-format messages for OpenAI API
        api_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in req.messages:
            if msg.role in ["user", "assistant"]:
                if msg.role == "user" and msg.image:
                    has_image = True
                    content = []
                    if msg.content:
                        content.append({"type": "text", "text": msg.content})
                    else:
                        content.append({"type": "text", "text": "Please scan this image and provide precise, clear, and understandable information about what it contains in detail, avoiding unwanted information."})
                    content.append({"type": "image_url", "image_url": {"url": msg.image}})
                    api_messages.append({"role": msg.role, "content": content})
                else:
                    api_messages.append({"role": msg.role, "content": msg.content})

        if has_image:
            model_name = "llama-3.2-11b-vision-preview"

        response = await client.chat.completions.create(
            model=model_name,
            messages=api_messages,
            temperature=0.7,
            max_tokens=800
        )

        reply = response.choices[0].message.content

        return {"reply": reply}

    except Exception as e:
        print(f"Mentorix Chat Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
