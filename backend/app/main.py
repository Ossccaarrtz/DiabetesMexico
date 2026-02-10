from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .data_service import get_df

app = FastAPI(title="Diabetes Mexico API")

# CORS para que React pueda consumir la API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/delegaciones")
def delegaciones():
    df = get_df()
    return sorted(df["delegacion"].unique().tolist())

@app.get("/years")
def years():
    df = get_df()
    return sorted(df["ano"].unique().tolist())


@app.get("/summary")
def summary(year: int):
    """
    Devuelve detecciones por delegación para un año.
    Esto se usa para colorear el mapa (choropleth).
    """
    df = get_df()
    dff = df[df["ano"] == year][["delegacion", "detecciones"]]

    # lo convertimos a formato simple para frontend
    return dff.to_dict(orient="records")

@app.get("/timeseries")
def timeseries(delegacion: str):
    """
    Devuelve la serie histórica de una delegación 
    para mostrar la gráfica cuando el usuario da click en el mapa.
    """
    df = get_df()
    dff = df[df["delegacion"] == delegacion].sort_values("ano")[["ano", "detecciones"]]
    return dff.to_dict(orient="records")

STATE_MAP = {
    "México Oriente": "Estado de México",
    "México Poniente": "Estado de México",
    "D.F. Norte": "Ciudad de México",
    "D.F. Sur": "Ciudad de México",
    "Veracruz Norte": "Veracruz",
    "Veracruz Sur": "Veracruz",
    "Coahuila ": "Coahuila",  # trailing space in data
}

@app.get("/states/summary")
def states_summary(year: int):
    df = get_df().copy()

    # limpiar espacios en blanco y crear columna estado
    df["delegacion"] = df["delegacion"].str.strip()
    df["estado"] = df["delegacion"].replace(STATE_MAP)

    # agrupar por estado 
    dff = df[df["ano"] == year].groupby("estado", as_index=False)["detecciones"].sum()

    return dff.to_dict(orient="records")