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

def test_ai_ask_empty_question():
    payload = {"question": "   ", "context": {}}
    response = client.post("/api/v1/ai/ask", json=payload)
    assert response.status_code == 400

def test_ai_ask_missing_key_graceful_response():
    payload = {
        "question": "Summarize this backtest",
        "context": {"selected_asset": "BTC-USD", "portfolio_summary": {"sharpe_ratio": 1.25}}
    }
    response = client.post("/api/v1/ai/ask", json=payload)
    assert response.status_code in [200, 500, 503]
    json_resp = response.json()
    # Ensure secrets are never exposed in error response
    resp_str = str(json_resp).lower()
    assert "api_key" not in resp_str or "not configured" in resp_str

