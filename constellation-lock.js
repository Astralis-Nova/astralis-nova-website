(function installAstralisConstellationLock(global) {
  "use strict";

  const PATTERN = Object.freeze(["apex", "apex", "apex", "left", "left", "bottom"]);

  function create(options = {}) {
    const timeoutMs = Number(options.timeoutMs) > 0 ? Number(options.timeoutMs) : 8000;
    const setTimer = options.setTimer || global.setTimeout.bind(global);
    const clearTimer = options.clearTimer || global.clearTimeout.bind(global);
    const onProgress = typeof options.onProgress === "function" ? options.onProgress : () => {};
    const onReset = typeof options.onReset === "function" ? options.onReset : () => {};
    const onComplete = typeof options.onComplete === "function" ? options.onComplete : () => {};
    let step = 0;
    let timer = null;

    const clearSequenceTimer = () => {
      if (timer !== null) clearTimer(timer);
      timer = null;
    };

    const reset = (notify = true) => {
      clearSequenceTimer();
      step = 0;
      if (notify) onReset();
    };

    const beginTimer = () => {
      clearSequenceTimer();
      timer = setTimer(() => reset(), timeoutMs);
    };

    const tap = node => {
      if (!PATTERN.includes(node)) return "ignored";

      if (node !== PATTERN[step]) {
        reset();
        if (node === PATTERN[0]) {
          step = 1;
          beginTimer();
          onProgress(step, PATTERN.length);
          return "progress";
        }
        return "reset";
      }

      if (step === 0) beginTimer();
      step += 1;
      onProgress(step, PATTERN.length);

      if (step === PATTERN.length) {
        reset(false);
        onComplete();
        return "complete";
      }
      return "progress";
    };

    return {
      tap,
      reset,
      getProgress: () => step,
      pattern: PATTERN
    };
  }

  global.AstralisConstellationLock = Object.freeze({ create, PATTERN });
})(typeof globalThis !== "undefined" ? globalThis : window);
