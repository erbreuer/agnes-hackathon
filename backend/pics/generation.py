import base64
import httpx
import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

API_KEY = os.getenv("AGNES_API_KEY")
API_URL = "https://apihub.agnes-ai.com/v1/images/generations"
PICS_DIR = Path(__file__).parent


def encode_image(path: Path) -> str:
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    suffix = path.suffix.lstrip(".")
    mime = "jpeg" if suffix in ("jpg", "jpeg") else suffix
    return f"data:image/{mime};base64,{b64}"


PRODUCT_IMAGE_URL = (
    "https://serpapi.com/images/url/VaaMUXicu1maUVJSUGylr5-al1xUWVCSmqJbkpRnpJdeXJJYkpmsl5yfq1-ckV9QkJmXbl9oC5SzcvRLsXRPDkqKcA9xK_JzK8wud0wOzE5Ozk0xMA6rNI0ySjH3Kc338stw9A4zcTbwycpzd83xC8mz9A3INTNJTXcOcgQAWDcp7A"
)


async def fuse_images():
    img1 = encode_image(PICS_DIR / "image.png")
    img2 = PRODUCT_IMAGE_URL

    payload = {
        "model": "agnes-image-2.0-flash",
        "prompt": (
            "Fuse both input images into a single cohesive composition. "
            "Blend the subjects naturally, keep the overall style consistent, "
            "cinematic lighting, high detail, seamless integration."
        ),
        "size": "1024x1024",
        "extra_body": {
            "image": [img1, img2],
            "response_format": "url",
        },
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    print("Sending fusion request to Agnes API...")
    async with httpx.AsyncClient(timeout=180) as client:
        resp = await client.post(API_URL, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    url = data["data"][0]["url"]
    print(f"Result URL: {url}")

    # Download and save result
    async with httpx.AsyncClient(timeout=60) as client:
        img_resp = await client.get(url)
        img_resp.raise_for_status()

    out_path = PICS_DIR / "fused_result.png"
    out_path.write_bytes(img_resp.content)
    print(f"Saved to: {out_path}")
    return str(out_path)


if __name__ == "__main__":
    asyncio.run(fuse_images())
