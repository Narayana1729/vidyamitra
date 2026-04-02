"""
VidyaMitra — Unified Coding Profile Aggregator
Fetches data from LeetCode, Codeforces, GitHub, and HackerRank in parallel.
All public endpoints — no API keys required.
"""

import asyncio
import httpx
from typing import Optional

TIMEOUT = httpx.Timeout(12.0, connect=8.0)


# ═══════════════════════════════════════════════════════════════════
# LEETCODE (GraphQL)
# ═══════════════════════════════════════════════════════════════════

async def fetch_leetcode(username: str) -> dict:
    """Fetch LeetCode stats via their internal GraphQL endpoint."""
    url = "https://leetcode.com/graphql"
    query = """
    query getUserProfile($username: String!) {
        matchedUser(username: $username) {
            username
            profile {
                ranking
                realName
            }
            submitStatsGlobal {
                acSubmissionNum {
                    difficulty
                    count
                }
            }
        }
        userContestRanking(username: $username) {
            rating
            globalRanking
            attendedContestsCount
        }
    }
    """

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            res = await client.post(
                url,
                json={"query": query, "variables": {"username": username}},
                headers={
                    "Content-Type": "application/json",
                    "Referer": "https://leetcode.com",
                }
            )
            data = res.json().get("data", {})

            user = data.get("matchedUser")
            if not user:
                return {"error": f"LeetCode user '{username}' not found", "platform": "leetcode"}

            stats = user.get("submitStatsGlobal", {}).get("acSubmissionNum", [])
            solved = {"All": 0, "Easy": 0, "Medium": 0, "Hard": 0}
            for s in stats:
                solved[s["difficulty"]] = s["count"]

            contest = data.get("userContestRanking") or {}

            return {
                "platform": "leetcode",
                "username": username,
                "total_solved": solved["All"],
                "easy": solved["Easy"],
                "medium": solved["Medium"],
                "hard": solved["Hard"],
                "contest_rating": round(contest.get("rating", 0)),
                "contests_attended": contest.get("attendedContestsCount", 0),
                "global_ranking": contest.get("globalRanking", 0) or user.get("profile", {}).get("ranking", 0),
            }
    except Exception as e:
        return {"error": str(e), "platform": "leetcode"}


# ═══════════════════════════════════════════════════════════════════
# CODEFORCES (REST API)
# ═══════════════════════════════════════════════════════════════════

async def fetch_codeforces(username: str) -> dict:
    """Fetch Codeforces stats via public REST API."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            # User info
            info_res = await client.get(f"https://codeforces.com/api/user.info?handles={username}")
            info_data = info_res.json()

            if info_data.get("status") != "OK":
                return {"error": f"Codeforces user '{username}' not found", "platform": "codeforces"}

            user = info_data["result"][0]

            # Contest history
            rating_res = await client.get(f"https://codeforces.com/api/user.rating?handle={username}")
            rating_data = rating_res.json()
            contests = rating_data.get("result", []) if rating_data.get("status") == "OK" else []

            return {
                "platform": "codeforces",
                "username": username,
                "rating": user.get("rating", 0),
                "max_rating": user.get("maxRating", 0),
                "rank": user.get("rank", "unrated"),
                "max_rank": user.get("maxRank", "unrated"),
                "contests_count": len(contests),
                "contribution": user.get("contribution", 0),
                "friend_count": user.get("friendOfCount", 0),
            }
    except Exception as e:
        return {"error": str(e), "platform": "codeforces"}


# ═══════════════════════════════════════════════════════════════════
# GITHUB (REST API — unauthenticated, 60 req/hr)
# ═══════════════════════════════════════════════════════════════════

async def fetch_github(username: str) -> dict:
    """Fetch GitHub profile stats via public REST API."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            # User info
            user_res = await client.get(
                f"https://api.github.com/users/{username}",
                headers={"Accept": "application/vnd.github.v3+json"}
            )
            if user_res.status_code == 404:
                return {"error": f"GitHub user '{username}' not found", "platform": "github"}

            user = user_res.json()

            # Repos (up to 100, sorted by updated)
            repos_res = await client.get(
                f"https://api.github.com/users/{username}/repos",
                params={"per_page": 100, "sort": "updated"},
                headers={"Accept": "application/vnd.github.v3+json"}
            )
            repos = repos_res.json() if repos_res.status_code == 200 else []

            # Aggregate languages and stars
            language_counts = {}
            total_stars = 0
            total_forks = 0
            for repo in repos:
                if isinstance(repo, dict) and not repo.get("fork"):
                    lang = repo.get("language")
                    if lang:
                        language_counts[lang] = language_counts.get(lang, 0) + 1
                    total_stars += repo.get("stargazers_count", 0)
                    total_forks += repo.get("forks_count", 0)

            # Top languages sorted by count
            top_languages = sorted(language_counts.items(), key=lambda x: x[1], reverse=True)

            return {
                "platform": "github",
                "username": username,
                "public_repos": user.get("public_repos", 0),
                "followers": user.get("followers", 0),
                "following": user.get("following", 0),
                "total_stars": total_stars,
                "total_forks": total_forks,
                "top_languages": [{"language": lang, "repos": count} for lang, count in top_languages[:8]],
                "bio": user.get("bio", ""),
                "avatar_url": user.get("avatar_url", ""),
                "profile_url": user.get("html_url", ""),
            }
    except Exception as e:
        return {"error": str(e), "platform": "github"}


# ═══════════════════════════════════════════════════════════════════
# HACKERRANK (Web Scrape — best effort)
# ═══════════════════════════════════════════════════════════════════

async def fetch_hackerrank(username: str) -> dict:
    """Fetch HackerRank profile via REST API (public profile endpoint)."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT, follow_redirects=True) as client:
            # HackerRank has an internal API for public profiles
            res = await client.get(
                f"https://www.hackerrank.com/rest/hackers/{username}/scores_elo",
                headers={
                    "Accept": "application/json",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
                }
            )

            if res.status_code != 200:
                return {"error": f"HackerRank user '{username}' not found or profile is private", "platform": "hackerrank"}

            scores = res.json()

            # Also try to get badges
            badges_res = await client.get(
                f"https://www.hackerrank.com/rest/hackers/{username}/badges",
                headers={
                    "Accept": "application/json",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
                }
            )
            badges = []
            if badges_res.status_code == 200:
                badges_data = badges_res.json()
                if isinstance(badges_data, dict):
                    badges_data = badges_data.get("models", badges_data.get("data", []))
                if isinstance(badges_data, list):
                    badges = [
                        {
                            "name": b.get("badge_name", b.get("name", "Unknown")),
                            "stars": b.get("stars", b.get("current_points", 0)),
                        }
                        for b in badges_data[:10]
                    ]

            # Parse scores
            domains = []
            if isinstance(scores, list):
                for s in scores:
                    domains.append({
                        "domain": s.get("name", s.get("slug", "Unknown")),
                        "score": s.get("practice", {}).get("score", 0) if isinstance(s.get("practice"), dict) else 0,
                    })

            return {
                "platform": "hackerrank",
                "username": username,
                "badges": badges,
                "domains": domains,
                "total_score": sum(d["score"] for d in domains),
            }
    except Exception as e:
        return {"error": str(e), "platform": "hackerrank"}


# ═══════════════════════════════════════════════════════════════════
# UNIFIED AGGREGATOR
# ═══════════════════════════════════════════════════════════════════

def _compute_coding_score(lc: dict, cf: dict, gh: dict, hr: dict) -> dict:
    """Compute a unified coding score from all platforms."""
    score = 0
    max_score = 0
    breakdown = {}

    # LeetCode: max 35 points
    if not lc.get("error"):
        lc_score = min(35, (
            lc.get("easy", 0) * 0.05 +
            lc.get("medium", 0) * 0.15 +
            lc.get("hard", 0) * 0.4
        ))
        score += lc_score
        max_score += 35
        breakdown["leetcode"] = round(lc_score, 1)
    
    # Codeforces: max 25 points
    if not cf.get("error"):
        rating = cf.get("rating", 0)
        cf_score = min(25, rating / 80)
        score += cf_score
        max_score += 25
        breakdown["codeforces"] = round(cf_score, 1)

    # GitHub: max 25 points
    if not gh.get("error"):
        repos = gh.get("public_repos", 0)
        stars = gh.get("total_stars", 0)
        langs = len(gh.get("top_languages", []))
        gh_score = min(25, repos * 0.3 + stars * 0.2 + langs * 1.5)
        score += gh_score
        max_score += 25
        breakdown["github"] = round(gh_score, 1)

    # HackerRank: max 15 points
    if not hr.get("error"):
        hr_total = hr.get("total_score", 0)
        badges_count = len(hr.get("badges", []))
        hr_score = min(15, hr_total * 0.01 + badges_count * 2)
        score += hr_score
        max_score += 15
        breakdown["hackerrank"] = round(hr_score, 1)

    # Normalize to 0-100
    normalized = round((score / max(max_score, 1)) * 100, 1) if max_score > 0 else 0

    # Auto-detect skills from all platforms
    skills = set()
    if not gh.get("error"):
        for lang_info in gh.get("top_languages", []):
            skills.add(lang_info["language"])
    if not lc.get("error") and lc.get("total_solved", 0) > 50:
        skills.update(["Data Structures", "Algorithms"])
    if not cf.get("error") and cf.get("rating", 0) > 1200:
        skills.update(["Competitive Programming", "Problem Solving"])

    # Rating label
    if normalized >= 80:
        level = "Advanced"
    elif normalized >= 60:
        level = "Intermediate"
    elif normalized >= 35:
        level = "Beginner"
    else:
        level = "Getting Started"

    return {
        "coding_score": normalized,
        "level": level,
        "breakdown": breakdown,
        "skills_auto_detected": sorted(list(skills)),
        "platforms_connected": sum(1 for p in [lc, cf, gh, hr] if not p.get("error")),
    }


async def fetch_all_profiles(
    leetcode_username: Optional[str] = None,
    codeforces_username: Optional[str] = None,
    github_username: Optional[str] = None,
    hackerrank_username: Optional[str] = None,
) -> dict:
    """Fetch all coding profiles in parallel and return unified result."""
    tasks = []
    keys = []

    if leetcode_username and leetcode_username.strip():
        tasks.append(fetch_leetcode(leetcode_username.strip()))
        keys.append("leetcode")
    if codeforces_username and codeforces_username.strip():
        tasks.append(fetch_codeforces(codeforces_username.strip()))
        keys.append("codeforces")
    if github_username and github_username.strip():
        tasks.append(fetch_github(github_username.strip()))
        keys.append("github")
    if hackerrank_username and hackerrank_username.strip():
        tasks.append(fetch_hackerrank(hackerrank_username.strip()))
        keys.append("hackerrank")

    if not tasks:
        return {"error": "Please provide at least one username."}

    results = await asyncio.gather(*tasks, return_exceptions=True)

    profile = {}
    for key, result in zip(keys, results):
        if isinstance(result, Exception):
            profile[key] = {"error": str(result), "platform": key}
        else:
            profile[key] = result

    # Compute unified score
    profile["computed"] = _compute_coding_score(
        profile.get("leetcode", {"error": "not provided"}),
        profile.get("codeforces", {"error": "not provided"}),
        profile.get("github", {"error": "not provided"}),
        profile.get("hackerrank", {"error": "not provided"}),
    )

    return profile
