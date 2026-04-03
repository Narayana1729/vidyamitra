import subprocess
import time
import requests

# We will start the real FastAPI app but on port 8003 and explicitly verify if it catches 500 when sending CSE
print("Starting uvicorn on 8003...")
proc = subprocess.Popen(["./venv/bin/uvicorn", "main:app", "--port", "8003"], env={"PYTHONPATH": "."})
time.sleep(3)

# I can't hit it without Auth token. But I can hit it with an invalid token and get 401 instead of 500!
# If it returns 500, it means the dependency `get_current_user` itself is crashing!
headers = {"Authorization": "Bearer fake-token"}
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

res = requests.post("http://localhost:8003/api/ml/predict-placement", json=data, headers=headers)
print("Status:", res.status_code)
print("Response:", res.text)
proc.terminate()
