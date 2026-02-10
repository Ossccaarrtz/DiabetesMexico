import "./App.css";

function App() {
  return (
    <div className="app">
      <Hero />
    </div>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>
          Análisis y Predicción de <span>Diabetes en México</span>
        </h1>

        <p>
          La diabetes es uno de los principales problemas de salud pública en
          México. A través del análisis de datos históricos del IMSS, este
          proyecto busca identificar patrones, comparar regiones y generar
          modelos predictivos que apoyen la toma de decisiones y la prevención.
        </p>

        <div className="hero-actions">
          <button>Explorar el mapa</button>
        </div>
      </div>
    </section>
  );
}

export default App;
