/**
 * The hero's WebGL depth layer (v2 spec §9.6; the lusion.co reference): an enhancement of the photo that is already on
 * screen, desktop + fine pointer + motion allowed only, fetched on idle after the intro (hero-live.ts). Raw WebGL 1,
 * no library, its own lazy chunk. The <img> stays underneath and is never hidden (the H1 is the LCP element anyway);
 * the canvas is aria-hidden, ignores the pointer, and fades in only after its first frame. A first frame slower than
 * 200 ms, or a lost context, removes the canvas and the static photo simply stays.
 *
 * It draws only on demand (hero-live.ts asks for a frame while the cursor or the swing moves; nothing loops when the
 * scene is still), from the photo itself:
 * - depth parallax: a depth map derived on the CPU from a 160 px copy of the photo (yellow steel and dark machinery
 *   near, blue/white sky far, the ground nearest), so the cursor moves the cranes more than the sky;
 * - the real rope and hook swing: pixels inside a capsule around the hoist rope (boom tip → hook) are sampled through
 *   an inverse rotation about the boom tip, so the photo's own rope and hook block swing with the pendulum that the
 *   DOM sling hangs from (hero-live.ts moves the rig with the same angle);
 * - a faint navy grade at the frame's edges (the brand blue as light, not paint).
 * It uses the same bottom-anchored cover maths as the CSS photo, so canvas and DOM agree to the pixel.
 */
import type { CropImage } from '@/generated/images';

/** v2 spec §9.6: a first frame slower than this removes the canvas. */
const SLOW_FIRST_FRAME_MS = 200;

export interface GlState {
  /** Cursor in -1…1 (eased by the caller). */
  px: number;
  py: number;
  /** Rope swing about the boom tip, radians (screen y-down, positive = clockwise). */
  theta: number;
}

export interface GlLayer {
  /** Ask for one frame (coalesced to the next animation frame; skipped while off-screen or hidden). */
  draw: () => void;
  stop: () => void;
}

const VERT = `
attribute vec2 a;
varying vec2 vP;
uniform vec2 uRes;
void main() {
  vP = (a * 0.5 + 0.5) * uRes;
  vP.y = uRes.y - vP.y;
  gl_Position = vec4(a, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vP;
uniform sampler2D uImg;
uniform sampler2D uDepth;
uniform vec2 uRes;
uniform vec2 uCrop;
uniform float uS;
uniform vec2 uTip;
uniform vec2 uHook;
uniform float uTheta;
uniform vec2 uPtr;
void main() {
  // screen (CSS px) -> crop px, for a bottom-anchored cover image (object-position 50% 100%)
  vec2 c = vec2((vP.x - uRes.x * 0.5) / uS + uCrop.x * 0.5, uCrop.y - (uRes.y - vP.y) / uS);
  float d = texture2D(uDepth, c / uCrop).r;
  c += uPtr * d * vec2(46.0, 26.0);
  vec2 seg = (uHook + vec2(0.0, 90.0)) - uTip;
  float t = clamp(dot(c - uTip, seg) / dot(seg, seg), 0.0, 1.0);
  float r = mix(36.0, 150.0, t * t);
  float m = 1.0 - smoothstep(r * 0.62, r, length(c - (uTip + seg * t)));
  float cs = cos(-uTheta), sn = sin(-uTheta);
  vec2 rel = c - uTip;
  c = mix(c, uTip + vec2(cs * rel.x - sn * rel.y, sn * rel.x + cs * rel.y), m);
  vec3 col = texture2D(uImg, clamp(c / uCrop, 0.0, 1.0)).rgb;
  vec2 sp = vP / uRes - 0.5;
  float vig = smoothstep(0.42, 0.9, length(sp * vec2(1.0, 1.25)));
  gl_FragColor = vec4(mix(col, vec3(0.137, 0.125, 0.478), vig * 0.22), 1.0);
}`;

function shader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
  return s;
}

/** Pseudo-depth from colour: yellow steel and dark machinery near, sky far, the ground nearest. Box-blurred. */
function depthFrom(img: HTMLImageElement): { data: Uint8Array; w: number; h: number } {
  const w = 160;
  const h = Math.round((w * img.naturalHeight) / img.naturalWidth);
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const cx = cv.getContext('2d', { willReadFrequently: true })!;
  cx.drawImage(img, 0, 0, w, h);
  const px = cx.getImageData(0, 0, w, h).data;
  let d = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = px[i * 4] / 255;
    const g = px[i * 4 + 1] / 255;
    const b = px[i * 4 + 2] / 255;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const yellow = Math.max(0, (r + g) / 2 - b);
    const dark = lum < 0.32 ? (0.32 - lum) * 2.4 : 0;
    const ground = Math.max(0, (Math.floor(i / w) / h - 0.78) / 0.22);
    d[i] = Math.min(1, yellow * 2.6 + dark + ground * 0.8);
  }
  for (let pass = 0; pass < 3; pass++) {
    const o = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0;
        let n = 0;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const xx = x + dx;
            const yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
            sum += d[yy * w + xx];
            n++;
          }
        }
        o[y * w + x] = sum / n;
      }
    }
    d = o;
  }
  const data = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) data[i] = Math.round(d[i] * 255);
  return { data, w, h };
}

/** Starts the layer inside `host` (an empty, aria-hidden box over the photo), or resolves to null without WebGL. */
export async function startDepth(
  host: HTMLElement,
  stage: HTMLElement,
  img: HTMLImageElement,
  crop: CropImage,
  tip: { x: number; y: number },
  state: GlState,
): Promise<GlLayer | null> {
  if (!crop.hook) return null;
  await img.decode().catch(() => undefined);
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'low-power' });
  if (!gl) return null;

  const prog = gl.createProgram()!;
  gl.attachShader(prog, shader(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const texture = (unit: number) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };
  texture(0);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
  const depth = depthFrom(img);
  texture(1);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, depth.w, depth.h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, depth.data);

  const u = (name: string) => gl.getUniformLocation(prog, name);
  const { width: cw, height: ch } = crop.rect;
  gl.uniform1i(u('uImg'), 0);
  gl.uniform1i(u('uDepth'), 1);
  gl.uniform2f(u('uCrop'), cw, ch);
  gl.uniform2f(u('uTip'), tip.x - crop.rect.left, tip.y - crop.rect.top);
  gl.uniform2f(u('uHook'), crop.hook.x - crop.rect.left, crop.hook.y - crop.rect.top);
  const uRes = u('uRes');
  const uS = u('uS');
  const uTheta = u('uTheta');
  const uPtr = u('uPtr');

  const resize = () => {
    const r = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, r.width, r.height);
    gl.uniform1f(uS, Math.max(r.width / cw, r.height / ch));
  };

  let raf = 0;
  let visible = true;
  let dead = false;
  let first = true;
  const frame = () => {
    raf = 0;
    if (dead || !visible || document.hidden) return;
    const started = performance.now();
    gl.uniform1f(uTheta, state.theta);
    gl.uniform2f(uPtr, state.px, state.py);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (first) {
      first = false;
      gl.finish();
      if (performance.now() - started > SLOW_FIRST_FRAME_MS) return stop();
      canvas.dataset.ready = '';
    }
  };
  const draw = () => {
    if (!raf && !dead) raf = requestAnimationFrame(frame);
  };
  const ro = new ResizeObserver(() => {
    resize();
    draw();
  });
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) draw();
  });
  const onVisibility = () => !document.hidden && draw();
  const onLost = (event: Event) => {
    event.preventDefault();
    stop();
  };
  function stop() {
    if (dead) return;
    dead = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.removeEventListener('webglcontextlost', onLost);
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    canvas.remove();
  }

  resize();
  host.append(canvas);
  ro.observe(stage);
  io.observe(stage);
  document.addEventListener('visibilitychange', onVisibility);
  canvas.addEventListener('webglcontextlost', onLost);
  draw();
  return { draw, stop };
}
