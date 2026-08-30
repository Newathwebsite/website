// A page's hero can carry a separate background photo for desktop and
// mobile (a tall portrait crop rarely works as a wide desktop banner, and
// vice versa) — set via --hero-bg-desktop/--hero-bg-mobile custom
// properties, which ath2.css switches between at the mobile breakpoint.
// Falls back to the plain gradient .hero background when neither is set.
export function heroBackgroundStyle(heroBackground, extra) {
  const hero = heroBackground || {};
  return {
    ...extra,
    '--hero-bg-desktop': hero.desktop ? `url(${hero.desktop})` : undefined,
    '--hero-bg-mobile': hero.mobile ? `url(${hero.mobile})` : undefined,
  };
}
