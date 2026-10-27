// SkyCast astronomy helpers (approximate, good for naked-eye sky viewing).
// Planet/Sun/Moon: low-precision orbital elements (P. Schlyter). Stars: J2000 + simple precession.
(function (g) {
  const D = Math.PI / 180, R2D = 180 / Math.PI;
  const rev = x => { x %= 360; return x < 0 ? x + 360 : x; };
  const jd = ms => ms / 86400000 + 2440587.5;
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  // [N0,N1, i0,i1, w0,w1, a0,a1, e0,e1, M0,M1]
  const EL = {
    mercury: [48.3313, 3.24587e-5, 7.0047, 5.00e-8, 29.1241, 1.01444e-5, 0.387098, 0, 0.205635, 5.59e-10, 168.6562, 4.0923344368],
    venus:   [76.6799, 2.46590e-5, 3.3946, 2.75e-8, 54.8910, 1.38374e-5, 0.723330, 0, 0.006773, -1.302e-9, 48.0052, 1.6021302244],
    mars:    [49.5574, 2.11081e-5, 1.8497, -1.78e-8, 286.5016, 2.92961e-5, 1.523688, 0, 0.093405, 2.516e-9, 18.6021, 0.5240207766],
    jupiter: [100.4542, 2.76854e-5, 1.3030, -1.557e-7, 273.8777, 1.64505e-5, 5.20256, 0, 0.048498, 4.469e-9, 19.8950, 0.0830853001],
    saturn:  [113.6634, 2.38980e-5, 2.4886, -1.081e-7, 339.3939, 2.97661e-5, 9.55475, 0, 0.055546, -9.499e-9, 316.9670, 0.0334442282]
  };
  function kepler(M, e) {
    let E = M + e * R2D * Math.sin(M * D) * (1 + e * Math.cos(M * D));
    for (let k = 0; k < 6; k++) E = E - (E - e * R2D * Math.sin(E * D) - M) / (1 - e * Math.cos(E * D));
    return E;
  }
  function orbit(el, d) {
    const N = el[0] + el[1] * d, i = el[2] + el[3] * d, w = el[4] + el[5] * d, a = el[6] + el[7] * d, e = el[8] + el[9] * d, M = rev(el[10] + el[11] * d);
    const E = kepler(M, e), xv = a * (Math.cos(E * D) - e), yv = a * Math.sqrt(1 - e * e) * Math.sin(E * D);
    const r = Math.hypot(xv, yv), vw = (Math.atan2(yv, xv) * R2D + w) * D, n = N * D, ic = i * D;
    return {
      r,
      x: r * (Math.cos(n) * Math.cos(vw) - Math.sin(n) * Math.sin(vw) * Math.cos(ic)),
      y: r * (Math.sin(n) * Math.cos(vw) + Math.cos(n) * Math.sin(vw) * Math.cos(ic)),
      z: r * Math.sin(vw) * Math.sin(ic)
    };
  }
  function sunEcl(d) {
    const w = 282.9404 + 4.70935e-5 * d, e = 0.016709 - 1.151e-9 * d, M = rev(356.0470 + 0.9856002585 * d);
    const E = kepler(M, e), xv = Math.cos(E * D) - e, yv = Math.sqrt(1 - e * e) * Math.sin(E * D);
    const r = Math.hypot(xv, yv), lon = (Math.atan2(yv, xv) * R2D + w) * D;
    return { lon: rev(lon * R2D), x: r * Math.cos(lon), y: r * Math.sin(lon), M, w };
  }
  function eclToEq(x, y, z, d) {
    const ec = (23.4393 - 3.563e-7 * d) * D, ye = y * Math.cos(ec) - z * Math.sin(ec), ze = y * Math.sin(ec) + z * Math.cos(ec);
    return { ra: rev(Math.atan2(ye, x) * R2D), dec: Math.atan2(ze, Math.hypot(x, ye)) * R2D };
  }
  function moonEcl(d) {
    const N = 125.1228 - 0.0529538083 * d, i = 5.1454, w = 318.0634 + 0.1643573223 * d, a = 60.2666, e = 0.0549, M = rev(115.3654 + 13.0649929509 * d);
    const E = kepler(M, e), xv = a * (Math.cos(E * D) - e), yv = a * Math.sqrt(1 - e * e) * Math.sin(E * D);
    const r = Math.hypot(xv, yv), vw = (Math.atan2(yv, xv) * R2D + w) * D, n = N * D, ic = i * D;
    const xh = r * (Math.cos(n) * Math.cos(vw) - Math.sin(n) * Math.sin(vw) * Math.cos(ic));
    const yh = r * (Math.sin(n) * Math.cos(vw) + Math.cos(n) * Math.sin(vw) * Math.cos(ic));
    const zh = r * Math.sin(vw) * Math.sin(ic);
    let lon = Math.atan2(yh, xh) * R2D, lat = Math.atan2(zh, Math.hypot(xh, yh)) * R2D;
    const s = sunEcl(d), Ms = s.M, Ls = Ms + s.w, Lm = M + w + N, Dm = Lm - Ls, F = Lm - N, sn = x => Math.sin(x * D);
    lon += -1.274 * sn(M - 2 * Dm) + 0.658 * sn(2 * Dm) - 0.186 * sn(Ms) - 0.059 * sn(2 * M - 2 * Dm) - 0.057 * sn(M - 2 * Dm + Ms) + 0.053 * sn(M + 2 * Dm) + 0.046 * sn(2 * Dm - Ms) + 0.041 * sn(M - Ms) - 0.035 * sn(Dm) - 0.031 * sn(M + Ms) - 0.015 * sn(2 * F - 2 * Dm) + 0.011 * sn(M - 4 * Dm);
    lat += -0.173 * sn(F - 2 * Dm) - 0.055 * sn(M - F - 2 * Dm) - 0.046 * sn(M + F - 2 * Dm) + 0.033 * sn(F + 2 * Dm) + 0.017 * sn(2 * M + F);
    return { lon: rev(lon), lat, r };
  }
  function bodies(ms) {
    const d = jd(ms) - 2451543.5, s = sunEcl(d), out = {};
    const se = eclToEq(s.x, s.y, 0, d); out.sun = { ra: se.ra, dec: se.dec, lon: s.lon };
    const m = moonEcl(d), cl = Math.cos(m.lat * D);
    const me = eclToEq(m.r * cl * Math.cos(m.lon * D), m.r * cl * Math.sin(m.lon * D), m.r * Math.sin(m.lat * D), d);
    const el = rev(m.lon - s.lon);
    out.moon = { ra: me.ra, dec: me.dec, r: m.r, elong: el, illum: (1 - Math.cos(el * D)) / 2 };
    for (const k in EL) { const o = orbit(EL[k], d), q = eclToEq(o.x + s.x, o.y + s.y, o.z, d); out[k] = { ra: q.ra, dec: q.dec }; }
    return out;
  }
  const gmst = ms => rev(280.46061837 + 360.98564736629 * (jd(ms) - 2451545.0));
  function altaz(ra, dec, ms, lat, lon) {
    const H = (gmst(ms) + lon - ra) * D, p = lat * D, dl = dec * D;
    const alt = Math.asin(Math.sin(dl) * Math.sin(p) + Math.cos(dl) * Math.cos(p) * Math.cos(H)) * R2D;
    const az = rev(Math.atan2(-Math.cos(dl) * Math.sin(H), Math.sin(dl) * Math.cos(p) - Math.cos(dl) * Math.sin(p) * Math.cos(H)) * R2D);
    return { alt, az };
  }
  function precess(ra, dec, ms) {
    const y = (jd(ms) - 2451545) / 365.25, r = ra * D, dl = dec * D;
    return { ra: rev(ra + y * (0.012813 + 0.005567 * Math.sin(r) * Math.tan(dl))), dec: dec + y * 0.005567 * Math.cos(r) };
  }
  const vec = (az, alt) => { az *= D; alt *= D; return [Math.sin(az) * Math.cos(alt), Math.cos(az) * Math.cos(alt), Math.sin(alt)]; };
  // Camera basis in Earth frame (x=East, y=North, z=Up): r=screen right, u=screen up, b=out of screen (camera looks along -b)
  function basisEuler(a, b, c) {
    a *= D; b *= D; c *= D;
    const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), cc = Math.cos(c), sc = Math.sin(c);
    const R = [[ca * cc - sa * sb * sc, -sa * cb, ca * sc + sa * sb * cc], [sa * cc + ca * sb * sc, ca * cb, sa * sc - ca * sb * cc], [-cb * sc, sb, cb * cc]];
    return { r: [R[0][0], R[1][0], R[2][0]], u: [R[0][1], R[1][1], R[2][1]], b: [R[0][2], R[1][2], R[2][2]] };
  }
  function basisLook(az, alt) {
    const L = vec(az, Math.max(-89.5, Math.min(89.5, alt))), r = norm(cross(L, [0, 0, 1])), u = cross(r, L);
    return { r, u, b: [-L[0], -L[1], -L[2]] };
  }
  function ortho(B) {
    const b = norm(B.b); let r = B.r; const k = dot(r, b);
    r = norm([r[0] - k * b[0], r[1] - k * b[1], r[2] - k * b[2]]);
    return { r, u: cross(b, r), b };
  }
  function project(v, B, f, cx, cy) {
    const d = -dot(v, B.b); if (d < 0.02) return null;
    return { x: cx + f * dot(v, B.r) / d, y: cy - f * dot(v, B.u) / d, d };
  }
  // Sun & Moon situation at a moment and place (ms = UTC milliseconds)
  function sunMoonAt(ms, lat, lon) {
    const b = bodies(ms), s = altaz(b.sun.ra, b.sun.dec, ms, lat, lon), m = altaz(b.moon.ra, b.moon.dec, ms, lat, lon);
    m.alt -= Math.asin(1 / b.moon.r) * R2D * Math.cos(m.alt * D);
    return { sunAlt: s.alt, sunAz: s.az, moonAlt: m.alt, moonIllum: b.moon.illum, moonWaxing: b.moon.elong < 180 };
  }
  const Astro = { bodies, altaz, precess, vec, basisEuler, basisLook, ortho, project, sunMoonAt, dot };
  if (typeof module !== 'undefined') module.exports = Astro; else g.Astro = Astro;
})(this);
