from datetime import datetime
from typing import Dict, Any, Iterable, Optional
from pymongo import MongoClient
from .config import MONGODB_URI, DB_NAME, WALLET_USDT_DEFAULT

_client = None
DB = None
if MONGODB_URI:
    try:
        _client = MongoClient(MONGODB_URI)
        DB = _client[DB_NAME]
    except Exception as e:
        print("Mongo connect error:", e)

def col(name):
    return DB[name] if DB is not None else None

def users_col():    return col("users")
def subs_col():     return col("subs")
def keys_col():     return col("apiKeys")
def trades_col():   return col("trades")
def wallets_col():  return col("wallets")  # { uid, usdt_balance }

def get_wallet_usdt(uid: str) -> float:
    if DB is None:
        return WALLET_USDT_DEFAULT
    w = wallets_col().find_one({"uid": uid})
    if w is None:
        wallets_col().update_one(
            {"uid": uid},
            {"$set": {"usdt_balance": WALLET_USDT_DEFAULT}},
            upsert=True,
        )
        return WALLET_USDT_DEFAULT
    return float(w.get("usdt_balance", WALLET_USDT_DEFAULT))

def set_wallet_usdt(uid: str, value: float):
    if DB is None:
        return
    wallets_col().update_one(
        {"uid": uid},
        {"$set": {"usdt_balance": float(value)}},
        upsert=True,
    )

def approved_users() -> Iterable[Dict[str, Any]]:
    """Yield users that have an approved subscription and an apiKey."""
    if DB is None:
        return []
    subs = subs_col()
    keys = keys_col()
    if subs is None or keys is None:
        return []
    uids = {s["uid"] for s in subs.find({"status": "approved"}, {"uid": 1})}
    out = []
    for uid in uids:
        k = keys.find_one({"uid": uid})
        if k:
            out.append({"uid": str(uid), "apiKey": k["apiKey"]})
    return out

def record_trade(doc: Dict[str, Any]):
    if DB is None:
        return
    t = trades_col()
    if t is None:
        return
    doc.setdefault("createdAt", datetime.utcnow())
    t.insert_one(doc)

def update_trade(_id, patch: Dict[str, Any]):
    if DB is None:
        return
    t = trades_col()
    if t is None:
        return
    t.update_one({"_id": _id}, {"$set": patch})

def recent_open_trades(uid: Optional[str] = None) -> Iterable[Dict[str, Any]]:
    if DB is None:
        return []
    t = trades_col()
    if t is None:
        return []
    q = {"status": "open"}
    if uid:
        q["uid"] = uid
    return list(t.find(q).sort("createdAt", -1).limit(500))
