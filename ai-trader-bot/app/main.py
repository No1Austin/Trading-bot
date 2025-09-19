import threading
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .storage import subs_col, keys_col
from .worker import loop_forever

app = FastAPI(title="AI Trader Bot", version="0.2 (A–M)")

class SyncUser(BaseModel):
    uid: str
    email: str | None = None
    apiKey: str
    route: str | None = "cex"   # reserved for future on-chain route

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/v1/users/sync")
def sync_user(p: SyncUser):
    # IMPORTANT: compare with None for PyMongo Database/Collection objects
    if subs_col() is None or keys_col() is None:
        raise HTTPException(500, "DB not configured")

    s = subs_col().find_one({"uid": p.uid, "status": "approved"})
    if s is None:
        raise HTTPException(403, "Subscription not approved")

    keys_col().update_one(
        {"uid": p.uid},
        {"$set": {"apiKey": p.apiKey}},
        upsert=True
    )
    return {"ok": True}

# Start background loop once
def _start_worker():
    t = threading.Thread(target=loop_forever, daemon=True)
    t.start()

_start_worker()
