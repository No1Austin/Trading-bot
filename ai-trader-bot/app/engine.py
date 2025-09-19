from datetime import datetime
from typing import Dict, Any
from .storage import get_wallet_usdt, set_wallet_usdt, record_trade
from .portfolio import step_size_usdt, quote_to_base

from .config import BUY_LADDER_STEP, SELL_LADDER_STEP, CRASH_EXIT_DROP

def open_position(uid:str, coin:Dict[str,Any], max_steps:int=9):
    """
    Create an initial BUY of 0.33% wallet in paper mode.
    Then track ladder buys/sells via follow-ups elsewhere.
    """
    wallet = get_wallet_usdt(uid)
    price = float(coin["current_price"])
    step_q = step_size_usdt(wallet)
    if step_q <= 0:
        return None

    base_qty = quote_to_base(step_q, price)
    set_wallet_usdt(uid, wallet - step_q)
    trade = {
        "uid": uid,
        "symbol": f"{coin['symbol'].upper()}/USDT",   # rule J: only USDT pairs
        "side": "BUY",
        "qty": round(base_qty, 8),
        "price": price,
        "status": "open",
        "note": "paper-open",
        "steps_used": 1,
        "max_steps": max_steps,
        "avg_price": price,
        "highest_price": price,     # for +5% ladder sells
        "ath": float(coin.get("ath") or 0),   # for first ATH sell
        "ath_sold_step": 0,         # 0 = not sold at ATH yet
        "stop_price": price * (1.0 - CRASH_EXIT_DROP),
        "createdAt": datetime.utcnow()
    }
    record_trade(trade)
    return trade

def ladder_buy_if_drop(trade:Dict[str,Any], current_price:float, uid:str):
    # If price dropped by >= 5% from avg, buy another 0.33% step
    drop_from_avg = (trade["avg_price"] - current_price) / trade["avg_price"]
    if drop_from_avg >= BUY_LADDER_STEP and trade["steps_used"] < trade["max_steps"]:
        wallet = get_wallet_usdt(uid)
        step_q = step_size_usdt(wallet)
        if step_q > 0:
            base_qty = quote_to_base(step_q, current_price)
            # update wallet and trade (paper fill)
            set_wallet_usdt(uid, wallet - step_q)
            new_qty = trade["qty"] + base_qty
            new_avg = (trade["avg_price"]*trade["qty"] + current_price*base_qty)/new_qty
            trade["qty"] = round(new_qty, 8)
            trade["avg_price"] = new_avg
            trade["steps_used"] += 1
            trade["stop_price"] = current_price * (1.0 - CRASH_EXIT_DROP)
            trade["note"] = "paper-ladder-buy"

def ladder_sell_if_rise(trade:Dict[str,Any], current_price:float, uid:str):
    # First: sell 1 step if price touches or exceeds ATH and we haven't sold at ATH yet
    if trade["ath"] and not trade.get("ath_sold_step") and current_price >= trade["ath"]:
        _sell_step(trade, current_price, uid, note="paper-sell-ATH")
        trade["ath_sold_step"] = 1

    # Next: sell 1 step every +5% above the last recorded highest_price
    if current_price > trade["highest_price"] * (1.0 + SELL_LADDER_STEP):
        _sell_step(trade, current_price, uid, note="paper-ladder-sell")
        trade["highest_price"] = current_price

def check_crash_exit(trade:Dict[str,Any], current_price:float, uid:str):
    if current_price <= trade["stop_price"]:
        # close entire position
        wallet = get_wallet_usdt(uid)
        proceeds = trade["qty"] * current_price
        set_wallet_usdt(uid, wallet + proceeds)
        trade["qty"] = 0.0
        trade["status"] = "closed"
        trade["note"] = "paper-crash-exit"

def _sell_step(trade:Dict[str,Any], current_price:float, uid:str, note:str):
    if trade["qty"] <= 0:
        return
    # sell 0.33% of wallet *in base* equivalent using current price:
    # We mirror the buy step size in USDT, then convert to base at current price,
    # limited by current position qty.
    wallet = get_wallet_usdt(uid)
    step_q = step_size_usdt(wallet)  # For paper simplicity we reuse same step; you can also store initial_wallet
    base_qty = quote_to_base(step_q, current_price)
    qty_to_sell = min(base_qty, trade["qty"])
    proceeds = qty_to_sell * current_price
    # credit wallet
    set_wallet_usdt(uid, wallet + proceeds)
    trade["qty"] = round(trade["qty"] - qty_to_sell, 8)
    if trade["qty"] <= 0:
        trade["status"] = "closed"
    trade["note"] = note
