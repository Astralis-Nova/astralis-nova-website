(() => {
  'use strict';

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let bootAttempts = 0;

  const boot = () => {
    const oldButton = document.querySelector('.rp-sound-toggle');
    if (!oldButton) {
      bootAttempts += 1;
      if (bootAttempts < 120) window.setTimeout(boot, 50);
      return;
    }

    const button = oldButton.cloneNode(true);
    oldButton.replaceWith(button);
    button.disabled = false;
    button.textContent = 'Sound Off';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', 'Turn ambient sound on');

    let context = null;
    let masterGain = null;
    let compressor = null;
    let enabled = false;
    let disposed = false;
    let thunderTimer = 0;
    let birdTimer = 0;
    const birdVoices = new Set();
    const liveNodes = [];

    const remember = (...nodes) => {
      liveNodes.push(...nodes);
      return nodes;
    };

    const createNoiseBuffer = (seconds = 5, pink = false) => {
      const length = Math.floor(context.sampleRate * seconds);
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      let b3 = 0;
      let b4 = 0;
      let b5 = 0;
      let b6 = 0;

      for (let i = 0; i < length; i += 1) {
        const white = Math.random() * 2 - 1;
        if (!pink) {
          data[i] = white * 0.72;
          continue;
        }
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
      return buffer;
    };

    const addNoiseLayer = ({ buffer, highpass, lowpass, bandpass, q = 0.7, gainValue, rate = 1 }) => {
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = buffer;
      source.loop = true;
      source.playbackRate.value = rate;
      gain.gain.value = gainValue;

      let input = source;
      const filters = [];
      if (highpass) {
        const filter = context.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = highpass;
        filter.Q.value = q;
        input.connect(filter);
        input = filter;
        filters.push(filter);
      }
      if (bandpass) {
        const filter = context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = bandpass;
        filter.Q.value = q;
        input.connect(filter);
        input = filter;
        filters.push(filter);
      }
      if (lowpass) {
        const filter = context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = lowpass;
        filter.Q.value = q;
        input.connect(filter);
        input = filter;
        filters.push(filter);
      }
      input.connect(gain).connect(compressor);
      source.start();
      remember(source, gain, ...filters);
      return { source, gain, filters };
    };

    const playConfirmation = () => {
      if (!context || context.state !== 'running') return;
      const now = context.currentTime;
      const tone = context.createOscillator();
      const gain = context.createGain();
      tone.type = 'sine';
      tone.frequency.setValueAtTime(523.25, now);
      tone.frequency.exponentialRampToValueAtTime(659.25, now + 0.24);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.075, now + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.46);
      tone.connect(gain).connect(compressor);
      tone.start(now);
      tone.stop(now + 0.5);
    };

    const playThunder = () => {
      if (!enabled || !context || context.state !== 'running') return;
      const now = context.currentTime;
      const thunderGain = context.createGain();
      const thunderFilter = context.createBiquadFilter();
      thunderFilter.type = 'lowpass';
      thunderFilter.frequency.value = 720;
      thunderFilter.Q.value = 0.45;
      thunderGain.gain.setValueAtTime(0.0001, now);
      thunderGain.gain.exponentialRampToValueAtTime(0.11, now + 0.32);
      thunderGain.gain.exponentialRampToValueAtTime(0.035, now + 1.6);
      thunderGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
      thunderFilter.connect(thunderGain).connect(compressor);

      const rumble = context.createOscillator();
      const body = context.createOscillator();
      rumble.type = 'triangle';
      body.type = 'sine';
      rumble.frequency.setValueAtTime(92 + Math.random() * 12, now);
      rumble.frequency.exponentialRampToValueAtTime(58, now + 3.7);
      body.frequency.setValueAtTime(145 + Math.random() * 22, now);
      body.frequency.exponentialRampToValueAtTime(82, now + 2.9);
      rumble.connect(thunderFilter);
      body.connect(thunderFilter);
      rumble.start(now);
      body.start(now);
      rumble.stop(now + 3.9);
      body.stop(now + 3.2);

      const crackBuffer = createNoiseBuffer(1.2, false);
      const crack = context.createBufferSource();
      const crackFilter = context.createBiquadFilter();
      const crackGain = context.createGain();
      crack.buffer = crackBuffer;
      crackFilter.type = 'bandpass';
      crackFilter.frequency.value = 520;
      crackFilter.Q.value = 0.35;
      crackGain.gain.setValueAtTime(0.0001, now);
      crackGain.gain.exponentialRampToValueAtTime(0.045, now + 0.08);
      crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
      crack.connect(crackFilter).connect(crackGain).connect(compressor);
      crack.start(now);
    };

    const scheduleThunder = () => {
      window.clearTimeout(thunderTimer);
      if (!enabled || disposed) return;
      thunderTimer = window.setTimeout(() => {
        playThunder();
        scheduleThunder();
      }, 14000 + Math.random() * 18000);
    };

    // Short, varied calls follow the flock's screen position and distance.
    // Synthesized chirps/coos and a low raven croak need no external audio fetch.
    const playBirdCall = () => {
      if (!enabled || disposed || document.hidden || context?.state !== 'running') return;
      const birds = [...document.querySelectorAll('.rp-bird')];
      const scene = document.querySelector('.rainbow-wrap')?.getBoundingClientRect();
      if (!birds.length || !scene || scene.bottom < 0 || scene.top > window.innerHeight) return;
      const bird = birds[Math.floor(Math.random() * birds.length)];
      const closeness = Math.min(1, Number(bird.dataset.flightSize || .2) / 1.7);
      const pan = Number(bird.dataset.flightPan || 0);
      const now = context.currentTime + .03;
      const gain = context.createGain();
      const panner = context.createStereoPanner?.();
      gain.gain.value = .065 + closeness * .13;
      if (panner) {
        panner.pan.value = pan;
        gain.connect(panner).connect(compressor);
      } else gain.connect(compressor);
      const nodes = [gain, ...(panner ? [panner] : [])];
      const sources = [];
      let remaining = 0;
      let cleaned = false;
      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        sources.forEach(source => { try { source.stop(); } catch (_) {} });
        nodes.forEach(node => { try { node.disconnect(); } catch (_) {} });
        birdVoices.delete(cleanup);
      };
      const track = (source) => {
        remaining += 1;
        sources.push(source);
        nodes.push(source);
        source.onended = () => { if (--remaining === 0) cleanup(); };
      };
      const note = (start, duration, frequencies, level = 1, type = 'sine') => {
        const tone = context.createOscillator();
        const envelope = context.createGain();
        tone.type = type;
        tone.frequency.setValueAtTime(frequencies[0], start);
        tone.frequency.exponentialRampToValueAtTime(frequencies[1], start + duration * .42);
        tone.frequency.exponentialRampToValueAtTime(frequencies[2], start + duration);
        envelope.gain.setValueAtTime(.0001, start);
        envelope.gain.exponentialRampToValueAtTime(level, start + .025);
        envelope.gain.exponentialRampToValueAtTime(.0001, start + duration);
        tone.connect(envelope).connect(gain);
        nodes.push(envelope);
        track(tone);
        tone.start(start);
        tone.stop(start + duration + .03);
      };
      birdVoices.add(cleanup);
      if (bird.dataset.flight === '0') {
        note(now, .3, [260, 180, 135], .55, 'triangle');
        note(now + .38, .26, [225, 165, 120], .38, 'triangle');
        const rasp = context.createBufferSource();
        const filter = context.createBiquadFilter();
        const envelope = context.createGain();
        rasp.buffer = createNoiseBuffer(.35);
        filter.type = 'bandpass';
        filter.frequency.value = 490;
        filter.Q.value = 1.8;
        envelope.gain.setValueAtTime(.0001, now);
        envelope.gain.exponentialRampToValueAtTime(.38, now + .04);
        envelope.gain.exponentialRampToValueAtTime(.0001, now + .31);
        rasp.connect(filter).connect(envelope).connect(gain);
        nodes.push(filter, envelope);
        track(rasp);
        rasp.start(now);
        rasp.stop(now + .35);
      } else {
        const variation = .9 + Math.random() * .18;
        note(now, .48, [550, 490, 420].map(f => f * variation), .6);
        note(now + .57, .6, [510, 465, 390].map(f => f * variation), .48);
        // A little bright twitter between the softer coos adds life to the sky.
        note(now + 1.3, .16, [1750, 2800, 2150].map(f => f * variation), .24);
        note(now + 1.55, .12, [2150, 3200, 2450].map(f => f * variation), .18);
      }
      button.dataset.birdCalls = String(Number(button.dataset.birdCalls || 0) + 1);
    };

    const stopBirdCalls = () => {
      window.clearTimeout(birdTimer);
      birdTimer = 0;
      [...birdVoices].forEach(stop => stop());
    };

    const scheduleBirds = (first = false) => {
      window.clearTimeout(birdTimer);
      if (!enabled || disposed || document.hidden) return;
      birdTimer = window.setTimeout(() => {
        playBirdCall();
        scheduleBirds();
      }, first ? 1200 : 2800 + Math.random() * 3900);
    };

    const buildAmbience = () => {
      if (context || !AudioContextClass) return;
      context = new AudioContextClass({ latencyHint: 'interactive' });
      masterGain = context.createGain();
      compressor = context.createDynamicsCompressor();
      masterGain.gain.value = 0;
      compressor.threshold.value = -24;
      compressor.knee.value = 24;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.02;
      compressor.release.value = 0.42;
      compressor.connect(masterGain).connect(context.destination);
      remember(masterGain, compressor);

      const white = createNoiseBuffer(5, false);
      const pink = createNoiseBuffer(6, true);
      const rain = addNoiseLayer({ buffer: white, highpass: 1050, lowpass: 7200, q: 0.45, gainValue: 0.12, rate: 1.08 });
      const wind = addNoiseLayer({ buffer: pink, bandpass: 720, lowpass: 2400, q: 0.42, gainValue: 0.065, rate: 0.42 });
      const water = addNoiseLayer({ buffer: pink, bandpass: 390, lowpass: 1350, q: 0.58, gainValue: 0.095, rate: 0.68 });

      const rainLfo = context.createOscillator();
      const rainLfoGain = context.createGain();
      rainLfo.frequency.value = 0.17;
      rainLfoGain.gain.value = 0.018;
      rainLfo.connect(rainLfoGain).connect(rain.gain.gain);
      rainLfo.start();

      const windLfo = context.createOscillator();
      const windLfoGain = context.createGain();
      windLfo.frequency.value = 0.065;
      windLfoGain.gain.value = 0.025;
      windLfo.connect(windLfoGain).connect(wind.gain.gain);
      windLfo.start();

      const surfLfo = context.createOscillator();
      const surfLfoGain = context.createGain();
      surfLfo.frequency.value = 0.11;
      surfLfoGain.gain.value = 0.034;
      surfLfo.connect(surfLfoGain).connect(water.gain.gain);
      surfLfo.start();
      remember(rainLfo, rainLfoGain, windLfo, windLfoGain, surfLfo, surfLfoGain);
    };

    const updateButton = (isOn) => {
      button.textContent = isOn ? 'Sound On' : 'Sound Off';
      button.setAttribute('aria-pressed', String(isOn));
      button.setAttribute('aria-label', isOn ? 'Turn ambient sound off' : 'Turn ambient sound on');
    };

    const setSound = async (turnOn) => {
      if (disposed) return;
      if (!AudioContextClass) {
        button.disabled = true;
        button.textContent = 'Sound Unavailable';
        button.setAttribute('aria-label', 'Ambient sound is unavailable in this browser');
        return;
      }
      buildAmbience();
      if (!context || !masterGain) return;
      enabled = turnOn;
      updateButton(turnOn);

      if (turnOn && context.state !== 'running') await context.resume();
      if (disposed || enabled !== turnOn) return;
      const now = context.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, 0.0001), now);
      masterGain.gain.exponentialRampToValueAtTime(turnOn ? 0.34 : 0.0001, now + (turnOn ? 0.8 : 0.65));

      if (turnOn) {
        playConfirmation();
        scheduleThunder();
        scheduleBirds(true);
      } else {
        stopBirdCalls();
        window.clearTimeout(thunderTimer);
        window.setTimeout(() => {
          if (!enabled && context?.state === 'running') context.suspend().catch(() => {});
        }, 760);
      }
    };

    button.addEventListener('click', () => {
      setSound(!enabled).catch(() => {
        enabled = false;
        stopBirdCalls();
        updateButton(false);
      });
    });

    const syncVisibility = () => {
      if (document.hidden) {
        stopBirdCalls();
        window.clearTimeout(thunderTimer);
        context?.suspend().catch(() => {});
      } else if (enabled && !disposed) {
        context?.resume().then(() => {
          if (!enabled || disposed || document.hidden) return;
          scheduleThunder();
          scheduleBirds(true);
        }).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', syncVisibility);

    window.addEventListener('pagehide', () => {
      disposed = true;
      enabled = false;
      stopBirdCalls();
      document.removeEventListener('visibilitychange', syncVisibility);
      window.clearTimeout(thunderTimer);
      liveNodes.forEach((node) => {
        try { node.stop?.(); } catch (_) {}
        try { node.disconnect?.(); } catch (_) {}
      });
      context?.close().catch(() => {});
    }, { once: true });
  };

  boot();
})();
