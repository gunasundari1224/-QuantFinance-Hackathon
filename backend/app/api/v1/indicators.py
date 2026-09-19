from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.data.fetcher import load_asset_data
from app.quant.indicators import calculate_sma, calculate_ema
from app.quant.returns import calculate_daily_returns, calculate_cumulative_returns, calculate_rolling_returns

router = APIRouter(prefix="/indicators", tags=["Indicators"])

class IndicatorRequest(BaseModel):
    symbol: str = Field(..., example="NVDA")
    start_date: str | None = None
    end_date: str | None = None
    sma_periods: list[int] = Field(default=[20, 50])
    ema_periods: list[int] = Field(default=[12, 26])
    rolling_returns_window: int = 30

@router.post("/calculate")
def calculate_indicators(req: IndicatorRequest):
    """Calculates SMA, EMA, Daily Returns, Cumulative Returns, and Rolling Returns."""
    try:
        df = load_asset_data(req.symbol, start_date=req.start_date, end_date=req.end_date)
        if df.empty:
            raise HTTPException(status_code=404, detail="No price data available for given parameters")
            
        close = df["Close"]
        
        # Indicators
        smas = {f"SMA_{p}": calculate_sma(close, p).round(4).tolist() for p in req.sma_periods}
        emas = {f"EMA_{p}": calculate_ema(close, p).round(4).tolist() for p in req.ema_periods}
        
        # Returns
        daily_ret = calculate_daily_returns(close)
        cum_ret = calculate_cumulative_returns(daily_ret)
        roll_ret = calculate_rolling_returns(close, window=req.rolling_returns_window)
        
        time_series = []
        dates = df["Date"].tolist()
        closes = close.tolist()
        d_ret = daily_ret.round(6).tolist()
        c_ret = (cum_ret * 100.0).round(4).tolist()
        r_ret = (roll_ret * 100.0).round(4).tolist()
        
        for i in range(len(df)):
            item = {
                "date": dates[i],
                "close": closes[i],
                "daily_return": d_ret[i],
                "cumulative_return_pct": c_ret[i],
                "rolling_return_pct": r_ret[i]
            }
            for key, val in smas.items():
                item[key] = val[i]
            for key, val in emas.items():
                item[key] = val[i]
            time_series.append(item)
            
        return {
            "symbol": req.symbol,
            "count": len(time_series),
            "data": time_series
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
