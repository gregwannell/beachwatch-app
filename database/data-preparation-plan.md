# Beachwatch Database - Data Preparation Plan

## Overview

This document outlines the strategy for preparing complete UK region data for the Beachwatch Data Explorer map, ensuring all UK regions are displayed while clearly indicating which regions have survey data available.

## Strategy: Complete Region Coverage with Data Availability Indicators

### The Challenge
- We want to display a complete UK map without gaps or missing regions
- We only have survey data for some regions, not all
- Users need to clearly understand which regions have data vs. don't
- Must meet PRD requirement ST-111: "Regions with no survey data are visibly differentiated"

### The Solution
Load ALL UK regions with complete GeoJSON boundaries and use the `has_data` boolean field to indicate survey data availability.

## Data Sources Required

### 1. UK Region Boundaries (ONS Geoportal)
**Source**: Office for National Statistics (ONS) Geoportal
**URL**: https://geoportal.statistics.gov.uk/

**Required Datasets**:
- Countries (England, Wales, Scotland, Northern Ireland)
- Counties (England administrative counties)
- Unitary Authorities (England, Wales, Scotland administrative areas)
- Principal Areas (Wales local government areas)
- Council Areas (Scotland local government areas)

**Format**: GeoJSON or Shapefile (convert to GeoJSON)
**Coordinate System**: WGS84 (EPSG:4326) for web mapping

### 2. ONS Codes Reference
Each region must have its official ONS code for consistent identification:
- Countries: E92000001 (England), W92000004 (Wales), etc.
- Counties: E10000008 (Devon), E10000016 (Kent), etc.
- Unitary Authorities: E06000052 (Cornwall), E06000059 (Dorset), etc.

## Database Structure

### Current `regions` Table Schema
```sql
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    region VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL CHECK (level IN ('country', 'county', 'unitary_authority')),
    parent_region_id INTEGER REFERENCES regions(id),
    ons_code VARCHAR(20) UNIQUE NOT NULL,
    boundaries JSONB, -- Complete GeoJSON polygon data
    has_data BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Data Population Strategy

#### Step 1: Load All UK Regions
```sql
-- Example: All regions with complete boundaries
INSERT INTO regions (region, level, parent_region_id, ons_code, boundaries, has_data) VALUES
('England', 'country', NULL, 'E92000001', '{...complete_geojson...}', false),
('Cornwall', 'unitary_authority', 1, 'E06000052', '{...complete_geojson...}', false),
('Devon', 'county', 1, 'E10000008', '{...complete_geojson...}', false),
-- ... all other UK regions
```

#### Step 2: Mark Regions with Survey Data
```sql
-- Update has_data flag for regions with actual survey data
UPDATE regions SET has_data = true 
WHERE ons_code IN (
    'E06000052', -- Cornwall
    'E10000008', -- Devon  
    'E06000059', -- Dorset
    -- ... other regions with survey data
);
```

## Data Preparation Workflow

### Phase 1: Download and Process ONS Data
1. **Download GeoJSON files** from ONS Geoportal
2. **Validate coordinate system** (ensure WGS84/EPSG:4326)
3. **Extract region metadata** (names, ONS codes, hierarchy)
4. **Simplify geometries** if needed for web performance
5. **Validate data completeness** (all UK regions included)

### Phase 2: Database Population
1. **Create data import scripts** (Python/Node.js recommended)
2. **Load all regions** with boundaries and metadata
3. **Set has_data = false** by default for all regions
4. **Update has_data = true** for regions with existing survey data
5. **Validate foreign key relationships** (parent_region_id)

### Phase 3: Data Verification
1. **Visual verification** - render all regions on test map
2. **Data integrity checks** - ensure no missing ONS codes
3. **Performance testing** - check query response times
4. **Boundary accuracy** - spot check against official maps

## Technical Implementation Notes

### GeoJSON Format Requirements
```json
{
  "type": "Polygon",
  "coordinates": [[[lng, lat], [lng, lat], ...]]
}
```

### Performance Considerations
- **Geometry simplification**: Reduce coordinate precision for web use
- **Response size**: Monitor API payload sizes for map rendering
- **Indexing**: Ensure spatial indexes if using PostGIS features
- **Caching**: Consider caching boundary data in frontend

### Frontend Map Behavior
```javascript
// Pseudo-code for map styling
regions.forEach(region => {
  if (region.has_data) {
    // Style: Full color, interactive, clickable
    style = { fillColor: '#2563eb', fillOpacity: 0.7 };
  } else {
    // Style: Grayed out, hatched pattern, less interactive
    style = { fillColor: '#9ca3af', fillOpacity: 0.3, dashArray: '5,5' };
  }
});
```

## Data Maintenance

### Initial Setup
- One-time bulk import of all UK regions
- Mark existing survey data regions as `has_data = true`

### Ongoing Updates
- **New survey data**: Update `has_data = true` for new regions
- **Boundary changes**: Update from ONS when administrative boundaries change
- **Data validation**: Regular checks for data integrity

### Annual Tasks
- **Boundary updates**: Check ONS for updated region boundaries
- **New regions**: Add any new administrative areas
- **Data audit**: Verify `has_data` flags match actual survey data

## Expected Outcomes

### Complete Map Coverage
- All UK regions visible on map
- No gaps or missing areas
- Professional, complete appearance

### Clear Data Availability
- Visual distinction between data/no-data regions
- User-friendly messaging for regions without data
- Intuitive understanding of data coverage

### Future-Proof Structure
- Easy to add survey data for new regions
- Scalable for additional geographic levels
- Maintains data integrity and relationships

## Files to Create

1. **import-scripts/**: Directory for data processing scripts
   - `download-ons-data.js` - Download ONS boundary files
   - `process-boundaries.js` - Convert and prepare GeoJSON
   - `import-regions.sql` - Bulk insert all regions
   - `update-data-flags.sql` - Set has_data flags

2. **data-validation/**: Scripts to verify data integrity
   - `validate-boundaries.js` - Check GeoJSON validity
   - `verify-coverage.sql` - Ensure complete UK coverage
   - `test-queries.sql` - Performance and accuracy tests

This plan ensures complete UK map coverage while maintaining clear data availability indicators for users.