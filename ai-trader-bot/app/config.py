import os
from dotenv import load_dotenv
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "")
DB_NAME = os.getenv("DB_NAME", "ai_trader")

MODE = os.getenv("MODE", "paper")      # paper | live (live requires ccxt keys + exchange code)
LOOP_SECONDS = int(os.getenv("LOOP_SECONDS", "20"))

COINGECKO_BASE = os.getenv("COINGECKO_BASE", "https://api.coingecko.com/api/v3")

# Portfolio sizing defaults (you can override per-user later)
WALLET_USDT_DEFAULT = float(os.getenv("WALLET_USDT_DEFAULT", "1000.0"))  # paper wallet if none stored
POSITION_STEP_PCT = 0.33 / 100.0   # 1/3% per buy/sell step

# Laddering thresholds
BUY_LADDER_STEP = 0.05   # buy additional 0.33% every -5%
SELL_LADDER_STEP = 0.05  # sell additional 0.33% every +5%

# Risk controls
CRASH_EXIT_DROP = 0.30   # close if -30% from last fill

# Liquidity/vol proxies
# M) token 'volatility >= 10% of MarketCap before trading token' is ambiguous.
# We'll require: (24h_volume / market_cap) >= 0.10  (>=10% of mcap traded in 24h)
LIQUIDITY_RATIO_MIN = 0.10
