import time
from datetime import datetime
from .config import LOOP_SECONDS
from .datasources import cg_markets, cg_global
from .rules import passes_all_rules
from .storage import approved_users
from .engine import open_position, ladder_buy_if_drop, ladder_sell_if_rise, check_crash_exit

def run_once():
    mkts = cg_markets(per_page=250)
    # Optional: you can check market-wide risk here via cg_global() if desired
    for u in approved_users():
        uid = u["uid"]
        # Filter coins by A→M rules
        picks = []
        for coin in mkts:
            ok, reason = passes_all_rules(coin)
            if ok:
                picks.append(coin)
        # Open a position in top few candidates
        for coin in picks[:3]:
            trade = open_position(uid, coin, max_steps=9)
            # After opening, check immediate ladders once (usually no-op in same tick)
            if trade:
                price = float(coin["current_price"])
                ladder_buy_if_drop(trade, price, uid)
                ladder_sell_if_rise(trade, price, uid)
                check_crash_exit(trade, price, uid)

def loop_forever():
    while True:
        try:
            run_once()
        except Exception as e:
            print("Worker error:", e)
        time.sleep(LOOP_SECONDS)
