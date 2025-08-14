## Database Design ERD

### Tables
- **Regions**
  - id (PK) - integer
  - region - varchar
  - level - varchar
  - parent_region_id - integer
  - ons_code - varchar (unique ONS identifier)
  - boundaries - geometry/json (GeoJSON polygon data)
  - has_data - boolean (indicates if region has survey data)

- **AnnualRegionAggregate**
  - id (PK) - integer
  - region_id (FK) - integer → Regions.id
  - year - varchar
  - total_surveys - integer
  - total_volunteers - integer
  - total_volunteer_min - numeric
  - total_length_m - integer
  - additional_areas_cleaned_m - integer
  - total_bags - numeric
  - total_weight_kg - numeric
  - total_litter - numeric
  - avg_per_100m - numeric
  - updated_at - datetime

- **AnnualMaterialAggregate**
  - id (PK) - integer
  - region_aggregate_id (FK) - integer → AnnualRegionAggregate.id
  - material_id (FK) - integer → Material.id
  - total - numeric
  - avg_per_100m - numeric
  - presence - integer

- **Material**
  - id (PK) - integer
  - material - varchar

- **AnnualSourceAggregate**
  - id (PK) - integer
  - region_aggregate_id (FK) - integer → AnnualRegionAggregate.id
  - source_id (FK) - integer → Source.id
  - total - numeric
  - avg_per_100m - numeric
  - presence - integer

- **Source**
  - id (PK) - integer
  - source - varchar

- **AnnualLitterAggregate**
  - id (PK) - integer
  - region_aggregate_id (FK) - integer → AnnualRegionAggregate.id
  - litter_item_id (FK) - integer → LitterItem.id
  - total - numeric
  - avg_per_100m - numeric
  - presence - integer

- **LitterItem**
  - id (PK) - integer
  - item_name - varchar
  - short_name - varchar
  - material - varchar
  - source - varchar

### Key Relationships
- Regions has self-referencing hierarchy via parent_region_id
- AnnualRegionAggregate is central fact table linked to Regions
- Material, Source, and LitterItem are dimension tables
- All aggregate tables link to AnnualRegionAggregate for data organization
