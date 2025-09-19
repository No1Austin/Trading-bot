from typing import Tuple

# Helpers return (ok, reason). reason helps you debug which rule filtered a coin.

def rule_A_price_under_1(coin)->Tuple[bool,str]:
    price = float(coin.get("current_price") or 0)
    return (price < 1.0, "A: price must be < $1")

def rule_B_vol_at_least_50m(coin)->Tuple[bool,str]:
    vol = float(coin.get("total_volume") or 0)
    return (vol >= 50_000_000, "B: 24h volume must be >= $50M")

def rule_C_volatility_around_20pct(coin)->Tuple[bool,str]:
    # Using absolute 24h % change as a simple volatility proxy.
    chg = abs(float(coin.get("price_change_percentage_24h") or 0))
    return (chg >= 20.0, "C: 24h |%change| must be >= 20%")

def rule_D_verified_on_cg_and_cmc(coin)->Tuple[bool,str]:
    # Proxy: If it's on CoinGecko, we count 'verified on CG'.
    # For CMC verification, you'd call CMC API (needs API key) and check status/listed.
    # We return True for now, with TODO.
    return (True, "D: CMC verification TODO (assumed true)")

def rule_E_holders_over_1000(coin)->Tuple[bool,str]:
    # Requires on-chain scan (Etherscan/BscScan/etc.) per token chain. Not in CG by default.
    # TODO: implement chain-specific holders lookup. For now, assume true.
    return (True, "E: holders > 1000 TODO (assumed true)")

def rule_F_not_below_listing_price(coin)->Tuple[bool,str]:
    # Need listing price per exchange. As a conservative proxy, require price >= all-time-low * 1.1
    atl = float(coin.get("atl") or 0)
    price = float(coin.get("current_price") or 0)
    if atl <= 0: 
        return (True, "F: no ATL data, passing")
    return (price >= atl * 1.10, "F: price must be >= 110% of ATL (proxy for not below listing)")

def rule_G_not_above_ath(coin)->Tuple[bool,str]:
    ath = float(coin.get("ath") or 0)
    price = float(coin.get("current_price") or 0)
    if ath <= 0: 
        return (True, "G: no ATH data, passing")
    return (price <= ath, "G: price must be <= ATH")

def rule_M_liquidity_ratio(coin)->Tuple[bool,str]:
    # "Volatility of the token to be at least 10% of the Marketcap"
    # We'll enforce: (24h_volume / market_cap) >= 0.10  (>=10% of mcap traded in 24h)
    mcap = float(coin.get("market_cap") or 0)
    vol  = float(coin.get("total_volume") or 0)
    if mcap <= 0:
        return (False, "M: missing market cap")
    ratio = vol / mcap
    return (ratio >= 0.10, "M: vol/mcap must be >= 0.10")

def passes_all_rules(coin)->Tuple[bool,str]:
    checks = [
        rule_A_price_under_1,
        rule_B_vol_at_least_50m,
        rule_C_volatility_around_20pct,
        rule_D_verified_on_cg_and_cmc,
        rule_E_holders_over_1000,
        rule_F_not_below_listing_price,
        rule_G_not_above_ath,
        rule_M_liquidity_ratio,
    ]
    for fn in checks:
        ok, reason = fn(coin)
        if not ok: 
            return (False, reason)
    return (True, "OK")
