"""
VidyaMitra — Resume-to-Role Classifier
TF-IDF + RandomForest: skill text → predicted job role
Output: models/role_classifier.pkl
Run: python train_role_classifier.py
"""

import os
import random
import joblib
import numpy as np

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report

random.seed(42)
np.random.seed(42)

# ── Skill profiles per role (templates for synthetic resume text) ─────────────
ROLE_SKILL_PROFILES = {
    "Data Scientist": [
        "Python Statistics Machine Learning scikit-learn Pandas NumPy TensorFlow Deep Learning Jupyter SQL Data Visualization",
        "Python ML algorithms regression classification clustering neural networks feature engineering A/B testing statistical modeling",
        "machine learning deep learning NLP computer vision Python R SQL Tableau data wrangling model deployment MLflow",
        "Python statistics hypothesis testing regression trees ensemble methods pandas seaborn matplotlib sklearn keras",
    ],
    "Full Stack Developer": [
        "React JavaScript Node.js Express MongoDB SQL REST APIs HTML CSS Git Docker TypeScript Redux",
        "React Node.js PostgreSQL Docker Kubernetes CI/CD REST APIs TypeScript Tailwind CSS Next.js GraphQL",
        "JavaScript HTML CSS React Redux Node Express SQL MongoDB GraphQL Git deployment Webpack Vite",
        "Full stack React Next.js Node.js Express PostgreSQL TypeScript Docker REST API authentication JWT",
    ],
    "DevOps Engineer": [
        "Docker Kubernetes CI/CD Jenkins AWS Linux Bash Terraform Ansible Monitoring Git Prometheus Grafana",
        "AWS GCP Azure Kubernetes Docker Terraform CI/CD GitHub Actions Linux scripting infrastructure as code",
        "DevOps Linux Docker Kubernetes Helm Prometheus Grafana Jenkins pipeline automation cloud networking",
        "CI/CD pipeline Jenkins GitHub Actions AWS ECS Terraform Ansible configuration management Linux shell scripting",
    ],
    "Backend Developer": [
        "Python FastAPI SQL PostgreSQL REST APIs Docker Redis Authentication JWT Linux Git testing pytest",
        "Java Spring Boot SQL MySQL Microservices Docker Git REST APIs JUnit Kafka message queues",
        "Node.js Express MongoDB PostgreSQL Redis Authentication REST APIs Git Linux Docker TypeScript",
        "Python Django REST framework PostgreSQL Celery Redis Docker nginx authentication permissions caching",
    ],
    "Frontend Developer": [
        "React JavaScript HTML CSS TypeScript Responsive Design Figma Git Webpack Tailwind animations",
        "React Angular Vue JavaScript CSS UI/UX design systems Storybook accessibility performance optimization",
        "HTML CSS JavaScript React TypeScript Next.js Tailwind CSS Framer Motion Web APIs browser compatibility",
        "React Redux TypeScript CSS modules Figma accessibility WCAG performance Lighthouse testing Jest",
    ],
    "Embedded Engineer": [
        "Microcontrollers ARM C C++ RTOS Embedded Systems I2C SPI UART PCB Design Oscilloscopes Firmware",
        "STM32 Arduino ESP32 Embedded Linux RTOS C programming hardware debugging communication protocols sensors",
        "Embedded systems ARM Cortex microcontrollers firmware C C++ digital electronics sensors actuators bare-metal",
        "FreeRTOS Embedded C ARM Cortex-M STM32 I2C SPI UART GPIO interrupt debugging JTAG",
    ],
    "Data Analyst": [
        "SQL Excel Power BI Tableau Python Pandas statistics data visualization reporting dashboards KPI analysis",
        "SQL MySQL Power BI Excel Python Matplotlib business intelligence data cleaning ETL analysis pivot tables",
        "Excel Power BI Tableau SQL Python statistics VLOOKUP data storytelling stakeholder reporting automation",
        "SQL data analysis Python Pandas Excel dashboards business reporting A/B testing cohort analysis metrics",
    ],
    "Mobile Developer": [
        "React Native Flutter JavaScript TypeScript iOS Android Firebase REST APIs Git App Store deployment",
        "Flutter Dart Android iOS React Native Redux Firebase push notifications performance user authentication",
        "React Native Expo TypeScript Redux Firebase Android iOS app deployment navigation offline storage",
        "Flutter Riverpod REST API Firebase SQLite animations iOS Android cross-platform UI responsive design",
    ],
    "VLSI Engineer": [
        "Verilog VHDL VLSI Digital Electronics FPGA SystemVerilog Cadence Static Timing Analysis simulation",
        "Digital design RTL verification Verilog VHDL FPGA Xilinx ModelSim synthesis timing closure STA",
        "VLSI chip design Verilog SystemVerilog FPGA Cadence Virtuoso simulation verification low power",
        "RTL design synthesis place-and-route Verilog SystemVerilog UVM verification Questasim coverage",
    ],
    "Mechanical Design Engineer": [
        "SolidWorks AutoCAD ANSYS GD&T Material Science Machine Design FEA Finite Element Analysis manufacturing",
        "CAD design SolidWorks CATIA ANSYS thermodynamics fluid mechanics manufacturing processes tolerances",
        "mechanical design AutoCAD SolidWorks FEA ANSYS assemblies drawings BOM product lifecycle DFM",
        "CATIA SolidWorks ANSYS Workbench stress analysis thermal simulation tolerance stack-up machining casting",
    ],
}


def generate_resume_dataset(n_per_role: int = 80):
    texts, labels = [], []
    for role, templates in ROLE_SKILL_PROFILES.items():
        for _ in range(n_per_role):
            base  = random.choice(templates).split()
            random.shuffle(base)
            drop  = random.randint(0, len(base) // 4)
            sample = base[drop:]
            noise  = random.sample(
                ["communication", "teamwork", "leadership", "agile", "scrum",
                 "git", "problem solving", "documentation", "code review"],
                random.randint(1, 3)
            )
            texts.append(" ".join(sample + noise))
            labels.append(role)
    return texts, labels


def train():
    os.makedirs('models', exist_ok=True)

    texts, labels = generate_resume_dataset(n_per_role=90)

    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )

    model = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            min_df=2,
            max_features=8000,
            stop_words='english',
            sublinear_tf=True,
        )),
        ('clf', RandomForestClassifier(
            n_estimators=300,
            max_depth=25,
            min_samples_split=4,
            random_state=42,
            n_jobs=-1,
        ))
    ])

    model.fit(X_train, y_train)

    y_pred    = model.predict(X_test)
    acc       = accuracy_score(y_test, y_pred)
    cv_scores = cross_val_score(model, texts, labels, cv=5)

    print(f"✅ Role Classifier")
    print(f"   Test Accuracy : {acc:.2%}")
    print(f"   CV Accuracy   : {cv_scores.mean():.2%} ± {cv_scores.std():.2%}")
    print()
    print(classification_report(y_test, y_pred))

    joblib.dump(model, 'models/role_classifier.pkl')
    print("✅ Saved: role_classifier.pkl")
    return model


# ── Inference helper ──────────────────────────────────────────────────────────
def predict_role(skills_text: str) -> dict:
    """
    Input: comma or space separated skills string
    e.g. "Python, TensorFlow, scikit-learn, Pandas, SQL"
    """
    model  = joblib.load('models/role_classifier.pkl')
    probs  = model.predict_proba([skills_text])[0]
    roles  = model.classes_
    top3   = sorted(zip(roles, probs), key=lambda x: x[1], reverse=True)[:3]

    return {
        "best_match"  : top3[0][0],
        "confidence"  : round(float(top3[0][1]) * 100, 1),
        "top_matches" : [
            {"role": r, "score": round(float(p) * 100, 1)} for r, p in top3
        ],
        "message": f"Your skills best match a {top3[0][0]} role ({round(top3[0][1]*100,1)}% confidence)."
    }


if __name__ == '__main__':
    train()

    print("\n── Smoke Test ──")
    result = predict_role("Python Machine Learning TensorFlow Pandas scikit-learn SQL Jupyter statistics")
    print(f"Best Match : {result['best_match']} ({result['confidence']}%)")
    print(f"Top 3:")
    for m in result['top_matches']:
        print(f"  {m['role']:30s} {m['score']}%")
