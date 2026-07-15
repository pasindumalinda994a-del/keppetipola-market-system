/** Smooth-scroll to an element by id (supports "#id" or "id"). */
export function scrollToId(hash: string) {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!id) return;

  const el = document.getElementById(id);
  if (!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "start" });
  if (window.location.hash !== `#${id}`) {
    window.history.pushState(null, "", `#${id}`);
  }
}

/** Returns the hash fragment from an href like "/#price-highlights". */
export function getHashFromHref(href: string): string | null {
  const i = href.indexOf("#");
  if (i === -1) return null;
  const hash = href.slice(i + 1);
  return hash || null;
}
