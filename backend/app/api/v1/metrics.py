from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.data.fetcher import load_asset_data
from app.quant.returns import calculate_daily_returns, calculate_cumulative_returns
from app.quant.metrics import (
    calculate_annualized_volatility,
    calculate_sharpe_ratio,
    calculate_max_drawdown,
    calculate_cagr
)

router = APIRouter(prefix="/metrics", tags=["Metrics"])

class MetricsRequest(BaseModel):
    symbol: str = Field(..., example="BTC-USD")
    start_date: str | None = None
    end_date: str | None = None
    risk_free_rate: float = 0.04

@router.post("/analyze")
def analyze_metrics(req: MetricsRequest):
    """Calculates Annualized Volatility, Sharpe Ratio, Max Drawdown, CAGR, and Cumulative Return."""
    try:
        df = load_asset_data(req.symbol, start_date=req.start_date, end_date=req.end_date)
        if df.empty:
            raise HTTPException(status_code=404, detail="No price data found")
            
        close = df["Close"]
        daily_ret = calculate_daily_returns(close)
        cum_ret = calculate_cumulative_returns(daily_ret).iloc[-1] * 100.0
        
        vol = calculate_annualized_volatility(daily_ret)
        sharpe = calculate_sharpe_ratio(daily_ret, risk_free_rate=req.risk_free_rate)
        mdd, _ = calculate_max_drawdown(close)
        cagr = calculate_cagr(close) * 100.0
        
        return {
            "symbol": req.symbol,
            "period_days": len(df),
            "start_date": df["Date"].iloc[0],
            "end_date": df["Date"].iloc[-1],
            "metrics": {
                "cumulative_return_pct": round(float(cum_ret), 2),
                "cagr_pct": round(cagr, 2),
                "annualized_volatility": round(vol, 4),
                "volatility_pct": round(vol * 100.0, 2),
                "sharpe_ratio": round(sharpe, 2),
                "max_drawdown_pct": round(mdd * 100.0, 2)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
