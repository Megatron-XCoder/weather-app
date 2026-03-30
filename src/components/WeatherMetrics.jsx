import { getAQILabel, getUVLabel, getWeatherIcon, getWeatherDescription, formatTime } from '../lib/weatherUtils'
import { Thermometer, Droplets, Wind, Eye, Sun, Sunset, Gauge, Activity, CloudFog, Zap } from 'lucide-react'

// Elegant Bento Card
function MetricCard({ icon, label, value, unit, sub, color = '#3b82f6', bgGlow, delay = 0 }) {
  return (
    <div 
      className="glass-card glass-card-hover animate-fade-in-up p-4 md:p-5 flex flex-col justify-between min-h-[120px] md:min-h-[140px]"
      style={{ animationDelay: `${delay}s`, boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.05)` }}
    >
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ background: color }} />
          {icon}
        </div>
        <span className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">{label}</span>
      </div>
      
      <div className="mt-3 md:mt-4 flex flex-col gap-1">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight">
            {value !== null && value !== undefined ? value : '—'}
          </span>
          {unit && <span className="text-xs md:text-sm font-medium text-zinc-500">{unit}</span>}
        </div>
        {sub && <span className="text-[10px] md:text-xs font-medium text-zinc-500">{sub}</span>}
      </div>
      
      {/* Decorative subtle accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 hidden">
        <div className="h-full opacity-20" style={{ background: color, width: '40%' }} />
      </div>
    </div>
  )
}

function AQICard({ label, value, unit, color }) {
  return (
    <div className="flex flex-col gap-1.5 p-3 md:p-4 rounded-[1.25rem] bg-black/40 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="absolute top-0 right-0 w-16 h-16 opacity-10 bg-gradient-to-br transition-opacity group-hover:opacity-20" 
        style={{ from: color, to: 'transparent', borderRadius: '0 0 0 100%' }} />
      <span className="text-[10px] md:text-[11px] text-zinc-400 font-bold tracking-widest uppercase">{label}</span>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-xl md:text-2xl font-display font-medium text-white tracking-tight">
          {value ?? '—'}
        </span>
        {unit && <span className="text-[9px] md:text-[10px] text-zinc-500 font-medium uppercase">{unit}</span>}
      </div>
      {/* Visual Bar */}
      {value !== null && value !== undefined && typeof value === 'number' && (
        <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000 ease-out" 
            style={{ 
              width: `${Math.min((value / (label === 'CO' ? 1000 : 100)) * 100, 100)}%`,
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}`
            }} 
          />
        </div>
      )}
    </div>
  )
}

export default function WeatherMetrics({ weatherData, aqiData, selectedDate }) {
  if (!weatherData || !aqiData) return null

  const { weather, aqi } = { weather: weatherData, aqi: aqiData }

  // Daily values
  const daily = weather.daily
  const dayIdx = 0 
  const tempMax = daily?.temperature_2m_max?.[dayIdx]
  const tempMin = daily?.temperature_2m_min?.[dayIdx]
  const precipitation = daily?.precipitation_sum?.[dayIdx]
  const sunrise = daily?.sunrise?.[dayIdx]
  const sunset = daily?.sunset?.[dayIdx]
  const windMax = daily?.windspeed_10m_max?.[dayIdx]
  const uvIndex = daily?.uv_index_max?.[dayIdx]
  const precipProbMax = daily?.precipitation_probability_max?.[dayIdx]

  // Current temp
  const currentTemp = weather.current_weather?.temperature
  const weatherCode = weather.current_weather?.weathercode
  const isDay = weather.current_weather?.is_day

  // Hourly humidity - nearest
  const hourlyHumidity = weather.hourly?.relativehumidity_2m
  const nowHour = new Date().getHours()
  const humidity = hourlyHumidity?.[nowHour] ?? hourlyHumidity?.[0]

  // AQI current values
  const current = aqi.current
  const pm10 = current?.pm10
  const pm25 = current?.pm2_5
  const co = current?.carbon_monoxide
  const no2 = current?.nitrogen_dioxide
  const so2 = current?.sulphur_dioxide
  const aqiVal = current?.european_aqi

  const aqiInfo = getAQILabel(aqiVal)
  const uvInfo = getUVLabel(uvIndex)

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 mt-4 md:mt-8">
      {/* Hero Huge weather card */}
      <div className="md:col-span-12 lg:col-span-8 lg:col-start-3 relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-white/5 animate-fade-in-up group"
        style={{ 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.02)',
        }}>
        
        {/* Abstract animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-blue-950 transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute top-[-20%] right-[-10%] w-[100%] md:w-[70%] h-[150%] bg-gradient-to-b from-cyan-500/10 to-blue-600/10 blur-[100px] rounded-full transform rotate-12 pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-70" />
        <div className="bg-grid-pattern opacity-30 mix-blend-overlay transition-opacity duration-700 group-hover:opacity-40" />

        <div className="relative p-6 sm:p-8 md:p-14 lg:p-16 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 md:gap-8 z-0">
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left w-full">
            <div className="flex items-center gap-3 mb-2 md:mb-4">
              <span className="text-5xl md:text-7xl filter drop-shadow-2xl">
                {getWeatherIcon(weatherCode, isDay)}
              </span>
              <div className="flex flex-col text-left">
                <span className="text-base md:text-xl font-medium text-zinc-200 tracking-tight">
                  {getWeatherDescription(weatherCode)}
                </span>
                <span className="text-[10px] md:text-xs font-bold text-cyan-400 tracking-widest uppercase">
                  Current Condition
                </span>
              </div>
            </div>
            
            <div className="flex items-start mt-2 md:mt-4">
              <span className="text-[90px] md:text-[150px] leading-none font-display font-medium text-white tracking-tighter"
                style={{ textShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 100px rgba(255,255,255,0.1)' }}>
                {currentTemp !== undefined ? Math.round(currentTemp) : '—'}
              </span>
              <span className="text-3xl md:text-5xl font-display font-light text-zinc-400 mt-2 md:mt-6 tracking-tighter">°C</span>
            </div>

            {/* Inline High/Low */}
            <div className="flex items-center gap-6 mt-4 md:mt-6 px-6 py-2.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md shadow-inner">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">High</span>
                <span className="text-lg font-display font-medium text-white tracking-tight">{tempMax !== undefined ? Math.round(tempMax) : '—'}°</span>
              </div>
              <div className="w-px h-4 bg-white/10"></div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Low</span>
                <span className="text-lg font-display font-medium text-zinc-300 tracking-tight">{tempMin !== undefined ? Math.round(tempMin) : '—'}°</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Droplets size={16} strokeWidth={2.5} className="text-cyan-400" />}
          label="Precipitation"
          value={precipitation !== undefined ? precipitation : '—'}
          unit="mm"
          color="#06b6d4"
          delay={0.1}
        />
        <MetricCard
          icon={<Sun size={16} strokeWidth={2.5} className="text-amber-400" />}
          label="Sunrise"
          value={formatTime(sunrise)}
          color="#f59e0b"
          delay={0.15}
        />
        <MetricCard
          icon={<Sunset size={16} strokeWidth={2.5} className="text-rose-400" />}
          label="Sunset"
          value={formatTime(sunset)}
          color="#f43f5e"
          delay={0.2}
        />
        <MetricCard
          icon={<Wind size={16} strokeWidth={2.5} className="text-indigo-400" />}
          label="Max Wind"
          value={windMax !== undefined ? Math.round(windMax) : '—'}
          unit="km/h"
          color="#6366f1"
          delay={0.25}
        />
        <MetricCard
          icon={<CloudFog size={16} strokeWidth={2.5} className="text-blue-400" />}
          label="Humidity"
          value={humidity !== undefined ? Math.round(humidity) : '—'}
          unit="%"
          color="#3b82f6"
          delay={0.3}
        />
        <MetricCard
          icon={<Zap size={16} strokeWidth={2.5} className={uvInfo.color} style={{ color: uvInfo.color }} />}
          label="UV Index"
          value={uvIndex !== undefined ? uvIndex : '—'}
          sub={`Condition: ${uvInfo.label}`}
          color={uvInfo.color}
          delay={0.35}
        />
        <MetricCard
          icon={<Droplets size={16} strokeWidth={2.5} className="text-emerald-400" />}
          label="Precip. Prob."
          value={precipProbMax !== undefined ? precipProbMax : '—'}
          unit="%"
          color="#10b981"
          delay={0.4}
        />
        
        {/* Special AQI Bento Block */}
        <div className="glass-card glass-card-hover animate-fade-in-up p-4 md:p-5 flex flex-col justify-between col-span-1 border-l-4"
          style={{ animationDelay: '0.45s', borderLeftColor: aqiInfo.color, background: `linear-gradient(135deg, ${aqiInfo.color}15, transparent)` }}>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ background: aqiInfo.color }} />
              <Activity size={16} strokeWidth={2.5} style={{ color: aqiInfo.color }} />
            </div>
            <span className="text-[10px] md:text-xs text-zinc-400 font-semibold uppercase tracking-widest">Air Quality</span>
          </div>
          <div className="mt-3 md:mt-4 flex flex-col gap-1">
            <span className="text-3xl md:text-4xl font-display font-medium tracking-tighter" style={{ color: aqiInfo.color, textShadow: `0 0 20px ${aqiInfo.color}40` }}>
              {aqiVal ?? '—'}
            </span>
            <span className="text-sm font-semibold tracking-wide uppercase mt-1" style={{ color: aqiInfo.color }}>{aqiInfo.label}</span>
          </div>
        </div>
      </div>

      {/* Advanced Air Quality Detail Panel */}
      <div className="md:col-span-12 glass-card p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-white tracking-tight">Pollutant Breakdown</h3>
            <p className="text-xs text-zinc-500 font-medium tracking-wide">Detailed air quality metrics in μg/m³</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <AQICard label="PM10" value={pm10 !== undefined && pm10 !== null ? Math.round(pm10) : '—'} unit="μg/m³" color="#f59e0b" />
          <AQICard label="PM2.5" value={pm25 !== undefined && pm25 !== null ? Math.round(pm25) : '—'} unit="μg/m³" color="#ef4444" />
          <AQICard label="CO" value={co !== undefined && co !== null ? Math.round(co) : '—'} unit="μg/m³" color="#6366f1" />
          <AQICard label="CO₂" value="N/A" color="#8b5cf6" />
          <AQICard label="NO₂" value={no2 !== undefined && no2 !== null ? Math.round(no2) : '—'} unit="μg/m³" color="#ec4899" />
          <AQICard label="SO₂" value={so2 !== undefined && so2 !== null ? Math.round(so2) : '—'} unit="μg/m³" color="#06b6d4" />
        </div>
      </div>
    </div>
  )
}
