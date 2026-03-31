from fastapi import APIRouter, Depends
from routers.auth import get_current_user
from models.resume_models import MatchRequest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

router = APIRouter()

@router.post("/match")
async def match(data: MatchRequest, user=Depends(get_current_user)):
    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([data.resume, data.job])

    score = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]

    return {"match_score": round(score * 100, 2)}