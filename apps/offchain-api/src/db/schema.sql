-- TAG Coins Off-chain Database Schema
-- Purpose: Processing state, audit logs, and performance caches
-- NOT for core mappings (those live on blockchain)

-- Processing status for TAG coin creation requests
CREATE TABLE coin_processing_status (
    id SERIAL PRIMARY KEY,
    
    -- Event identification
    tag_string VARCHAR(255) NOT NULL,
    machine_name VARCHAR(255) NOT NULL,
    creator_address CHAR(42) NOT NULL,
    relayer_address CHAR(42) NOT NULL,
    
    -- ETS event data
    ets_tag_id VARCHAR(50),
    ets_block_number BIGINT,
    ets_transaction_hash CHAR(66),
    
    -- Processing state
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- pending, processing, metadata_generated, coin_creating, completed, failed
    
    -- Zora results
    predicted_coin_address CHAR(42),
    actual_coin_address CHAR(42),
    zora_transaction_hash CHAR(66),
    zora_block_number BIGINT,
    
    -- Metadata
    metadata_uri TEXT,
    metadata_generated_at TIMESTAMP,
    
    -- Processing metadata
    attempts INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    
    -- Indexes
    UNIQUE(tag_string, creator_address), -- Prevent duplicate processing
    INDEX(status),
    INDEX(created_at),
    INDEX(ets_tag_id)
);

-- Metadata generation records
CREATE TABLE metadata_records (
    id SERIAL PRIMARY KEY,
    
    -- Request data
    tag_string VARCHAR(255) NOT NULL,
    machine_name VARCHAR(255) NOT NULL,
    creator_address CHAR(42) NOT NULL,
    relayer_address CHAR(42) NOT NULL,
    
    -- Generated metadata
    metadata_uri TEXT NOT NULL,
    metadata_json JSONB NOT NULL,
    image_uri TEXT NOT NULL,
    
    -- Generation metadata
    generation_method VARCHAR(50) DEFAULT 'mock', -- mock, ipfs, custom
    ipfs_hash VARCHAR(100),
    is_mock BOOLEAN DEFAULT true,
    
    -- Validation
    validation_passed BOOLEAN DEFAULT false,
    validation_errors JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes
    UNIQUE(tag_string, creator_address), -- One metadata per tag/creator pair
    INDEX(created_at),
    INDEX(generation_method)
);

-- Performance cache for blockchain lookups
CREATE TABLE blockchain_cache (
    id SERIAL PRIMARY KEY,
    
    -- Cache key
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    cache_type VARCHAR(50) NOT NULL, -- 'coin_exists', 'tag_lookup', etc.
    
    -- Cached data
    result_data JSONB NOT NULL,
    
    -- Cache metadata
    block_number BIGINT, -- Block when this was cached
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes
    INDEX(cache_type),
    INDEX(expires_at),
    INDEX(created_at)
);

-- Audit log for all operations
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    
    -- Operation details
    operation VARCHAR(100) NOT NULL, -- 'coin_creation', 'metadata_generation', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'tag_coin', 'metadata', etc.
    entity_id VARCHAR(255) NOT NULL, -- tag_string or other identifier
    
    -- Request context
    user_agent TEXT,
    ip_address INET,
    api_key_id VARCHAR(100),
    
    -- Operation data
    request_data JSONB,
    response_data JSONB,
    error_data JSONB,
    
    -- Results
    success BOOLEAN DEFAULT false,
    duration_ms INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes
    INDEX(operation),
    INDEX(entity_type),
    INDEX(entity_id),
    INDEX(created_at),
    INDEX(success)
);

-- System health metrics
CREATE TABLE health_metrics (
    id SERIAL PRIMARY KEY,
    
    -- Metric identification
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'counter', 'gauge', 'histogram'
    
    -- Metric data
    value DECIMAL(10,4),
    tags JSONB, -- Additional dimensions
    
    -- Timestamps
    recorded_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes
    INDEX(metric_name),
    INDEX(metric_type),
    INDEX(recorded_at)
);

-- API rate limiting (if needed)
CREATE TABLE rate_limits (
    id SERIAL PRIMARY KEY,
    
    -- Identifier
    identifier VARCHAR(255) NOT NULL, -- IP, API key, etc.
    limit_type VARCHAR(50) NOT NULL, -- 'ip', 'api_key', 'endpoint'
    
    -- Limit data
    current_count INTEGER DEFAULT 0,
    limit_max INTEGER NOT NULL,
    window_start TIMESTAMP NOT NULL,
    window_duration INTERVAL NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes
    UNIQUE(identifier, limit_type),
    INDEX(window_start)
);

-- Update triggers for updated_at fields
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_coin_processing_status_updated_at 
    BEFORE UPDATE ON coin_processing_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at 
    BEFORE UPDATE ON rate_limits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE VIEW active_processing AS
SELECT *
FROM coin_processing_status
WHERE status IN ('pending', 'processing', 'metadata_generated', 'coin_creating')
ORDER BY created_at DESC;

CREATE VIEW failed_processing AS
SELECT *
FROM coin_processing_status
WHERE status = 'failed'
ORDER BY updated_at DESC;

CREATE VIEW processing_stats AS
SELECT 
    status,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_duration_seconds
FROM coin_processing_status
GROUP BY status;