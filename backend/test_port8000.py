import requests

data = {
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
}

res = requests.post("http://localhost:8000/api/ml/predict-placement", json=data)
print("Status:", res.status_code)
print("Response:", res.text)
if res.status_code == 401:
    print("Please bypass auth for testing or provide token!")
