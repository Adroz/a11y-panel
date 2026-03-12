/**
 * WCAG 1.2.2 Captions (Prerecorded) check.
 *
 * Checks visible <video> elements for <track kind="captions"> or
 * <track kind="subtitles">. Returns null if no videos are found
 * (inapplicable).
 */

function isVisible(el: Element): boolean {
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function checkCaptions(): { failCount: number } | null {
  const videos = Array.from(document.querySelectorAll("video")).filter(isVisible);

  if (videos.length === 0) return null;

  let failCount = 0;

  for (const video of videos) {
    const tracks = video.querySelectorAll("track");
    const hasCaptions = Array.from(tracks).some(
      (track) => {
        const kind = track.getAttribute("kind")?.toLowerCase();
        return kind === "captions" || kind === "subtitles";
      },
    );

    if (!hasCaptions) {
      failCount++;
    }
  }

  return { failCount };
}
