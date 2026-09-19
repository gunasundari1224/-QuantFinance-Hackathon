from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.data.fetcher import load_asset_data
from app.backtester.engine import run_backtest

router = APIRouter(prefix="/backtest", tags=["Backtesting"])

class BacktestRequest(BaseModel):
    symbol: str = Field(default="BTC-USD")
    strategy: str = Field(default="SMA_CROSSOVER", description="SMA_CROSSOVER, EMA_TREND, MOMENTUM, MEAN_REVERSION")
    parameters: dict = Field(default={"fast_period": 10, "slow_period": 50})
    initial_capital: float = Field(default=100000.0, ge=100.0)
    transaction_cost_pct: float = Field(default=0.001, ge=0.0, le=0.05, description="0.001 = 0.1% fee")
    slippage_pct: float = Field(default=0.0005, ge=0.0, le=0.05, description="0.0005 = 0.05% slippage")
    start_date: str | None = None
    end_date: str | None = None

@router.post("/run")
def execute_backtest(req: BacktestRequest):
    """Executes a strict lookahead-free strategy backtest against Buy & Hold benchmark."""
    try:
        df = load_asset_data(req.symbol, start_date=req.start_date, end_date=req.end_date)
        if df.empty or len(df) < 10:
            raise HTTPException(status_code=400, detail="Insufficient price data to perform backtest")
            
        results = run_backtest(
            df=df,
            strategy_name=req.strategy,
            parameters=req.parameters,
            initial_capital=req.initial_capital,
            transaction_cost_pct=req.transaction_cost_pct,
            slippage_pct=req.slippage_pct
        )
        results["symbol"] = req.symbol
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
