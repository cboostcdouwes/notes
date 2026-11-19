#version 300 es
precision highp float; precision highp int;
uniform sampler2D uNative; uniform int uMode; uniform int uRect; uniform int uPX; uniform int uH;
uniform int uOutRow;            // output drawn this many rows below the traced rows, so several renders share the canvas
uniform vec3 uC; uniform vec3 uD0; uniform vec3 uE; uniform float uPhi0; uniform float uDphi; uniform float uZ0; uniform float uZ1;
uniform float uLineX;           // line-scan: where its scan line lies along travel, mm
uniform float uPlaneY;          // line-scan: height of the plane its view is fitted to, mm (the belt plane; a top camera's mirror of it)
uniform float uNoise; uniform float uSeed; uniform float uRowBase; uniform int uTone;
uniform float uK;               // exposure relative to the reference (1 = mid-grey at half the full well)
uniform float uGain;            // the camera's gain, set for its light (never below 1, so overexposure stays clipped)
uniform float uFullWell; uniform float uReadNoise;   // electrons
uniform sampler2D uHdr;         // the whole area image, mipmapped, for lens glare
uniform float uVeil; uniform float uGhost; uniform int uHdrOff; uniform vec2 uHdrSize; uniform int uLevels;
uniform vec3 uWB;               // white balance: the camera's gains for its own light's colour
uniform vec3 uFlick;            // light driver: mode (0 steady, 1 PWM, 2 ripple), frequency Hz, duty or depth
uniform float uT0; uniform float uTRow; uniform float uExpS;   // time of row 0 and per row, exposure, s
uniform float uFpn; uniform float uCamSeed;   // uncalibrated sensor: pixel-to-pixel gain and dark offset
uniform vec4 uDebris[16]; uniform int uNDebris; // on the bottom window: position along the line and across it, radius (mm), opacity
uniform vec3 uWinN; uniform vec3 uWinO; uniform vec3 uWinA;   // the window: outward normal, where the lens axis crosses it, along the line
uniform float uApR;             // aperture radius, mm
uniform float uFog;             // bottom window fogged: 1
out vec4 outColor;
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
float h11(float n) { return fract(sin(n) * 43758.5453123); }
vec3 fetchRow(float f, int row) {
  if (f < 0.0 || f > float(uPX - 1)) return vec3(0.0);
  int i0 = int(floor(f)); int i1 = min(i0 + 1, uPX - 1); float w = f - float(i0);
  int y = uH - 1 - row;
  return mix(texelFetch(uNative, ivec2(i0, y), 0).rgb, texelFetch(uNative, ivec2(i1, y), 0).rgb, w);
}
// Lens glare. Veiling glare spreads uVeil of all light: one blur per mip level, of doubling width, with shares falling
// by 2^-0.5 per octave (a point spread falling off with distance^-2.5). One ghost: a defocused image mirrored through
// the centre, faintly tinted by the coatings. Each level is read with four taps to smooth its blocks.
vec3 tent(vec2 uv, float lod) {
  vec2 t = 0.5 * exp2(lod) / uHdrSize;
  return 0.25 * (textureLod(uHdr, uv + t, lod).rgb + textureLod(uHdr, uv - t, lod).rgb
    + textureLod(uHdr, uv + vec2(t.x, -t.y), lod).rgb + textureLod(uHdr, uv + vec2(-t.x, t.y), lod).rgb);
}
vec3 withGlare(vec3 c, vec2 uv) {
  vec3 g = vec3(0.0); float wsum = 0.0;
  for (int i = 1; i < 16; i++) { if (i >= uLevels) break; float w = exp2(-0.5 * float(i)); g += w * tent(uv, float(i)); wsum += w; }
  return c * (1.0 - uVeil) + g * (uVeil / wsum) + uGhost * vec3(0.85, 1.0, 1.1) * tent(1.0 - uv, 4.0);
}
// Light output averaged over an exposure of T s from t s, relative to its mean (as flickerAvg in the page script).
float flicker(float t, float T) {
  int mode = int(uFlick.x);
  if (mode == 0) return 1.0;
  float a = t * uFlick.y, b = (t + T) * uFlick.y, d = uFlick.z;
  if (mode == 1) return (floor(b) * d + min(fract(b), d) - floor(a) * d - min(fract(a), d)) / (d * (b - a));
  return 1.0 + d * (sin(6.2831853 * b) - sin(6.2831853 * a)) / (6.2831853 * (b - a));
}
// area where two circles (centres d apart) overlap
float circOverlap(float d, float r1, float r2) {
  if (d >= r1 + r2) return 0.0;
  if (d <= abs(r1 - r2)) return 3.14159265 * min(r1, r2) * min(r1, r2);
  return r1 * r1 * acos((d * d + r1 * r1 - r2 * r2) / (2.0 * d * r1)) + r2 * r2 * acos((d * d + r2 * r2 - r1 * r1) / (2.0 * d * r2))
    - 0.5 * sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
}
// Share of the light that gets past the debris on the window for native pixel f (as windowT in the page script). The
// pixel's light crosses the window as a disc the size of the aperture around its ray; debris is far out of focus, so
// it dims the pixels whose disc it covers rather than showing as a shape. Each item, seen along the ray, is
// foreshortened to a disc of equal area.
float windowT(float f) {
  if (uNDebris == 0) return 1.0;
  float phi = uPhi0 + f * uDphi;
  vec3 d = cos(phi) * uD0 + sin(phi) * uE;
  float c = dot(d, uWinN);
  if (c <= 0.0) return 1.0;   // the ray ends on the housing (black in the tracer)
  vec3 x = uC + d * (dot(uWinO - uC, uWinN) / c), b = cross(uWinN, uWinA);
  float blocked = 0.0;
  for (int i = 0; i < 16; i++) {
    if (i >= uNDebris) break;
    vec4 q = uDebris[i];
    vec3 off = uWinO + q.x * uWinA + q.y * b - x;
    blocked += q.w * circOverlap(length(off - d * dot(off, d)), uApR, q.z * sqrt(c));
  }
  return max(0.0, 1.0 - blocked / (3.14159265 * uApR * uApR));
}
// A fogged window scatters light along the line: a wide average of it, weighted exp(-distance / FOG_PX).
const float FOG_PX = 60.0;
const float FOG_KEEP = 0.85, FOG_SCATTER = 0.5;   // fogged window (assumed): light let through, share of it scattered
vec3 fogScatter(float f, int row) {
  vec3 s = vec3(0.0); float mx = float(uPX - 1), wsum = 0.0;
  for (int i = -24; i <= 24; i++) { float o = float(i) * 6.0, w = exp(-abs(o) / FOG_PX); s += w * fetchRow(clamp(f + o, 0.0, mx), row); wsum += w; }
  return s / wsum;
}
const float PRNU_SPAN = 0.04, DARK_E = 30.0;   // uncalibrated sensor (assumed): pixel gain spread, dark offset up to, e-
vec3 enc(vec3 c) { c = clamp(c, 0.0, 1.0); return mix(12.92 * c, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
void main() {
  int ix = int(gl_FragCoord.x), fy = int(gl_FragCoord.y) + uOutRow, row = uH - 1 - fy;
  vec3 c;
  float f = float(ix);   // native pixel (line-scan)
  if (uMode == 0) {
    if (uRect == 1) {   // perspective correction: uniform mm on the plane at uPlaneY
      float z = uZ0 + (uZ1 - uZ0) * float(ix) / float(uPX - 1);
      vec3 v = vec3(uLineX, uPlaneY, z) - uC;
      f = (atan(dot(v, uE), dot(v, uD0)) - uPhi0) / uDphi;
    }
    c = fetchRow(f, row);
    c.r = 0.6 * c.r + 0.4 * fetchRow(f, row > 0 ? row - 1 : row).r;   // trilinear sensor: R line slightly behind
    if (uFog > 0.0) c = FOG_KEEP * mix(c, fogScatter(f, row), FOG_SCATTER);
    c *= windowT(f);
  } else if (uVeil > 0.0) {
    ivec2 tp = ivec2(ix, fy - uHdrOff);
    c = withGlare(texelFetch(uHdr, tp, 0).rgb, (vec2(tp) + 0.5) / uHdrSize);
  } else {
    c = texelFetch(uNative, ivec2(ix, fy), 0).rgb;
  }
  // Sensor: electrons from the light collected (clipped at the full well), shot and read noise, then the camera's gain
  // (uGain), which brings an underexposed image back to the reference brightness.
  c *= flicker(uT0 + float(row) * uTRow, uExpS) * uWB;
  float r0 = uRowBase + float(row);
  vec3 e = min(max(c, vec3(0.0)) * uK, vec3(1.0)) * uFullWell, g;
  if (uFpn > 0.0) {   // each pixel's gain differs ±2% and it adds a dark offset; a line sensor repeats its pixels every line, so streaks
    float px = uMode == 0 ? floor(f) : float(ix) + float(row) * 4099.0;
    e = min(e * (1.0 + PRNU_SPAN * (h11(px * 0.731 + uCamSeed) - 0.5)) + DARK_E * h11(px * 1.37 + uCamSeed + 5.0), vec3(uFullWell));
  }
  for (int j = 0; j < 3; j++) {
    float fj = float(j) * 17.0;
    g[j] = (h11(float(ix) * 12.9898 + r0 * 78.233 + uSeed + fj) + h11(float(ix) * 3.1 + r0 * 7.7 + uSeed * 1.3 + fj) + h11(float(ix) * 5.3 + r0 * 1.9 + uSeed * 2.1 + fj) - 1.5) * 2.0;
  }
  e += uNoise * sqrt(e + uReadNoise * uReadNoise) * g;
  c = e / uFullWell * uGain;
  if (uTone == 1) c = aces(c);   // filmic curve for the photo of the 3D view; machine-vision images stay linear
  outColor = vec4(enc(c), 1.0);
}
