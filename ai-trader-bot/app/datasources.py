import requests
from .config import COINGECKO_BASE

def cg_markets(per_page=250):
    url = f"{COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page={per_page}&price_change_percentage=24h"
    r = requests.get(url, timeout=20)
    r.raise_for_status()
    return r.json()

def cg_global():
    url = f"{COINGECKO_BASE}/global"
    r = requests.get(url, timeout=20)
    r.raise_for_status()
    return r.json()
