from typing import Dict
from .config import POSITION_STEP_PCT

def step_size_usdt(wallet_usdt: float)->float:
    # 1/3% of wallet
    return wallet_usdt * POSITION_STEP_PCT

def quote_to_base(qty_usdt: float, price: float)->float:
    return 0.0 if price <= 0 else qty_usdt / price

def can_buy_more(used_steps:int, max_steps:int)->bool:
    return used_steps < max_steps
