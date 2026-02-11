import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MexicoMap.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function MexicoMap() {
    const [geoData, setGeoData] = useState(null);
    const [statesData, setStatesData] = useState({});
    const [selectedYear, setSelectedYear] = useState(2024);
    const [availableYears, setAvailableYears] = useState([]);
    const [selectedState, setSelectedState] = useState(null);
    const [totalDetecciones, setTotalDetecciones] = useState(0);
    const [hoveredState, setHoveredState] = useState(null);

    // Cargar años disponibles
    useEffect(() => {
        fetch(`${API_BASE_URL}/years`)
            .then((res) => res.json())
            .then((years) => {
                setAvailableYears(years);
                if (years.length > 0) {
                    setSelectedYear(years[years.length - 1]);
                }
            })
            .catch((err) => console.error("Error loading years:", err));
    }, []);

    // Cargar GeoJSON de México
    useEffect(() => {
        fetch("/geo/mexico_states.geojson")
            .then((res) => res.json())
            .then((data) => setGeoData(data))
            .catch((err) => console.error("Error loading GeoJSON:", err));
    }, []);

    // Cargar datos de detecciones por estado
    useEffect(() => {
        if (!selectedYear) return;

        fetch(`${API_BASE_URL}/states/summary?year=${selectedYear}`)
            .then((res) => res.json())
            .then((data) => {
                const dataMap = {};
                let total = 0;
                data.forEach((item) => {
                    // Trim whitespace from state names
                    const stateName = item.estado.trim();
                    dataMap[stateName] = item.detecciones;
                    total += item.detecciones;
                });
                setStatesData(dataMap);
                setTotalDetecciones(total);
            })
            .catch((err) => console.error("Error loading state data:", err));
    }, [selectedYear]);

    // Función para obtener color según número de detecciones (escala de rojos)
    const getColor = (detecciones) => {
        if (!detecciones) return "#FEE5D9"; // Rojo muy claro para sin datos
        return detecciones > 1000000
            ? "#67000D" // Rojo muy oscuro
            : detecciones > 750000
                ? "#A50F15" // Rojo oscuro
                : detecciones > 500000
                    ? "#CB181D" // Rojo medio-oscuro
                    : detecciones > 300000
                        ? "#EF3B2C" // Rojo medio
                        : detecciones > 150000
                            ? "#FB6A4A" // Rojo medio-claro
                            : detecciones > 50000
                                ? "#FC9272" // Rojo claro
                                : "#FCBBA1"; // Rojo muy claro
    };

    // Normalizar nombres de estados del GeoJSON para coincidir con la API
    const normalizeStateName = (geoJsonName) => {
        const map = {
            "Distrito Federal": "Ciudad de México",
            "México": "Estado de México",
            "Coahuila de Zaragoza": "Coahuila",
            "Michoacán de Ocampo": "Michoacán",
            "Veracruz de Ignacio de la Llave": "Veracruz"
        };
        return map[geoJsonName] || geoJsonName;
    };

    // Estilo de cada estado
    const style = (feature) => {
        const rawStateName = feature.properties.name || feature.properties.estado;
        const stateName = normalizeStateName(rawStateName);
        const detecciones = statesData[stateName] || 0;
        const isHovered = normalizeStateName(hoveredState) === stateName;
        const isSelected = selectedState === stateName;

        return {
            fillColor: getColor(detecciones),
            weight: isSelected ? 3 : isHovered ? 2 : 1,
            opacity: 1,
            color: isSelected ? "#000" : isHovered ? "#666" : "#fff",
            fillOpacity: isSelected ? 0.9 : isHovered ? 0.8 : 0.7,
        };
    };

    // Eventos de cada estado
    const onEachFeature = (feature, layer) => {
        const rawStateName = feature.properties.name || feature.properties.estado;
        const stateName = normalizeStateName(rawStateName);

        layer.on({
            mouseover: () => setHoveredState(rawStateName), // Keep raw name for matching in style
            mouseout: () => setHoveredState(null),
            click: () => setSelectedState(stateName), // Use normalized name for data display
        });
    };

    return (
        <div className="mexico-map-wrapper">
            <div className="map-header">
                <h2>Mapa de Detecciones de Diabetes en México</h2>
                <div className="year-selector">
                    <label htmlFor="year-select">Año:</label>
                    <select
                        id="year-select"
                        value={selectedYear || ""}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                        {availableYears.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="map-content">
                <div className="map-container">
                    {geoData && (
                        <MapContainer
                            center={[23.6345, -102.5528]}
                            zoom={5}
                            style={{ height: "600px", width: "100%" }}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <GeoJSON
                                data={geoData}
                                style={style}
                                onEachFeature={onEachFeature}
                                key={`${selectedYear}-${selectedState}-${hoveredState}`}
                            />
                        </MapContainer>
                    )}
                </div>

                <div className="map-sidebar">
                    {/* Leyenda */}
                    <div className="legend">
                        <h3>Leyenda</h3>
                        <div className="legend-item">
                            <span
                                className="legend-color"
                                style={{ backgroundColor: "#67000D" }}
                            ></span>
                            <span>&gt; 1,000,000</span>
                        </div>
                        <div className="legend-item">
                            <span
                                className="legend-color"
                                style={{ backgroundColor: "#A50F15" }}
                            ></span>
                            <span>750,000 - 1,000,000</span>
                        </div>
                        <div className="legend-item">
                            <span
                                className="legend-color"
                                style={{ backgroundColor: "#CB181D" }}
                            ></span>
                            <span>500,000 - 750,000</span>
                        </div>
                        <div className="legend-item">
                            <span
                                className="legend-color"
                                style={{ backgroundColor: "#EF3B2C" }}
                            ></span>
                            <span>300,000 - 500,000</span>
                        </div>
                        <div className="legend-item">
                            <span
                                className="legend-color"
                                style={{ backgroundColor: "#FB6A4A" }}
                            ></span>
                            <span>150,000 - 300,000</span>
                        </div>
                        <div className="legend-item">
                            <span
                                className="legend-color"
                                style={{ backgroundColor: "#FC9272" }}
                            ></span>
                            <span>50,000 - 150,000</span>
                        </div>
                        <div className="legend-item">
                            <span
                                className="legend-color"
                                style={{ backgroundColor: "#FCBBA1" }}
                            ></span>
                            <span>&lt; 50,000</span>
                        </div>
                        <div className="legend-item">
                            <span
                                className="legend-color"
                                style={{ backgroundColor: "#FEE5D9", border: "1px solid #ddd" }}
                            ></span>
                            <span>Sin datos</span>
                        </div>
                    </div>

                    {/* Panel de información del estado */}
                    {/* Panel de información (Estado seleccionado o Total Nacional) */}
                    <div className="state-info">
                        {selectedState ? (
                            <>
                                <h3>{selectedState}</h3>
                                <div className="detecciones-count">
                                    <span>Detecciones en {selectedYear}</span>
                                    <strong>
                                        {statesData[selectedState]
                                            ? statesData[selectedState].toLocaleString("es-MX")
                                            : "Sin datos"}
                                    </strong>
                                </div>
                                <p className="info-hint">
                                    Haz clic fuera del mapa para ver el total nacional
                                </p>
                            </>
                        ) : (
                            <>
                                <h3>Total Nacional</h3>
                                <div className="detecciones-count">
                                    <span>Detecciones en {selectedYear}</span>
                                    <strong>
                                        {totalDetecciones.toLocaleString("es-MX")}
                                    </strong>
                                </div>
                                <p className="info-hint">
                                    Suma de todos los estados de México
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MexicoMap;
