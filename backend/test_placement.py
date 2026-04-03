import asyncio
import sys
from routers.ml_router import *

class DummyReq:
    def __init__(self):
        self.cgpa = 8.5
        self.internships = 1
        self.projects = 3
        self.dsa_score = 80
        self.core_cs_score = 75
        self.soft_skills = 80
        self.branch = "Software Engineering / CS / IT"
        self.hackathons = 1
    def model_dump(self):
        return {
            "cgpa": self.cgpa, "internships": self.internships,
            "projects": self.projects, "dsa_score": self.dsa_score,
            "core_cs_score": self.core_cs_score, "soft_skills": self.soft_skills,
            "branch": self.branch, "hackathons": self.hackathons
        }

async def run():
    try:
        res = await predict_placement(DummyReq())
        print("Success:", res)
    except Exception as e:
        import traceback
        traceback.print_exc(file=sys.stdout)

if __name__ == "__main__":
    asyncio.run(run())
