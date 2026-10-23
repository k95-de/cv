/* ============================================================================
   HEAT FIELD · a real-time GPU fluid (stable fluids) with buoyancy.
   The dye is TEMPERATURE: the cursor injects heat, warm fluid rises
   (natural convection), the field cools down over time, and the result is
   drawn through Khaled's full thermal colour map with isotherm contour lines.
   Raw WebGL, no library. Exposes window.HeatField.
   Technique after Jos Stam "Stable Fluids" (1999) and the well-known
   WebGL port by Pavel Dobryakov (MIT); rewritten and trimmed for this site.
   ========================================================================== */
(function () {
"use strict";

function HeatField(canvas, opts) {
  opts = opts || {};
  const mobile = !!opts.mobile;
  /* opts.quality = { sim, dye, iter, dpr } from the adaptive tier picker in main.js */
  const q = opts.quality || {};
  const cfg = {
    SIM: q.sim || (mobile ? 96 : 128),
    DYE: q.dye || (mobile ? 384 : 768),
    PRESSURE_ITER: q.iter || (mobile ? 14 : 20),
    DPR: q.dpr || (mobile ? 1.25 : 1.5),
    VEL_DISS: 0.35,
    HEAT_DISS: 0.3,
    CURL: 16,
    BUOY: 120,
    SPLAT_R: mobile ? 0.0042 : 0.0028
  };
  this.ok = false;
  this.dim = 0;           // 0 = full brightness (hero), 1 = dimmed (behind content)
  this.cool = 0;          // 0 = normal, 1 = fully cooled (end of page, 404)
  this.energy = 0;        // cheap CPU estimate of how much heat is in the field (0..~1)
  let userHeat = 0;
  this.paused = false;

  const params = { alpha: false, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false, powerPreference: "high-performance" };
  let gl = canvas.getContext("webgl2", params);
  const isGL2 = !!gl;
  if (!gl) gl = canvas.getContext("webgl", params) || canvas.getContext("experimental-webgl", params);
  if (!gl) return;

  let halfFloat, linear, internal, format;
  if (isGL2) {
    gl.getExtension("EXT_color_buffer_float");
    linear = gl.getExtension("OES_texture_float_linear") || true; // half-float linear is core in GL2
    halfFloat = gl.HALF_FLOAT;
    internal = gl.RGBA16F; format = gl.RGBA;
  } else {
    const hf = gl.getExtension("OES_texture_half_float");
    linear = gl.getExtension("OES_texture_half_float_linear");
    if (!hf) return;
    halfFloat = hf.HALF_FLOAT_OES; internal = gl.RGBA; format = gl.RGBA;
  }
  const filtering = linear ? gl.LINEAR : gl.NEAREST;

  /* can we actually render into half floats? */
  function supportsRT() {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, 4, 4, 0, format, halfFloat, null);
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteTexture(t); gl.deleteFramebuffer(f);
    return ok;
  }
  if (!supportsRT()) return;

  /* ------------------------------------------------------------ shaders */
  const VS = `
    precision highp float;
    attribute vec2 aPos;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform vec2 texel;
    void main(){
      vUv = aPos * 0.5 + 0.5;
      vL = vUv - vec2(texel.x, 0.0); vR = vUv + vec2(texel.x, 0.0);
      vT = vUv + vec2(0.0, texel.y); vB = vUv - vec2(0.0, texel.y);
      gl_Position = vec4(aPos, 0.0, 1.0);
    }`;
  const P = "precision highp float; precision highp sampler2D;\n varying vec2 vUv, vL, vR, vT, vB;\n";

  const FS = {
    clear: P + `uniform sampler2D uTex; uniform float value;
      void main(){ gl_FragColor = value * texture2D(uTex, vUv); }`,

    splat: P + `uniform sampler2D uTarget; uniform float aspect; uniform vec3 color; uniform vec2 point; uniform float radius;
      void main(){
        vec2 p = vUv - point; p.x *= aspect;
        vec3 s = exp(-dot(p, p) / radius) * color;
        gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + s, 1.0);
      }`,

    advect: P + `uniform sampler2D uVelocity, uSource; uniform vec2 texel; uniform float dt, dissipation;
      void main(){
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texel;
        vec4 r = texture2D(uSource, coord);
        gl_FragColor = r / (1.0 + dissipation * dt);
      }`,

    divergence: P + `uniform sampler2D uVelocity;
      void main(){
        float L = texture2D(uVelocity, vL).x, R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y, B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x;
        if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
        gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
      }`,

    curl: P + `uniform sampler2D uVelocity;
      void main(){
        float L = texture2D(uVelocity, vL).y, R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x, B = texture2D(uVelocity, vB).x;
        gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
      }`,

    /* vorticity confinement + buoyancy (hot fluid rises) */
    force: P + `uniform sampler2D uVelocity, uCurl, uHeat; uniform float curl, dt, buoy;
      void main(){
        float L = texture2D(uCurl, vL).x, R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x, B = texture2D(uCurl, vB).x, C = texture2D(uCurl, vUv).x;
        vec2 f = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        f /= length(f) + 0.0001; f *= curl * C; f.y *= -1.0;
        float h = texture2D(uHeat, vUv).x;
        vec2 v = texture2D(uVelocity, vUv).xy + (f + vec2(0.0, buoy * h)) * dt;
        gl_FragColor = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
      }`,

    pressure: P + `uniform sampler2D uPressure, uDivergence;
      void main(){
        float L = texture2D(uPressure, vL).x, R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x, B = texture2D(uPressure, vB).x;
        float d = texture2D(uDivergence, vUv).x;
        gl_FragColor = vec4((L + R + B + T - d) * 0.25, 0.0, 0.0, 1.0);
      }`,

    gradient: P + `uniform sampler2D uPressure, uVelocity;
      void main(){
        float L = texture2D(uPressure, vL).x, R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x, B = texture2D(uPressure, vB).x;
        vec2 v = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
        gl_FragColor = vec4(v, 0.0, 1.0);
      }`,

    /* temperature -> full thermal spectrum (navy, blue, cyan, green, yellow, orange, red) */
    display: P + `uniform sampler2D uHeat; uniform vec2 dyeTexel; uniform float dim, time, cool; uniform vec2 res;
      vec3 thermal(float t){
        t = clamp(t, 0.0, 1.0);
        vec3 c0 = vec3(0.020,0.035,0.090);
        vec3 c1 = vec3(0.070,0.160,0.520);
        vec3 c2 = vec3(0.115,0.420,0.960);
        vec3 c3 = vec3(0.180,0.820,0.950);
        vec3 c4 = vec3(0.250,0.880,0.520);
        vec3 c5 = vec3(0.980,0.900,0.260);
        vec3 c6 = vec3(1.000,0.560,0.140);
        vec3 c7 = vec3(0.960,0.200,0.180);
        float s = t * 7.0;
        if (s < 1.0) return mix(c0, c1, s);
        if (s < 2.0) return mix(c1, c2, s - 1.0);
        if (s < 3.0) return mix(c2, c3, s - 2.0);
        if (s < 4.0) return mix(c3, c4, s - 3.0);
        if (s < 5.0) return mix(c4, c5, s - 4.0);
        if (s < 6.0) return mix(c5, c6, s - 5.0);
        return mix(c6, c7, s - 6.0);
      }
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
      void main(){
        float h  = texture2D(uHeat, vUv).x;
        float hx = texture2D(uHeat, vUv + vec2(dyeTexel.x, 0.0)).x;
        float hy = texture2D(uHeat, vUv + vec2(0.0, dyeTexel.y)).x;
        float t  = 1.0 - exp(-h * 1.6);
        float tx = 1.0 - exp(-hx * 1.6), ty = 1.0 - exp(-hy * 1.6);
        /* cool-down: squeeze the scale toward the blue end */
        float cs = 1.0 - 0.62 * cool;
        t *= cs; tx *= cs; ty *= cs;
        vec3 col = thermal(t * 0.98);
        col = mix(col, col * vec3(0.78, 0.92, 1.12), cool * 0.6);
        /* isotherms: thin lines every 1/9 of the scale */
        float k = 6.0;
        float g = length(vec2(tx - t, ty - t)) * k + 1e-4;
        float d = abs(fract(t * k + 0.5) - 0.5);
        float line = (1.0 - smoothstep(0.0, g * 1.4, d)) * smoothstep(0.03, 0.12, t);
        col = col * 0.8 + vec3(0.85, 0.93, 1.0) * line * 0.12;
        /* soft glow and quiet blue floor so empty space is never flat black */
        vec2 uv = vUv; uv.x *= res.x / res.y;
        float floorGlow = 0.5 + 0.5 * sin(uv.x * 1.3 + time * 0.07) * cos(uv.y * 1.7 - time * 0.05);
        col += vec3(0.02, 0.05, 0.14) * floorGlow * 0.6;
        /* vignette + dim when content sits on top */
        float v = smoothstep(1.25, 0.25, length(vUv - 0.5) * 1.6);
        col *= mix(0.6, 1.0, v);
        col *= mix(1.0, 0.3, dim);
        col += (hash(vUv * res + time) - 0.5) * 0.03;
        gl_FragColor = vec4(col, 1.0);
      }`
  };

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  const vs = compile(gl.VERTEX_SHADER, VS);
  function program(fsSrc) {
    const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) throw new Error("shader");
    const p = gl.createProgram();
    gl.attachShader(p, vs); gl.attachShader(p, fs);
    gl.bindAttribLocation(p, 0, "aPos");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name; u[name] = gl.getUniformLocation(p, name); }
    return { p, u };
  }
  let prog;
  try { prog = {}; for (const k in FS) prog[k] = program(FS[k]); } catch (e) { console.warn("HeatField disabled:", e.message); return; }

  /* fullscreen triangle pair */
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  const ibuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  function blit(target) {
    if (target) { gl.viewport(0, 0, target.w, target.h); gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo); }
    else { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  function fbo(w, h) {
    gl.activeTexture(gl.TEXTURE0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filtering);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filtering);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, halfFloat, null);
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, fbo: f, w, h, tx: 1 / w, ty: 1 / h,
      attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; } };
  }
  function dbl(w, h) {
    let a = fbo(w, h), b = fbo(w, h);
    return { w, h, tx: 1 / w, ty: 1 / h,
      get read() { return a; }, get write() { return b; }, swap() { const t = a; a = b; b = t; } };
  }
  function res(r) {
    const ar = gl.drawingBufferWidth / gl.drawingBufferHeight;
    const min = Math.round(r), max = Math.round(r * (ar < 1 ? 1 / ar : ar));
    return gl.drawingBufferWidth > gl.drawingBufferHeight ? { w: max, h: min } : { w: min, h: max };
  }

  let vel, heat, div, curlT, pres;
  const self = this;
  function free() {
    /* release the old GPU textures before allocating new ones (matters on low-memory phones) */
    const kill = t => { if (!t) return; gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fbo); };
    [vel, heat, pres].forEach(d => { if (d) { kill(d.read); kill(d.write); } });
    kill(div); kill(curlT);
  }
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, cfg.DPR);
    const w = Math.max(2, Math.floor(canvas.clientWidth * dpr)), h = Math.max(2, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width === w && canvas.height === h && vel) return;
    /* small size changes (phone address bar, scrollbars, layout refresh) keep the
       running field: only the drawing buffer changes, the simulation continues */
    if (vel && Math.abs(w - canvas.width) / canvas.width < 0.25 && Math.abs(h - canvas.height) / canvas.height < 0.25) {
      canvas.width = w; canvas.height = h; return;
    }
    canvas.width = w; canvas.height = h;
    free();
    const s = res(cfg.SIM), d = res(cfg.DYE);
    vel = dbl(s.w, s.h); heat = dbl(d.w, d.h);
    div = fbo(s.w, s.h); curlT = fbo(s.w, s.h); pres = dbl(s.w, s.h);
  }
  resize();
  /* change grid size, solver iterations and pixel ratio on the fly (adaptive quality) */
  this.setQuality = function (nq) {
    if (!self.ok || !nq) return;
    cfg.SIM = nq.sim; cfg.DYE = nq.dye; cfg.PRESSURE_ITER = nq.iter; cfg.DPR = nq.dpr;
    free(); vel = heat = pres = div = curlT = null; canvas.width = 1;   // forces resize() to reallocate
    resize();
    self.prime(20);
  };
  this.destroy = function () {
    self.ok = false; free();
    const lose = gl.getExtension("WEBGL_lose_context");
    if (lose) lose.loseContext();
  };

  function use(pr) { gl.useProgram(pr.p); return pr.u; }

  function splat(x, y, dx, dy, amount, radius) {
    let u = use(prog.splat);
    gl.uniform1i(u.uTarget, vel.read.attach(0));
    gl.uniform1f(u.aspect, canvas.width / canvas.height);
    gl.uniform2f(u.point, x, y);
    gl.uniform3f(u.color, dx, dy, 0);
    gl.uniform1f(u.radius, (radius || cfg.SPLAT_R));
    gl.uniform2f(u.texel, vel.tx, vel.ty);
    blit(vel.write); vel.swap();
    if (amount > 0) {
      gl.uniform1i(u.uTarget, heat.read.attach(0));
      gl.uniform3f(u.color, amount, 0, 0);
      blit(heat.write); heat.swap();
    }
  }
  this.splat = function (x, y, dx, dy, amount, radius) {
    if (!self.ok) return;
    splat(x, y, dx, dy, amount, radius);
    if (amount > 0) userHeat = Math.min(4, userHeat + amount * ((radius || cfg.SPLAT_R) / cfg.SPLAT_R) * 0.12);
  };

  function step(dt) {
    let u;
    gl.disable(gl.BLEND);
    u = use(prog.curl); gl.uniform2f(u.texel, vel.tx, vel.ty);
    gl.uniform1i(u.uVelocity, vel.read.attach(0)); blit(curlT);

    u = use(prog.force); gl.uniform2f(u.texel, vel.tx, vel.ty);
    gl.uniform1i(u.uVelocity, vel.read.attach(0)); gl.uniform1i(u.uCurl, curlT.attach(1));
    gl.uniform1i(u.uHeat, heat.read.attach(2));
    gl.uniform1f(u.curl, cfg.CURL); gl.uniform1f(u.dt, dt); gl.uniform1f(u.buoy, cfg.BUOY);
    blit(vel.write); vel.swap();

    u = use(prog.divergence); gl.uniform2f(u.texel, vel.tx, vel.ty);
    gl.uniform1i(u.uVelocity, vel.read.attach(0)); blit(div);

    u = use(prog.clear); gl.uniform2f(u.texel, vel.tx, vel.ty);
    gl.uniform1i(u.uTex, pres.read.attach(0)); gl.uniform1f(u.value, 0.8);
    blit(pres.write); pres.swap();

    u = use(prog.pressure); gl.uniform2f(u.texel, vel.tx, vel.ty);
    gl.uniform1i(u.uDivergence, div.attach(0));
    for (let i = 0; i < cfg.PRESSURE_ITER; i++) {
      gl.uniform1i(u.uPressure, pres.read.attach(1)); blit(pres.write); pres.swap();
    }

    u = use(prog.gradient); gl.uniform2f(u.texel, vel.tx, vel.ty);
    gl.uniform1i(u.uPressure, pres.read.attach(0)); gl.uniform1i(u.uVelocity, vel.read.attach(1));
    blit(vel.write); vel.swap();

    u = use(prog.advect); gl.uniform2f(u.texel, vel.tx, vel.ty);
    gl.uniform1i(u.uVelocity, vel.read.attach(0)); gl.uniform1i(u.uSource, vel.read.attach(0));
    gl.uniform1f(u.dt, dt); gl.uniform1f(u.dissipation, cfg.VEL_DISS);
    blit(vel.write); vel.swap();

    gl.uniform1i(u.uVelocity, vel.read.attach(0)); gl.uniform1i(u.uSource, heat.read.attach(1));
    gl.uniform1f(u.dissipation, cfg.HEAT_DISS);
    blit(heat.write); heat.swap();
  }

  let time = 0;
  function render() {
    const u = use(prog.display);
    gl.uniform2f(u.texel, 1 / canvas.width, 1 / canvas.height);
    gl.uniform2f(u.dyeTexel, heat.tx, heat.ty);
    gl.uniform2f(u.res, canvas.width, canvas.height);
    gl.uniform1i(u.uHeat, heat.read.attach(0));
    gl.uniform1f(u.dim, self.dim);
    gl.uniform1f(u.cool, Math.max(0, Math.min(1, self.cool)));
    gl.uniform1f(u.time, time);
    blit(null);
  }

  /* ambient heat source: ONE slow "hot plate" low in the frame, so the
     field breathes even when nobody touches it (and on phones) */
  const emitters = [
    { x: 0.5, ph: 0.0, sp: 0.1 }
  ];
  let emitClock = 0;
  this.ambient = 1;
  function ambient(dt) {
    emitClock += dt;
    if (emitClock < 0.05) return;
    emitClock = 0;
    for (const e of emitters) {
      const x = e.x + Math.sin(time * e.sp + e.ph) * 0.12;
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.6 + e.ph * 1.7);
      splat(x, 0.03, Math.sin(time * 0.8 + e.ph) * 90, 160 + 120 * pulse, (0.3 + 0.8 * pulse * pulse) * self.ambient * (mobile ? 0.55 : 1), 0.0006);
    }
  }

  let last = performance.now();
  this.tick = function (now) {
    if (!self.ok) return;
    let dt = Math.min((now - last) / 1000, 0.033); last = now;
    if (self.paused) return;
    time += dt;
    userHeat *= Math.exp(-cfg.HEAT_DISS * 1.6 * dt);
    self.energy = Math.min(1, (1 - Math.exp(-userHeat)) * 0.75 + 0.25 * self.ambient * 0.6);
    resize();
    ambient(dt);
    step(dt);
    render();
  };
  this.renderOnce = function () { if (self.ok) { resize(); render(); } };
  this.prime = function (n) { for (let i = 0; i < n; i++) { time += 0.016; ambient(0.016); step(0.016); } render(); };
  this.ok = true;
}

window.HeatField = HeatField;
})();
