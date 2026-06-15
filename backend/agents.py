"""Agents: scout_products — F04."""
import json
import os

import httpx
from dotenv import load_dotenv

load_dotenv()

SERPAPI_KEY = os.getenv("SERPAPI_KEY", "")
_CATALOG_PATH = os.path.join(os.path.dirname(__file__), "catalog.json")
_catalog_cache: list[dict] | None = None


def _load_catalog() -> list[dict]:
    global _catalog_cache
    if _catalog_cache is None:
        with open(_CATALOG_PATH) as f:
            _catalog_cache = json.load(f)
    return _catalog_cache


async def _fetch_serpapi(client: httpx.AsyncClient, item: dict) -> dict | None:
    try:
        resp = await client.get(
            "https://serpapi.com/search",
            params={
                "engine": "google_shopping",
                "q": item["search_query"],
                "max_price": item["budget_cap"],
                "api_key": SERPAPI_KEY,
            },
        )
        resp.raise_for_status()
        results = resp.json().get("shopping_results", [])
        if not results:
            return None
        r = results[0]
        return {
            "name": r.get("title", ""),
            "price": r.get("extracted_price", 0),
            "link": r.get("product_link", ""),
            "image": r.get("thumbnail", ""),
        }
    except Exception:
        return None


def _fallback(item: dict) -> dict | None:
    catalog = _load_catalog()
    matches = [
        p for p in catalog
        if p.get("category") == item.get("category") and p.get("price", 0) <= item["budget_cap"]
    ]
    if not matches:
        matches = [p for p in catalog if p.get("price", 0) <= item["budget_cap"]]
    if not matches:
        return None
    return matches[0]


async def scout_products(items: list[dict]) -> list[dict]:
    """items = [{"search_query": str, "budget_cap": int, "category": str}, ...]"""
    results = []
    async with httpx.AsyncClient(timeout=15) as client:
        for item in items:
            product = await _fetch_serpapi(client, item) or _fallback(item)
            if product:
                results.append(product)
    return results
