(() => {
  const status = document.getElementById("weather-status");
  const temperature = document.getElementById("weather-temperature");
  const recommendation = document.getElementById("weather-recommendation");

  async function loadWeather() {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=32.4567&longitude=-114.7719&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=America%2FHermosillo";
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Open-Meteo respondió ${response.status}`);
      const data = await response.json();
      const degrees = Number(data.current?.temperature_2m);
      if (!Number.isFinite(degrees)) throw new Error("La respuesta no contiene una temperatura válida.");
      temperature.textContent = `${Math.round(degrees)}°C`;
      recommendation.textContent = `Hoy recomendamos: ${degrees >= 24 ? "una bebida fría 🧊" : "una bebida caliente ☕"}`;
      status.textContent = "Clima actual en San Luis Río Colorado";
    } catch (error) {
      status.textContent = "No pudimos consultar el clima en este momento.";
      temperature.textContent = "--°";
      recommendation.textContent = "Te recomendamos elegir tu bebida favorita de todos modos.";
      console.error("Error al consultar Open-Meteo:", error);
    }
  }
  loadWeather();
})();
