"""
VidyaMitra — Synthetic Student Dataset Generator
Generates 600 realistic student profiles with placement outcomes.
Run: python generate_dataset.py
"""

import numpy as np
import pandas as pd
import os
import random

np.random.seed(42)
random.seed(42)

NUM_STUDENTS = 600

BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil']
BRANCH_WEIGHTS = [0.30, 0.15, 0.20, 0.10, 0.15, 0.10]


def generate_students() -> pd.DataFrame:
    data = []

    for i in range(NUM_STUDENTS):
        branch = np.random.choice(BRANCHES, p=BRANCH_WEIGHTS)

        # Branch-specific base distributions
        if branch in ['CSE', 'IT']:
            cgpa            = np.clip(np.random.normal(7.8, 1.0), 5.0, 10.0)
            leetcode        = int(np.clip(np.random.exponential(85), 0, 500))
            github_repos    = int(np.clip(np.random.normal(15, 8), 0, 60))
            skills_count    = int(np.clip(np.random.normal(18, 5), 3, 35))
        elif branch in ['ECE', 'EEE']:
            cgpa            = np.clip(np.random.normal(7.5, 1.0), 5.0, 10.0)
            leetcode        = int(np.clip(np.random.exponential(30), 0, 300))
            github_repos    = int(np.clip(np.random.normal(8, 5), 0, 40))
            skills_count    = int(np.clip(np.random.normal(12, 4), 3, 25))
        else:  # Mechanical, Civil
            cgpa            = np.clip(np.random.normal(7.3, 1.0), 5.0, 10.0)
            leetcode        = int(np.clip(np.random.exponential(10), 0, 100))
            github_repos    = int(np.clip(np.random.normal(4, 3), 0, 20))
            skills_count    = int(np.clip(np.random.normal(8, 3), 3, 20))

        certifications  = int(np.clip(np.random.poisson(2.0), 0, 10))
        projects        = int(np.clip(np.random.poisson(4.0), 0, 12))
        internships     = int(np.clip(np.random.poisson(1.0), 0, 5))
        backlogs        = int(np.clip(np.random.poisson(0.3), 0, 6))
        hackathons      = int(np.clip(np.random.poisson(2.0), 0, 10))

        # ATS score — correlated with skills + certifications + CGPA
        ats_base  = 25 + (skills_count * 1.5) + (certifications * 3) + (cgpa * 3)
        ats_score = round(np.clip(ats_base + np.random.normal(0, 10), 20, 98), 1)

        # Interview score — correlated with leetcode + CGPA + projects
        int_base        = 25 + (leetcode * 0.10) + (cgpa * 3) + (projects * 2)
        interview_score = round(np.clip(int_base + np.random.normal(0, 15), 10, 100), 1)

        # Placement probability (logistic function)
        placement_score = (
            cgpa            * 8.0  +
            min(leetcode, 200) * 0.15 +
            certifications  * 2.5  +
            projects        * 1.5  +
            internships     * 5.0  +
            ats_score       * 0.12 +
            skills_count    * 0.60 +
            hackathons      * 1.5  +
            interview_score * 0.12 -
            backlogs        * 5.0
        )
        placed_prob = 1 / (1 + np.exp(-(placement_score - 90) / 12))
        placed      = int(np.random.random() < placed_prob)

        # Company type
        if not placed:
            company_type = "Not Placed"
        elif cgpa >= 8.0 and leetcode >= 100 and ats_score >= 70:
            company_type = np.random.choice(["Product", "Startup"], p=[0.65, 0.35])
        elif cgpa >= 7.0:
            company_type = np.random.choice(["Service", "Startup", "Core"], p=[0.50, 0.30, 0.20])
        else:
            company_type = np.random.choice(["Service", "Core"], p=[0.70, 0.30])

        data.append({
            'student_id'            : f'STU{i+1:04d}',
            'branch'                : branch,
            'cgpa'                  : round(cgpa, 2),
            'leetcode_count'        : leetcode,
            'certifications_count'  : certifications,
            'projects_count'        : projects,
            'internships_count'     : internships,
            'backlogs'              : backlogs,
            'github_repos'          : github_repos,
            'hackathons_count'      : hackathons,
            'skills_count'          : skills_count,
            'ats_score'             : ats_score,
            'interview_score'       : interview_score,
            'placed'                : placed,
            'company_type'          : company_type,
        })

    return pd.DataFrame(data)


if __name__ == '__main__':
    os.makedirs('data', exist_ok=True)
    df = generate_students()
    df.to_csv('data/students.csv', index=False)

    print(f"✅ Generated {len(df)} student profiles → data/students.csv")
    print(f"   Placement rate : {df['placed'].mean():.1%}")
    print(f"\n   Branch distribution:")
    print(df['branch'].value_counts().to_string())
    print(f"\n   Company types:")
    print(df['company_type'].value_counts().to_string())
