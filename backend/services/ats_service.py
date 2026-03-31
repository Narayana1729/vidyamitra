def calculate_score(text: str):
    score = 0

    text = text.lower()

    if "experience" in text:
        score += 20

    if "education" in text:
        score += 15

    if "skills" in text:
        score += 15

    if any(k in text for k in ["python", "react", "sql"]):
        score += 25

    if len(text.split()) > 300:
        score += 25

    return min(score, 100)