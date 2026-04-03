from fastapi.testclient import TestClient
from main import app
from routers.auth import get_current_user

# Mock auth dependency
app.dependency_overrides[get_current_user] = lambda: {"id": "test-user"}

client = TestClient(app)

res = client.post("/api/ml/predict-placement", json={
    "cgpa": 7.5,
    "leetcode_count": 50,
    "certifications_count": 2,
    "projects_count": 4,
    "internships_count": 1,
    "backlogs": 0,
    "github_repos": 15,
    "hackathons_count": 2,
    "skills_count": 8,
    "ats_score": 85,
    "interview_score": 75,
    "branch": "Software Engineering / CS / IT"
})

print("Status:", res.status_code)
print("Response:", res.json())
