import pandas as pd
import numpy as np
from app.backtester.strategies import (
    generate_sma_crossover_signals,
    generate_ema_trend_signals,
    generate_momentum_signals,
    generate_mean_reversion_signals
)
from app.quant.metrics import (
    calculate_annualized_volatility,
    calculate_sharpe_ratio,
    calculate_max_drawdown,
    calculate_cagr
)

def run_backtest(
    df: pd.DataFrame,
    strategy_name: str = "SMA_CROSSOVER",
    parameters: dict = None,
    initial_capital: float = 100000.0,
    transaction_cost_pct: float = 0.001, # 0.1% commission fee
    slippage_pct: float = 0.0005          # 0.05% slippage
) -> dict:
    """
    Executes a strict, lookahead-free backtest.
    Signals at bar t execute on bar t+1.
    Deducts transaction costs + slippage on trade execution.
    Compares against a re-based Buy & Hold benchmark starting at initial_capital.
    """
    if parameters is None:
        parameters = {}

    df_bt = df.copy().reset_index(drop=True)
    
    # 1. Generate Signal Vector (Signals at bar t)
    if strategy_name == "SMA_CROSSOVER":
        fast = int(parameters.get("fast_period", 10))
        slow = int(parameters.get("slow_period", 50))
        signals = generate_sma_crossover_signals(df_bt, fast_period=fast, slow_period=slow)
    elif strategy_name == "EMA_TREND":
        fast = int(parameters.get("fast_period", 12))
        slow = int(parameters.get("slow_period", 26))
        signals = generate_ema_trend_signals(df_bt, fast_period=fast, slow_period=slow)
    elif strategy_name == "MOMENTUM":
        lookback = int(parameters.get("momentum_period", 20))
        thresh = float(parameters.get("threshold_pct", 0.02))
        signals = generate_momentum_signals(df_bt, lookback_period=lookback, threshold_pct=thresh)
    elif strategy_name == "MEAN_REVERSION":
        lookback = int(parameters.get("lookback_period", 20))
        z_thresh = float(parameters.get("z_threshold", 1.5))
        signals = generate_mean_reversion_signals(df_bt, lookback_period=lookback, z_threshold=z_thresh)
    else:
        raise ValueError(f"Unknown strategy: {strategy_name}")

    df_bt["RawSignal"] = signals
    
    # 2. Prevent Lookahead Bias: Position at day t+1 is Signal from day t
    df_bt["Position"] = df_bt["RawSignal"].shift(1).fillna(0.0)

    # 3. Simulate Trade Executions & Portfolio Dynamics
    total_cost_factor = transaction_cost_pct + slippage_pct
    
    dates = df_bt["Date"].tolist()
    closes = df_bt["Close"].tolist()
    positions = df_bt["Position"].tolist()

    cash = initial_capital
    holdings = 0.0 # Number of asset units owned
    
    strategy_equity = []
    trade_log = []
    
    current_trade = None
    
    for i in range(len(df_bt)):
        date = dates[i]
        price = closes[i]
        pos = positions[i]
        prev_pos = positions[i-1] if i > 0 else 0.0
        
        # Check for position change (Entry or Exit)
        if pos != prev_pos:
            # 1. Closing existing position
            if prev_pos > 0 and pos == 0:
                exit_price = price * (1.0 - slippage_pct)
                gross_proceeds = holdings * exit_price
                fee = gross_proceeds * transaction_cost_pct
                cash = gross_proceeds - fee
                
                if current_trade:
                    current_trade["exit_date"] = date
                    current_trade["exit_price"] = round(exit_price, 4)
                    current_trade["fee"] += round(fee, 2)
                    pnl = cash - current_trade["capital_before"]
                    pnl_pct = (pnl / current_trade["capital_before"]) * 100.0
                    current_trade["pnl"] = round(pnl, 2)
                    current_trade["pnl_pct"] = round(pnl_pct, 2)
                    trade_log.append(current_trade)
                    current_trade = None

                holdings = 0.0

            # 2. Opening new position
            elif prev_pos == 0 and pos > 0:
                entry_price = price * (1.0 + slippage_pct)
                fee = cash * transaction_cost_pct
                investable = cash - fee
                holdings = investable / entry_price
                capital_before = cash
                cash = 0.0

                current_trade = {
                    "trade_id": len(trade_log) + 1,
                    "entry_date": date,
                    "exit_date": None,
                    "type": "BUY",
                    "entry_price": round(entry_price, 4),
                    "exit_price": None,
                    "fee": round(fee, 2),
                    "capital_before": round(capital_before, 2),
                    "pnl": 0.0,
                    "pnl_pct": 0.0
                }

        # Calculate daily total portfolio value
        daily_val = cash + (holdings * price)
        strategy_equity.append(daily_val)

    # Close any open trade at end of backtest period for complete reporting
    if current_trade is not None:
        last_price = closes[-1] * (1.0 - slippage_pct)
        gross_proceeds = holdings * last_price
        fee = gross_proceeds * transaction_cost_pct
        final_cash = gross_proceeds - fee
        current_trade["exit_date"] = None
        current_trade["exit_price"] = round(last_price, 4)
        current_trade["fee"] += round(fee, 2)
        pnl = final_cash - current_trade["capital_before"]
        pnl_pct = (pnl / current_trade["capital_before"]) * 100.0
        current_trade["pnl"] = round(pnl, 2)
        current_trade["pnl_pct"] = round(pnl_pct, 2)
        trade_log.append(current_trade)

    df_bt["StrategyEquity"] = strategy_equity
    
    # 4. Buy & Hold Benchmark Equity (Normalized to initial_capital)
    initial_asset_price = closes[0] if closes[0] > 0 else 1.0
    benchmark_equity = [initial_capital * (p / initial_asset_price) for p in closes]
    df_bt["BenchmarkEquity"] = benchmark_equity

    # 5. Calculate Metrics
    strat_returns = pd.Series(strategy_equity).pct_change().fillna(0.0)
    bench_returns = pd.Series(benchmark_equity).pct_change().fillna(0.0)

    strat_total_ret = ((strategy_equity[-1] - initial_capital) / initial_capital) * 100.0
    bench_total_ret = ((benchmark_equity[-1] - initial_capital) / initial_capital) * 100.0

    strat_vol = calculate_annualized_volatility(strat_returns)
    bench_vol = calculate_annualized_volatility(bench_returns)

    strat_sharpe = calculate_sharpe_ratio(strat_returns)
    bench_sharpe = calculate_sharpe_ratio(bench_returns)

    strat_mdd, strat_dd_series = calculate_max_drawdown(pd.Series(strategy_equity))
    bench_mdd, bench_dd_series = calculate_max_drawdown(pd.Series(benchmark_equity))

    strat_cagr = calculate_cagr(pd.Series(strategy_equity)) * 100.0
    bench_cagr = calculate_cagr(pd.Series(benchmark_equity)) * 100.0

    # Trade statistics
    winning_trades = [t for t in trade_log if t["pnl"] > 0]
    total_trades = len(trade_log)
    win_rate = (len(winning_trades) / total_trades * 100.0) if total_trades > 0 else 0.0

    gross_profit = sum(t["pnl"] for t in winning_trades)
    gross_loss = abs(sum(t["pnl"] for t in trade_log if t["pnl"] < 0))
    profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else (gross_profit if gross_profit > 0 else 0.0)

    summary = {
        "strategy_name": strategy_name,
        "initial_capital": initial_capital,
        "final_capital": round(strategy_equity[-1], 2),
        "total_return_pct": round(strat_total_ret, 2),
        "benchmark_return_pct": round(bench_total_ret, 2),
        "cagr_pct": round(strat_cagr, 2),
        "benchmark_cagr_pct": round(bench_cagr, 2),
        "annualized_volatility": round(strat_vol, 4),
        "benchmark_volatility": round(bench_vol, 4),
        "sharpe_ratio": round(strat_sharpe, 2),
        "benchmark_sharpe_ratio": round(bench_sharpe, 2),
        "max_drawdown_pct": round(strat_mdd * 100.0, 2),
        "benchmark_max_drawdown_pct": round(bench_mdd * 100.0, 2),
        "total_trades": total_trades,
        "win_rate_pct": round(win_rate, 2),
        "profit_factor": round(profit_factor, 2)
    }

    # Chart data formatted for JSON response
    equity_curve = [
        {
            "date": dates[i],
            "strategy": round(strategy_equity[i], 2),
            "benchmark": round(benchmark_equity[i], 2),
            "drawdown": round(float(strat_dd_series.iloc[i]) * 100.0, 2)
        }
        for i in range(len(df_bt))
    ]

    execution_signals = [
        {
            "date": dates[i],
            "price": closes[i],
            "signal": "BUY" if positions[i] > 0 and (i == 0 or positions[i-1] == 0)
                      else ("SELL" if positions[i] == 0 and positions[i-1] > 0 else "HOLD")
        }
        for i in range(len(df_bt))
    ]
    # Filter only execution buy/sell points for clear chart markers
    trade_markers = [s for s in execution_signals if s["signal"] in ["BUY", "SELL"]]

    return {
        "summary": summary,
        "equity_curve": equity_curve,
        "trade_markers": trade_markers,
        "trades": trade_log
    }
