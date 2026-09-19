import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.data.fetcher import load_asset_data
from app.data.cleaner import align_and_clean_series
from app.quant.returns import calculate_daily_returns
from app.quant.correlation import calculate_correlation_matrix, calculate_rolling_correlation

router = APIRouter(prefix="/correlation", tags=["Correlation"])

class CorrelationRequest(BaseModel):
    symbols: list[str] = Field(default=["GC=F", "BTC-USD", "NVDA", "SPY"])
    start_date: str | None = None
    end_date: str | None = None
    rolling_window: int = 30

@router.post("/matrix")
def get_correlation_data(req: CorrelationRequest):
    """Computes correlation matrix and rolling correlation time-series across selected assets."""
    try:
        raw_df_dict = {sym: load_asset_data(sym, start_date=req.start_date, end_date=req.end_date) for sym in req.symbols}
        aligned_dict = align_and_clean_series(raw_df_dict, start_date=req.start_date, end_date=req.end_date)
        
        returns_dict = {}
        for sym, df in aligned_dict.items():
            returns_dict[sym] = calculate_daily_returns(df["Close"])
            
        returns_df = pd.DataFrame(returns_dict)
        matrix_data = calculate_correlation_matrix(returns_df)
        
        # Rolling correlation between key pairs (e.g. BTC vs Gold, NVDA vs SPY)
        rolling_series = []
        if len(req.symbols) >= 2 and not aligned_dict[req.symbols[0]].empty:
            dates = aligned_dict[req.symbols[0]]["Date"].tolist()
            r_btc_gold = calculate_rolling_correlation(returns_df[req.symbols[0]], returns_df[req.symbols[1]], window=req.rolling_window)
            r_btc_gold_list = r_btc_gold.round(4).tolist()
            
            for i in range(len(dates)):
                rolling_series.append({
                    "date": dates[i],
                    "pair": f"{req.symbols[0]} vs {req.symbols[1]}",
                    "correlation": r_btc_gold_list[i]
                })
                
        return {
            "matrix": matrix_data,
            "rolling_correlation": rolling_series
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
