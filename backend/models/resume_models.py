from pydantic import BaseModel

class ImproveRequest(BaseModel):
    text: str


class MatchRequest(BaseModel):
    resume: str
    job: str


class ScoreRequest(BaseModel):
    resume: str
    