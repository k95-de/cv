/* ============================================================================
   THE FLOW · procedural soundscape (Web Audio, no audio files)
   - hum: two soft detuned tones + filtered brown noise ("fluid in a pipe").
     Pitch follows scroll speed, filter brightness follows the heat field.
   - tick(): tiny filtered click for hovers
   - toggle(): two-note pip for switches
   - swell(): warm chord that rises when the hero is revealed / sound turned on
   - cool(x): end-of-page cool-down (pitch and brightness sink)
   Exposes window.FlowSound. Off by default. Never starts without a user gesture.
   ========================================================================== */
(function () {
"use strict";

const AC = window.AudioContext || window.webkitAudioContext;

function FlowSound(opts) {
  opts = opts || {};
  const calm = !!opts.reduced;   // reduced motion: static hum, no motion-driven modulation
  let ctx = null, master = null, comp = null, humBus = null, fxBus = null;
  let o1, o2, o3, noiseF, humF, lfo, lfoG;
  let on = false, lastTick = 0;
  const api = { get on() { return on; }, get ready() { return !!ctx && ctx.state === "running"; } };

  function build() {
    if (ctx || !AC) return !!ctx;
    try { ctx = new AC(); } catch (e) { ctx = null; return false; }
    master = ctx.createGain(); master.gain.value = 0;
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
    master.connect(comp); comp.connect(ctx.destination);

    humBus = ctx.createGain(); humBus.gain.value = 0.9; humBus.connect(master);
    fxBus = ctx.createGain(); fxBus.gain.value = 1; fxBus.connect(master);

    /* brown-ish noise loop */
    const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
    /* crossfade the loop seam */
    for (let i = 0; i < 2000; i++) { const k = i / 2000; d[len - 2000 + i] = d[len - 2000 + i] * (1 - k) + d[i] * k; }
    const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
    noiseF = ctx.createBiquadFilter(); noiseF.type = "lowpass"; noiseF.frequency.value = 340; noiseF.Q.value = 0.9;
    const noiseG = ctx.createGain(); noiseG.gain.value = 0.22;
    noise.connect(noiseF); noiseF.connect(noiseG); noiseG.connect(humBus);

    /* tonal hum */
    humF = ctx.createBiquadFilter(); humF.type = "lowpass"; humF.frequency.value = 420; humF.Q.value = 2.2;
    const humG = ctx.createGain(); humG.gain.value = 0.11;
    o1 = ctx.createOscillator(); o1.type = "sine"; o1.frequency.value = 55;
    o2 = ctx.createOscillator(); o2.type = "triangle"; o2.frequency.value = 82.6;
    o3 = ctx.createOscillator(); o3.type = "sine"; o3.frequency.value = 110.4;
    const g3 = ctx.createGain(); g3.gain.value = 0.35;
    o1.connect(humF); o2.connect(humF); o3.connect(g3); g3.connect(humF);
    humF.connect(humG); humG.connect(humBus);

    /* slow breathing on the filter */
    lfo = ctx.createOscillator(); lfo.frequency.value = 0.09;
    lfoG = ctx.createGain(); lfoG.gain.value = calm ? 0 : 60;
    lfo.connect(lfoG); lfoG.connect(humF.frequency);

    const t = ctx.currentTime;
    [noise, o1, o2, o3, lfo].forEach(n => n.start(t));
    return true;
  }

  function resume() {
    if (!ctx) return Promise.resolve();
    if (ctx.state === "suspended") return ctx.resume().catch(() => {});
    return Promise.resolve();
  }

  api.enable = function (withSwell) {
    if (!build()) return false;
    on = true;
    resume().then(() => {
      if (!on) return;
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0.9, t + 0.8);
      if (withSwell !== false) api.swell();
    });
    return true;
  };
  api.disable = function () {
    on = false;
    if (!ctx) return;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 0.35);
  };
  /* tab hidden: suspend the whole graph */
  api.sleep = function (yes) {
    if (!ctx) return;
    if (yes) ctx.suspend().catch(() => {});
    else if (on) ctx.resume().catch(() => {});
  };

  /* per-frame control. speed: |scroll velocity| (px/frame), heat 0..1, cool 0..1 */
  let sSm = 0, hSm = 0;
  api.update = function (speed, heat, cool) {
    if (!on || !ctx || ctx.state !== "running") return;
    const t = ctx.currentTime;
    if (calm) { speed = 0; }
    sSm += (Math.min(1, speed / 60) - sSm) * 0.08;
    hSm += (heat - hSm) * 0.05;
    const c = cool || 0;
    const pitch = (1 + sSm * 0.32 + hSm * 0.12) * (1 - c * 0.25);
    o1.frequency.setTargetAtTime(55 * pitch, t, 0.12);
    o2.frequency.setTargetAtTime(82.6 * pitch, t, 0.12);
    o3.frequency.setTargetAtTime(110.4 * pitch, t, 0.12);
    humF.frequency.setTargetAtTime((300 + hSm * 900 + sSm * 700) * (1 - c * 0.6), t, 0.15);
    noiseF.frequency.setTargetAtTime((260 + sSm * 1500 + hSm * 500) * (1 - c * 0.55), t, 0.12);
    humBus.gain.setTargetAtTime((0.8 + sSm * 0.5) * (1 - c * 0.55), t, 0.2);
  };

  /* hover tick: a 6 ms filtered click */
  api.tick = function (bright) {
    if (!on || !ctx || ctx.state !== "running") return;
    const now = performance.now();
    if (now - lastTick < 45) return;
    lastTick = now;
    const t = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.012), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
    const s = ctx.createBufferSource(); s.buffer = b;
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = bright ? 4200 : 2600; f.Q.value = 6;
    const g = ctx.createGain(); g.gain.value = 0.32;
    s.connect(f); f.connect(g); g.connect(fxBus); s.start(t);
  };

  /* toggle: two soft notes, up = on, down = off */
  api.toggle = function (up) {
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime;
    const notes = up ? [660, 990] : [880, 587];
    notes.forEach((fr, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = fr;
      const st = t + i * 0.07;
      g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(0.06, st + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 0.22);
      o.connect(g); g.connect(ctx.destination); o.start(st); o.stop(st + 0.25);
    });
  };

  /* station pass: a soft pitched blip */
  api.blip = function (f) {
    if (!on || !ctx || ctx.state !== "running") return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(f || 880, t); o.frequency.exponentialRampToValueAtTime((f || 880) / 2, t + 0.14);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.04, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g); g.connect(fxBus); o.start(t); o.stop(t + 0.2);
  };

  /* warm swell: detuned saw chord through a rising lowpass */
  api.swell = function () {
    if (!on || !ctx) return;
    const t = ctx.currentTime + 0.02, dur = calm ? 2.2 : 3.4;
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.Q.value = 1.4;
    f.frequency.setValueAtTime(180, t); f.frequency.exponentialRampToValueAtTime(calm ? 900 : 1800, t + dur * 0.55);
    f.frequency.exponentialRampToValueAtTime(260, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(calm ? 0.05 : 0.085, t + dur * 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    f.connect(g); g.connect(fxBus);
    [110, 164.8, 220, 277.2, 329.6].forEach((fr, i) => {
      [-6, 6].forEach(det => {
        const o = ctx.createOscillator(); o.type = i < 2 ? "sawtooth" : "triangle";
        o.frequency.value = fr; o.detune.value = det;
        o.connect(f); o.start(t); o.stop(t + dur + 0.05);
      });
    });
  };

  return api;
}

window.FlowSound = FlowSound;
})();
