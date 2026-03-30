import { useState, useRef } from 'react'
import {
  LineChart, Line, BarChart, Bar,
  ComposedChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import { ZoomIn, ZoomOut, RotateCcw, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { formatTimeIST, getWindDirection } from '../lib/weatherUtils'

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="recharts-default-tooltip">
      <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-3 mt-1">
          <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ background: entry.color }} />
          <span className="text-white font-display font-medium text-lg tracking-tight">
            {entry.value !== null ? `${entry.value}${entry.unit || unit || ''}` : 'N/A'}
          </span>
          <span className="text-zinc-400 text-xs font-medium ml-1">{entry.name}</span>
        </div>
      ))}
    </div>
  )
}

function ChartWrapper({ title, children, subtitle, icon, delay = 0 }) {
  const [zoom, setZoom] = useState(1)

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.5, 5))
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.5, 1))
  const handleReset = () => setZoom(1)

  const baseWidth = 900
  const chartWidth = Math.max(baseWidth, baseWidth * zoom)

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
          <button onClick={handleZoomIn} disabled={zoom >= 5}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30"
            title="Zoom in"><ZoomIn size={14} strokeWidth={2} /></button>
          <div className="w-px h-3 bg-white/10 mx-1" />
          <button onClick={handleReset}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-white/10 text-zinc-400 hover:text-white"
            title="Reset"><RotateCcw size={14} strokeWidth={2} /></button>
        </div>
      </div>
      <div className="chart-scroll-container overflow-x-auto px-6 pb-6 pt-4 flex-grow z-0">
        <div style={{ width: chartWidth, minWidth: '100%', height: '100%' }}>
          {children({ chartWidth })}
        </div>
      </div>
    </div>
  )
}

export default function HistoricalCharts({ weather, aqi }) {
  if (!weather || !aqi) return null

  const daily = weather.daily
  const aiqdaily = aqi.daily
  const dates = daily?.time || []

  const totalDays = dates.length
  const labelFn = (dateStr) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      if (totalDays > 60) return format(d, 'MMM yy')
      return format(d, 'MMM d')
    } catch { return dateStr }
  }

  const tempData = dates.map((d, i) => ({
    date: labelFn(d),
    max: daily.temperature_2m_max?.[i] !== undefined ? Math.round(daily.temperature_2m_max[i] * 10) / 10 : null,
    min: daily.temperature_2m_min?.[i] !== undefined ? Math.round(daily.temperature_2m_min[i] * 10) / 10 : null,
    mean: daily.temperature_2m_mean?.[i] !== undefined ? Math.round(daily.temperature_2m_mean[i] * 10) / 10 : null,
  }))

  const toDecimalHourIST = (isoStr) => {
    if (!isoStr) return null
    try {
      const d = new Date(isoStr)
      const istMs = d.getTime() + (5.5 * 60 * 60 * 1000)
      const istDate = new Date(istMs)
      return +(istDate.getUTCHours() + istDate.getUTCMinutes() / 60).toFixed(2)
    } catch { return null }
  }

  const sunData = dates.map((d, i) => ({
    date: labelFn(d),
    sunrise: toDecimalHourIST(daily.sunrise?.[i]),
    sunset: toDecimalHourIST(daily.sunset?.[i]),
    sunriseLabel: formatTimeIST(daily.sunrise?.[i]),
    sunsetLabel: formatTimeIST(daily.sunset?.[i]),
  }))

  const precipData = dates.map((d, i) => ({
    date: labelFn(d),
    precipitation: daily.precipitation_sum?.[i] !== undefined ? Math.round(daily.precipitation_sum[i] * 100) / 100 : null,
  }))

  const windData = dates.map((d, i) => ({
    date: labelFn(d),
    windspeed: daily.windspeed_10m_max?.[i] !== undefined ? Math.round(daily.windspeed_10m_max[i] * 10) / 10 : null,
    direction: daily.winddirection_10m_dominant?.[i] !== undefined ? getWindDirection(daily.winddirection_10m_dominant[i]) : null,
  }))

  const aqiChartData = dates.map((d, i) => ({
    date: labelFn(d),
    pm10: aiqdaily?.pm10_max?.[i] !== undefined ? Math.round(aiqdaily.pm10_max[i] * 10) / 10 : null,
    pm25: aiqdaily?.pm2_5_max?.[i] !== undefined ? Math.round(aiqdaily.pm2_5_max[i] * 10) / 10 : null,
  }))

  const xInterval = totalDays > 180 ? Math.floor(totalDays / 24) : totalDays > 60 ? Math.floor(totalDays / 16) : 'preserveStartEnd'
  const axisStyle = { fill: '#71717a', fontSize: 10, fontWeight: 600, fontFamily: 'Outfit, sans-serif' }
  const gridStyle = { stroke: 'rgba(255,255,255,0.03)', strokeDasharray: '4 4' }

  const SunTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const sr = payload.find(p => p.dataKey === 'sunrise')
    const ss = payload.find(p => p.dataKey === 'sunset')
    const srd = sunData.find(d => d.date === label)
    return (
      <div className="recharts-default-tooltip">
        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-2">{label}</p>
        {srd && <>
          {sr && <div className="flex items-center gap-3 mt-1"><div className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] bg-amber-400" /><span className="text-white font-display font-medium text-lg tracking-tight">Sunrise: {srd.sunriseLabel}</span></div>}
          {ss && <div className="flex items-center gap-3 mt-1"><div className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] bg-rose-400" /><span className="text-white font-display font-medium text-lg tracking-tight">Sunset: {srd.sunsetLabel}</span></div>}
        </>}
      </div>
    )
  }

  const WindTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const wd = windData.find(d => d.date === label)
    return (
      <div className="recharts-default-tooltip">
        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-2">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-3 mt-1">
            <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ background: entry.color }} />
            <span className="text-white font-display font-medium text-lg tracking-tight">{entry.value !== null ? entry.value : 'N/A'} km/h</span>
            <span className="text-zinc-400 text-xs font-medium ml-1">{entry.name}</span>
          </div>
        ))}
        {wd?.direction && (
          <div className="flex items-center gap-3 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            <span className="text-white font-display font-medium text-lg tracking-tight">Direction: <span className="text-zinc-300">{wd.direction}</span></span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
      <div className="col-span-1 md:col-span-12 flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <TrendingUp size={16} className="text-purple-400" />
          </div>
          <h2 className="text-xl font-display font-semibold text-white tracking-tight"> Trend Analysis </h2>
        </div>
      </div>

      <div className="col-span-1 md:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Trends */}
        <ChartWrapper title="Temperature Trends" subtitle="Daily Max, Mean & Min in °C" icon={<span className="text-lg">🌡️</span>} delay={0.1}>
          {({ chartWidth }) => (
            <ComposedChart data={tempData} width={chartWidth} height={260} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} {...gridStyle} />
              <XAxis dataKey="date" tick={axisStyle} interval={xInterval} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={axisStyle} unit="°C" tickLine={false} axisLine={false} width={45} dx={-10} />
              <Tooltip content={<CustomTooltip unit="°C" />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, fontFamily: 'Outfit, sans-serif', color: '#a1a1aa', paddingTop: '10px' }} iconType="circle" />
              <Area type="monotone" dataKey="max" stroke="#ef4444" fill="url(#maxGrad)" strokeWidth={2} name="Max" dot={false} activeDot={{ r: 5, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
              <Line type="monotone" dataKey="mean" stroke="#f59e0b" strokeWidth={2.5} name="Mean" dot={false} activeDot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="min" stroke="#3b82f6" fill="url(#minGrad)" strokeWidth={2} name="Min" dot={false} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
            </ComposedChart>
          )}
        </ChartWrapper>

        {/* Sunrise & Sunset */}
        <ChartWrapper title="Sun Cycle (IST)" subtitle="Daily sunrise & sunset times" icon={<span className="text-lg">🌅</span>} delay={0.2}>
          {({ chartWidth }) => (
            <ComposedChart data={sunData} width={chartWidth} height={260} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} {...gridStyle} />
              <XAxis dataKey="date" tick={axisStyle} interval={xInterval} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={axisStyle} domain={[4, 20]} tickLine={false} axisLine={false} width={55} dx={-10} tickFormatter={v => {
                const h = Math.floor(v); const m = Math.round((v-h)*60);
                return `${h>12?h-12:h||12}:${String(m).padStart(2,'0')}${h>=12?'p':'a'}`
              }} />
              <Tooltip content={<SunTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, fontFamily: 'Outfit, sans-serif', color: '#a1a1aa', paddingTop: '10px' }} iconType="circle" />
              <Line type="monotone" dataKey="sunrise" stroke="#f59e0b" strokeWidth={3} name="Sunrise" dot={false} activeDot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }} />
              <Line type="monotone" dataKey="sunset" stroke="#f43f5e" strokeWidth={3} name="Sunset" dot={false} activeDot={{ r: 5, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }} />
            </ComposedChart>
          )}
        </ChartWrapper>

        {/* Precipitation */}
        <ChartWrapper title="Precipitation History" subtitle="Daily total in mm" icon={<span className="text-lg">🌧️</span>} delay={0.3}>
          {({ chartWidth }) => (
            <BarChart data={precipData} width={chartWidth} height={260} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} {...gridStyle} />
              <XAxis dataKey="date" tick={axisStyle} interval={xInterval} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={axisStyle} unit="mm" tickLine={false} axisLine={false} width={45} dx={-10} />
              <Tooltip content={<CustomTooltip unit=" mm" />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="precipitation" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Precipitation" maxBarSize={40} />
            </BarChart>
          )}
        </ChartWrapper>

        {/* Wind Speed & Direction */}
        <ChartWrapper title="Max Wind Speed" subtitle="Daily max in km/h with dominant direction" icon={<span className="text-lg">💨</span>} delay={0.4}>
          {({ chartWidth }) => (
            <ComposedChart data={windData} width={chartWidth} height={260} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="windHistGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} {...gridStyle} />
              <XAxis dataKey="date" tick={axisStyle} interval={xInterval} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={axisStyle} unit="km" tickLine={false} axisLine={false} width={45} dx={-10} />
              <Tooltip content={<WindTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Area type="monotone" dataKey="windspeed" stroke="#10b981" fill="url(#windHistGrad)" strokeWidth={3} name="Max Wind" dot={false} activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
            </ComposedChart>
          )}
        </ChartWrapper>

        {/* PM10 & PM2.5 */}
        <ChartWrapper title="Particulate Matter" subtitle="Daily PM10 & PM2.5 max in μg/m³" icon={<span className="text-lg">🫁</span>} delay={0.5}>
          {({ chartWidth }) => (
            <ComposedChart data={aqiChartData} width={chartWidth} height={260} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="histPm10" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="histPm25" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} {...gridStyle} />
              <XAxis dataKey="date" tick={axisStyle} interval={xInterval} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={axisStyle} unit="μg" tickLine={false} axisLine={false} width={45} dx={-10} />
              <Tooltip content={<CustomTooltip unit=" μg/m³" />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, fontFamily: 'Outfit, sans-serif', color: '#a1a1aa', paddingTop: '10px' }} iconType="circle" />
              <Area type="monotone" dataKey="pm10" stroke="#f59e0b" fill="url(#histPm10)" strokeWidth={2.5} name="PM10" dot={false} activeDot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="pm25" stroke="#ef4444" fill="url(#histPm25)" strokeWidth={2.5} name="PM2.5" dot={false} activeDot={{ r: 5, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
            </ComposedChart>
          )}
        </ChartWrapper>
      </div>
    </div>
  )
}
