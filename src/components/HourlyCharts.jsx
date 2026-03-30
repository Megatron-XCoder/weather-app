import { useState, useRef } from 'react'
import {
  ComposedChart, LineChart, BarChart, AreaChart,
  Line, Bar, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  Brush
} from 'recharts'
import { ZoomIn, ZoomOut, RotateCcw, Activity, Droplets } from 'lucide-react'
import { celsiusToFahrenheit, getWeatherIcon } from '../lib/weatherUtils'

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="recharts-default-tooltip">
      <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-3 mt-1">
          <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ background: entry.color }} />
          <span className="text-white font-display font-medium text-lg tracking-tight">
            {entry.value !== null ? `${entry.value}${unit || entry.unit || ''}` : 'N/A'}
          </span>
          <span className="text-zinc-400 text-xs font-medium ml-1">{entry.name}</span>
        </div>
      ))}
    </div>
  )
}

function ChartWrapper({ title, children, subtitle, icon, delay = 0 }) {
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef(null)

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.5, 4))
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.5, 1))
  const handleReset = () => setZoom(1)

  const chartWidth = Math.max(700, 700 * zoom)

  return (
    <div className="glass-card animate-fade-in-up flex flex-col h-full" style={{ animationDelay: `${delay}s` }}>
      <div className="p-6 pb-2 flex items-start justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            {icon}
          </div>
          <div>
            <h3 className="text-base font-display font-semibold text-white tracking-tight">{title}</h3>
            {subtitle && <p className="text-[11px] text-zinc-500 font-medium tracking-wide uppercase mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-black/20 rounded-full p-1 border border-white/5 backdrop-blur-md">
          <button onClick={handleZoomOut} disabled={zoom <= 1}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30"
            title="Zoom out"><ZoomOut size={14} strokeWidth={2} /></button>
          <span className="text-[10px] font-bold text-zinc-500 w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} disabled={zoom >= 4}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30"
            title="Zoom in"><ZoomIn size={14} strokeWidth={2} /></button>
          <div className="w-px h-3 bg-white/10 mx-1" />
          <button onClick={handleReset}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-white/10 text-zinc-400 hover:text-white"
            title="Reset"><RotateCcw size={14} strokeWidth={2} /></button>
        </div>
      </div>

      <div ref={containerRef} className="chart-scroll-container overflow-x-auto px-6 pb-6 pt-4 flex-grow z-0">
        <div style={{ width: chartWidth, minWidth: '100%', height: '100%' }}>
          {children({ chartWidth })}
        </div>
      </div>
    </div>
  )
}

export default function HourlyCharts({ weather, aqi, isFahrenheit, onToggleFahrenheit }) {
  if (!weather || !aqi) return null

  const hours = weather.hourly?.time?.map(t => {
    const d = new Date(t)
    return `${String(d.getHours()).padStart(2, '0')}:00`
  }) || []

  const temps = weather.hourly?.temperature_2m || []
  const humidity = weather.hourly?.relativehumidity_2m || []
  const precipitation = weather.hourly?.precipitation || []
  const visibility = weather.hourly?.visibility || []
  const windspeed = weather.hourly?.windspeed_10m || []
  const pm10 = aqi.hourly?.pm10 || []
  const pm25 = aqi.hourly?.pm2_5 || []
  const weatherCodes = weather.hourly?.weathercode || []

  const tempData = hours.map((h, i) => ({
    time: h,
    temp: temps[i] !== undefined
      ? (isFahrenheit ? celsiusToFahrenheit(temps[i]) : Math.round(temps[i] * 10) / 10)
      : null,
  }))

  const humidityData = hours.map((h, i) => ({
    time: h,
    humidity: humidity[i] !== undefined ? Math.round(humidity[i]) : null,
  }))

  const precipData = hours.map((h, i) => ({
    time: h,
    precipitation: precipitation[i] !== undefined ? Math.round(precipitation[i] * 100) / 100 : null,
  }))

  const visibilityData = hours.map((h, i) => ({
    time: h,
    visibility: visibility[i] !== undefined ? Math.round(visibility[i] / 1000 * 10) / 10 : null,
  }))

  const windData = hours.map((h, i) => ({
    time: h,
    windspeed: windspeed[i] !== undefined ? Math.round(windspeed[i] * 10) / 10 : null,
  }))

  const aqiData = hours.map((h, i) => ({
    time: h,
    pm10: pm10[i] !== undefined ? Math.round(pm10[i] * 10) / 10 : null,
    pm25: pm25[i] !== undefined ? Math.round(pm25[i] * 10) / 10 : null,
  }))

  const axisStyle = { fill: '#71717a', fontSize: 10, fontWeight: 600, fontFamily: 'Outfit, sans-serif' }
  const gridStyle = { stroke: 'rgba(255,255,255,0.03)', strokeDasharray: '4 4' }

  return (
    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[inset_0_1px_rgba(255,255,255,0.1)]">
            <Activity size={16} className="text-blue-400" />
          </div>
          <h2 className="text-xl font-display font-semibold text-white tracking-tight"> Hourly Forecast </h2>
        </div>
        
        <div className="toggle-pill">
          <button
            onClick={() => onToggleFahrenheit(false)}
            className={`toggle-btn ${!isFahrenheit ? 'active' : 'inactive'}`}
          >
            °C
          </button>
          <button
            onClick={() => onToggleFahrenheit(true)}
            className={`toggle-btn ${isFahrenheit ? 'active' : 'inactive'}`}
          >
            °F
          </button>
        </div>
      </div>

      {/* Premium Horizontal Scroll Forecast */}
      <div className="glass-card p-4 md:p-6 mb-8 overflow-hidden rounded-[24px]">
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 hide-scroll-bar" style={{ scrollbarWidth: 'none' }}>
          {tempData.map((d, i) => {
            const hourInt = parseInt(d.time.split(':')[0])
            const isDay = hourInt >= 6 && hourInt <= 18
            const popVal = precipitation[i] > 0 ? Math.round(precipitation[i] * 10) / 10 : null
            // Show up to 24 hours
            if (i > 24) return null
            return (
              <div key={i} className="flex flex-col items-center justify-between min-w-[70px] shrink-0 py-2 hover-scale">
                <span className="text-zinc-400 text-sm font-semibold mb-3">{d.time}</span>
                <span className="text-3xl mb-3 drop-shadow-lg filter transition-transform hover:scale-110">
                  {getWeatherIcon(weatherCodes[i], isDay)}
                </span>
                <span className="text-white font-display font-medium text-lg tracking-tight mb-2">
                  {d.temp !== null ? `${Math.round(d.temp)}°` : '—'}
                </span>
                <div className="h-4 flex items-center justify-center">
                  {popVal ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400">
                      <Droplets size={10} /> {popVal}mm
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature */}
        <ChartWrapper title="Temperature" subtitle={`Hourly in ${isFahrenheit ? '°F' : '°C'}`} icon={<span className="text-lg">🌡️</span>} delay={0.1}>
          {({ chartWidth }) => (
            <AreaChart data={tempData} width={chartWidth} height={260} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradPulse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} {...gridStyle} />
              <XAxis dataKey="time" tick={axisStyle} interval={2} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={axisStyle} unit={isFahrenheit ? '°F' : '°C'} tickLine={false} axisLine={false} width={45} dx={-10} />
              <Tooltip content={<CustomTooltip unit={isFahrenheit ? '°F' : '°C'} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="temp" stroke="#3b82f6" fill="url(#tempGradPulse)" strokeWidth={3} name="Temperature" dot={false} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          )}
        </ChartWrapper>

        {/* Relative Humidity */}
        <ChartWrapper title="Relative Humidity" subtitle="Hourly percentage" icon={<span className="text-lg">💧</span>} delay={0.2}>
          {({ chartWidth }) => (
            <AreaChart data={humidityData} width={chartWidth} height={260} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="humGradPulse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} {...gridStyle} />
              <XAxis dataKey="time" tick={axisStyle} interval={2} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={axisStyle} unit="%" domain={[0, 100]} tickLine={false} axisLine={false} width={45} dx={-10} />
              <Tooltip content={<CustomTooltip unit="%" />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="humidity" stroke="#06b6d4" fill="url(#humGradPulse)" strokeWidth={3} name="Humidity" dot={false} activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          )}
        </ChartWrapper>

        {/* Precipitation */}
        <ChartWrapper title="Precipitation" subtitle="Hourly total in mm" icon={<span className="text-lg">🌧️</span>} delay={0.3}>
          {({ chartWidth }) => (
            <BarChart data={precipData} width={chartWidth} height={260} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} {...gridStyle} />
              <XAxis dataKey="time" tick={axisStyle} interval={2} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={axisStyle} unit="mm" tickLine={false} axisLine={false} width={45} dx={-10} />
              <Tooltip content={<CustomTooltip unit=" mm" />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="precipitation" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Precipitation" maxBarSize={40} />
            </BarChart>
          )}
        </ChartWrapper>

        {/* Visibility */}
        <ChartWrapper title="Visibility" subtitle="Hourly distance in km" icon={<span className="text-lg">👁️</span>} delay={0.4}>
          {({ chartWidth }) => (
            <AreaChart data={visibilityData} width={chartWidth} height={260} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="visGradPulse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} {...gridStyle} />
              <XAxis dataKey="time" tick={axisStyle} interval={2} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={axisStyle} unit="km" tickLine={false} axisLine={false} width={45} dx={-10} />
              <Tooltip content={<CustomTooltip unit=" km" />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Area type="monotone" dataKey="visibility" stroke="#8b5cf6" fill="url(#visGradPulse)" strokeWidth={3} name="Visibility" dot={false} activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          )}
        </ChartWrapper>

        {/* Wind Speed */}
        <ChartWrapper title="Wind Speed" subtitle="Hourly at 10m height (km/h)" icon={<span className="text-lg">💨</span>} delay={0.5}>
          {({ chartWidth }) => (
            <AreaChart data={windData} width={chartWidth} height={260} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="windGradPulse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} {...gridStyle} />
              <XAxis dataKey="time" tick={axisStyle} interval={2} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={axisStyle} unit="km" tickLine={false} axisLine={false} width={45} dx={-10} />
              <Tooltip content={<CustomTooltip unit=" km/h" />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Area type="monotone" dataKey="windspeed" stroke="#10b981" fill="url(#windGradPulse)" strokeWidth={3} name="Wind Speed" dot={false} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          )}
        </ChartWrapper>

        {/* PM10 & PM2.5 Combined */}
        <ChartWrapper title="PM10 & PM2.5" subtitle="Hourly air quality in μg/m³" icon={<span className="text-lg">🫁</span>} delay={0.6}>
          {({ chartWidth }) => (
            <ComposedChart data={aqiData} width={chartWidth} height={260} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pm10Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pm25Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} {...gridStyle} />
              <XAxis dataKey="time" tick={axisStyle} interval={2} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={axisStyle} unit="μg" tickLine={false} axisLine={false} width={45} dx={-10} />
              <Tooltip content={<CustomTooltip unit=" μg/m³" />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, fontFamily: 'Outfit, sans-serif', color: '#a1a1aa', paddingTop: '10px' }} iconType="circle" />
              <Area type="monotone" dataKey="pm10" stroke="#f59e0b" fill="url(#pm10Grad)" strokeWidth={2.5} name="PM10" dot={false} activeDot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="pm25" stroke="#ef4444" fill="url(#pm25Grad)" strokeWidth={2.5} name="PM2.5" dot={false} activeDot={{ r: 5, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
            </ComposedChart>
          )}
        </ChartWrapper>
      </div>
    </div>
  )
}
