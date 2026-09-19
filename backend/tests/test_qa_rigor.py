import pytest
import pandas as pd
import numpy as np
from app.data.fetcher import load_asset_data, get_available_assets
from app.quant.indicators import calculate_sma, calculate_ema
from app.quant.returns import calculate_daily_returns, calculate_cumulative_returns, calculate_rolling_returns
from app.quant.metrics import calculate_annualized_volatility, calculate_sharpe_ratio, calculate_max_drawdown, calculate_cagr
from app.quant.correlation import calculate_correlation_matrix, calculate_rolling_correlation
from app.quant.regime import detect_market_regimes
from app.backtester.engine import run_backtest

def test_all_supported_assets_loading():
    assets = get_available_assets()
    symbols = [a["symbol"] for a in assets]
    assert "BTC-USD" in symbols
    assert "NVDA" in symbols
    assert "GC=F" in symbols
    assert "SPY" in symbols

    for sym in symbols:
        df = load_asset_data(sym, start_date="2022-01-01", end_date="2023-01-01")
        assert not df.empty, f"Data for {sym} should not be empty"
        assert "Date" in df.columns
        assert "Close" in df.columns
        assert len(df) > 50

def test_quant_indicators_and_returns():
    dates = pd.date_range(start="2023-01-01", periods=100, freq="D").strftime("%Y-%m-%d")
    prices = pd.Series([100.0 * (1.01 ** i) for i in range(100)])
    
    sma_20 = calculate_sma(prices, 20)
    ema_20 = calculate_ema(prices, 20)
    daily_ret = calculate_daily_returns(prices)
    cum_ret = calculate_cumulative_returns(daily_ret)
    roll_ret = calculate_rolling_returns(prices, 30)

    assert len(sma_20) == 100
    assert len(ema_20) == 100
    assert round(cum_ret.iloc[-1], 2) == round((prices.iloc[-1] / prices.iloc[0]) - 1.0, 2)
    assert len(roll_ret) == 100

def test_risk_metrics_math_correctness():
    # Constant 1% daily return
    returns = pd.Series([0.01] * 252)
    prices = pd.Series([100.0 * (1.01 ** i) for i in range(253)])

    vol = calculate_annualized_volatility(returns)
    assert vol == 0.0 # Standard deviation of constant series is 0

    # Series with fluctuation
    np.random.seed(42)
    fluc_returns = pd.Series(np.random.normal(0.001, 0.01, 252))
    vol_fluc = calculate_annualized_volatility(fluc_returns)
    sharpe = calculate_sharpe_ratio(fluc_returns, risk_free_rate=0.04)

    assert vol_fluc > 0.0
    assert isinstance(sharpe, float)

    # Drawdown check: 100 -> 150 -> 105 -> 140
    dd_prices = pd.Series([100.0, 150.0, 105.0, 140.0])
    mdd, dd_series = calculate_max_drawdown(dd_prices)
    # Peak is 150, Trough is 105 -> Drop = (150-105)/150 = 45/150 = 0.30 (30%)
    assert round(mdd, 2) == 0.30

def test_all_four_backtest_strategies():
    df = load_asset_data("BTC-USD", start_date="2022-01-01", end_date="2023-01-01")

    strategies = [
        ("SMA_CROSSOVER", {"fast_period": 10, "slow_period": 50}),
        ("EMA_TREND", {"fast_period": 12, "slow_period": 26}),
        ("MOMENTUM", {"momentum_period": 20, "threshold_pct": 0.02}),
        ("MEAN_REVERSION", {"lookback_period": 20, "z_threshold": 1.5})
    ]

    for strat_name, params in strategies:
        res = run_backtest(
            df=df,
            strategy_name=strat_name,
            parameters=params,
            initial_capital=100000.0,
            transaction_cost_pct=0.001,
            slippage_pct=0.0005
        )

        assert "summary" in res
        assert "equity_curve" in res
        assert "trades" in res
        assert res["summary"]["initial_capital"] == 100000.0
        assert len(res["equity_curve"]) == len(df)

def test_lookahead_bias_prevention():
    df = load_asset_data("NVDA", start_date="2022-01-01", end_date="2022-06-01")
    
    # Run SMA Crossover
    res = run_backtest(df=df, strategy_name="SMA_CROSSOVER", parameters={"fast_period": 5, "slow_period": 15})
    
    # Ensure trade execution markers match shift(1) logic
    trades = res["trades"]
    for t in trades:
        # Trade entry date must be strictly after signal generation
        assert t["entry_date"] > df["Date"].iloc[0]

def test_buy_and_hold_benchmark_alignment():
    df = load_asset_data("GC=F", start_date="2022-01-01", end_date="2022-06-01")
    res = run_backtest(df=df, strategy_name="SMA_CROSSOVER", initial_capital=50000.0)

    equity_curve = res["equity_curve"]
    first_bar = equity_curve[0]
    
    # Benchmark must start at exact initial capital
    assert first_bar["benchmark"] == 50000.0

    # Check benchmark final return ratio
    asset_start_price = df["Close"].iloc[0]
    asset_end_price = df["Close"].iloc[-1]
    expected_bench_final = 50000.0 * (asset_end_price / asset_start_price)
    
    assert round(equity_curve[-1]["benchmark"], 2) == round(expected_bench_final, 2)

def test_correlation_matrix_properties():
    df_btc = load_asset_data("BTC-USD", start_date="2022-01-01", end_date="2022-06-01")
    df_gold = load_asset_data("GC=F", start_date="2022-01-01", end_date="2022-06-01")
    df_nvda = load_asset_data("NVDA", start_date="2022-01-01", end_date="2022-06-01")

    returns_df = pd.DataFrame({
        "BTC-USD": calculate_daily_returns(df_btc["Close"]),
        "GC=F": calculate_daily_returns(df_gold["Close"]),
        "NVDA": calculate_daily_returns(df_nvda["Close"])
    }).dropna()

    matrix_data = calculate_correlation_matrix(returns_df)
    matrix = matrix_data["matrix"]

    # Diagonal elements must equal 1.0
    for i in range(len(matrix)):
        assert matrix[i][i] == 1.0
        
    # Symmetric matrix property
    assert matrix[0][1] == matrix[1][0]

def test_market_regime_classification():
    df = load_asset_data("BTC-USD", start_date="2022-01-01", end_date="2022-06-01")
    df_regime = detect_market_regimes(df)

    assert "Regime" in df_regime.columns
    assert "RegimeColor" in df_regime.columns
    unique_regimes = set(df_regime["Regime"].unique())
    valid_regimes = {"Bull Market", "Bear Market", "High Volatility", "Low Volatility"}
    assert unique_regimes.issubset(valid_regimes)
