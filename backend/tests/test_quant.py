import pytest
import pandas as pd
import numpy as np
from app.quant.indicators import calculate_sma, calculate_ema
from app.quant.returns import calculate_daily_returns, calculate_cumulative_returns
from app.quant.metrics import calculate_annualized_volatility, calculate_sharpe_ratio, calculate_max_drawdown

def test_sma_ema_calculation():
    series = pd.Series([10.0, 12.0, 14.0, 16.0, 18.0, 20.0])
    sma = calculate_sma(series, period=3)
    ema = calculate_ema(series, period=3)
    
    assert round(sma.iloc[2], 2) == 12.0  # (10+12+14)/3
    assert round(sma.iloc[-1], 2) == 18.0 # (16+18+20)/3
    assert len(ema) == len(series)

def test_returns_and_volatility():
    prices = pd.Series([100.0, 105.0, 102.0, 108.0, 110.0])
    daily_ret = calculate_daily_returns(prices)
    cum_ret = calculate_cumulative_returns(daily_ret)
    
    assert round(daily_ret.iloc[1], 4) == 0.05
    assert round(cum_ret.iloc[-1], 2) == 0.10 # (110-100)/100 = 10%
    
    vol = calculate_annualized_volatility(daily_ret)
    assert vol > 0.0

def test_sharpe_and_max_drawdown():
    prices = pd.Series([100.0, 120.0, 90.0, 110.0, 130.0])
    daily_ret = calculate_daily_returns(prices)
    
    sharpe = calculate_sharpe_ratio(daily_ret)
    mdd, dd_series = calculate_max_drawdown(prices)
    
    # Max drawdown is from 120 peak to 90 trough = (120-90)/120 = 25%
    assert round(mdd, 2) == 0.25
    assert dd_series.min() == -0.25
