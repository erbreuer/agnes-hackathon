"""render_room agent — composites room photo + product images into renders."""
import logging

import agnes

logger = logging.getLogger(__name__)


async def render_room(
    room_b64: str,
    products: list[dict],
    design_summary: str,
) -> list[str]:
    """Composite room photo + product images into 3 redesigned renders.

    room_b64: raw base64 string (no data: prefix).
    products: list of dicts with at least {name, price, link, image}.
    design_summary: text paragraph from plan_design.
    Returns a list of up to 3 render URLs.
    """
    room_uri = "data:image/jpeg;base64," + room_b64

    product_image_urls = [p["image"] for p in products if p.get("image")][:5]
    image_array = [room_uri] + product_image_urls

    prompt = (
        "Interior design render. Place these furniture pieces naturally into the "
        "existing room, preserving its layout, windows and perspective. "
        f"Style: {design_summary[:180]}. Photorealistic, warm lighting."
    )

    renders: list[str] = []
    for i in range(3):
        try:
            urls = await agnes.image(prompt, image_urls=image_array)
            if urls:
                renders.append(urls[0])
            else:
                logger.warning("render %d: empty response from agnes.image()", i + 1)
        except Exception as exc:
            logger.warning("render %d failed: %s", i + 1, exc)

    return renders
