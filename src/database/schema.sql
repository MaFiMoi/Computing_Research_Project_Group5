-- Bảng Users (người dùng)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Bảng Phone Numbers (số điện thoại)
CREATE TABLE phone_numbers (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    is_scam BOOLEAN DEFAULT false,
    risk_level VARCHAR(20),
    total_reports INTEGER DEFAULT 0,
    verified_by_admin BOOLEAN DEFAULT false,
    first_reported_at TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Bảng Phone Checks (lịch sử kiểm tra)
CREATE TABLE phone_checks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    phone_number VARCHAR(20) NOT NULL,
    result VARCHAR(20),
    risk_score DECIMAL(5,2),
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Bảng Reports (báo cáo)
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    reported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    report_type VARCHAR(50),
    description TEXT,
    evidence_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP
);

-- Bảng Web Sources (nguồn web)
CREATE TABLE web_sources (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR(255) NOT NULL,
    source_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    crawl_frequency VARCHAR(50),
    last_crawled_at TIMESTAMP,
    total_numbers_found INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng AI Crawl Logs (log AI)
CREATE TABLE ai_crawl_logs (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES web_sources(id) ON DELETE CASCADE,
    status VARCHAR(20),
    numbers_found INTEGER DEFAULT 0,
    numbers_added INTEGER DEFAULT 0,
    numbers_updated INTEGER DEFAULT 0,
    error_message TEXT,
    crawl_duration INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Bảng Scam Data (dữ liệu từ web)
CREATE TABLE scam_data (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    source_id INTEGER REFERENCES web_sources(id) ON DELETE CASCADE,
    scam_type VARCHAR(100),
    confidence_score DECIMAL(5,2),
    raw_data JSONB,
    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX idx_phone_checks_user ON phone_checks(user_id);
CREATE INDEX idx_phone_checks_date ON phone_checks(checked_at DESC);
CREATE INDEX idx_phone_numbers_risk ON phone_numbers(risk_level);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_phone ON reports(phone_number);

-- View: Thống kê tổng quan
CREATE VIEW admin_overview_stats AS
SELECT 
    (SELECT COUNT(*) FROM phone_checks) as total_checks,
    (SELECT COUNT(*) FROM phone_checks WHERE checked_at >= CURRENT_DATE) as checks_today,
    (SELECT COUNT(*) FROM phone_numbers WHERE is_scam = true) as total_scam_numbers,
    (SELECT COUNT(DISTINCT user_id) FROM phone_checks WHERE checked_at >= CURRENT_DATE - INTERVAL '7 days') as active_users_week,
    (SELECT AVG(confidence_score) FROM scam_data WHERE extracted_at >= CURRENT_DATE - INTERVAL '7 days') as avg_ai_confidence;

-- Function: Lấy thống kê theo ngày
CREATE OR REPLACE FUNCTION get_daily_stats(days INTEGER DEFAULT 7)
RETURNS TABLE (
    date DATE,
    total_checks BIGINT,
    scam_found BIGINT,
    unique_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(checked_at) as date,
        COUNT(*) as total_checks,
        COUNT(*) FILTER (WHERE result = 'scam') as scam_found,
        COUNT(DISTINCT user_id) as unique_users
    FROM phone_checks
    WHERE checked_at >= CURRENT_DATE - (days || ' days')::INTERVAL
    GROUP BY DATE(checked_at)
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;