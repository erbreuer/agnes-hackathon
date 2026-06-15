"""Agents: scout_products — F04."""
import json
import os

import httpx
from dotenv import load_dotenv

load_dotenv()

SERPAPI_KEY = os.getenv("SERPAPI_KEY", "")
_CATALOG_PATH = os.path.join(os.path.dirname(__file__), "..", "catalog.json")
_catalog_cache: list[dict] | None = None

# Map F03 category strings → catalog category keys
_CATEGORY_ALIASES = {
    "floor lamp": "lamp",
    "table lamp": "lamp",
    "ceiling lamp": "lamp",
    "accent chair": "chair",
    "dining chair": "chair",
    "lounge chair": "chair",
    "armchair": "chair",
    "coffee table": "table",
    "dining table": "table",
    "side table": "table",
    "end table": "table",
    "area rug": "rug",
    "throw rug": "rug",
    "bookcase": "shelf",
    "bookshelf": "shelf",
    "shelving unit": "shelf",
    "wall art": "art",
    "artwork": "art",
    "painting": "art",
    "throw pillows": "art",
    "decor": "art",
    "indoor plant": "plant",
    "potted plant": "plant",
    "houseplant": "plant",
}


def _normalize_category(category: str) -> str:
    return _CATEGORY_ALIASES.get(category.lower().strip(), category.lower().strip())


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
    cat = _normalize_category(item.get("category", ""))
    budget = item["budget_cap"]
    matches = [p for p in catalog if p.get("category") == cat and p.get("price", 0) <= budget]
    if not matches:
        matches = [p for p in catalog if p.get("price", 0) <= budget]
    if not matches:
        return None
    return matches[0]


async def scout_products(items: list[dict]) -> list[dict]:
    """items = [{"search_query": str, "budget_cap"|"max_price": int, "category": str}, ...]"""
    results = []
    async with httpx.AsyncClient(timeout=15) as client:
        for item in items:
            normalized = {
                "search_query": item["search_query"],
                "budget_cap": item.get("budget_cap") or item.get("max_price", 0),
                "category": item.get("category", ""),
            }
            product = await _fetch_serpapi(client, normalized) or _fallback(normalized)
            if product:
                results.append(product)
    return results
