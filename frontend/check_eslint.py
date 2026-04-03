import json; [print(f"{f[\"filePath\"]}: {len(f[\"messages\"])} issues") for f in json.load(open("eslint.json", encoding="utf-16le")) if len(f["messages"]) > 0]
