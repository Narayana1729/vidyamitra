"""
Sandboxed code execution endpoint.
Runs user code in a subprocess with timeout and output capture.
Supports: Python, JavaScript, TypeScript (via tsx).
"""
import subprocess, tempfile, os
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from routers.auth import get_current_user

router = APIRouter()

TIMEOUT_SECONDS = 10
MAX_OUTPUT_CHARS = 5000

# Map frontend language keys → file extension + command
LANG_CONFIG = {
    "python":     {"ext": ".py",  "cmd": lambda f: ["python3", f]},
    "javascript": {"ext": ".js",  "cmd": lambda f: ["node", f]},
    "typescript": {"ext": ".ts",  "cmd": lambda f: ["npx", "-y", "tsx", f]},
}


class RunRequest(BaseModel):
    language: str
    code: str
    stdin: str = ""


@router.post("/run")
def run_code(data: RunRequest, user=Depends(get_current_user)):
    lang = data.language.lower()

    if lang not in LANG_CONFIG:
        return {
            "success": False,
            "output": f"Language '{lang}' is not supported for execution. Supported: {', '.join(LANG_CONFIG.keys())}",
        }

    config = LANG_CONFIG[lang]

    # Write code to a temp file
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=config["ext"], delete=False, dir=tempfile.gettempdir()
        ) as f:
            f.write(data.code)
            tmp_path = f.name
    except Exception as e:
        return {"success": False, "output": f"Failed to create temp file: {e}"}

    try:
        result = subprocess.run(
            config["cmd"](tmp_path),
            input=data.stdin,
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SECONDS,
            env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        )

        stdout = (result.stdout or "").strip()
        stderr = (result.stderr or "").strip()

        if result.returncode != 0 and stderr:
            return {
                "success": False,
                "output": stderr[:MAX_OUTPUT_CHARS],
            }

        return {
            "success": True,
            "output": (stdout or "(No output)")[:MAX_OUTPUT_CHARS],
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "output": f"⏱ Code execution timed out after {TIMEOUT_SECONDS} seconds. Check for infinite loops.",
        }
    except Exception as e:
        return {"success": False, "output": str(e)}
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
