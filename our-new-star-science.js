(() => {
  "use strict";
  const controls = document.getElementById("matterControls");
  if (controls) {
    const choices = [...controls.querySelectorAll("[data-matter-target]")];
    function showMatter(key) {
      choices.forEach(button => {
        const selected = button.dataset.matterTarget === key;
        button.setAttribute("aria-pressed", String(selected));
        document.getElementById(`matter-${button.dataset.matterTarget}`).hidden = !selected;
      });
    }
    choices.forEach(button => button.addEventListener("click", () => showMatter(button.dataset.matterTarget)));
    showMatter("matter");
    controls.hidden = false;
  }

  const lab = document.getElementById("spectrumLab");
  if (!lab) return;
  const range = document.getElementById("spectrumRange");
  const presets = [...lab.querySelectorAll("[data-spectrum-band]")];
  // Exact SI constants; energy is reported in electronvolts.
  const C = 299792458, H = 6.62607015e-34, EV = 1.602176634e-19;
  function bandIndex(wavelength) {
    if (wavelength >= 1) return 0;
    if (wavelength >= 1e-3) return 1;
    if (wavelength > 700e-9) return 2;
    if (wavelength >= 400e-9) return 3;
    if (wavelength >= 1e-8) return 4;
    if (wavelength >= 1e-11) return 5;
    return 6;
  }
  function wavelengthText(value) {
    for (const [unit, size] of [["km",1e3],["m",1],["mm",1e-3],["µm",1e-6],["nm",1e-9],["pm",1e-12]]) {
      if (value >= size * 0.999999) return `${Number((value / size).toPrecision(4))} ${unit}`;
    }
    return `${Number((value / 1e-12).toPrecision(4))} pm`;
  }
  function scientific(value, unit) {
    const [number, power] = value.toExponential(3).split("e");
    return `${Number(number)} × 10^${Number(power)} ${unit}`;
  }
  function showWavelength(wavelength) {
    const chosen = presets[bandIndex(wavelength)];
    const frequency = C / wavelength;
    const waveText = wavelengthText(wavelength);
    document.getElementById("spectrumBand").textContent = chosen.dataset.label;
    document.getElementById("spectrumExample").textContent = chosen.dataset.example;
    document.getElementById("spectrumWavelength").textContent = waveText;
    document.getElementById("spectrumFrequency").textContent = scientific(frequency, "Hz");
    document.getElementById("spectrumEnergy").textContent = scientific(H * frequency / EV, "eV");
    document.getElementById("spectrumReading").style.setProperty("--band-color", chosen.style.getPropertyValue("--band-color"));
    document.getElementById("spectrumPointer").style.left = `${(4 - Math.log10(wavelength)) / 18 * 100}%`;
    range.setAttribute("aria-valuetext", `${chosen.dataset.label}, wavelength ${waveText}`);
    presets.forEach(button => button.setAttribute("aria-pressed", String(button === chosen)));
  }
  presets.forEach(button => button.addEventListener("click", () => {
    const wavelength = Number(button.dataset.wavelength);
    range.value = String((4 - Math.log10(wavelength)) * 10);
    showWavelength(wavelength);
  }));
  range.addEventListener("input", () => showWavelength(10 ** (4 - Number(range.value) / 10)));
  showWavelength(550e-9);
  document.getElementById("spectrumReference").open = false;
  lab.hidden = false;
})();
