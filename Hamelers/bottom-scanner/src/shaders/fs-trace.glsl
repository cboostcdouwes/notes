#version 300 es
precision highp float; precision highp int; precision highp sampler2D;
uniform sampler2D uParts;
uniform int uMode;              // 0 line-scan colour, 1 area colour, 2 line-scan ids, 3 area ids
uniform int uNPal;
uniform vec4 uPalA[6];          // x: belt offset, w: first part row
uniform vec4 uPalB[6];          // x: part count, y: is pallet (0 = world)
uniform sampler2D uMotion;      // per slot row: pose by belt progress, two texels per sample (see poseAt)
uniform float uMotionU0; uniform float uMotionDU; uniform int uMotionN;
uniform vec4 uBbLo[6]; uniform vec4 uBbHi[6];
uniform float uRollX[40]; uniform int uNRoll; uniform float uRollHalf;
uniform vec4 uLights[32]; uniform int uNL; uniform float uAmbient;
uniform int uNBar;              // the first uNBar lights are LED bar points (see barFacing)
uniform int uNSide;             // the next uNSide are side lights, aimed along the gap at the belt centre
uniform int uNSpot;             // the next uNSpot are the spots beside the cameras, each a row of units: axis, along the line,
uniform vec3 uSpotAxis[4]; uniform vec3 uSpotAlong[4]; uniform vec2 uSpotTan[4];   // a unit's half-angle tangents across and along,
uniform vec3 uSpotUnits[4];     // and units, angle between them (rad), shape (1: elliptical cone, 0: rectangular)
uniform float uSpotFace;        // radius of a spot's emitting face, mm
uniform float uLightWin;        // own windows of the lights beside the cameras: angle from horizontal, rad; < 0: none
uniform vec2 uFace;             // scale of the lamps' face radiance in this view: x the LED bar, y the station lamps
uniform float uLouvreTan;       // tangent of the bar louvre's cut-off angle along the bar; 0: no louvre
uniform float uBarHalf;         // mm of bar each bar point stands for, to either side
uniform float uDust;            // scattering by dust in the air, per mm
uniform vec3 uBarCol; uniform vec3 uLampCol;   // light colours (linear RGB, luminance 1)
uniform vec4 uLampLo[16]; uniform vec4 uLampHi[16]; uniform int uNLamp;   // lamp faces: box, radiance (lo.w), is the bar (hi.w)
uniform float uVib;             // bottom camera vibration amplitude, mm
uniform float uSpeed;           // belt speed over the scanner, mm/s (encoder position to time)
uniform float uDistort;         // uncorrected barrel distortion of the lens; 0: calibrated
uniform float uRollMM;          // rolling shutter: belt travel during the readout from the first row to the last
uniform int uIndirect;          // outside photo mode: bounce samples of indirect light per pixel (0: a constant fill instead)
uniform vec3 uBgUp;             // what rays escaping upward see: the lit hall above the station
uniform vec3 uC; uniform vec3 uD0; uniform vec3 uE; uniform float uPhi0; uniform float uDphi; uniform float uAxisPhi;
uniform float uS0; uniform float uPitch; uniform int uH;
uniform vec3 uF; uniform vec3 uR; uniform vec3 uU; uniform vec2 uFoc; uniform vec2 uSize; uniform float uSnapS;
uniform float uAperture; uniform float uFocus; uniform int uDof; uniform vec3 uAxis;
uniform vec3 uBg; uniform float uExposure; uniform float uDirt; uniform float uSeed;
uniform highp sampler2DArray uAlb; uniform highp sampler2DArray uNor; uniform int uTex; uniform float uPixAng; uniform float uTexSize;
uniform int uStill; uniform vec3 uSky; uniform vec3 uLightJit;   // photo mode: indirect light, soft lights
uniform float uBlur;            // encoder travel during one exposure, mm: samples spread over it (motion blur)
uniform vec3 uWinN; uniform vec3 uWinO;   // line-scan: the window's outward normal, where the lens axis crosses it
uniform vec2 uGlass;            // the window glass: index, thickness (mm)
float glassT(float c);
out vec4 outColor;

uint rngS;
float rnd() { rngS ^= rngS >> 16; rngS *= 0x7feb352dU; rngS ^= rngS >> 15; rngS *= 0x846ca68bU; rngS ^= rngS >> 16; return float(rngS) / 4294967296.0; }
float h11(float n) { return fract(sin(n) * 43758.5453123); }
float h31(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123); }
float n1(float x) { float i = floor(x); float f = fract(x); return mix(h11(i), h11(i + 1.0), f * f * (3.0 - 2.0 * f)); }
vec4 P(int k, int j) { return texelFetch(uParts, ivec2(j, k), 0); }

vec3 rotIn(float yaw, vec3 w) { float c = cos(yaw), sn = sin(yaw); return vec3(c * w.x - sn * w.z, w.y, sn * w.x + c * w.z); }
vec3 rotZ(float a, vec3 v) { float c = cos(a), sn = sin(a); return vec3(c * v.x - sn * v.y, sn * v.x + c * v.y, v.z); }

// Pallet pose at encoder position s, from its precomputed motion (slip, ripple, sticking, jostle): translation t,
// yaw about the vertical, pitch about the across-belt axis (nose down < 0). The world slot never moves.
struct Pose { vec3 t; float yaw; float pitch; };
Pose poseAt(int p, float s) {
  Pose q; q.t = vec3(0.0); q.yaw = 0.0; q.pitch = 0.0;
  if (uPalB[p].y < 0.5) return q;
  float u = s - uPalA[p].x, f = clamp((u - uMotionU0) / uMotionDU, 0.0, float(uMotionN - 1) - 0.001);
  int i = int(f); float w = f - float(i);
  vec4 a = mix(texelFetch(uMotion, ivec2(2 * i, p), 0), texelFetch(uMotion, ivec2(2 * i + 2, p), 0), w);   // dx, z, yaw, dy
  q.pitch = mix(texelFetch(uMotion, ivec2(2 * i + 1, p), 0).x, texelFetch(uMotion, ivec2(2 * i + 3, p), 0).x, w);
  q.t = vec3(u + a.x, a.w, a.y); q.yaw = a.z;
  return q;
}
vec3 localP(Pose q, vec3 w) { return rotIn(q.yaw, rotZ(-q.pitch, w - q.t)); }
vec3 localD(Pose q, vec3 d) { return rotIn(q.yaw, rotZ(-q.pitch, d)); }
vec3 worldD(Pose q, vec3 l) { return rotZ(q.pitch, rotIn(-q.yaw, l)); }
vec3 worldP(Pose q, vec3 l) { return worldD(q, l) + q.t; }
vec3 safeInv(vec3 d) {
  return 1.0 / vec3(abs(d.x) < 1e-8 ? (d.x < 0.0 ? -1e-8 : 1e-8) : d.x,
                    abs(d.y) < 1e-8 ? (d.y < 0.0 ? -1e-8 : 1e-8) : d.y,
                    abs(d.z) < 1e-8 ? (d.z < 0.0 ? -1e-8 : 1e-8) : d.z);
}
bool boxRange(vec3 lo, vec3 hi, vec3 o, vec3 inv, out float tn, out float tf, out vec3 tnv, out vec3 tfv) {
  vec3 a = (lo - o) * inv, b = (hi - o) * inv; tnv = min(a, b); tfv = max(a, b);
  tn = max(max(tnv.x, tnv.y), tnv.z); tf = min(min(tfv.x, tfv.y), tfv.z); return tn <= tf && tf > 0.0;
}
vec3 axisN(vec3 tv, float t, vec3 d) {
  if (t == tv.x) return vec3(-sign(d.x), 0.0, 0.0);
  if (t == tv.y) return vec3(0.0, -sign(d.y), 0.0);
  return vec3(0.0, 0.0, -sign(d.z));
}
float wrapAlpha(vec3 p) { return step(0.42, n1(p.x * 0.05 + n1(p.z * 0.03) * 4.0)); }

// A part: box, cut by up to 4 half-spaces (chamfers, tapers), minus one box (chips, crushed corners).
bool partHit(int k, vec3 o, vec3 d, vec3 inv, float tmax, out float t, out vec3 n) {
  vec4 t0 = P(k, 0), t1 = P(k, 1);
  float tn, tf; vec3 tnv, tfv;
  if (!boxRange(t0.xyz, t1.xyz, o, inv, tn, tf, tnv, tfv) || tn > tmax) return false;
  vec3 nn = axisN(tnv, tn, d);
  for (int j = 0; j < 4; j++) {
    vec4 pl = P(k, 10 + j);
    if (dot(pl.xyz, pl.xyz) < 0.5) break;
    float den = dot(pl.xyz, d), dist = pl.w - dot(pl.xyz, o);
    if (abs(den) < 1e-7) { if (dist < 0.0) return false; continue; }
    float tt = dist / den;
    if (den < 0.0) { if (tt > tn) { tn = tt; nn = pl.xyz; } } else { tf = min(tf, tt); }
  }
  if (tn > tf || tf < 1e-3 || tn > tmax) return false;
  float th = tn;
  vec4 s0 = P(k, 8);
  if (s0.w > 0.5) {
    vec4 s1 = P(k, 9); float bn, bf; vec3 bnv, bfv;
    if (boxRange(s0.xyz, s1.xyz, o, inv, bn, bf, bnv, bfv) && th >= bn - 1e-3 && th <= bf) {
      if (bf >= tf) return false;
      th = bf; nn = axisN(bfv, bf, d);
    }
  }
  if (th < 1e-3 || th > tmax) return false;
  if (int(t0.w) == 7 && wrapAlpha(o + d * th) < 0.5) return false;
  t = th; n = nn; return true;
}

struct Hit { float t; int k; int p; int roller; vec3 n; vec3 pl; vec3 ld; };
Hit trace(vec3 o, vec3 d, float s) {
  Hit h; h.t = 1e9; h.k = -1; h.p = -1; h.roller = -1; h.n = vec3(0.0); h.pl = vec3(0.0); h.ld = d;
  for (int p = 0; p < 6; p++) {
    if (p >= uNPal) break;
    Pose q = poseAt(p, s);
    vec3 lo = localP(q, o), ld = localD(q, d);
    vec3 inv = safeInv(ld);
    float tn, tf; vec3 a, b;
    if (!boxRange(uBbLo[p].xyz, uBbHi[p].xyz, lo, inv, tn, tf, a, b) || tn > h.t) continue;
    int st = int(uPalA[p].w), cnt = int(uPalB[p].x);
    for (int k = 0; k < 256; k++) {
      if (k >= cnt) break;
      float t; vec3 n;
      if (partHit(st + k, lo, ld, inv, h.t, t, n)) { h.t = t; h.k = st + k; h.p = p; h.n = n; h.pl = lo + ld * t; h.ld = ld; }
    }
  }
  for (int r = 0; r < 40; r++) {   // rollers: cylinders along z, top at y = 0
    if (r >= uNRoll) break;
    float ox = o.x - uRollX[r], oy = o.y + 30.0;
    float A = d.x * d.x + d.y * d.y, B = 2.0 * (d.x * ox + d.y * oy), Cq = ox * ox + oy * oy - 900.0;
    float disc = B * B - 4.0 * A * Cq;
    if (disc < 0.0) continue;
    float t = (-B - sqrt(disc)) / (2.0 * A);
    if (t < 1e-3 || t >= h.t) continue;
    vec3 p3 = o + d * t;
    if (abs(p3.z) > uRollHalf) continue;
    h.t = t; h.k = -1; h.p = -1; h.roller = r; h.n = vec3(ox + d.x * t, oy + d.y * t, 0.0) / 30.0; h.pl = p3; h.ld = d;
  }
  return h;
}
bool shadowed(int p, vec3 o, vec3 d, float maxT);
// Poses of all slots at the current encoder position, loaded once per shading call.
Pose gq[6];
void loadPoses(float s) { for (int p = 0; p < 6; p++) { if (p >= uNPal) break; gq[p] = poseAt(p, s); } }
// Is the segment from world point wp along u, for dist mm, blocked by any pallet (its own included)?
bool palletShadow(vec3 wp, vec3 u, float dist) {
  for (int p = 0; p < 6; p++) {
    if (p >= uNPal) break;
    if (uPalB[p].y < 0.5) continue;
    vec3 lo = localP(gq[p], wp), ld = localD(gq[p], u), inv = safeInv(ld);
    float tn, tf; vec3 a, b;
    if (!boxRange(uBbLo[p].xyz, uBbHi[p].xyz, lo, inv, tn, tf, a, b) || tn > dist) continue;
    if (shadowed(p, lo, ld, dist)) return true;
  }
  return false;
}
bool shadowed(int p, vec3 o, vec3 d, float maxT) {
  vec3 inv = safeInv(d); int st = int(uPalA[p].w), cnt = int(uPalB[p].x);
  for (int k = 0; k < 256; k++) { if (k >= cnt) break; float t; vec3 n; if (partHit(st + k, o, d, inv, maxT, t, n)) return true; }
  return false;
}
// Does a roller block the segment a -> b (world)? This is what makes a narrow gap cut off the light.
bool rollerBlocked(vec3 a, vec3 b) {
  if (a.y > 0.0 && b.y > 0.0) return false;
  vec3 d = b - a; float A = d.x * d.x + d.y * d.y;
  if (A < 1e-6) return false;
  for (int r = 0; r < 40; r++) {
    if (r >= uNRoll) break;
    float ox = a.x - uRollX[r], oy = a.y + 30.0;
    float B = 2.0 * (d.x * ox + d.y * oy), Cq = ox * ox + oy * oy - 900.0, disc = B * B - 4.0 * A * Cq;
    if (disc < 0.0) continue;
    float t = (-B - sqrt(disc)) / (2.0 * A);
    if (t > 1e-4 && t < 1.0 && abs(a.z + d.z * t) < uRollHalf) return true;
  }
  return false;
}
// LED bar optics. The bar emits upward from a diffuse (Lambertian) face. An optional louvre film limits the angle along
// the bar's length: its transmission falls linearly with the tangent of that angle, to a small leak at the cut-off.
const float LOUVRE_LEAK = 0.005;
float louvreT(float tanA) { return uLouvreTan > 0.0 ? max(LOUVRE_LEAK, 1.0 - tanA / uLouvreTan) : 1.0; }
// cumulative of the triangle max(0, 1 - |x| / w)
float triCum(float x, float w) { x = clamp(x, -w, w); return x < 0.0 ? (x + w) * (x + w) / (2.0 * w) : w - (w - x) * (w - x) / (2.0 * w); }
// Share of bar point lp's intensity that reaches p: the cosine of the face, and with a louvre the part of the bar
// stretch the point stands for that the louvre passes toward p (by each part's angle along the bar).
// Behind its own window, the light leaving toward p also passes the glass (ownWindowT).
float ownWindowT(vec3 lp, vec3 u);
// A bar below the belt faces up; one above it (the top line-scan cameras' bar) faces down: +1 or -1 along y.
float barFacing(vec3 lp) { return lp.y < 0.0 ? 1.0 : -1.0; }
float barWeight(vec3 lp, vec3 p) {
  vec3 v = p - lp; float len = length(v), cosT = barFacing(lp) * v.y / len;
  if (cosT <= 0.0) return 0.0;
  cosT *= ownWindowT(lp, v / len);
  if (uLouvreTan <= 0.0) return cosT;
  float w = abs(v.y) * uLouvreTan;
  return cosT * (triCum(lp.z + uBarHalf - p.z, w) - triCum(lp.z - uBarHalf - p.z, w)) / (2.0 * uBarHalf);
}
// A light beside its camera (lp) sends light along u through its own window, turned toward the scan line at x = 0
// and facing the belt (up below it, down above it).
float ownWindowT(vec3 lp, vec3 u) {
  if (uLightWin < 0.0) return 1.0;
  return glassT(dot(u, vec3((lp.x > 0.0 ? -1.0 : 1.0) * sin(uLightWin), barFacing(lp) * cos(uLightWin), 0.0)));
}
// How many of spot k's units (spot at Lw) send light toward p, through its window (as beamShare in the page script).
// Unit i is turned along the line by (i - (n - 1) / 2) times the angle between units.
float spotShare(int k, vec3 Lw, vec3 p) {
  vec3 u = normalize(p - Lw), U = uSpotUnits[k];
  float count = 0.0;
  for (int i = 0; i < 16; i++) {
    if (float(i) >= U.x) break;
    float th = (float(i) - (U.x - 1.0) * 0.5) * U.y, c = cos(th), sn = sin(th);
    vec3 ax = c * uSpotAxis[k] + sn * uSpotAlong[k], al = c * uSpotAlong[k] - sn * uSpotAxis[k];
    float f = dot(u, ax);
    if (f <= 0.0) continue;
    float x = abs(dot(u, cross(ax, al))) / (uSpotTan[k].x * f), y = abs(dot(u, al)) / (uSpotTan[k].y * f);
    if (U.z > 0.5 ? x * x + y * y <= 1.0 : max(x, y) <= 1.0) count += 1.0;
  }
  return count > 0.0 ? count * ownWindowT(Lw, u) : 0.0;
}
// Share of light l's intensity (at Lw) that reaches p: a bar point by barWeight, a side light by the cosine of its
// face, aimed at the belt centre, a spot by its beam; a station lamp all of it (as lightShareAt in the page script).
float lightShare(int l, vec3 Lw, vec3 p) {
  if (l < uNBar) return barWeight(Lw, p);
  if (l < uNBar + uNSide) return max(0.0, dot(normalize(p - Lw), -normalize(Lw)));
  if (l < uNBar + uNSide + uNSpot) return spotShare(l - uNBar - uNSide, Lw, p);
  return 1.0;
}
vec3 lightCol(int l) { return l < uNBar + uNSide + uNSpot ? uBarCol : uLampCol; }   // the bottom lights share the bar's LEDs

vec3 toWorld(int p, float s, vec3 v, bool point) {
  if (p < 0 || uPalB[p].y < 0.5) return v;
  Pose q = poseAt(p, s);
  return point ? worldP(q, v) : worldD(q, v);
}

// Sawn edges are slightly rounded: bend the normal toward the neighbouring face within r mm of an edge.
vec3 bevel(int k, vec3 p, vec3 n, float r) {
  vec3 an = abs(n);
  if (r <= 0.0 || max(an.x, max(an.y, an.z)) < 0.99) return n;
  vec3 lo = P(k, 0).xyz, hi = P(k, 1).xyz, b = n;
  for (int i = 0; i < 3; i++) {
    if (an[i] > 0.5) continue;
    float dl = p[i] - lo[i], dh = hi[i] - p[i];
    if (dl < r) b[i] -= 1.0 - max(dl, 0.0) / r;
    if (dh < r) b[i] += 1.0 - max(dh, 0.0) / r;
  }
  return normalize(b);
}

// Photo texture detail (CC0 scans) for wood and presswood: albedo relative to the texture's mean, so each part keeps
// its own colour, plus the scan's normal map. fa = face axis, ax = grain axis, foot = pixel footprint in mm.
vec3 woodTex(int m, int fa, int ax, vec3 p, float along, float across, vec2 pith, float seed, float foot, inout vec3 n) {
  float layer = m == 1 ? 2.0 : ((m == 2 || m == 4) ? 1.0 : 0.0);
  float tile = m == 4 ? 350.0 : (m == 0 || m == 3 ? 500.0 : 600.0);
  bool endGrain = (fa == 0 && ax == 0) || (fa == 2 && ax == 2);
  vec3 A = ax == 2 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0), X = ax == 2 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 0.0, 1.0), Y = vec3(0.0, 1.0, 0.0);
  vec2 uv; vec3 U, V;
  if (fa == 1) { uv = vec2(along, across); U = A; V = X; }
  else if (endGrain) { uv = vec2(across, p.y); U = X; V = Y; }
  else { uv = vec2(along, p.y); U = A; V = Y; }
  if (m == 1) { uv = uv.yx; vec3 tmp = U; U = V; V = tmp; }   // the hardwood scan's grain runs along v
  uv = uv / tile + vec2(fract(seed * 0.618), fract(seed * 0.377));
  float lod = log2(max(foot * uTexSize / tile, 1.0));
  vec3 det = textureLod(uAlb, vec3(uv, layer), lod).rgb / max(textureLod(uAlb, vec3(0.5, 0.5, layer), 11.0).rgb, vec3(0.02));
  if (endGrain && layer != 1.0) {   // growth rings around a pith outside the board
    float r = length(vec2(across, p.y) - pith);
    det = mix(vec3(dot(det, vec3(0.333))), det, 0.5) * (0.78 + 0.22 * smoothstep(0.15, 0.7, fract(r / 5.0 + 0.4 * n1(r * 0.15))));
  }
  vec3 tn = textureLod(uNor, vec3(uv, layer), max(lod - 1.0, 0.0)).rgb * 2.0 - 1.0;
  vec3 nb = normalize(n * max(tn.z, 0.2) + (U * tn.x + V * tn.y) * 0.8);
  if (dot(nb, n) > 0.3) n = nb;
  return det;
}

vec3 albedo(int k, vec3 p, inout vec3 n, float foot, out float spec) {
  vec4 t0 = P(k, 0), t1 = P(k, 1), t2 = P(k, 2), t3 = P(k, 3);
  int m = int(t0.w); int ax = int(t1.w);
  vec3 col = t2.rgb; float seed = t2.w;
  float ph1 = fract(seed * 0.1371) * 6.283, ph2 = fract(seed * 0.2953) * 6.283, ph3 = fract(seed * 0.4127) * 6.283;
  float along = ax == 2 ? p.z : p.x, across = ax == 2 ? p.x : p.z;
  int fa = abs(n.x) > 0.5 ? 0 : (abs(n.y) > 0.5 ? 1 : 2);
  int flags = int(t3.y);
  spec = 0.0;
  if (m == 0 || m == 1 || m == 3) {   // sawn wood (spruce, hardwood, painted)
    vec3 w;
    if (uTex == 1) {   // pith of the log this was sawn from, beside or below the part
      vec2 pith = vec2((ax == 2 ? t0.x + t1.x : t0.z + t1.z) * 0.5 + fract(seed * 0.73) * 160.0 - 80.0, t0.y - 30.0 - fract(seed * 0.31) * 140.0);
      w = woodTex(m, fa, ax, p, along, across, pith, seed, foot, n);
    }
    else {
      w = vec3(0.9 + 0.1 * sin((across + 6.0 * sin(along * 0.013 + ph1) + 3.0 * sin(along * 0.031 + ph2)) * (m == 1 ? 0.6 : 0.9) + p.y * 0.6));
      w *= 0.95 + 0.05 * sin(across * 0.35 + ph3 + 2.0 * sin(along * 0.004 + ph1));
      if ((fa == 0 && ax == 0) || (fa == 2 && ax == 2)) w *= 0.72;   // end grain
    }
    vec4 kn = P(k, 4);
    float dA = length(vec2((along - kn.x) / 14.0, (across - kn.y) / 9.0)); if (dA < 1.6) w *= 0.45 + 0.55 * clamp(dA - 0.6, 0.0, 1.0);
    float dB = length(vec2((along - kn.z) / 14.0, (across - kn.w) / 9.0)); if (dB < 1.6) w *= 0.45 + 0.55 * clamp(dB - 0.6, 0.0, 1.0);
    col *= w; spec = 0.03;
    if (m == 3) { float wear = sin(p.x * 0.02 + ph1) + sin(p.z * 0.017 + ph2) + sin((p.x + p.z) * 0.05 + ph3); if (wear < 1.6) { col = vec3(0.02, 0.075, 0.32) * mix(vec3(1.0), w, 0.35); spec = 0.06; } }
  } else if (m == 2 || m == 4) {      // pressed chips, moulded fibre
    if (uTex == 1) col *= woodTex(m, fa, ax, p, p.x, p.z, vec2(0.0), seed, foot, n);
    else col *= (0.78 + 0.38 * h31(floor(p / (m == 2 ? 3.0 : 5.0)))) * (0.95 + 0.05 * sin(p.x * 0.01 + ph1));
  } else if (m == 5 || m == 6) {      // plastic
    float kk = 0.95 + 0.05 * h31(floor(p / 2.0));
    if ((flags & 1) != 0 && n.y < -0.5) { float mx = mod(p.x, 100.0), mz = mod(p.z, 100.0); if (mx < 7.0 || mz < 7.0) kk *= 0.55; }
    if ((flags & 2) != 0 && n.y < -0.5) { float c0 = (t0.z + t1.z) * 0.5; float fr = fract((p.x + 140.0) / 280.0); if (fr > 0.25 && fr < 0.75 && abs(p.z - c0) < 35.0) kk *= 0.12; }
    col *= kk * (0.97 + 0.03 * n1(p.x * 0.02 + p.z * 0.013 + seed));   // faint flow lines from moulding
    spec = m == 5 ? 0.14 : 0.11;
    // fine moulded surface: a slight random tilt of the normal
    n = normalize(n + 0.05 * (vec3(n1(p.x * 0.9 + seed), n1(p.y * 0.9 + seed * 1.7), n1(p.z * 0.9 + seed * 2.3)) - 0.5));
  } else if (m == 7) { col = vec3(0.78, 0.8, 0.82); spec = 0.6; }
  else if (m == 9) { spec = 0.25; }
  else if (m == 10) { col *= 0.9 + 0.1 * h31(floor(p / 40.0)); }
  else if (m == 11) {   // corrugated cardboard: flute shading, a strip of packing tape
    col *= 0.9 + 0.1 * sin(p.x * 0.785) + 0.05 * n1(p.z * 0.05 + seed);
    if (abs(p.z - (t0.z + t1.z) * 0.5) < 24.0) { col = vec3(0.62, 0.5, 0.33); spec = 0.3; }
  }
  if (n.y < -0.5 && p.y < 1.0 && m < 9) {   // underside: floor grime, mud, stains, nail heads
    float dd = 0.5 + 0.5 * tanh(sin(p.x * 0.012 + ph1) + sin(p.z * 0.03 + ph2) + 0.6 * sin((p.x - p.z) * 0.02 + ph3));
    float mx = ((m == 5 || m == 6) ? 0.15 : 0.25) + 0.4 * dd;
    col *= vec3(1.0 - mx * 0.45, 1.0 - mx * 0.5, 1.0 - mx * 0.56);
    if (t3.w > 0.0) { float mm = smoothstep(0.45, 0.8, n1(p.x * 0.01 + ph1) * 0.6 + n1(p.z * 0.02 + ph2) * 0.6); col = mix(col, vec3(0.16, 0.11, 0.07), mm * t3.w); }
    vec4 st = P(k, 5);
    if (st.z > 0.0) { float rr = length(vec2(p.x - st.x, (p.z - st.y) * 1.3)) / st.z; col *= 1.0 - 0.45 * exp(-rr * rr * 2.0); }
    vec4 nl = P(k, 6), np = P(k, 14);
    if (nl.w > 0.0) {
      float cAcross = ax == 2 ? (t0.x + t1.x) * 0.5 : (t0.z + t1.z) * 0.5;
      for (int a = 0; a < 3; a++) {
        float pk = a == 0 ? nl.x : (a == 1 ? nl.y : nl.z);
        if (pk > 1e8) continue;
        for (int b = 0; b < 3; b++) {
          if (b >= int(np.y)) break;
          float off = np.y < 1.5 ? 0.0 : (np.y < 2.5 ? (b == 0 ? -np.x : np.x) : float(b - 1) * np.x);
          for (int c2 = 0; c2 < 2; c2++) {
            float ac = cAcross + (c2 == 0 ? -nl.w : nl.w);
            float d2 = (along - pk - off) * (along - pk - off) + (across - ac) * (across - ac);
            if (d2 < 20.0) { col = st.w > 0.5 ? vec3(0.55, 0.56, 0.58) : vec3(0.10, 0.10, 0.11); spec = st.w > 0.5 ? 0.35 : 0.05; }
            else if (d2 < 64.0 && st.w < 0.5) col *= vec3(0.75, 0.55, 0.4);
          }
        }
      }
    }
  }
  if (t3.z > 0.0) {   // wet patches: wood darkens and shines; plastic doesn't soak up water, it only shines
    float wm = smoothstep(0.3, 0.6, n1(p.x * 0.008 + ph3) + n1(p.z * 0.01 + ph1) - 0.5);
    if (m != 5 && m != 6) col *= 1.0 - 0.5 * t3.z * wm;
    spec += 0.2 * t3.z * wm;
  }
  if (t3.x < 1e8) { float off = along - t3.x - 3.0 * sin(across * 0.07 + ph1); if (abs(off) < 1.3) col *= 0.15; }
  vec4 sw = P(k, 15);
  if (sw.x > 0.0 && n.y > 0.3) {   // snow lying on upward faces
    float sm = smoothstep(0.45, 0.6, 0.5 * n1(p.x * 0.02 + seed) + 0.5 * n1(p.z * 0.025 + seed * 1.3) + (sw.x - 0.5) * 0.6);
    col = mix(col, vec3(0.86, 0.88, 0.92), sm); spec = mix(spec, 0.04, sm);
  }
  if (sw.y > 0.0) {   // ice glaze: darker, glossy, faintly blue
    float im = smoothstep(0.3, 0.7, n1(p.x * 0.01 + seed * 2.1) + n1(p.z * 0.013 + seed) - 0.6 + sw.y * 0.4);
    col = mix(col, col * 0.75 + vec3(0.03, 0.05, 0.07), im); spec += 0.5 * im;
  }
  int soil = int(sw.z);
  if (soil > 0) {   // contamination and defects in a patch of radius sw.w around (x, z) = P(k, 14).zw; see addSoil
    vec4 sl = P(k, 14);
    float rr = length(vec2(p.x - sl.z, p.z - sl.w)) / max(sw.w, 1.0);
    float inside = 1.0 - smoothstep(0.8, 1.0, rr + 0.3 * (n1(p.x * 0.05 + seed) + n1(p.z * 0.06 + seed * 1.3) - 1.0));   // ragged outline
    if (soil == 1) { col *= mix(1.0, 0.3, inside); spec += 0.2 * inside; }   // oil soaked in: dark, faintly glossy
    else if (soil == 2) {   // paint splashes: a sharp-edged patch and droplets around it
      vec3 pc = h11(seed) < 0.33 ? vec3(0.82, 0.82, 0.78) : (h11(seed) < 0.66 ? vec3(0.8, 0.55, 0.03) : vec3(0.55, 0.06, 0.04));
      float drop = step(0.97, h31(floor(p / 3.0))) * (1.0 - step(1.6, rr));
      float pm = max(step(0.5, inside), drop); col = mix(col, pc, pm); spec = mix(spec, 0.12, pm);
    }
    else if (soil == 3) {   // mould: dark grey-green specks at random spots in a 3 mm cell grid, dense in irregular clusters
      vec2 uv = fa == 0 ? p.zy : (fa == 1 ? p.xz : p.xy), c = floor(uv / 3.0);
      vec2 at = (c + 0.2 + 0.6 * vec2(h11(c.x * 7.1 + c.y * 3.7 + seed), h11(c.x * 2.3 + c.y * 9.1 + seed))) * 3.0;
      float cluster = smoothstep(0.35, 0.75, 0.5 * n1(uv.x * 0.06 + seed) + 0.5 * n1(uv.y * 0.07 + seed * 1.7));
      float speck = step(h11(c.x * 13.0 + c.y * 5.0 + seed), cluster) * (1.0 - smoothstep(0.5, 1.1, length(uv - at)));
      col = mix(col * mix(vec3(1.0), vec3(0.72, 0.78, 0.7), 0.6 * cluster * inside), vec3(0.06, 0.08, 0.06), 0.85 * speck * inside);   // with a diffuse grey-green stain
    }
    else if (soil == 4) col = mix(col, vec3(0.20, 0.17, 0.13) * (0.6 + 0.4 * n1(along * 0.08 + across * 0.9 + seed)), inside);   // rot: grey-brown, fibrous
    else if (soil == 5) {   // woodworm exit holes, ~2 mm, in the face's own plane
      vec2 uv = fa == 0 ? p.zy : (fa == 1 ? p.xz : p.xy), c = floor(uv / 6.0);
      if (h11(c.x * 17.0 + c.y * 31.0 + seed) > 0.8 && length(uv - (c + 0.5) * 6.0) < 1.1) col *= 1.0 - 0.9 * inside;
    }
    else if (soil == 6 && max(abs(n.x), max(abs(n.y), abs(n.z))) < 0.9 && sign(n.z) == sl.z)   // wane: the bark left on a slanted edge
      col = vec3(0.24, 0.19, 0.14) * (0.7 + 0.3 * n1(along * 0.15 + seed));
  }
  vec4 mk = P(k, 7);
  if (mk.x > 0.5) {   // marks: 1 burnt EPAL oval, 2 IPPC stamp, 3 paper label with barcode
    float nsg = fa == 0 ? n.x : (fa == 1 ? n.y : n.z);
    int face = fa * 2 + (nsg > 0.0 ? 1 : 0);
    if (face == int(mk.y)) {
      vec2 uv = fa == 0 ? vec2(p.z, p.y) : (fa == 1 ? vec2(p.x, p.z) : vec2(p.x, p.y));
      vec2 q = uv - mk.zw;
      int mt = int(mk.x);
      if (mt == 1) {
        float r = length(q / vec2(42.0, 20.0));
        if (abs(r - 1.0) < 0.12 || (r < 0.8 && abs(q.y) < 9.0 && h11(floor(q.x / 5.0) + floor(q.y / 7.0) * 13.0 + seed) > 0.55)) col *= 0.3;
      } else if (mt == 2) {
        vec2 a2 = abs(q);
        if (a2.x < 26.0 && a2.y < 18.0 && (a2.x > 23.0 || a2.y > 15.0 || (a2.y < 10.0 && h11(floor(q.x / 4.0) * 7.0 + floor(q.y / 6.0) + seed) > 0.6))) col *= 0.28;
      } else if (mt == 3) {
        vec2 a2 = abs(q);
        if (a2.x < 35.0 && a2.y < 22.0) { col = vec3(0.86, 0.86, 0.84); spec = 0.05; if (q.y < 4.0 && q.y > -16.0 && h11(floor((q.x + 35.0) / 2.2) + seed) > 0.5) col = vec3(0.06); }
      }
    }
  }
  return col;
}

// Mirror images of the lamps in a shiny surface at wp, reflected direction r (world). Only the lamp faces are tested,
// as they are what clips in an image. A rough surface blurs the image: each lamp grows by rough × its distance, and
// its brightness spreads over the larger area.
vec3 lampGlint(vec3 wp, vec3 r, float rough) {
  vec3 sum = vec3(0.0), inv = safeInv(r);
  for (int i = 0; i < 16; i++) {
    if (i >= uNLamp) break;
    vec3 lo = uLampLo[i].xyz, hi = uLampHi[i].xyz;
    float grow = rough * length((lo + hi) * 0.5 - wp), tn, tf; vec3 a, b;
    if (!boxRange(lo - grow, hi + grow, wp, inv, tn, tf, a, b) || tn < 0.0) continue;
    vec3 sz = hi - lo; float big = max(sz.x, max(sz.y, sz.z)), small = min(sz.x, min(sz.y, sz.z)), mid = sz.x + sz.y + sz.z - big - small;
    float spread = big * mid / ((big + 2.0 * grow) * (mid + 2.0 * grow));
    bool isBar = uLampHi[i].w > 0.5;
    if (palletShadow(wp, r, tn) || rollerBlocked(wp, wp + r * tn)) continue;
    sum += uLampLo[i].w * spread * (isBar ? uFace.x * louvreT(abs(r.z) / max(abs(r.y), 1e-4)) * uBarCol : uFace.y * uLampCol);
  }
  return sum;
}
// Mirror images of the spots' faces (discs of radius uSpotFace) in a shiny surface at wp, reflected direction r: seen
// only from inside a spot's beam. A rough surface blurs each image as in lampGlint.
vec3 spotGlint(vec3 wp, vec3 r, float rough) {
  vec3 sum = vec3(0.0);
  for (int k = 0; k < 2; k++) {
    if (k >= uNSpot) break;
    int l = uNBar + uNSide + k;
    vec3 Lw = uLights[l].xyz, v = Lw - wp;
    float t = dot(v, r), R = uSpotFace + rough * t;
    if (t <= 0.0 || length(v - r * t) > R) continue;
    float share = spotShare(k, Lw, wp);
    if (share <= 0.0 || palletShadow(wp, r, t) || rollerBlocked(wp, Lw)) continue;
    sum += uLights[l].w * share / (3.14159265 * R * R) * uBarCol;   // the face's radiance, spread over the blurred image
  }
  return sum;
}
// The spots' faces seen directly along the ray from o (direction d) up to distance tEnd: a face (disc of radius
// uSpotFace) is as bright as its light toward the viewer, so only from inside its beam.
vec3 spotFaces(vec3 o, vec3 d, float tEnd) {
  vec3 sum = vec3(0.0);
  for (int k = 0; k < 2; k++) {
    if (k >= uNSpot) break;
    int l = uNBar + uNSide + k;
    vec3 Lw = uLights[l].xyz, v = Lw - o;
    float t = dot(v, d);
    if (t <= 0.0 || t > tEnd || length(v - d * t) > uSpotFace) continue;
    sum += uLights[l].w * spotShare(k, Lw, o) / (3.14159265 * uSpotFace * uSpotFace) * uBarCol;
  }
  return sum;
}
// Surfaces at least this shiny (spec) reflect the lamps as mirror images (lampGlint) instead of highlights.
const float MIRROR_SPEC = 0.1;
const float METAL_F0 = 0.5, DIELECTRIC_F0 = 0.04;   // head-on reflectance: zinc and steel (assumed), water, ice and plastic

const float BEVEL[14] = float[14](2.5, 2.0, 1.2, 2.5, 6.0, 4.0, 4.0, 0.0, 0.0, 1.0, 0.0, 0.5, 0.0, 0.0);   // edge radius per material (MAT), mm

// Direct light at a hit. Returns radiance; alb and wn give the albedo and world normal for an indirect bounce.
vec3 shade(Hit h, float s, float foot, out vec3 alb, out vec3 wn) {
  alb = vec3(0.0); wn = vec3(0.0, 1.0, 0.0);
  if (h.k < 0 && h.roller < 0) return (h.ld.y > 0.0 ? uBgUp : uBg) * uLampCol;   // the hall, lit by the station lamps
  if (h.k >= 0 && int(P(h.k, 0).w) == 12) {   // a lamp's emitting face: its radiance (the part's colour) in this view
    vec3 L = P(h.k, 2).xyz;
    if (int(P(h.k, 1).w) == 2) return L * uFace.x * louvreT(abs(h.ld.z) / max(-barFacing(P(h.k, 0).xyz) * h.ld.y, 1e-4)) * uBarCol;   // an LED bar
    return L * uFace.y * uLampCol;
  }
  float spec = 0.0; vec3 n = h.n;
  if (h.roller >= 0) { alb = vec3(0.17, 0.175, 0.18); spec = 0.35; }   // zinc-plated steel
  else { n = bevel(h.k, h.pl, n, BEVEL[int(P(h.k, 0).w)]); alb = albedo(h.k, h.pl, n, foot, spec); }
  vec3 irr = vec3(0.0), sp = vec3(0.0);
  int p = h.p;
  bool movable = p >= 0 && uPalB[p].y > 0.5;
  loadPoses(s);
  Pose q; q.t = vec3(0.0); q.yaw = 0.0; q.pitch = 0.0;
  if (movable) q = gq[p];
  wn = movable ? worldD(q, n) : n;
  vec3 wp = (movable ? worldP(q, h.pl) : h.pl) + wn * 0.05;
  float gloss = spec > 0.1 ? 40.0 : 10.0;
  bool mirror = spec >= MIRROR_SPEC;
  for (int l = 0; l < 32; l++) {
    if (l >= uNL) break;
    vec3 Lw = uLights[l].xyz;
    if (uStill == 1) Lw += (vec3(rnd(), rnd(), rnd()) * 2.0 - 1.0) * uLightJit;
    vec3 L = movable ? localP(q, Lw) : Lw;
    vec3 v = L - h.pl; float dist = length(v); vec3 u = v / dist;
    float lam = dot(n, u);
    if (lam <= 0.0 || dot(h.n, u) <= -0.05) continue;
    vec3 toL = Lw - wp; float dl = length(toL);
    float share = lightShare(l, Lw, wp);
    if (share <= 0.0) continue;
    if (palletShadow(wp, toL / dl, dl)) continue;   // any pallet, onto pallets, rollers, frame and floor alike
    if (rollerBlocked(wp, Lw)) continue;
    float fall = uLights[l].w * share / (dist * dist);
    vec3 col = lightCol(l);
    irr += lam * fall * col;
    if (spec > 0.0 && !mirror) { vec3 hv = normalize(u - h.ld); float nh = dot(n, hv); if (nh > 0.0) sp += col * spec * pow(nh, gloss) * fall * (gloss + 2.0) / 42.0; }
  }
  vec3 c = alb * (uAmbient * uLampCol + irr) + sp * 0.5;
  if (mirror) {   // Fresnel (Schlick): zinc and steel reflect ~50% head-on, water, ice and plastic ~4%, all more at grazing angles
    bool metal = h.roller >= 0 || int(P(h.k, 0).w) == 9;
    float F0 = metal ? METAL_F0 : DIELECTRIC_F0, F = F0 + (1.0 - F0) * pow(1.0 - clamp(dot(-h.ld, n), 0.0, 1.0), 5.0);
    float rough = mix(0.25, 0.02, smoothstep(MIRROR_SPEC, 0.6, spec)) + (metal ? 0.08 : 0.0);   // spread angle, rad
    vec3 r = reflect(h.ld, n);
    vec3 rw = movable ? worldD(q, r) : r;
    c += F * (lampGlint(wp, rw, rough) + spotGlint(wp, rw, rough));
  }
  return c;
}

// Photo mode: one cosine-weighted bounce of indirect light; rays that escape see the hall (uSky).
const float BOUNCE_MAX = 3.0;   // a few times a well-lit surface
vec3 bounce(Hit h, float s, vec3 wn) {
  bool movable = h.p >= 0 && uPalB[h.p].y > 0.5;
  vec3 wp = toWorld(movable ? h.p : -1, s, h.pl, true) + wn * 0.1;
  float r1 = rnd(), r2 = rnd(), ph = 6.2831853 * r1, sr = sqrt(r2);
  vec3 t = normalize(cross(wn, abs(wn.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0))), b = cross(wn, t);
  vec3 d = normalize(t * cos(ph) * sr + b * sin(ph) * sr + wn * sqrt(1.0 - r2));
  Hit h2 = trace(wp, d, s);
  if (h2.k < 0 && h2.roller < 0) return uSky * uLampCol * (0.35 + 0.65 * max(d.y, 0.0));
  if (h2.k >= 0 && int(P(h2.k, 0).w) == 12) return vec3(0.0);   // lamps are already counted as direct light
  vec3 a2, n2;
  // capped: a rare bounce onto a glint or a brightly lit spot would otherwise show as a speckle until many passes average it
  return min(shade(h2, s, h2.t * uPixAng * 8.0 + 2.0, a2, n2), vec3(BOUNCE_MAX));
}

// Light scattered toward the camera by dust in the air along the ray from o (direction d) to distance tEnd: single
// scattering from each light, with a Henyey-Greenstein phase (coarse dust scatters mostly forward). Each light is a
// small source of radius DUST_R, so the glow stays finite at the light; its share and shadow are judged at the ray's
// point closest to it, and only when its glow would show.
const float DUST_G = 0.7, DUST_R = 30.0, DUST_VISIBLE = 1e-3;
vec3 dustGlow(vec3 o, vec3 d, float tEnd, float s) {
  if (uDust <= 0.0) return vec3(0.0);
  vec3 sum = vec3(0.0); bool posed = false;
  for (int l = 0; l < 32; l++) {
    if (l >= uNL) break;
    vec3 Lw = uLights[l].xyz, v = Lw - o;
    float tc = dot(v, d), hh = sqrt(max(dot(v, v) - tc * tc, 0.0) + DUST_R * DUST_R);
    float J = (atan((tEnd - tc) / hh) - atan(-tc / hh)) / hh;   // integral of 1 / distance² along the ray
    vec3 pc = o + d * clamp(tc, 0.0, tEnd), u = pc - Lw; float du = max(length(u), 1e-3); u /= du;
    float g2 = DUST_G * DUST_G, phase = (1.0 - g2) / (12.566371 * pow(1.0 + g2 - 2.0 * DUST_G * dot(u, -d), 1.5));
    float add = uDust * phase * uLights[l].w * lightShare(l, Lw, pc) * J;
    vec3 col = lightCol(l);
    if (add * uExposure < DUST_VISIBLE) { sum += add * col; continue; }
    if (!posed) { loadPoses(s); posed = true; }
    if (palletShadow(pc, -u, du) || rollerBlocked(pc, Lw)) continue;
    sum += add * col;
  }
  return sum;
}

// The bottom camera's stand shaking with the conveyor at time t s: two assumed modes, 24 and 61 Hz across the belt
// and 31 Hz along it, amplitude uVib mm.
const vec3 VIB_HZ = vec3(24.0, 31.0, 61.0);
vec3 vibration(float t) {
  if (uVib <= 0.0) return vec3(0.0);
  float w = 6.2831853 * t;
  return uVib * vec3(0.5 * sin(VIB_HZ.y * w + 0.4), 0.0, 0.8 * sin(VIB_HZ.x * w) + 0.3 * sin(VIB_HZ.z * w + 1.3));
}

// The bottom camera's window, a parallel glass plate: the ray from o leaves it in its own direction d, shifted
// sideways (o moves to the shifted line, so distances still count from the camera, and each aperture sample shifts
// on its own: astigmatism). Returns the share of the light let through (glassT). A ray that doesn't cross the window
// outward ends on the black housing.
float throughWindow(inout vec3 o, vec3 d) {
  float c = dot(d, uWinN);
  if (c <= 0.0) return 0.0;
  vec3 p1 = o + d * (dot(uWinO - o, uWinN) / c), r = refract(d, -uWinN, 1.0 / uGlass.x);
  vec3 w = p1 + r * (uGlass.y / dot(r, uWinN)) - o;
  o += w - d * dot(w, d);
  return glassT(c);
}
// Share of the light a window lets through at cosine c to its normal: both faces reflect, by Fresnel for each
// polarisation, and the light bouncing between them comes out too (as glassPass in the page script).
float glassT(float c) {
  if (c <= 0.0) return 0.0;
  float n = uGlass.x, ct = sqrt(1.0 - (1.0 - c * c) / (n * n));
  float rs = (c - n * ct) / (c + n * ct), rp = (n * c - ct) / (n * c + ct);
  rs *= rs; rp *= rp;
  return 0.5 * ((1.0 - rs) / (1.0 + rs) + (1.0 - rp) / (1.0 + rp));
}

void main() {
  int ix = int(gl_FragCoord.x); int row = uH - 1 - int(gl_FragCoord.y);
  rngS = uint(ix) * 1973u + uint(row) * 9277u + uint(uSeed * 977.0) * 26699u + 1u;
  vec3 o = uC, d; float s, vig;
  if (uMode == 0 || uMode == 2) {
    s = uS0 + float(row) * uPitch;
    float rel = uPhi0 + float(ix) * uDphi - uAxisPhi;
    vig = pow(cos(rel), 4.0) / 0.93;
    float phi = uAxisPhi + rel * (1.0 + uDistort * rel * rel);   // barrel distortion: pixels away from the axis look further out
    d = cos(phi) * uD0 + sin(phi) * uE;
    o += vibration(s / uSpeed);
  } else {
    s = uSnapS + (float(row) / uSize.y - 0.5) * uRollMM;   // a rolling shutter exposes each row a little later
    vec2 pc = vec2(float(ix) + (uStill == 1 ? rnd() : 0.5), float(row) + (uStill == 1 ? rnd() : 0.5)) - uSize * 0.5;
    pc *= 1.0 + uDistort * dot(pc, pc) / (uFoc.x * uFoc.x);
    d = normalize(uF + pc.x / uFoc.x * uR - pc.y / uFoc.y * uU); vig = pow(max(dot(d, uF), 0.0), 4.0) / 0.93;
  }
  if (uMode >= 2) {   // ids for the visibility map: part, face, distance
    if (uMode == 2 && throughWindow(o, d) <= 0.0) { outColor = vec4(0.0); return; }
    Hit h = trace(o, d, s);
    if (h.k < 0) { outColor = vec4(0.0); return; }
    int id = h.k + 1;
    int face = abs(h.n.x) > 0.5 ? (h.n.x > 0.0 ? 1 : 0) : (abs(h.n.y) > 0.5 ? (h.n.y > 0.0 ? 3 : 2) : (h.n.z > 0.0 ? 5 : 4));
    int dmm = int(min(h.t, 65535.0));
    outColor = vec4(float(id % 256), float((id / 256) * 8 + face), float(dmm % 256), float(dmm / 256)) / 255.0;
    return;
  }
  vec3 acc = vec3(0.0);
  float seen = 0.0;   // samples that cross the window: only they see the dirt on it
  int ns = uStill == 1 ? 1 : max(uDof, uBlur > 0.05 ? 4 : 1);
  vec3 up = abs(uAxis.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 b1 = normalize(cross(uAxis, up)), b2 = cross(uAxis, b1);
  for (int k = 0; k < 8; k++) {
    if (k >= ns) break;
    vec3 oo = o, dd = d;
    if (uDof > 0) {   // thin lens: sample the aperture, aim at the point on the focus plane
      float a = uStill == 1 ? rnd() * 6.2831853 : (float(k) + h11(float(ix) * 1.7 + float(row) * 3.1 + uSeed)) / float(ns) * 6.2831853;
      float r = sqrt(uStill == 1 ? rnd() : (float(k) + 0.5) / float(ns)) * uAperture * 0.5;
      vec3 pf = o + d * (uFocus / dot(d, uAxis));
      oo = o + (cos(a) * b1 + sin(a) * b2) * r; dd = normalize(pf - oo);
    }
    // the scene moves during the exposure: each sample sees it at its own point within the exposure
    float sk = s + (uStill == 1 ? rnd() - 0.5 : (float(k) + h11(float(ix) * 2.3 + float(row) * 1.1 + uSeed)) / float(ns) - 0.5) * uBlur;
    float glass = uMode == 0 ? throughWindow(oo, dd) : 1.0;
    if (glass <= 0.0) continue;
    seen += 1.0;
    Hit h = trace(oo, dd, sk);
    vec3 alb, wn;
    float tEnd = h.k < 0 && h.roller < 0 ? 8000.0 : h.t;
    vec3 c = shade(h, sk, h.t * uPixAng, alb, wn) + dustGlow(oo, dd, tEnd, sk) + spotFaces(oo, dd, tEnd);
    if (h.k >= 0 || h.roller >= 0) {
      if (uStill == 1) c += alb * bounce(h, sk, wn);
      else if (uIndirect > 0) {
        vec3 b = vec3(0.0);
        for (int j = 0; j < 8; j++) { if (j >= uIndirect) break; b += bounce(h, sk, wn); }
        c += alb * b / float(uIndirect);
      }
    }
    acc += c * glass;
  }
  vec3 c = acc / float(ns) * uExposure * vig;
  if (uMode == 0) {   // dirty camera window: blotchy transmission loss plus veiling glare
    float bl = smoothstep(0.55, 0.85, n1(float(ix) / (uSize.x / 60.0)));
    c = c * (1.0 - uDirt * 0.6 * bl) + uDirt * 0.02 * seen / float(ns);
  }
  outColor = vec4(c, 1.0);
}
