// Shared meridian activation — set by MeridianLayer, subscribed to by OrganNode.
// Using a listener pattern so OrganNode can trigger its own re-render without prop threading.
export const activeMeridianRef = { current: null };
const listeners = new Set();

export function setActiveMeridian(id) {
  activeMeridianRef.current = id;
  listeners.forEach((fn) => fn(id));
}

export function subscribeActiveMeridian(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
