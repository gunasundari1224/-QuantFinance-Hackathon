from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.data.fetcher import load_asset_data
from app.quant.regime import detect_market_regimes

router = APIRouter(prefix="/regime", tags=["Market Regime"])

class RegimeRequest(BaseModel):
    symbol: str = Field(..., example="BTC-USD")
    start_date: str | None = None
    end_date: str | None = None
    trend_window: int = 50
    vol_window: int = 20

@router.post("/detect")
def detect_regimes(req: RegimeRequest):
    """Detects daily market regimes (Bull Market, Bear Market, High Volatility, Low Volatility)."""
    try:
        df = load_asset_data(req.symbol, start_date=req.start_date, end_date=req.end_date)
        if df.empty:
            raise HTTPException(status_code=404, detail="No price data available")
            
        df_regime = detect_market_regimes(df, trend_window=req.trend_window, vol_window=req.vol_window)
        
        counts = df_regime["Regime"].value_counts().to_dict()
        total = len(df_regime)
        breakdown = {regime: round((count / total) * 100.0, 2) for regime, count in counts.items()}
        
        result_series = [
            {
                "date": row["Date"],
                "close": row["Close"],
                "regime": row["Regime"],
                "color": row["RegimeColor"],
                "rolling_volatility": row["RollingVol"]
            }
            for _, row in df_regime.iterrows()
        ]
        
        return {
            "symbol": req.symbol,
            "total_bars": total,
            "regime_breakdown_pct": breakdown,
            "regime_series": result_series
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
