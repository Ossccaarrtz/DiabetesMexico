import os
import pandas as pd

df = pd.read_csv("../raw_data/deteccion_diabetes.csv")

# Eliminar fn_ano, es redundante
df = df.drop(columns=["fn_ano"])

# Limpiar 'ano' (ej. "2004*" -> "2004") y convertir a int
df["ano"] = (
    df["ano"]
    .astype(str)
    .str.replace(r"[^0-9]", "", regex=True)
    .astype(int)
)

df["detecciones"] = pd.to_numeric(df["detecciones"], errors="raise").astype(int)
df["fecha"] = pd.to_datetime(df["fecha"], format="%Y-%m-%d", errors="raise")

# Asegurar consistencia año-fecha
df["ano"] = df["fecha"].dt.year

# Validaciones básicas
print("Nulos por columna:")
print(df.isna().sum())

print("\nDuplicados (delegacion, ano):")
print(df.duplicated(subset=["delegacion", "ano"]).sum())

print("\nRango de años por delegacion:")
print(df.groupby("delegacion")["ano"].agg(["min", "max", "count"]).head())

print("\nValores negativos en detecciones:")
print((df["detecciones"] < 0).sum())

print("\nFecha consistente con ano:")
print((df["fecha"].dt.year != df["ano"]).sum())

# Guardar archivo limpio
output_dir = "../cleaned_data"
os.makedirs(output_dir, exist_ok=True)

output_path = os.path.join(output_dir, "deteccion_diabetes_clean.csv")
df.to_csv(output_path, index=False, encoding="utf-8")

