-- TradingEdge Sample Data
-- Run: psql -h localhost -U postgres -d postgres -f sample_data.sql

-- ============================================================
-- 1. Stock Prices (time series — great for line/area/candlestick)
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_prices (
    id          SERIAL PRIMARY KEY,
    symbol      VARCHAR(10) NOT NULL,
    trade_date  DATE NOT NULL,
    open        NUMERIC(10,2),
    high        NUMERIC(10,2),
    low         NUMERIC(10,2),
    close       NUMERIC(10,2),
    volume      BIGINT,
    UNIQUE(symbol, trade_date)
);

INSERT INTO stock_prices (symbol, trade_date, open, high, low, close, volume) VALUES
('AAPL', '2026-05-18', 198.50, 201.20, 197.80, 200.15, 52400000),
('AAPL', '2026-05-19', 200.15, 203.40, 199.60, 202.80, 48900000),
('AAPL', '2026-05-20', 202.80, 205.10, 201.90, 203.45, 51200000),
('AAPL', '2026-05-21', 203.45, 204.80, 200.30, 201.10, 47800000),
('AAPL', '2026-05-22', 201.10, 206.50, 200.80, 205.90, 55100000),
('AAPL', '2026-05-23', 205.90, 208.00, 204.50, 207.30, 60300000),
('AAPL', '2026-05-25', 207.30, 210.20, 206.80, 209.45, 58700000),
('AAPL', '2026-05-26', 209.45, 212.00, 208.90, 211.60, 62100000),
('NVDA', '2026-05-18', 142.30, 146.80, 141.50, 145.20, 38500000),
('NVDA', '2026-05-19', 145.20, 148.90, 144.10, 147.60, 41200000),
('NVDA', '2026-05-20', 147.60, 152.40, 146.80, 151.30, 45800000),
('NVDA', '2026-05-21', 151.30, 153.10, 148.50, 149.80, 39700000),
('NVDA', '2026-05-22', 149.80, 155.20, 149.00, 154.50, 44300000),
('NVDA', '2026-05-23', 154.50, 158.70, 153.80, 157.90, 50200000),
('NVDA', '2026-05-25', 157.90, 160.40, 156.50, 159.20, 47600000),
('NVDA', '2026-05-26', 159.20, 163.00, 158.60, 162.45, 53100000),
('TSLA', '2026-05-18', 268.00, 274.50, 266.30, 272.10, 32100000),
('TSLA', '2026-05-19', 272.10, 278.80, 270.40, 276.50, 34500000),
('TSLA', '2026-05-20', 276.50, 279.20, 271.10, 273.80, 29800000),
('TSLA', '2026-05-21', 273.80, 280.60, 272.90, 279.40, 33400000),
('TSLA', '2026-05-22', 279.40, 285.10, 277.20, 283.60, 36700000),
('TSLA', '2026-05-23', 283.60, 288.90, 281.50, 286.30, 38900000),
('TSLA', '2026-05-25', 286.30, 291.40, 284.80, 290.10, 40200000),
('TSLA', '2026-05-26', 290.10, 295.00, 288.20, 293.50, 41500000),
('MSFT', '2026-05-18', 458.20, 462.10, 456.80, 461.30, 22100000),
('MSFT', '2026-05-19', 461.30, 466.40, 459.50, 465.20, 23500000),
('MSFT', '2026-05-20', 465.20, 468.90, 463.10, 467.50, 24200000),
('MSFT', '2026-05-21', 467.50, 471.20, 464.30, 466.80, 21900000),
('MSFT', '2026-05-22', 466.80, 472.50, 465.90, 471.40, 25800000),
('MSFT', '2026-05-23', 471.40, 475.80, 469.20, 474.10, 27100000),
('MSFT', '2026-05-25', 474.10, 478.30, 472.50, 476.90, 28500000),
('MSFT', '2026-05-26', 476.90, 481.20, 475.40, 480.60, 29300000);

-- ============================================================
-- 2. Trade Orders (good for tables / bar charts)
-- ============================================================
CREATE TABLE IF NOT EXISTS trade_orders (
    id              SERIAL PRIMARY KEY,
    order_ref       VARCHAR(20) NOT NULL UNIQUE,
    symbol          VARCHAR(10) NOT NULL,
    side            VARCHAR(4) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    quantity        INTEGER NOT NULL,
    price           NUMERIC(10,2),
    order_type      VARCHAR(10) NOT NULL DEFAULT 'MARKET',
    status          VARCHAR(10) NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    filled_at       TIMESTAMP
);

INSERT INTO trade_orders (order_ref, symbol, side, quantity, price, order_type, status, created_at, filled_at) VALUES
('ORD-001', 'AAPL',  'BUY',  500,  201.50, 'LIMIT',  'FILLED',  '2026-05-26 09:31:00', '2026-05-26 09:31:02'),
('ORD-002', 'NVDA',  'BUY',  1000, 147.80, 'MARKET',  'FILLED',  '2026-05-26 09:35:00', '2026-05-26 09:35:01'),
('ORD-003', 'TSLA',  'SELL', 200,  290.50, 'LIMIT',  'FILLED',  '2026-05-26 09:42:00', '2026-05-26 09:44:15'),
('ORD-004', 'MSFT',  'BUY',  300,  468.00, 'MARKET',  'FILLED',  '2026-05-26 10:01:00', '2026-05-26 10:01:01'),
('ORD-005', 'AAPL',  'SELL', 400,  210.80, 'LIMIT',  'PENDING', '2026-05-26 10:15:00', NULL),
('ORD-006', 'NVDA',  'BUY',  750,  155.20, 'LIMIT',  'PENDING', '2026-05-26 10:22:00', NULL),
('ORD-007', 'TSLA',  'BUY',  150,  285.00, 'STOP',   'PENDING', '2026-05-26 10:30:00', NULL),
('ORD-008', 'MSFT',  'SELL', 250,  480.00, 'LIMIT',  'FILLED',  '2026-05-26 10:45:00', '2026-05-26 10:48:30'),
('ORD-009', 'AAPL',  'BUY',  600,  202.30, 'MARKET',  'FILLED',  '2026-05-26 11:05:00', '2026-05-26 11:05:01'),
('ORD-010', 'NVDA',  'SELL', 500,  160.00, 'LIMIT',  'REJECTED','2026-05-26 11:20:00', NULL),
('ORD-011', 'TSLA',  'BUY',  300,  291.00, 'MARKET',  'FILLED',  '2026-05-26 11:35:00', '2026-05-26 11:35:01'),
('ORD-012', 'MSFT',  'BUY',  100,  476.50, 'LIMIT',  'FILLED',  '2026-05-26 11:50:00', '2026-05-26 11:52:10');

-- ============================================================
-- 3. Portfolio Holdings (good for pie charts)
-- ============================================================
CREATE TABLE IF NOT EXISTS portfolio (
    id              SERIAL PRIMARY KEY,
    symbol          VARCHAR(10) NOT NULL,
    shares          INTEGER NOT NULL,
    avg_cost        NUMERIC(10,2) NOT NULL,
    last_price      NUMERIC(10,2) NOT NULL,
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO portfolio (symbol, shares, avg_cost, last_price) VALUES
('AAPL', 1500, 198.75, 211.60),
('NVDA', 2200, 142.30, 162.45),
('TSLA', 800,  265.40, 293.50),
('MSFT', 600,  458.90, 480.60),
('GOOGL', 400, 185.20, 192.30),
('META', 350,  548.30, 562.10);

-- ============================================================
-- View: Portfolio Summary (convenience view)
-- ============================================================
CREATE OR REPLACE VIEW portfolio_summary AS
SELECT
    symbol,
    shares,
    avg_cost,
    last_price,
    shares * avg_cost                       AS cost_basis,
    shares * last_price                     AS market_value,
    shares * (last_price - avg_cost)        AS unrealized_pnl,
    ROUND((last_price - avg_cost) / avg_cost * 100, 2) AS pnl_pct
FROM portfolio;

-- ============================================================
-- Verify
-- ============================================================
SELECT 'Tables created:' AS status, COUNT(*) AS table_count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  AND table_name IN ('stock_prices', 'trade_orders', 'portfolio');

SELECT 'Row counts:' AS label, 'stock_prices' AS tbl, COUNT(*) AS rows FROM stock_prices
UNION ALL
SELECT 'Row counts:', 'trade_orders', COUNT(*) FROM trade_orders
UNION ALL
SELECT 'Row counts:', 'portfolio', COUNT(*) FROM portfolio;
