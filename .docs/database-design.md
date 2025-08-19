## Database Design ERD

### Tables (Production Schema)

- **regions** (226 rows)
  - id (PK) - integer
  - name - varchar (region name)
  - parent_id - integer (FK → regions.id, hierarchical structure)
  - type - varchar (UK/Country/Crown Dependency/County Unitary)
  - code - varchar (unique ONS identifier, unique constraint)
  - geometry - jsonb (GeoJSON polygon boundary data)
  - has_data - boolean (default: false, indicates if region has survey data)
  - created_at - timestamptz (default: now())
  - updated_at - timestamptz (default: now())

- **annual_region_aggregates** (2,288 rows) - Central Fact Table
  - id (PK) - integer
  - name_id (FK) - integer → regions.id
  - year - varchar
  - total_surveys - integer (default: 0)
  - total_volunteers - integer (default: 0) 
  - total_volunteer_min - numeric (default: 0)
  - total_length_m - integer (default: 0)
  - additional_area_cleaned_m - integer (default: 0)
  - total_bags - numeric (default: 0)
  - total_weight_kg - numeric (default: 0)
  - total_litter - numeric (default: 0)
  - avg_per_100m - numeric (default: 0)
  - created_at - timestamptz (default: now())
  - updated_at - timestamptz (default: now())

- **annual_material_aggregates** (20,592 rows)
  - id (PK) - integer
  - aggregate_id (FK) - integer → annual_region_aggregates.id
  - material_id (FK) - integer → materials.id
  - total - numeric (default: 0)
  - avg_per_100m - numeric (default: 0)
  - presence - integer (default: 0)
  - created_at - timestamptz (default: now())

- **materials** (9 materials)
  - id (PK) - integer
  - material - varchar (unique constraint)
  - created_at - timestamptz (default: now())

- **annual_source_aggregates** (13,728 rows)
  - id (PK) - integer
  - aggregate_id (FK) - integer → annual_region_aggregates.id
  - source_id (FK) - integer → sources.id
  - total - numeric (default: 0)
  - avg_per_100m - numeric (default: 0)
  - presence - integer (default: 0)
  - created_at - timestamptz (default: now())

- **sources** (6 sources)
  - id (PK) - integer
  - source - varchar (unique constraint)
  - created_at - timestamptz (default: now())

- **annual_litter_aggregates** (329,472 rows) - Largest table
  - id (PK) - integer
  - aggregate_id (FK) - integer → annual_region_aggregates.id
  - litter_item_id (FK) - integer → litter_items.id
  - total - numeric (default: 0)
  - avg_per_100m - numeric (default: 0)
  - presence - integer (default: 0)
  - created_at - timestamptz (default: now())

- **litter_items** (148 items)
  - id (PK) - integer
  - item_name - varchar
  - short_name - varchar
  - material - varchar
  - source - varchar
  - created_at - timestamptz (default: now())

### Key Relationships & Data Architecture

**Hierarchical Structure:**
- regions has self-referencing hierarchy via parent_id
- Type hierarchy: UK → Country → Crown Dependency → County Unitary

**Star Schema Design:**
- annual_region_aggregates serves as central fact table (2,288 rows)
- Connected to regions via name_id foreign key
- materials, sources, litter_items are dimension tables
- All aggregate tables (material/source/litter) link to annual_region_aggregates

**Data Volume & Performance:**
- annual_litter_aggregates is the largest table (329,472 rows, 38 MB)
- All tables have RLS (Row Level Security) enabled
- Proper indexing on foreign keys and primary keys
- GeoJSON geometry data stored as jsonb for efficient querying

### Database Features
- **PostGIS Integration**: Geometry column uses jsonb for GeoJSON storage
- **Row Level Security**: All tables have RLS enabled for data access control  
- **Audit Trail**: created_at/updated_at timestamps on all tables
- **Data Integrity**: Foreign key constraints maintain referential integrity
- **Unique Constraints**: ONS codes and dimension values are unique

### Production Data Summary

**Materials (9 total):**
Glass, Medical, Paper/Cardboard, Rubber, Metal, Plastic/Polystyrene, Wood, Pottery/ceramics, Cloth
- Each material has data across all 2,288 annual aggregates

**Sources (6 total):**
Non-sourced, Sewage related debris (SRD), Public, Shipping, Fly-tipped, Fishing
- Each source has data across all 2,288 annual aggregates

**Data Coverage:**
- 226 UK regions with hierarchical structure
- 2,288 annual region aggregates (complete coverage across years)
- 20,592 material breakdowns (9 materials × 2,288 aggregates)
- 13,728 source breakdowns (6 sources × 2,288 aggregates)
- 329,472 individual litter item records (148 items with varying coverage)

**Sample Data Values (2024 UK totals):**
- Total surveys: 1,266
- Total volunteers: 15,194
- Total volunteer minutes: 1,541,861
- Beach length surveyed: 147,812m
- Additional area cleaned: 216,555m
- Total bags collected: 3,904
- Total weight: 16,858.10kg
- Total litter items: 977,599
- Average per 100m: 209 items
