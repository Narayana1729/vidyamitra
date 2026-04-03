from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

dummyProfile = {
    "cgpa": 8.5,
    "leetcode_count": 120,
    "certifications_count": 2,
    "projects_count": 4,
    "internships_count": 1,
    "backlogs": 0,
    "github_repos": 15,
    "hackathons_count": 2,
    "skills_count": 8,
    "ats_score": 85,
    "interview_score": 75,
}

print("Testing placement...")
p = dummyProfile.copy()
p["branch"] = "CSE"
res = client.post("/api/ml/predict-placement", json=p)
print(res.status_code, res.json())

print("Testing archetype...")
a = dummyProfile.copy()
# Note: no branch
res = client.post("/api/ml/career-archetype", json=a)
print(res.status_code, res.json())

print("Done")
