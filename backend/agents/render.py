"""render_room agent — composites room photo + up to 3 picked product images into ONE render."""
import asyncio
import logging

import agnes

logger = logging.getLogger(__name__)

# User can pick up to 3 products to include in the render. Plus the room photo
# itself, the image_array sent to Agnes is at most 4 entries — well within the
# payload limits that gave us 500s during F05 stress testing.
MAX_PRODUCTS = 3

# Multi-image composition can take 30-60s. We bound it tightly here so a slow
# Agnes response doesn't make the UI feel frozen — products still render even
# if the image render comes back empty.
RENDER_TIMEOUT = 60
# Single attempt: a retry doubles wall-clock for the user with low success-rate
# payoff in our testing. If the first call fails we just return None.
MAX_ATTEMPTS = 1


async def render_room(
    room_b64: str,
    products: list[dict],
    design_summary: str,
) -> str | None:
    """Composite the room photo + the user-picked product images into ONE render.

    room_b64: raw base64 string of the room photo (no data: prefix).
    products: list of dicts with at least {name, price, link, image}.
              The user picks up to MAX_PRODUCTS of them; extras are dropped
              with a warning.
    design_summary: text paragraph from plan_design.

    Returns the render URL, or None if the call failed.
    """
    if len(products) > MAX_PRODUCTS:
        logger.warning(
            "render_room got %d products, capping at %d", len(products), MAX_PRODUCTS
        )
        products = products[:MAX_PRODUCTS]

    room_uri = "data:image/jpeg;base64," + room_b64
    product_image_urls = [p["image"] for p in products if p.get("image")]
    image_array = [room_uri] + product_image_urls

    prompt = (
        "Interior design render. Place these furniture pieces naturally into the "
        "existing room, preserving its layout, windows and perspective. "
        f"Style: {design_summary[:180]}. Photorealistic, warm lighting."
    )

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            urls = await agnes.image(
                prompt, image_urls=image_array, timeout=RENDER_TIMEOUT
            )
            if urls:
                return urls[0]
            logger.warning(
                "render_room attempt %d/%d: empty response from agnes.image()",
                attempt, MAX_ATTEMPTS,
            )
        except Exception as exc:
            logger.warning(
                "render_room attempt %d/%d failed: %s", attempt, MAX_ATTEMPTS, exc
            )
        if attempt < MAX_ATTEMPTS:
            await asyncio.sleep(2 * attempt)  # 2s, 4s backoff

    logger.warning("render_room: all %d attempts failed", MAX_ATTEMPTS)
    return None
