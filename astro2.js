// SkyCast Astro 2: planets incl. Uranus/Neptune with perturbations + magnitudes, rise/set, sky events.
// Approximate (arc-minute level for planets, ~0.2 deg for the Moon). Not for navigation or eclipse timing.
(function (g) {
  const D = Math.PI / 180, R2D = 180 / Math.PI;
  const rev = x => { x %= 360; return x < 0 ? x + 360 : x; };
  const wrap = x => rev(x + 180) - 180;
  const jd = ms => ms / 86400000 + 2440587.5;
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const EL = {
    mercury: [48.3313, 3.24587e-5, 7.0047, 5.00e-8, 29.1241, 1.01444e-5, 0.387098, 0, 0.205635, 5.59e-10, 168.6562, 4.0923344368],
    venus:   [76.6799, 2.46590e-5, 3.3946, 2.75e-8, 54.8910, 1.38374e-5, 0.723330, 0, 0.006773, -1.302e-9, 48.0052, 1.6021302244],
    mars:    [49.5574, 2.11081e-5, 1.8497, -1.78e-8, 286.5016, 2.92961e-5, 1.523688, 0, 0.093405, 2.516e-9, 18.6021, 0.5240207766],
    jupiter: [100.4542, 2.76854e-5, 1.3030, -1.557e-7, 273.8777, 1.64505e-5, 5.20256, 0, 0.048498, 4.469e-9, 19.8950, 0.0830853001],
    saturn:  [113.6634, 2.38980e-5, 2.4886, -1.081e-7, 339.3939, 2.97661e-5, 9.55475, 0, 0.055546, -9.499e-9, 316.9670, 0.0334442282],
    uranus:  [74.0005, 1.3978e-5, 0.7733, 1.9e-8, 96.6612, 3.0565e-5, 19.18171, -1.55e-8, 0.047318, 7.45e-9, 142.5905, 0.011725806],
    neptune: [131.7806, 3.0173e-5, 1.7700, -2.55e-7, 272.8461, -6.027e-6, 30.05826, 3.313e-8, 0.008606, 2.15e-9, 260.2471, 0.005995147]
  };
  const RADIUS_KM = { mercury: 2440, venus: 6052, mars: 3396, jupiter: 71492, saturn: 60268, uranus: 25559, neptune: 24764 };
  const PLANETS = Object.keys(EL);
  function kepler(M, e) {
    let E = M + e * R2D * Math.sin(M * D) * (1 + e * Math.cos(M * D));
    for (let k = 0; k < 6; k++) E = E - (E - e * R2D * Math.sin(E * D) - M) / (1 - e * Math.cos(E * D));
    return E;
  }
  function orbit(el, d) {
    const N = el[0] + el[1] * d, i = el[2] + el[3] * d, w = el[4] + el[5] * d, a = el[6] + el[7] * d, e = el[8] + el[9] * d, M = rev(el[10] + el[11] * d);
    const E = kepler(M, e), xv = a * (Math.cos(E * D) - e), yv = a * Math.sqrt(1 - e * e) * Math.sin(E * D);
    const r = Math.hypot(xv, yv), vw = (Math.atan2(yv, xv) * R2D + w) * D, n = N * D, ic = i * D;
    return { r, x: r * (Math.cos(n) * Math.cos(vw) - Math.sin(n) * Math.sin(vw) * Math.cos(ic)), y: r * (Math.sin(n) * Math.cos(vw) + Math.cos(n) * Math.sin(vw) * Math.cos(ic)), z: r * Math.sin(vw) * Math.sin(ic) };
  }
  function helio(k, d) {
    const o = orbit(EL[k], d), sn = x => Math.sin(x * D), cs = x => Math.cos(x * D);
    let lon = Math.atan2(o.y, o.x) * R2D, lat = Math.atan2(o.z, Math.hypot(o.x, o.y)) * R2D;
    const Mj = rev(19.8950 + 0.0830853001 * d), Ms = rev(316.9670 + 0.0334442282 * d), Mu = rev(142.5905 + 0.011725806 * d);
    if (k === 'jupiter') lon += -0.332 * sn(2 * Mj - 5 * Ms - 67.6) - 0.056 * sn(2 * Mj - 2 * Ms + 21) + 0.042 * sn(3 * Mj - 5 * Ms + 21) - 0.036 * sn(Mj - 2 * Ms) + 0.022 * cs(Mj - Ms) + 0.023 * sn(2 * Mj - 3 * Ms + 52) - 0.016 * sn(Mj - 5 * Ms - 69);
    else if (k === 'saturn') { lon += 0.812 * sn(2 * Mj - 5 * Ms - 67.6) - 0.229 * cs(2 * Mj - 4 * Ms - 2) + 0.119 * sn(Mj - 2 * Ms - 3) + 0.046 * sn(2 * Mj - 6 * Ms - 69) + 0.014 * sn(Mj - 3 * Ms + 32); lat += -0.020 * cs(2 * Mj - 4 * Ms - 2) + 0.018 * sn(2 * Mj - 6 * Ms - 49); }
    else if (k === 'uranus') lon += 0.040 * sn(Ms - Mu + 6) + 0.035 * sn(Ms - 2 * Mu + 33) - 0.015 * sn(Mj - Mu + 20);
    const c = Math.cos(lat * D);
    return { r: o.r, x: o.r * c * Math.cos(lon * D), y: o.r * c * Math.sin(lon * D), z: o.r * Math.sin(lat * D) };
  }
  function sunEcl(d) {
    const w = 282.9404 + 4.70935e-5 * d, e = 0.016709 - 1.151e-9 * d, M = rev(356.0470 + 0.9856002585 * d);
    const E = kepler(M, e), xv = Math.cos(E * D) - e, yv = Math.sqrt(1 - e * e) * Math.sin(E * D);
    const r = Math.hypot(xv, yv), lon = (Math.atan2(yv, xv) * R2D + w) * D;
    return { lon: rev(lon * R2D), r, x: r * Math.cos(lon), y: r * Math.sin(lon), M, w };
  }
  function eclToEq(x, y, z, d) {
    const ec = (23.4393 - 3.563e-7 * d) * D, ye = y * Math.cos(ec) - z * Math.sin(ec), ze = y * Math.sin(ec) + z * Math.cos(ec);
    return { ra: rev(Math.atan2(ye, x) * R2D), dec: Math.atan2(ze, Math.hypot(x, ye)) * R2D };
  }
  function moonEcl(d, sun) {
    const N = 125.1228 - 0.0529538083 * d, i = 5.1454, w = 318.0634 + 0.1643573223 * d, a = 60.2666, e = 0.0549, M = rev(115.3654 + 13.0649929509 * d);
    const E = kepler(M, e), xv = a * (Math.cos(E * D) - e), yv = a * Math.sqrt(1 - e * e) * Math.sin(E * D);
    const r = Math.hypot(xv, yv), vw = (Math.atan2(yv, xv) * R2D + w) * D, n = N * D, ic = i * D;
    const xh = r * (Math.cos(n) * Math.cos(vw) - Math.sin(n) * Math.sin(vw) * Math.cos(ic)), yh = r * (Math.sin(n) * Math.cos(vw) + Math.cos(n) * Math.sin(vw) * Math.cos(ic)), zh = r * Math.sin(vw) * Math.sin(ic);
    let lon = Math.atan2(yh, xh) * R2D, lat = Math.atan2(zh, Math.hypot(xh, yh)) * R2D;
    const s = sun || sunEcl(d), Ms = s.M, Ls = Ms + s.w, Lm = M + w + N, Dm = Lm - Ls, F = Lm - N, sn = x => Math.sin(x * D);
    lon += -1.274 * sn(M - 2 * Dm) + 0.658 * sn(2 * Dm) - 0.186 * sn(Ms) - 0.059 * sn(2 * M - 2 * Dm) - 0.057 * sn(M - 2 * Dm + Ms) + 0.053 * sn(M + 2 * Dm) + 0.046 * sn(2 * Dm - Ms) + 0.041 * sn(M - Ms) - 0.035 * sn(Dm) - 0.031 * sn(M + Ms) - 0.015 * sn(2 * F - 2 * Dm) + 0.011 * sn(M - 4 * Dm);
    lat += -0.173 * sn(F - 2 * Dm) - 0.055 * sn(M - F - 2 * Dm) - 0.046 * sn(M + F - 2 * Dm) + 0.033 * sn(F + 2 * Dm) + 0.017 * sn(2 * M + F);
    return { lon: rev(lon), lat, r };
  }
  // light Sun+Moon only
  function sunMoon(ms) {
    const d = jd(ms) - 2451543.5, s = sunEcl(d), se = eclToEq(s.x, s.y, 0, d), m = moonEcl(d, s), cl = Math.cos(m.lat * D);
    const me = eclToEq(m.r * cl * Math.cos(m.lon * D), m.r * cl * Math.sin(m.lon * D), m.r * Math.sin(m.lat * D), d), el = rev(m.lon - s.lon);
    return { d, sun: { ra: se.ra, dec: se.dec, lon: s.lon, dist: s.r }, moon: { ra: me.ra, dec: me.dec, r: m.r, lon: m.lon, lat: m.lat, elong: el, illum: (1 - Math.cos(el * D)) / 2, dist: m.r * 6378.137 } };
  }
  function bodies(ms) {
    const out = sunMoon(ms), d = out.d, s = sunEcl(d);
    for (const k of PLANETS) {
      const o = helio(k, d), xg = o.x + s.x, yg = o.y + s.y, zg = o.z, R = Math.hypot(xg, yg, zg), q = eclToEq(xg, yg, zg, d);
      const cl = x => Math.acos(Math.max(-1, Math.min(1, x))) * R2D;
      const el = cl((R * R + s.r * s.r - o.r * o.r) / (2 * R * s.r)), FV = cl((o.r * o.r + R * R - s.r * s.r) / (2 * o.r * R)), lg = 5 * Math.log10(o.r * R);
      const mag = { mercury: -0.36 + lg + 0.027 * FV + 2.2e-13 * Math.pow(FV, 6), venus: -4.34 + lg + 0.013 * FV + 4.2e-7 * Math.pow(FV, 3), mars: -1.51 + lg + 0.016 * FV, jupiter: -9.25 + lg + 0.014 * FV, saturn: -9.0 + lg + 0.044 * FV, uranus: -7.15 + lg + 0.001 * FV, neptune: -6.90 + lg + 0.001 * FV }[k];
      out[k] = { ra: q.ra, dec: q.dec, lon: rev(Math.atan2(yg, xg) * R2D), dist: R, rsun: o.r, elong: el, phase: (1 + Math.cos(FV * D)) / 2, mag, diam: 2 * RADIUS_KM[k] / (R * 149597871) * 206265 };
    }
    return out;
  }
  const gmst = ms => rev(280.46061837 + 360.98564736629 * (jd(ms) - 2451545.0));
  function altaz(ra, dec, ms, lat, lon) {
    const H = (gmst(ms) + lon - ra) * D, p = lat * D, dl = dec * D;
    return { alt: Math.asin(Math.sin(dl) * Math.sin(p) + Math.cos(dl) * Math.cos(p) * Math.cos(H)) * R2D, az: rev(Math.atan2(-Math.cos(dl) * Math.sin(H), Math.sin(dl) * Math.cos(p) - Math.cos(dl) * Math.sin(p) * Math.cos(H)) * R2D) };
  }
  const moonAlt = (m, ms, lat, lon) => { const p = altaz(m.ra, m.dec, ms, lat, lon); p.alt -= Math.asin(1 / m.r) * R2D * Math.cos(p.alt * D); return p; };
  // ---- matrices (row-major 3x3 arrays of 9) ----
  function precMat(ms) {
    const T = (jd(ms) - 2451545) / 36525, as = D / 3600;
    const ze = (2306.2181 * T + 0.30188 * T * T + 0.017998 * T * T * T) * as, z = (2306.2181 * T + 1.09468 * T * T + 0.018203 * T * T * T) * as, th = (2004.3109 * T - 0.42665 * T * T - 0.041833 * T * T * T) * as;
    const cz = Math.cos(ze), sz = Math.sin(ze), cZ = Math.cos(z), sZ = Math.sin(z), ct = Math.cos(th), st = Math.sin(th);
    return [cz * ct * cZ - sz * sZ, -sz * ct * cZ - cz * sZ, -st * cZ, cz * ct * sZ + sz * cZ, -sz * ct * sZ + cz * cZ, -st * sZ, cz * st, -sz * st, ct];
  }
  function eq2enu(ms, lat, lon) {
    const th = (gmst(ms) + lon) * D, ph = lat * D, st = Math.sin(th), ct = Math.cos(th), sp = Math.sin(ph), cp = Math.cos(ph);
    return [-st, ct, 0, -sp * ct, -sp * st, cp, cp * ct, cp * st, sp];
  }
  const mul = (A, B) => { const C = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C.push(A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]); return C; };
  const ap = (M, v) => [M[0] * v[0] + M[1] * v[1] + M[2] * v[2], M[3] * v[0] + M[4] * v[1] + M[5] * v[2], M[6] * v[0] + M[7] * v[1] + M[8] * v[2]];
  const eqVec = (ra, dec) => { ra *= D; dec *= D; return [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)]; };
  const vec = (az, alt) => { az *= D; alt *= D; return [Math.sin(az) * Math.cos(alt), Math.cos(az) * Math.cos(alt), Math.sin(alt)]; };
  // galactic -> equatorial (deg)
  function gal2eq(l, b) {
    l *= D; b *= D; const aN = 192.85948 * D, dN = 27.12825 * D, lN = 122.93192 * D;
    const dec = Math.asin(Math.sin(b) * Math.sin(dN) + Math.cos(b) * Math.cos(dN) * Math.cos(lN - l));
    const ra = aN + Math.atan2(Math.cos(b) * Math.sin(lN - l), Math.sin(b) * Math.cos(dN) - Math.cos(b) * Math.sin(dN) * Math.cos(lN - l));
    return { ra: rev(ra * R2D), dec: dec * R2D };
  }
  // ---- camera ----
  function basisEuler(a, b, c) {
    a *= D; b *= D; c *= D; const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), cc = Math.cos(c), sc = Math.sin(c);
    const R = [[ca * cc - sa * sb * sc, -sa * cb, ca * sc + sa * sb * cc], [sa * cc + ca * sb * sc, ca * cb, sa * sc - ca * sb * cc], [-cb * sc, sb, cb * cc]];
    return { r: [R[0][0], R[1][0], R[2][0]], u: [R[0][1], R[1][1], R[2][1]], b: [R[0][2], R[1][2], R[2][2]] };
  }
  function basisMatrix(m) { return { r: [m[0], m[1], m[2]], u: [m[4], m[5], m[6]], b: [m[8], m[9], m[10]] }; } // column-major 4x4 (device->earth)
  function basisLook(az, alt) { const L = vec(az, Math.max(-89.5, Math.min(89.5, alt))), r = norm(cross(L, [0, 0, 1])); return { r, u: cross(r, L), b: [-L[0], -L[1], -L[2]] }; }
  function ortho(B) { const b = norm(B.b); let r = B.r; const k = dot(r, b); r = norm([r[0] - k * b[0], r[1] - k * b[1], r[2] - k * b[2]]); return { r, u: cross(b, r), b }; }
  // screen rotation for the deviceorientation fallback (angle = screen.orientation.angle)
  function screenRot(B, a) { const n = v => [-v[0], -v[1], -v[2]]; a = ((a % 360) + 360) % 360; if (a === 90) return { r: n(B.u), u: B.r, b: B.b }; if (a === 180) return { r: n(B.r), u: n(B.u), b: B.b }; if (a === 270) return { r: B.u, u: n(B.r), b: B.b }; return B; }
  function rotZ(B, t) { const c = Math.cos(t), s = Math.sin(t), f = v => [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]]; return { r: f(B.r), u: f(B.u), b: f(B.b) }; }
  function project(v, B, f, cx, cy) { const d = -dot(v, B.b); if (d < 0.02) return null; return { x: cx + f * dot(v, B.r) / d, y: cy - f * dot(v, B.u) / d, d }; }
  // ---- rise / set / transit by scanning (altFn(ms)->deg) ----
  function riseSet(altFn, ms0, h0) {
    let prev = altFn(ms0), best = prev, tb = ms0; const o = { rise: null, set: null, transit: null, max: prev };
    for (let i = 1; i <= 144; i++) {
      const t = ms0 + i * 600000, a = altFn(t);
      if (prev < h0 && a >= h0 && !o.rise) o.rise = t - 600000 + 600000 * (h0 - prev) / (a - prev);
      if (prev >= h0 && a < h0 && !o.set) o.set = t - 600000 + 600000 * (prev - h0) / (prev - a);
      if (a > best) { best = a; tb = t; } prev = a;
    }
    o.transit = tb; o.max = best; return o;
  }
  function sunTimes(ms, lat, lon) {
    const A = t => { const s = sunMoon(t).sun; return altaz(s.ra, s.dec, t, lat, lon).alt; }, out = {};
    let prev = A(ms);
    for (let i = 1; i <= 216; i++) {
      const t = ms + i * 600000, a = A(t), x = (h, name, down) => { if (down ? (prev > h && a <= h) : (prev < h && a >= h)) if (!out[name]) out[name] = t; };
      x(-0.833, 'sunset', true); x(-0.833, 'sunrise', false); x(-18, 'dusk', true); x(-18, 'dawn', false); x(-6, 'civilDusk', true); prev = a;
    }
    return out;
  }
  // ---- events ----
  const sep = (ra1, de1, ra2, de2) => { const a = eqVec(ra1, de1), b = eqVec(ra2, de2); return Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * R2D; };
  const NAME = { mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune' };
  function parab(y0, y1, y2) { const den = y0 - 2 * y1 + y2; return den === 0 ? 0 : 0.5 * (y0 - y2) / den; } // vertex offset in steps from middle
  function sunMoonSep(ms, lat, lon) {
    const b = sunMoon(ms), s = altaz(b.sun.ra, b.sun.dec, ms, lat, lon), m = moonAlt(b.moon, ms, lat, lon);
    const v1 = vec(s.az, s.alt), v2 = vec(m.az, m.alt);
    return { sep: Math.acos(Math.max(-1, Math.min(1, dot(v1, v2)))) * R2D, sunAlt: s.alt, moonAlt: m.alt };
  }
  const PHASE = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'];
  function phaseEvents(t0, t1, lat, lon) {
    const out = [], step = 6 * 36e5, el = t => { const d = jd(t) - 2451543.5; return rev(moonEcl(d).lon - sunEcl(d).lon); };
    let t = t0, e = el(t);
    while (t < t1) {
      const t2 = t + step, e2 = el(t2);
      if (Math.floor(e / 90) !== Math.floor(e2 / 90)) {
        const k = Math.floor(e2 / 90) % 4, tg = k * 90; let a = t, b = t2;
        for (let i = 0; i < 16; i++) { const m = (a + b) / 2; if (wrap(el(m) - tg) < 0) a = m; else b = m; }
        const tm = Math.round((a + b) / 2), sm = sunMoon(tm), beta = Math.abs(sm.moon.lat), gam = sm.moon.r * Math.sin(beta * D);
        out.push({ t: tm, cat: 'moon', title: PHASE[k], detail: '', obj: 'Moon' });
        if (k === 0 && gam < 1.55) {
          const sunAng = Math.asin(695700 / (sm.sun.dist * 149597871)), moonAng = Math.asin(1737.4 / sm.moon.dist);
          const kind = gam < 0.9972 ? (moonAng > sunAng ? 'Total' : 'Annular') : 'Partial';
          let best = { sep: 99 }; for (let j = -96; j <= 96; j++) { const q = sunMoonSep(tm + j * 300000, lat, lon); if (q.sep < best.sep) best = Object.assign({ t: tm + j * 300000 }, q); }
          const vis = best.sep < 0.6 && best.sunAlt > -0.5;
          out.push({ t: tm, cat: 'eclipse', title: kind + ' solar eclipse', detail: (vis ? 'Visible from your location around ' + new Date(best.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '. Never look at the Sun without proper eclipse glasses.' : 'Not visible from your location (somewhere else on Earth).'), obj: 'Sun' });
        }
        if (k === 2 && beta < 1.5) {
          const kind = beta < 0.45 ? 'Total' : beta < 0.95 ? 'Partial' : 'Penumbral';
          let up = -90; for (let j = -24; j <= 24; j++) { const b2 = sunMoon(tm + j * 300000); up = Math.max(up, moonAlt(b2.moon, tm + j * 300000, lat, lon).alt); }
          out.push({ t: tm, cat: 'eclipse', title: kind + ' lunar eclipse', detail: (up > 0 ? 'Moon is above your horizon around then: visible from your location.' : 'Moon is below your horizon then: not visible from your location.') + (kind === 'Penumbral' ? ' Very subtle to the eye.' : ''), obj: 'Moon' });
        }
      }
      t = t2; e = e2;
    }
    return out;
  }
  function seasonEvents(t0, t1) {
    const out = [], L = t => rev(sunEcl(jd(t) - 2451543.5).lon), N = ['March equinox', 'June solstice', 'September equinox', 'December solstice'];
    let t = t0, e = L(t);
    while (t < t1) { const t2 = t + 864e5, e2 = L(t2);
      if (Math.floor(e / 90) !== Math.floor(e2 / 90)) { const k = Math.floor(e2 / 90) % 4; let a = t, b = t2; for (let i = 0; i < 18; i++) { const m = (a + b) / 2; if (wrap(L(m) - k * 90) < 0) a = m; else b = m; } out.push({ t: Math.round((a + b) / 2), cat: 'season', title: N[k], detail: k % 2 ? 'Longest/shortest day of the year (north).' : 'Day and night are nearly equal.', obj: 'Sun' }); }
      t = t2; e = e2; }
    return out;
  }
  const SHOWERS = [['Quadrantids', 1, 3, 80, 'Boötes'], ['Lyrids', 4, 22, 18, 'Lyra'], ['Eta Aquariids', 5, 6, 50, 'Aquarius'], ['Southern Delta Aquariids', 7, 30, 25, 'Aquarius'], ['Perseids', 8, 12, 100, 'Perseus'], ['Draconids', 10, 8, 10, 'Draco'], ['Orionids', 10, 21, 20, 'Orion'], ['Leonids', 11, 17, 15, 'Leo'], ['Geminids', 12, 14, 150, 'Gemini'], ['Ursids', 12, 22, 10, 'Ursa Minor']];
  function showerEvents(t0, t1) {
    const out = [], y0 = new Date(t0).getUTCFullYear();
    for (let y = y0; y <= y0 + 1; y++) for (const s of SHOWERS) { const t = Date.UTC(y, s[1] - 1, s[2], 0); if (t < t0 || t > t1) continue;
      const il = sunMoon(t + 6 * 36e5).moon.illum; out.push({ t, cat: 'shower', title: s[0] + ' meteor shower peak', detail: 'About ' + s[3] + ' meteors/hour in perfect dark skies, radiant in ' + s[4] + '. Moon ' + Math.round(il * 100) + '% lit: ' + (il < .35 ? 'good viewing.' : il < .7 ? 'some moonlight.' : 'bright moonlight will hide faint meteors.') + ' Peak date can vary by a day.', obj: null }); }
    return out;
  }
  function planetEvents(t0, t1) {
    const out = [], days = Math.ceil((t1 - t0) / 864e5) + 2, B = [], ks = ['venus', 'mars', 'jupiter', 'saturn', 'mercury'];
    for (let i = 0; i <= days; i++) B.push(bodies(t0 - 864e5 + i * 864e5));
    const T = i => t0 - 864e5 + i * 864e5;
    // elongations, oppositions, conjunctions with the Sun
    for (const k of PLANETS) for (let i = 1; i < days; i++) {
      const a = B[i - 1][k].elong, b = B[i][k].elong, c = B[i + 1][k].elong;
      if (b > a && b >= c) { const t = T(i) + parab(a, b, c) * 864e5, inner = k === 'mercury' || k === 'venus';
        if (inner) { const east = wrap(B[i][k].lon - B[i].sun.lon) > 0; out.push({ t, cat: 'planet', title: NAME[k] + ' greatest elongation ' + (east ? 'east' : 'west'), detail: b.toFixed(0) + '° from the Sun: best time to see it in the ' + (east ? 'evening' : 'morning') + ' sky.', obj: NAME[k] }); }
        else if (b > 170) out.push({ t, cat: 'planet', title: NAME[k] + ' at opposition', detail: 'Closest and brightest of the year (mag ' + B[i][k].mag.toFixed(1) + '). Rises at sunset and is up all night.', obj: NAME[k] }); }
      if (b < a && b <= c && b < 8 && (k === 'mercury' || k === 'venus' || k === 'mars' || k === 'jupiter' || k === 'saturn')) {
        const t = T(i) + parab(a, b, c) * 864e5, inner = k === 'mercury' || k === 'venus', kind = inner ? (B[i][k].dist < 1 ? 'inferior conjunction' : 'superior conjunction') : 'conjunction with the Sun';
        out.push({ t, cat: 'planet', title: NAME[k] + ' ' + kind, detail: 'Too close to the Sun to see for a few weeks.', obj: NAME[k] }); }
    }
    // planet-planet conjunctions (daily minima)
    for (let x = 0; x < ks.length; x++) for (let y = x + 1; y < ks.length; y++) {
      const p = ks[x], q = ks[y], S = i => sep(B[i][p].ra, B[i][p].dec, B[i][q].ra, B[i][q].dec);
      for (let i = 1; i < days; i++) { const a = S(i - 1), b = S(i), c = S(i + 1);
        if (b < a && b <= c && b < 4 && B[i][p].elong > 15 && B[i][q].elong > 15) out.push({ t: T(i) + parab(a, b, c) * 864e5, cat: 'planet', title: NAME[p] + ' near ' + NAME[q], detail: 'Closest approach about ' + Math.max(0.1, b - 0.0).toFixed(1) + '° apart in the sky.', obj: NAME[p] }); }
    }
    // Moon near planets (3 h steps, planets interpolated daily)
    const step = 3 * 36e5, n = Math.floor((t1 - t0) / step), mv = [], pvs = i => ks.map(k => eqVec(B[i][k].ra, B[i][k].dec));
    for (let j = -1; j <= n + 1; j++) { const t = t0 + j * step, di = Math.min(days - 1, Math.max(0, Math.floor((t - T(0)) / 864e5))), f = (t - T(di)) / 864e5, A = pvs(di), C = pvs(di + 1), m = sunMoon(t).moon, mvv = eqVec(m.ra, m.dec);
      mv.push({ t, s: ks.map((k, x) => Math.acos(Math.max(-1, Math.min(1, dot(mvv, norm([A[x][0] * (1 - f) + C[x][0] * f, A[x][1] * (1 - f) + C[x][1] * f, A[x][2] * (1 - f) + C[x][2] * f]))))) * R2D), el: ks.map(k => B[di][k].elong), mg: ks.map(k => B[di][k].mag) }); }
    for (let j = 1; j < mv.length - 1; j++) ks.forEach((k, x) => { const a = mv[j - 1].s[x], b = mv[j].s[x], c = mv[j + 1].s[x];
      if (b < a && b <= c && b < 4.5 && mv[j].el[x] > 15 && mv[j].t >= t0 && mv[j].t <= t1) out.push({ t: mv[j].t + parab(a, b, c) * step, cat: 'moon', title: 'Moon near ' + NAME[k], detail: 'Closest approach about ' + b.toFixed(1) + '° (as seen from Earth\'s centre). Look for them together: easy to spot.', obj: NAME[k] }); });
    return out;
  }
  function events(t0, days, lat, lon) {
    const t1 = t0 + days * 864e5;
    return [].concat(phaseEvents(t0, t1, lat, lon), seasonEvents(t0, t1), showerEvents(t0, t1), planetEvents(t0, t1)).filter(e => e.t >= t0 && e.t <= t1).sort((a, b) => a.t - b.t);
  }
  function sunMoonAt(ms, lat, lon) {
    const b = sunMoon(ms), s = altaz(b.sun.ra, b.sun.dec, ms, lat, lon), m = moonAlt(b.moon, ms, lat, lon);
    return { sunAlt: s.alt, sunAz: s.az, moonAlt: m.alt, moonIllum: b.moon.illum, moonWaxing: b.moon.elong < 180 };
  }
  const Astro2 = { version: 2, PLANETS, NAME, RADIUS_KM, bodies, sunMoon, altaz, moonAlt, sunMoonAt, precMat, eq2enu, mul, ap, eqVec, vec, gal2eq, basisEuler, basisMatrix, basisLook, ortho, screenRot, rotZ, project, riseSet, sunTimes, events, dot, jd, gmst, rev, wrap };
  if (typeof module !== 'undefined') module.exports = Astro2; else g.Astro2 = Astro2;
})(this);
