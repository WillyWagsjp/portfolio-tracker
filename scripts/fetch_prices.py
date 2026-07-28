import json
import os 
from datetime import datetime, timezone
import yfinance as yf

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(BASE_DIR, "config.json")
SAMPLE_CONFIG_PATH = os.path.join(BASE_DIR, "config.sample.json")
DATA_PATH = os.path.join(BASE_DIR, "data", "data.json")


def load_config():
    path = CONFIG_PATH if os.path.exists(CONFIG_PATH) else SAMPLE_CONFIG_PATH
    with open(path, "r") as f:
        return json.load(f)

def fetch_current_prices(tickers):
    prices = {}
    for ticker in tickers:
        stock = yf.Ticker(ticker)
        price = stock.fast_info["last_price"]
        prices[ticker] = round(price, 2)
    return prices

def build_snapshot(config, prices):
    holdings_detail = []
    total_value = 0.0
    total_cost = 0.0

    for h in config["holdings"]:
        ticker = h["ticker"]
        shares = h["shares"]
        cost_basis = h["cost_basis"]
        current_price = prices[ticker]

        value = round(current_price * shares, 2)
        cost = round(cost_basis * shares, 2)
        gain = round(value - cost, 2)
        gain_pct = round((gain / cost) * 100, 2) if cost else 0

        holdings_detail.append({
            "ticker": ticker,
            "shares": shares,
            "current_price": current_price,
            "cost_basis": cost_basis,
            "value": value,
            "gain": gain,
            "gain_pct": gain_pct,
        })

        total_value += value
        total_cost += cost

    total_gain = round(total_value - total_cost, 2)
    total_gain_pct = round((total_gain / total_cost) * 100, 2) if total_cost else 0

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_value": round(total_value, 2),
        "total_cost": round(total_cost, 2),
        "total_gain": total_gain,
        "total_gain_pct": total_gain_pct,
        "holdings": holdings_detail,
    }

def load_existing_data():
    if os.path.exists(DATA_PATH):
        with open(DATA_PATH, "r") as f:
            return json.load(f)
    return {"history": []}

def save_data(data):
    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    with open(DATA_PATH, "w") as f:
        json.dump(data, f, indent=2)

def main():
    config = load_config()
    tickers = [h["ticker"] for h in config["holdings"]]

    print(f"Fetching prices for :{tickers}")
    prices = fetch_current_prices(tickers)
    print(f"Prices: {prices}")

    snapshot = build_snapshot(config, prices)
    data = load_existing_data()
    data["history"].append(snapshot)

    save_data(data)
    print(f"Saved Snapshot. Total history entries: {len(data['history'])}")

if __name__ == "__main__":
    main()


