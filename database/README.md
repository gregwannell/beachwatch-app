# Beachwatch Database Setup

This directory contains the database schema and setup scripts for the Beachwatch Data Explorer application.

## Files

- `schema.sql` - Complete database schema with tables, indexes, and constraints
- `sample-data.sql` - Sample data for testing and development
- `queries.sql` - Common queries used by the application
- `README.md` - This documentation file

## Database Schema Overview

The database is designed as a star schema optimized for analytical queries:

### Dimension Tables
- `regions` - UK geographic regions with hierarchical structure
- `materials` - Litter material types (Plastic, Metal, Glass, etc.)
- `sources` - Litter sources (Public, Fishing, Sewage, etc.)
- `litter_items` - Specific litter item types with material/source mappings

### Fact Tables
- `annual_region_aggregates` - Central fact table with annual survey summaries
- `annual_material_aggregates` - Material breakdowns per region/year
- `annual_source_aggregates` - Source breakdowns per region/year  
- `annual_litter_aggregates` - Litter item breakdowns per region/year

## Setup Instructions

### 1. Connect to Supabase
Make sure you have access to your Supabase project and the database connection is configured.

### 2. Run Schema Creation
Execute the schema.sql file in your Supabase SQL editor or via psql:

```sql
-- Copy and paste the contents of schema.sql into Supabase SQL editor
-- Or use psql: \i schema.sql
```

### 3. Load Sample Data (Optional)
For testing and development, load the sample data:

```sql
-- Copy and paste the contents of sample-data.sql
-- Or use psql: \i sample-data.sql
```

### 4. Verify Installation
Run these queries to verify the setup:

```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check sample data (if loaded)
SELECT COUNT(*) FROM regions;
SELECT COUNT(*) FROM annual_region_aggregates;
```

## Key Features

### Performance Optimizations
- Indexes on frequently queried columns
- Pre-aggregated data to avoid heavy calculations
- Optimized for read-heavy workloads

### Data Integrity
- Foreign key constraints ensure referential integrity
- Check constraints for data validation
- Unique constraints prevent duplicates

### Scalability
- Partitioned by year for large datasets
- Efficient querying with proper indexing
- Support for PostGIS geographic operations

## Common Query Patterns

The application typically queries data in these patterns:

1. **Region Selection** - Get all regions with data availability
2. **Annual Summaries** - Get metrics for a specific region/year
3. **Top N Items** - Get top litter items for visualization
4. **Breakdowns** - Get material/source distributions
5. **Trends** - Get historical data with year-over-year changes
6. **Mapping** - Get region boundaries for map visualization

See `queries.sql` for example implementations.

## Data Loading

For production use, you'll need to:

1. Load actual UK region boundaries from ONS Geoportal
2. Import historical survey data (CSV format)
3. Set up automated annual data refresh processes
4. Configure data validation and quality checks

## Maintenance

- Run `ANALYZE` after bulk data loads
- Monitor query performance and add indexes as needed  
- Regular backups of the database
- Update region boundaries when ONS releases new data