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
    type VARCHAR(50) NOT NULL CHECK (level IN ('country', 'county', 'unitary_authority')),
    code VARCHAR(20) UNIQUE NOT NULL,
    geometry JSONB, -- GeoJSON polygon data
    has_data BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    name_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    year VARCHAR(4) NOT NULL,
    total_surveys INTEGER DEFAULT 0,
    total_volunteers INTEGER DEFAULT 0,
    total_volunteer_min NUMERIC(10,2) DEFAULT 0,
    total_length_m INTEGER DEFAULT 0,
    additional_areas_cleaned_m INTEGER DEFAULT 0,
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
    UNIQUE(region_aggregate_id, material_id)
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
    UNIQUE(region_aggregate_id, source_id)
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
    UNIQUE(region_aggregate_id, litter_item_id)
);

-- Create indexes for performance optimization
CREATE INDEX idx_regions_type ON regions(type);
CREATE INDEX idx_regions_parent ON regions(parent_id);
CREATE INDEX idx_regions_code ON regions(code);
CREATE INDEX idx_regions_has_data ON regions(has_data);

CREATE INDEX idx_annual_region_aggregates_region_year ON annual_region_aggregates(region_id, year);
CREATE INDEX idx_annual_region_aggregates_year ON annual_region_aggregates(year);

CREATE INDEX idx_annual_material_aggregates_region ON annual_material_aggregates(aggregate_id);
CREATE INDEX idx_annual_material_aggregates_material ON annual_material_aggregates(material_id);

CREATE INDEX idx_annual_source_aggregates_region ON annual_source_aggregates(aggregate_id);
CREATE INDEX idx_annual_source_aggregates_source ON annual_source_aggregates(source_id);

CREATE INDEX idx_annual_litter_aggregates_region ON annual_litter_aggregates(aggregate_id);
CREATE INDEX idx_annual_litter_aggregates_litter ON annual_litter_aggregates(litter_item_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON regions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_annual_region_aggregates_updated_at BEFORE UPDATE ON annual_region_aggregates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE regions IS 'Geographic regions with hierarchical structure and boundary data';
COMMENT ON TABLE annual_region_aggregates IS 'Central fact table containing annual survey aggregates per region';
COMMENT ON TABLE annual_material_aggregates IS 'Material breakdown data linked to region aggregates';
COMMENT ON TABLE annual_source_aggregates IS 'Source breakdown data linked to region aggregates';
COMMENT ON TABLE annual_litter_aggregates IS 'Litter item breakdown data linked to region aggregates';
COMMENT ON TABLE materials IS 'Dimension table for litter materials';
COMMENT ON TABLE sources IS 'Dimension table for litter sources';
COMMENT ON TABLE litter_items IS 'Dimension table for specific litter items';
