import "./App.css";
import MexicoMap from "./components/MexicoMap";

function App() {
  const scrollToMap = () => {
    const mapElement = document.getElementById("mapa");
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="app">
      <Hero onExploreClick={scrollToMap} />
      <section id="mapa">
        <MexicoMap />
      </section>
    </div>
  );
}

function Hero({ onExploreClick }) {
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
          <button onClick={onExploreClick}>Explorar el mapa</button>
        </div>
      </div>
    </section>
  );
}

export default App;
