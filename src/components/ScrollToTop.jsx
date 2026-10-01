import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/*
  Every navigation opens at the top of the page.

  Keyed on the location's `key`, not its pathname: the key is new for every
  navigation, so this also fires for a link to the page already open, and
  for links that only change the query (/products?category=millets from the
  products page). A layout effect, and an instant jump rather than the
  site-wide smooth scroll, so the new page is never seen scrolling up from
  where the old one was left.
*/
export default function ScrollToTop() {
  const { key } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [key]);
  return null;
}
