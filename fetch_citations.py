#!/usr/bin/env python3
"""
Fetches live Google Scholar citation metrics via SerpApi
(https://serpapi.com/google-scholar-author-api) and writes them
into citations.json at the repo root, which the site's front-end
(publications.html) reads to render the citation stats + bar chart.

Requires the environment variable SERPAPI_KEY (a free SerpApi key).
Run by .github/workflows/update-citations.yml on a weekly schedule.
"""

import json
import os
import sys
from datetime import datetime, timezone
from urllib.request import urlopen
from urllib.parse import urlencode
from urllib.error import URLError, HTTPError

AUTHOR_ID = "WUUOPUAAAAAJ"  # Dr. Ravi Sharma's Google Scholar author ID
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "citations.json")


def fetch_serpapi_data(api_key: str) -> dict:
    params = {
        "engine": "google_scholar_author",
        "author_id": AUTHOR_ID,
        "api_key": api_key,
    }
    url = "https://serpapi.com/search.json?" + urlencode(params)
    with urlopen(url, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def extract_metrics(data: dict) -> dict:
    cited_by = data.get("cited_by", {})
    table = cited_by.get("table", [])

    total_citations = None
    h_index = None
    i10_index = None

    for row in table:
        if "citations" in row:
            total_citations = row["citations"].get("all")
        if "h_index" in row:
            h_index = row["h_index"].get("all")
        if "i10_index" in row:
            i10_index = row["i10_index"].get("all")

    citations_by_year = {}
    for point in cited_by.get("graph", []):
        year = point.get("year")
        citations = point.get("citations")
        if year is not None and citations is not None:
            citations_by_year[str(year)] = citations

    return {
        "total_citations": total_citations,
        "h_index": h_index,
        "i10_index": i10_index,
        "citations_by_year": citations_by_year,
    }


def main() -> int:
    api_key = os.environ.get("SERPAPI_KEY")
    if not api_key:
        print("ERROR: SERPAPI_KEY environment variable not set.", file=sys.stderr)
        return 1

    try:
        raw = fetch_serpapi_data(api_key)
    except (URLError, HTTPError) as exc:
        print(f"ERROR: failed to reach SerpApi: {exc}", file=sys.stderr)
        return 1

    if "error" in raw:
        print(f"ERROR: SerpApi returned an error: {raw['error']}", file=sys.stderr)
        return 1

    metrics = extract_metrics(raw)

    if metrics["total_citations"] is None:
        print("ERROR: could not parse citation data from SerpApi response.", file=sys.stderr)
        return 1

    output = {
        "google_scholar": metrics,
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
        f.write("\n")

    print(f"Updated {OUTPUT_PATH}: {metrics['total_citations']} citations, "
          f"h-index {metrics['h_index']}, i10-index {metrics['i10_index']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
