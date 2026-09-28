// Wildcard path matcher used to decide whether a route may be tracked.
// Supported syntax: '/admin' (exact), '/admin/*' (prefix, any descendants).
// Shared by the analytics client and the unit tests.

export function isPathExcluded(pathname: string, patterns: string[]): boolean {
  const path = (pathname || '/').split('?')[0];
  for (const raw of patterns) {
    const pattern = String(raw || '').trim();
    if (!pattern) continue;
    if (pattern.endsWith('/*')) {
      const prefix = pattern.slice(0, -1); // keep trailing '/'
      if (path === prefix.slice(0, -1) || path.startsWith(prefix)) return true;
    } else if (pattern.endsWith('*')) {
      if (path.startsWith(pattern.slice(0, -1))) return true;
    } else if (path === pattern) {
      return true;
    }
  }
  return false;
}
