export type MapTheme = 'light' | 'dark'

export interface MapTileConfig {
  url: string
  attribution: string
  name: string
}

/**
 * CARTO basemap key. Public by design — it travels in every tile request, so
 * CARTO scopes it by domain rather than treating it as a secret. Without it,
 * tiles render with an "API KEY REQUIRED" watermark.
 */
const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_BASEMAP_API_KEY

const cartoTileUrl = (style: 'light_all' | 'dark_all') => {
  const base = `https://{s}.basemaps.cartocdn.com/rastertiles/${style}/{z}/{x}/{y}{r}.png`
  return CARTO_KEY ? `${base}?key=${CARTO_KEY}` : base
}

const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

export const MAP_THEMES: Record<MapTheme, MapTileConfig> = {
  light: {
    url: cartoTileUrl('light_all'),
    attribution: CARTO_ATTRIBUTION,
    name: 'Light Theme'
  },
  dark: {
    url: cartoTileUrl('dark_all'),
    attribution: CARTO_ATTRIBUTION,
    name: 'Dark Theme'
  }
}

export const DEFAULT_MAP_THEME: MapTheme = 'light'
