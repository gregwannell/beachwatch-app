# Chart Components Library

A collection of accessible, colorblind-safe chart components built with shadcn/ui and Recharts.

## Components

### HorizontalBarChart
Displays data as horizontal bars, ideal for showing top N items with clear ranking.

**Features:**
- Responsive design with ChartContainer
- Colorblind-safe color palette
- ARIA labels and screen reader support
- Customizable display modes (count/percentage)
- Interactive tooltips

**Usage:**
```tsx
import { HorizontalBarChart } from '@/components/charts'

<HorizontalBarChart
  data={litterData}
  maxItems={5}
  showPercentage={false}
  height={300}
/>
```

### PieChart
Shows proportional data as a pie chart with optional legend.

**Features:**
- Donut-style with inner radius for better readability
- Accessible color palette
- Screen reader descriptions
- Interactive tooltips with percentages
- Customizable legend display

**Usage:**
```tsx
import { PieChart } from '@/components/charts'

<PieChart
  data={breakdownData}
  showLegend={true}
  showPercentage={true}
  height={300}
/>
```

## Accessibility Features

### Colorblind Safety
- Uses scientifically-tested color combinations
- Distinct colors for deuteranopia, protanopia, and tritanopia
- High contrast ratios meeting WCAG guidelines
- Pattern fallbacks available for additional distinction

### Screen Reader Support
- Comprehensive ARIA labels describing chart content
- Hidden descriptions with detailed data breakdown
- Proper role attributes (`role="img"`)
- Keyboard navigation support through shadcn/ui

### Visual Accessibility
- Respects `prefers-reduced-motion` for animations
- High contrast mode detection
- Scalable typography and spacing
- Focus indicators for interactive elements

## Data Format

### BarChartData
```typescript
interface BarChartData {
  name: string      // Display label
  value: number     // Numeric value
  category: string  // Optional grouping
}
```

### PieChartData
```typescript
interface PieChartData {
  name: string      // Display label
  value: number     // Numeric value
  fill?: string     // Optional custom color
}
```

## Color Palette

The components use CSS custom properties that adapt to light/dark themes:

- `--chart-1`: Orange-ish (deuteranopia/protanopia safe)
- `--chart-2`: Blue (universally safe)
- `--chart-3`: Purple/violet (high contrast)
- `--chart-4`: Green-yellow (distinguishable)
- `--chart-5`: Red-orange (colorblind safe)

## Best Practices

1. **Data Preparation**: Sort data by value for bar charts to show clear ranking
2. **Labels**: Use descriptive names that make sense without context
3. **Size Limits**: Limit to 5-7 items for optimal readability
4. **Testing**: Test with screen readers and colorblind simulators
5. **Responsive**: Always test on mobile devices for touch interactions