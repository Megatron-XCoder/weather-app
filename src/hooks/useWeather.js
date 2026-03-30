import { useState, useEffect } from 'react'
import { format, isBefore, subDays } from 'date-fns'

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive'
const AQI_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'

/**
 * Smartly decides between forecast and archive API based on date.
 * Open-Meteo archive provides data up to yesterday.
 * Forecast provides today + future (and recent past ~92 days).
 */
function getWeatherEndpoint(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr)
  // Use forecast for today and recent dates (within 90 days past)
  const ninetyDaysAgo = subDays(today, 90)
  if (!isBefore(date, ninetyDaysAgo)) {
    return FORECAST_URL
  }
  return ARCHIVE_URL
}

export function useWeatherDay(lat, lon, date) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!lat || !lon) return

    const dateStr = format(date || new Date(), 'yyyy-MM-dd')
    const endpoint = getWeatherEndpoint(dateStr)

    const controller = new AbortController()
    const signal = controller.signal

    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const weatherUrl =
          `${endpoint}?` +
          `latitude=${lat}&longitude=${lon}` +
          `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,windspeed_10m_max,uv_index_max,precipitation_probability_max` +
          `&hourly=temperature_2m,relativehumidity_2m,precipitation,visibility,windspeed_10m,weathercode` +
          `&current_weather=true` +
          `&timezone=auto` +
          `&start_date=${dateStr}&end_date=${dateStr}`

        const aqiUrl =
          `${AQI_URL}?` +
          `latitude=${lat}&longitude=${lon}` +
          `&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,uv_index` +
          `&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,european_aqi` +
          `&timezone=auto` +
          `&start_date=${dateStr}&end_date=${dateStr}`

        const [weatherRes, aqiRes] = await Promise.all([
          fetch(weatherUrl, { signal }),
          fetch(aqiUrl, { signal }),
        ])

        if (!weatherRes.ok) {
          const err = await weatherRes.json().catch(() => ({}))
          throw new Error(err.reason || `Weather API error (${weatherRes.status})`)
        }

        const weatherJson = await weatherRes.json()
        let aqiJson = null

        if (aqiRes.ok) {
          aqiJson = await aqiRes.json()
        } else {
          // AQI might not be available for all historical dates — graceful fallback
          aqiJson = { current: {}, hourly: { time: [], pm10: [], pm2_5: [], carbon_monoxide: [], nitrogen_dioxide: [], sulphur_dioxide: [] } }
        }

        setData({ weather: weatherJson, aqi: aqiJson })
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    return () => controller.abort()
  }, [lat, lon, date && format(date, 'yyyy-MM-dd')])

  return { data, loading, error }
}

export function useWeatherRange(lat, lon, startDate, endDate) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!lat || !lon || !startDate || !endDate) return

    const startStr = format(startDate, 'yyyy-MM-dd')
    const endStr = format(endDate, 'yyyy-MM-dd')

    const controller = new AbortController()
    const signal = controller.signal

    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const ninetyDaysAgo = subDays(today, 90)

        // Determine best endpoint: if start >= 90 days ago, use forecast; else use archive
        const useArchive = isBefore(startDate, ninetyDaysAgo)
        const weatherEndpoint = useArchive ? ARCHIVE_URL : FORECAST_URL

        const weatherUrl =
          `${weatherEndpoint}?` +
          `latitude=${lat}&longitude=${lon}` +
          `&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,sunrise,sunset,windspeed_10m_max,winddirection_10m_dominant` +
          `&timezone=auto` +
          `&start_date=${startStr}&end_date=${endStr}`

        // For air quality historical, use hourly data
        // The air quality API provides daily for recent; for older dates we fetch hourly and extract daily max
        const aqiUrl =
          `${AQI_URL}?` +
          `latitude=${lat}&longitude=${lon}` +
          `&hourly=pm10,pm2_5` +
          `&timezone=auto` +
          `&start_date=${startStr}&end_date=${endStr}`

        const [weatherRes, aqiRes] = await Promise.all([
          fetch(weatherUrl, { signal }),
          fetch(aqiUrl, { signal }),
        ])

        if (!weatherRes.ok) {
          const errBody = await weatherRes.json().catch(() => ({}))
          throw new Error(errBody.reason || `Weather API error (${weatherRes.status})`)
        }

        const weatherJson = await weatherRes.json()
        let processedAqi = { daily: { time: [], pm10_max: [], pm2_5_max: [] } }

        if (aqiRes.ok) {
          const aqiJson = await aqiRes.json()
          // Aggregate hourly PM10/PM2.5 into daily max values
          processedAqi = aggregateHourlyAqiToDaily(aqiJson, weatherJson.daily?.time || [])
        }

        setData({ weather: weatherJson, aqi: processedAqi })
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    return () => controller.abort()
  }, [lat, lon, startDate && format(startDate, 'yyyy-MM-dd'), endDate && format(endDate, 'yyyy-MM-dd')])

  return { data, loading, error }
}

/**
 * Aggregates hourly AQI data into daily max values
 */
function aggregateHourlyAqiToDaily(aqiJson, dailyDates) {
  const hourlyTimes = aqiJson.hourly?.time || []
  const hourlyPm10 = aqiJson.hourly?.pm10 || []
  const hourlyPm25 = aqiJson.hourly?.pm2_5 || []

  // Build a map: date -> {pm10: [], pm25: []}
  const dayMap = {}
  hourlyTimes.forEach((t, i) => {
    const dateKey = t.split('T')[0]
    if (!dayMap[dateKey]) dayMap[dateKey] = { pm10: [], pm25: [] }
    if (hourlyPm10[i] !== null && hourlyPm10[i] !== undefined) dayMap[dateKey].pm10.push(hourlyPm10[i])
    if (hourlyPm25[i] !== null && hourlyPm25[i] !== undefined) dayMap[dateKey].pm25.push(hourlyPm25[i])
  })

  const times = []
  const pm10Max = []
  const pm25Max = []

  const dates = dailyDates.length > 0 ? dailyDates : Object.keys(dayMap).sort()
  dates.forEach(date => {
    times.push(date)
    const dayData = dayMap[date]
    if (dayData && dayData.pm10.length > 0) {
      pm10Max.push(Math.round(Math.max(...dayData.pm10) * 10) / 10)
    } else {
      pm10Max.push(null)
    }
    if (dayData && dayData.pm25.length > 0) {
      pm25Max.push(Math.round(Math.max(...dayData.pm25) * 10) / 10)
    } else {
      pm25Max.push(null)
    }
  })

  return { daily: { time: times, pm10_max: pm10Max, pm2_5_max: pm25Max } }
}
