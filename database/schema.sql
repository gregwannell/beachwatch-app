-- Beachwatch Database Schema
-- This schema supports the Beachwatch Data Explorer application
-- for visualizing UK beach litter survey data

-- Enable PostGIS extension for geographic data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Regions table with hierarchical structure and geographic boundaries
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES regions(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('UK', 'Country', 'Crown Dependency', 'County Unitary')),
    code VARCHAR(20) UNIQUE NOT NULL,
    has_data BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Region geometries table (geometry separated from regions for query performance)
CREATE TABLE region_geometries (
    id SERIAL PRIMARY KEY,
    region_id INTEGER UNIQUE NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    geometry JSONB, -- GeoJSON Polygon for one polygon component of the region
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material dimension table
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    material VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Source dimension table
CREATE TABLE sources (
    id SERIAL PRIMARY KEY,
    source VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Litter item dimension table
CREATE TABLE litter_items (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    material VARCHAR(255),
    source VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Central fact table for annual region aggregates
CREATE TABLE annual_region_aggregates (
    id SERIAL PRIMARY KEY,
    region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    year SMALLINT NOT NULL,
    total_surveys INTEGER DEFAULT 0,
    total_volunteers INTEGER DEFAULT 0,
    total_volunteer_min NUMERIC(10,2) DEFAULT 0,
    total_length_m INTEGER DEFAULT 0,
    additional_area_cleaned_m INTEGER DEFAULT 0,
    total_bags NUMERIC(10,2) DEFAULT 0,
    total_weight_kg NUMERIC(10,2) DEFAULT 0,
    total_litter NUMERIC(12,2) DEFAULT 0,
    avg_per_100m NUMERIC(8,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(region_id, year)
);

-- Annual material aggregates linked to region aggregates
CREATE TABLE annual_material_aggregates (
    id SERIAL PRIMARY KEY,
    aggregate_id INTEGER NOT NULL REFERENCES annual_region_aggregates(id) ON DELETE CASCADE,
    material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    total NUMERIC(12,2) DEFAULT 0,
    avg_per_100m NUMERIC(8,2) DEFAULT 0,
    presence INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(aggregate_id, material_id)
);

-- Annual source aggregates linked to region aggregates
CREATE TABLE annual_source_aggregates (
    id SERIAL PRIMARY KEY,
    aggregate_id INTEGER NOT NULL REFERENCES annual_region_aggregates(id) ON DELETE CASCADE,
    source_id INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    total NUMERIC(12,2) DEFAULT 0,
    avg_per_100m NUMERIC(8,2) DEFAULT 0,
    presence INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(aggregate_id, source_id)
);

-- Annual litter item aggregates linked to region aggregates
CREATE TABLE annual_litter_aggregates (
    id SERIAL PRIMARY KEY,
    aggregate_id INTEGER NOT NULL REFERENCES annual_region_aggregates(id) ON DELETE CASCADE,
    litter_item_id INTEGER NOT NULL REFERENCES litter_items(id) ON DELETE CASCADE,
    total NUMERIC(12,2) DEFAULT 0,
    avg_per_100m NUMERIC(8,2) DEFAULT 0,
    presence INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(aggregate_id, litter_item_id)
);

-- Policy item dimension table
CREATE TABLE policy_items (
    id SERIAL PRIMARY KEY,
    policy_item VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Annual policy item aggregates linked to region aggregates
CREATE TABLE annual_policy_aggregates (
    id SERIAL PRIMARY KEY,
    aggregate_id INTEGER NOT NULL REFERENCES annual_region_aggregates(id) ON DELETE CASCADE,
    policy_item_id INTEGER NOT NULL REFERENCES policy_items(id) ON DELETE CASCADE,
    total NUMERIC(12,2) DEFAULT 0,
    avg_per_100m NUMERIC(8,2) DEFAULT 0,
    presence INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(aggregate_id, policy_item_id)
);

-- Create indexes for performance optimization
CREATE INDEX idx_regions_type ON regions(type);
CREATE INDEX idx_regions_parent ON regions(parent_id);
CREATE INDEX idx_regions_code ON regions(code);
CREATE INDEX idx_regions_has_data ON regions(has_data);

CREATE INDEX idx_region_geometries_region ON region_geometries(region_id);

CREATE INDEX idx_annual_region_aggregates_region_year ON annual_region_aggregates(region_id, year);
CREATE INDEX idx_annual_region_aggregates_year ON annual_region_aggregates(year);

CREATE INDEX idx_annual_material_aggregates_region ON annual_material_aggregates(aggregate_id);
CREATE INDEX idx_annual_material_aggregates_material ON annual_material_aggregates(material_id);

CREATE INDEX idx_annual_source_aggregates_region ON annual_source_aggregates(aggregate_id);
CREATE INDEX idx_annual_source_aggregates_source ON annual_source_aggregates(source_id);

CREATE INDEX idx_annual_litter_aggregates_region ON annual_litter_aggregates(aggregate_id);
CREATE INDEX idx_annual_litter_aggregates_litter ON annual_litter_aggregates(litter_item_id);

CREATE INDEX idx_annual_policy_aggregates_region ON annual_policy_aggregates(aggregate_id);
CREATE INDEX idx_annual_policy_aggregates_policy ON annual_policy_aggregates(policy_item_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON regions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_annual_region_aggregates_updated_at BEFORE UPDATE ON annual_region_aggregates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update has_data flag when survey data changes
CREATE OR REPLACE FUNCTION update_region_has_data()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    -- Handle different trigger events
    IF TG_OP = 'DELETE' THEN
        -- Check if the deleted region still has data
        UPDATE regions
        SET has_data = EXISTS (
            SELECT 1 FROM annual_region_aggregates
            WHERE region_id = OLD.region_id
        )
        WHERE id = OLD.region_id;
        RETURN OLD;
    ELSE
        -- For INSERT and UPDATE operations
        -- Set has_data = TRUE for the affected region
        UPDATE regions
        SET has_data = TRUE
        WHERE id = NEW.region_id;
        RETURN NEW;
    END IF;
END;
$$;

-- Create trigger to automatically update has_data flags
CREATE TRIGGER trigger_update_has_data
    AFTER INSERT OR UPDATE OR DELETE ON annual_region_aggregates
    FOR EACH ROW
    EXECUTE FUNCTION update_region_has_data();

-- Function to verify has_data flags match actual survey data
CREATE OR REPLACE FUNCTION verify_has_data_flags()
RETURNS TABLE (
    region_id INTEGER,
    region_name VARCHAR(255),
    region_code VARCHAR(20),
    current_has_data BOOLEAN,
    actual_has_data BOOLEAN,
    issue_type TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.name,
        r.code,
        r.has_data as current_has_data,
        EXISTS(SELECT 1 FROM annual_region_aggregates ara WHERE ara.region_id = r.id) as actual_has_data,
        CASE
            WHEN r.has_data = TRUE AND NOT EXISTS(SELECT 1 FROM annual_region_aggregates ara WHERE ara.region_id = r.id)
                THEN 'FALSE_POSITIVE: has_data=TRUE but no survey data exists'
            WHEN r.has_data = FALSE AND EXISTS(SELECT 1 FROM annual_region_aggregates ara WHERE ara.region_id = r.id)
                THEN 'FALSE_NEGATIVE: has_data=FALSE but survey data exists'
            ELSE 'CORRECT'
        END as issue_type
    FROM regions r
    WHERE r.has_data != EXISTS(SELECT 1 FROM annual_region_aggregates ara WHERE ara.region_id = r.id)
    ORDER BY r.name;
END;
$$;

-- Function to sync all has_data flags to match actual survey data
CREATE OR REPLACE FUNCTION sync_has_data_flags()
RETURNS TABLE (
    updated_count INTEGER,
    summary TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    update_count INTEGER;
BEGIN
    -- Update all regions to have correct has_data flags
    UPDATE regions 
    SET has_data = EXISTS (
        SELECT 1 FROM annual_region_aggregates ara
        WHERE ara.region_id = regions.id
    );
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    
    RETURN QUERY SELECT 
        update_count,
        'Updated ' || update_count || ' regions. All has_data flags now match actual survey data.' as summary;
END;
$$;

-- Add comments for documentation
COMMENT ON TABLE regions IS 'Geographic regions with hierarchical structure and boundary data';
COMMENT ON TABLE region_geometries IS 'GeoJSON boundary data for regions, separated for query performance';
COMMENT ON TABLE annual_region_aggregates IS 'Central fact table containing annual survey aggregates per region';
COMMENT ON TABLE annual_material_aggregates IS 'Material breakdown data linked to region aggregates';
COMMENT ON TABLE annual_source_aggregates IS 'Source breakdown data linked to region aggregates';
COMMENT ON TABLE annual_litter_aggregates IS 'Litter item breakdown data linked to region aggregates';
COMMENT ON TABLE materials IS 'Dimension table for litter materials';
COMMENT ON TABLE sources IS 'Dimension table for litter sources';
COMMENT ON TABLE litter_items IS 'Dimension table for specific litter items';
COMMENT ON TABLE policy_items IS 'Dimension table for litter item groups monitored for policy';
COMMENT ON TABLE annual_policy_aggregates IS 'Annual policy item breakdown data linked to region aggregates';

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE litter_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_geometries ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_region_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_material_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_source_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_litter_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_policy_aggregates ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only app backend (service_role) can access data
-- Users can only see data through the app interface, not raw database access

CREATE POLICY "app_backend_only_regions" ON regions
    FOR ALL TO service_role
    USING (true);

CREATE POLICY "app_backend_only_materials" ON materials
    FOR ALL TO service_role
    USING (true);

CREATE POLICY "app_backend_only_sources" ON sources
    FOR ALL TO service_role
    USING (true);

CREATE POLICY "app_backend_only_litter_items" ON litter_items
    FOR ALL TO service_role
    USING (true);

CREATE POLICY "app_backend_only_region_geometries" ON region_geometries
    FOR ALL TO service_role
    USING (true);

CREATE POLICY "app_backend_only_annual_region_aggregates" ON annual_region_aggregates
    FOR ALL TO service_role
    USING (true);

CREATE POLICY "app_backend_only_annual_material_aggregates" ON annual_material_aggregates
    FOR ALL TO service_role
    USING (true);

CREATE POLICY "app_backend_only_annual_source_aggregates" ON annual_source_aggregates
    FOR ALL TO service_role
    USING (true);

CREATE POLICY "app_backend_only_annual_litter_aggregates" ON annual_litter_aggregates
    FOR ALL TO service_role
    USING (true);

CREATE POLICY "app_backend_only_policy_items" ON policy_items
    FOR ALL TO service_role
    USING (true);

CREATE POLICY "app_backend_only_annual_policy_aggregates" ON annual_policy_aggregates
    FOR ALL TO service_role
    USING (true);

-- Comments for has_data management functions
COMMENT ON FUNCTION update_region_has_data() IS 'Trigger function to automatically update regions.has_data when survey data changes';
COMMENT ON FUNCTION verify_has_data_flags() IS 'Returns regions where has_data flag does not match actual survey data existence';
COMMENT ON FUNCTION sync_has_data_flags() IS 'Updates all regions to have correct has_data flags matching actual survey data';
