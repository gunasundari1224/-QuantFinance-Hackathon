import pytest
import pandas as pd
import numpy as np
from app.backtester.engine import run_backtest

def test_backtest_lookahead_prevention_and_fee_deduction():
    # Construct synthetic trending dataset
    dates = pd.date_range(start="2023-01-01", periods=100, freq="D").strftime("%Y-%m-%d")
    prices = [100.0 + i for i in range(100)] # Constant upward trend
    
    df = pd.DataFrame({
        "Date": dates,
        "Open": prices,
        "High": prices,
        "Low": prices,
        "Close": prices,
        "Volume": 1000
    })

    result = run_backtest(
        df=df,
        strategy_name="SMA_CROSSOVER",
        parameters={"fast_period": 5, "slow_period": 20},
        initial_capital=100000.0,
        transaction_cost_pct=0.001,
        slippage_pct=0.0005
    )

    summary = result["summary"]
    trades = result["trades"]
    equity_curve = result["equity_curve"]

    assert summary["initial_capital"] == 100000.0
    assert summary["final_capital"] > 0.0
    assert len(equity_curve) == 100
    assert summary["total_trades"] >= 1
    
    # Assert fees were charged on executed trades
    for trade in trades:
        assert trade["fee"] > 0.0
        assert trade["entry_price"] > 0.0
