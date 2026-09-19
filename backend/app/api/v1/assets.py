from fastapi import APIRouter, HTTPException, Query
from app.data.fetcher import get_available_assets, load_asset_data

router = APIRouter(prefix="/assets", tags=["Assets"])

@router.get("/list")
def list_assets():
    """Returns available asset catalog."""
    return {"assets": get_available_assets()}

@router.get("/history")
def get_asset_history(
    symbol: str = Query(..., description="Asset symbol, e.g. BTC-USD, NVDA, GC=F, SPY"),
    start_date: str = Query(None, description="YYYY-MM-DD"),
    end_date: str = Query(None, description="YYYY-MM-DD")
):
    """Returns historical OHLCV data for an asset."""
    try:
        df = load_asset_data(symbol, start_date=start_date, end_date=end_date)
        return {
            "symbol": symbol,
            "count": len(df),
            "data": df.to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
