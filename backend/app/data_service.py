from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
DATA_PATH = BASE_DIR / "cleaned_data" / "deteccion_diabetes_clean.csv"

_df_cache = None

def get_df() -> pd.DataFrame:
    global _df_cache
    if _df_cache is None:
        _df_cache = pd.read_csv(DATA_PATH)
    return _df_cache
