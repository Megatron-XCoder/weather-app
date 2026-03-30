/**
 * Utility functions for weather data processing
 */

export function getAQILabel(aqi) {
  if (aqi === null || aqi === undefined) return { label: 'N/A', color: '#64748b', bg: 'rgba(100,116,139,0.2)' }
  if (aqi <= 20) return { label: 'Good', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' }
  if (aqi <= 40) return { label: 'Fair', color: '#86efac', bg: 'rgba(134,239,172,0.15)' }
  if (aqi <= 60) return { label: 'Moderate', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' }
  if (aqi <= 80) return { label: 'Poor', color: '#f97316', bg: 'rgba(249,115,22,0.15)' }
  if (aqi <= 100) return { label: 'Very Poor', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' }
  return { label: 'Hazardous', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' }
}

export function getUVLabel(uv) {
  if (uv === null || uv === undefined) return { label: 'N/A', color: '#64748b' }
  if (uv <= 2) return { label: 'Low', color: '#22c55e' }
  if (uv <= 5) return { label: 'Moderate', color: '#f59e0b' }
  if (uv <= 7) return { label: 'High', color: '#f97316' }
  if (uv <= 10) return { label: 'Very High', color: '#ef4444' }
  return { label: 'Extreme', color: '#7c3aed' }
}

export function celsiusToFahrenheit(c) {
  if (c === null || c === undefined) return null
  return Math.round(((c * 9) / 5 + 32) * 10) / 10
}

export function getWindDirection(degrees) {
  if (degrees === null || degrees === undefined) return 'N/A'
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round((degrees % 360) / 22.5)
  return dirs[index % 16]
}

export function formatTime(isoString) {
  if (!isoString) return 'N/A'
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  } catch {
    return 'N/A'
  }
}

export function formatTimeIST(isoString) {
  if (!isoString) return 'N/A'
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    })
  } catch {
    return 'N/A'
  }
}

export function getWeatherIcon(code, isDay = true) {
  // WMO Weather code interpretation
  if (code === 0) return isDay ? '☀️' : '🌙'
  if (code <= 2) return isDay ? '🌤️' : '🌙'
  if (code === 3) return '☁️'
  if (code <= 49) return '🌫️' // fog/mist/rime
  if (code <= 57) return '🌧️' // drizzle
  if (code <= 67) return '🌧️' // rain
  if (code <= 77) return '🌨️' // snow
  if (code <= 82) return '🌦️' // rain showers
  if (code <= 86) return '❄️' // snow showers
  if (code <= 99) return '⛈️' // thunderstorm
  return '🌡️'
}

export function getWeatherDescription(code) {
  const descriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Icy fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail',
  }
  return descriptions[code] || 'Unknown'
}

export function formatDateLabel(dateStr, granularity = 'day') {
  const date = new Date(dateStr)
  if (granularity === 'month') {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function generateColors(count) {
  const palette = [
    '#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b',
    '#22c55e', '#f97316', '#ec4899', '#14b8a6',
  ]
  return Array.from({ length: count }, (_, i) => palette[i % palette.length])
}
