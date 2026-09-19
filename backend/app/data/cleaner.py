import pandas as pd

def align_and_clean_series(df_dict: dict[str, pd.DataFrame], start_date: str = None, end_date: str = None) -> dict[str, pd.DataFrame]:
    """
    Aligns multiple price DataFrames across a unified daily calendar date range.
    Handles market closures (crypto 24/7 vs stocks 5d/wk) via outer joins and forward fill.
    """
    if not df_dict:
        return {}

    # Extract all unique dates across datasets
    all_dates = set()
    for symbol, df in df_dict.items():
        if "Date" in df.columns:
            df["Date"] = pd.to_datetime(df["Date"])
            df.set_index("Date", inplace=True)
        all_dates.update(df.index)

    sorted_dates = pd.DatetimeIndex(sorted(all_dates))

    aligned_dict = {}
    for symbol, df in df_dict.items():
        # Reindex to full date range and forward-fill missing values (e.g. weekend stock prices stay constant)
        reindexed = df.reindex(sorted_dates)
        reindexed[["Open", "High", "Low", "Close"]] = reindexed[["Open", "High", "Low", "Close"]].ffill().bfill()
        if "Volume" in reindexed.columns:
            reindexed["Volume"] = reindexed["Volume"].fillna(0)
            
        reindexed = reindexed.reset_index().rename(columns={"index": "Date"})
        reindexed["Date"] = reindexed["Date"].dt.strftime("%Y-%m-%d")

        # Filter by start_date and end_date if provided
        if start_date:
            reindexed = reindexed[reindexed["Date"] >= start_date]
        if end_date:
            reindexed = reindexed[reindexed["Date"] <= end_date]

        aligned_dict[symbol] = reindexed.reset_index(drop=True)

    return aligned_dict
