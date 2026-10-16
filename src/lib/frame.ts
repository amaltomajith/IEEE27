// One requestAnimationFrame for the whole site. Lenis advances first, then
// subscribers run, so canvas work always sees the scroll position that the DOM
// is about to paint (no one-frame lag between ribbon and text).
type Cb = (now: number) => void;
const subs = new Set<Cb>();

export const onFrame = (cb: Cb) => {
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
};

export const runFrame = (now: number) => {
  subs.forEach((cb) => cb(now));
};
