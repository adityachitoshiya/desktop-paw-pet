/**
 * Calculate the shortest distance from a point to a rectangle.
 * Returns 0 if the point is inside the rectangle.
 */
export function distanceToRect(point, rect) {
  const dx = Math.max(rect.x - point.x, 0, point.x - (rect.x + rect.width));
  const dy = Math.max(rect.y - point.y, 0, point.y - (rect.y + rect.height));
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if the cursor is within a proximity threshold of the cat's bounding box.
 * All coordinates are in screen space.
 */
export function isInProximity(cursorPos, catScreenBounds, threshold = 80) {
  const dist = distanceToRect(cursorPos, catScreenBounds);
  return dist <= threshold;
}

/**
 * Calculate the angle (in radians) from point p1 to point p2.
 * Returns angle in radians where 0 = right, PI/2 = down.
 */
export function angleBetween(p1, p2) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * Convert a screen-space cursor position to a position relative to the cat's window.
 */
export function screenToLocal(cursorScreen, windowBounds) {
  return {
    x: cursorScreen.x - windowBounds.x,
    y: cursorScreen.y - windowBounds.y,
  };
}
