-- Таблица партнеров
CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    partner_code VARCHAR(50) UNIQUE NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0,
    commission_rate DECIMAL(5, 2) DEFAULT 2.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица переходов по партнерским ссылкам
CREATE TABLE IF NOT EXISTS partner_clicks (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id),
    ip_address VARCHAR(45),
    user_agent TEXT,
    from_currency VARCHAR(20),
    to_currency VARCHAR(20),
    city VARCHAR(100),
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заявок на обмен
CREATE TABLE IF NOT EXISTS exchange_orders (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    from_currency VARCHAR(20) NOT NULL,
    to_currency VARCHAR(20) NOT NULL,
    from_amount DECIMAL(20, 8) NOT NULL,
    to_amount DECIMAL(20, 8) NOT NULL,
    exchange_rate DECIMAL(20, 8) NOT NULL,
    margin_profit DECIMAL(15, 2) DEFAULT 0,
    customer_email VARCHAR(255),
    customer_contact VARCHAR(255),
    wallet_address TEXT,
    card_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Таблица начислений партнерам
CREATE TABLE IF NOT EXISTS partner_earnings (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id),
    order_id INTEGER REFERENCES exchange_orders(id),
    amount DECIMAL(15, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL,
    order_amount DECIMAL(20, 8) NOT NULL,
    order_direction VARCHAR(100) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица выплат партнерам
CREATE TABLE IF NOT EXISTS partner_payouts (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id),
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_details TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_partners_code ON partners(partner_code);
CREATE INDEX IF NOT EXISTS idx_orders_partner ON exchange_orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON exchange_orders(status);
CREATE INDEX IF NOT EXISTS idx_earnings_partner ON partner_earnings(partner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_partner ON partner_payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_clicks_partner ON partner_clicks(partner_id);
