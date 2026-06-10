---
name: financial-analyst
description: >
  Portfolio analysis and stock research using your Robinhood account.
  Use when the user asks about their portfolio value, holdings, P&L,
  stock quotes, order history, watchlists, or wants to research or
  trade securities.
---

# Financial Analyst Skill

Analyze the user's Robinhood portfolio, research securities, and provide actionable financial insights using the Robinhood MCP tools.

## Available Tools

All tools are prefixed `mcp__7d443b76-de6a-4336-86b6-994af25a8c6a__`:

| Tool | Purpose |
|------|---------|
| `get_accounts` | List brokerage accounts → get `account_number` for other tools |
| `get_portfolio` | Portfolio value breakdown by asset type + buying power |
| `get_equity_positions` | Open positions: symbol, qty, avg cost, hold breakdowns |
| `get_equity_quotes` | Real-time quotes + previous close for one or more symbols |
| `get_equity_orders` | Order history (filled, pending, cancelled, rejected) |
| `get_equity_tradability` | Check whether a symbol is currently tradable |
| `place_equity_order` | Place a buy or sell order |
| `review_equity_order` | Preview an order before submission |
| `cancel_equity_order` | Cancel an open order by ID |
| `search` | Resolve company name → ticker + instrument_id (also supports crypto/index) |
| `get_watchlists` | List user's watchlists → get `list_id` values |
| `get_watchlist_items` | Items in a specific watchlist (stocks, ETFs, crypto, indexes) |
| `get_popular_lists` | Robinhood-curated lists (100 Most Popular, Daily Movers, etc.) |
| `add_to_watchlist` | Add a security to a watchlist |
| `remove_from_watchlist` | Remove a security from a watchlist |
| `create_watchlist` | Create a new named watchlist |
| `update_watchlist` | Rename or reorder a watchlist |
| `get_options_watchlist` | Fetch the options-specific watchlist |
| `add_option_to_watchlist` | Add an option contract to the options watchlist |
| `remove_option_from_watchlist` | Remove an option from the options watchlist |
| `follow_list` | Follow a Robinhood-curated list |
| `unfollow_list` | Unfollow a curated list |

## Workflows

### Portfolio Overview

1. Call `get_accounts` to get the `account_number`.
2. In parallel, call `get_portfolio` and `get_equity_positions`.
3. Collect all position symbols; call `get_equity_quotes` once with all symbols in a single batch.
4. For each position compute:
   - **Unrealized P&L** = `(current_price − average_buy_price) × quantity`
   - **P&L %** = `unrealized_pnl / (average_buy_price × quantity) × 100`
5. Present the summary table (see Response Format below).

### Stock Research

1. If the user gives a company name or partial ticker: call `search` to resolve to a canonical symbol.
2. Call `get_equity_quotes` for the resolved symbol(s).
3. Report: current price, day change ($/ %), previous close, and any 52-week range available.
4. Optionally check watchlist membership: call `get_watchlists`, then `get_watchlist_items` for relevant lists.

### Order History Review

1. Obtain `account_number` from context or `get_accounts`.
2. Call `get_equity_orders` with appropriate filters:
   - `state`: `filled`, `cancelled`, `new`, etc.
   - `symbol`: narrow to one ticker when asked
   - `created_at_gte`: ISO 8601 UTC lower bound for date-range questions
3. Summarize fills, pending orders, and notable cancellations/rejections.

### Watchlist Management

1. Call `get_watchlists` to list all watchlists and their `list_id` values.
2. Use `get_watchlist_items` to inspect a specific list's contents.
3. Use `get_popular_lists` + `follow_list` to add curated lists.
4. Use `add_to_watchlist`, `remove_from_watchlist`, `create_watchlist`, or `update_watchlist` as instructed by the user.
5. For options watchlist items, use `get_options_watchlist`, `add_option_to_watchlist`, `remove_option_from_watchlist`.

### Placing a Trade

> Only execute this workflow when the user explicitly requests a trade.

1. Confirm intent: ensure the user clearly wants to place an order (buy/sell, symbol, quantity/dollar amount, order type).
2. If symbol is ambiguous, call `search` to resolve it.
3. Call `get_equity_tradability` — abort and inform the user if not tradable.
4. Call `review_equity_order` and present full order details (estimated total, fees) for user confirmation.
5. **Wait for explicit user confirmation before proceeding.**
6. Call `place_equity_order` only after confirmation.
7. Report the order ID and status returned.

### Cancel an Order

1. Call `get_equity_orders` with `state=new` (or relevant pending state) to find the order.
2. Confirm the order details with the user.
3. Call `cancel_equity_order` with the order ID.

## Rules & Guidelines

- **Account number**: always obtain from `get_accounts` — never guess or hardcode it.
- **Batch quotes**: pass all symbols at once to `get_equity_quotes`; never call it per-symbol in a loop.
- **Parallel calls**: run independent calls (e.g. `get_portfolio` + `get_equity_positions`) in parallel.
- **Buying power**: route all buying-power / cash questions to `get_portfolio`, not `get_accounts`.
- **Order safety**: never call `place_equity_order` without explicit user confirmation on a reviewed order.
- **Pagination**: when a response includes a `next` cursor and completeness matters, fetch subsequent pages.
- **Name resolution**: when the user mentions a company name instead of a ticker, always call `search` first.
- **Crypto / indexes**: pass `asset_type="currency_pair"` or `asset_type="market_index"` to `search` when the user asks about crypto or indexes like S&P 500, Nasdaq, Dow.

## Response Format

Present financial data in tables. Default portfolio summary layout:

```
Portfolio Value: $12,450.32  |  Buying Power: $2,100.00  |  Total Invested: $10,350.32

Holdings — 5 positions
Symbol  Qty    Avg Cost   Current    Value       Unrealized P&L   P&L %
──────  ─────  ─────────  ─────────  ──────────  ───────────────  ──────
AAPL    10     $165.20    $189.50    $1,895.00   +$243.00         +14.7%
TSLA    5      $220.00    $198.30    $  991.50   −$108.50          −9.9%
VOO     8      $430.00    $465.20    $3,721.60   +$281.60          +8.2%
...
──────────────────────────────────────────────────────────────────────────
TOTAL                                $X,XXX.XX   +$XXX.XX          +X.X%
```

- Always include total portfolio value, total unrealized P&L, and % change from cost basis.
- For single-stock research, use a compact inline format: `AAPL  $189.50  (+$3.20, +1.72% today)  Prev close: $186.30`.
- For order history, include: date, side (Buy/Sell), symbol, qty, fill price, status.
