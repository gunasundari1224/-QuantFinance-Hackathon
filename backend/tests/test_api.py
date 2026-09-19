from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_assets_list():
    response = client.get("/api/v1/assets/list")
    assert response.status_code == 200
    assets = response.json()["assets"]
    symbols = [a["symbol"] for a in assets]
    assert "BTC-USD" in symbols
    assert "NVDA" in symbols
    assert "GC=F" in symbols

def test_indicators_calculate():
    payload = {
        "symbol": "BTC-USD",
        "sma_periods": [10, 30],
        "ema_periods": [12, 26]
    }
    response = client.post("/api/v1/indicators/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) > 0
    assert "SMA_10" in data[0]

def test_metrics_analyze():
    payload = {"symbol": "NVDA"}
    response = client.post("/api/v1/metrics/analyze", json=payload)
    assert response.status_code == 200
    metrics = response.json()["metrics"]
    assert "sharpe_ratio" in metrics
    assert "max_drawdown_pct" in metrics

def test_correlation_matrix():
    payload = {"symbols": ["GC=F", "BTC-USD", "NVDA"]}
    response = client.post("/api/v1/correlation/matrix", json=payload)
    assert response.status_code == 200
    matrix = response.json()["matrix"]
    assert len(matrix["symbols"]) == 3

def test_backtest_run():
    payload = {
        "symbol": "BTC-USD",
        "strategy": "SMA_CROSSOVER",
        "parameters": {"fast_period": 10, "slow_period": 50},
        "initial_capital": 100000.0,
        "transaction_cost_pct": 0.001
    }
    response = client.post("/api/v1/backtest/run", json=payload)
    assert response.status_code == 200
    result = response.json()
    assert "summary" in result
    assert "equity_curve" in result
