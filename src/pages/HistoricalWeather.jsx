import { useState } from 'react'
import { subDays } from 'date-fns'
import { useLocation } from '../context/LocationContext'
import { useWeatherRange } from '../hooks/useWeather'
import { DateRangePicker } from '../components/DatePicker'
import HistoricalCharts from '../components/HistoricalCharts'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

const QUICK_RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: '2Y', days: 730 },
]

export default function HistoricalWeather() {
  const { location, locationError, fetchLocation } = useLocation()
  
  const [endDate, setEndDate] = useState(new Date())
  const [startDate, setStartDate] = useState(subDays(new Date(), 7))

  const { data, loading, error } = useWeatherRange(
    location?.lat,
    location?.lon,
    startDate,
    endDate
  )

  const handleDateChange = (start, end) => {
    setStartDate(start)
    setEndDate(end)
  }

  const handleQuickRange = (days) => {
    const end = new Date()
    const start = subDays(end, days)
    setStartDate(start)
    setEndDate(end)
  }

  if (locationError) {
    return <ErrorState message={locationError} isLocationError={true} onRetry={fetchLocation} />
  }

  if (!location) {
    return <LoadingState message="Locating coordinates..." />
  }

  return (
    <div className="min-h-screen bg-app">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-70">
        <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-6 mb-10 pt-24 md:pt-[112px] relative z-20">
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-semibold text-white tracking-tight animate-fade-in-up stagger-1">
              Historical Telemetry
            </h1>
            <p className="text-zinc-400 text-sm mt-1 animate-fade-in-up stagger-2">
              Retrospective climate and air quality analysis
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center w-full xl:w-auto gap-4 animate-fade-in-up stagger-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center justify-start sm:justify-center gap-1.5 p-1 rounded-full bg-black/40 border border-white/5 backdrop-blur-xl overflow-x-auto sm:overflow-visible">
                {QUICK_RANGES.map((range) => {
                  const isSelected = 
                    Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) === range.days
                  
                  return (
                    <button
                      key={range.label}
                      onClick={() => handleQuickRange(range.days)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                        isSelected
                          ? 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                          : 'text-zinc-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {range.label}
                    </button>
                  )
                })}
              </div>
              
              <div className="shrink-0">
                <DateRangePicker 
                  startDate={startDate} 
                  endDate={endDate} 
                  onChange={handleDateChange} 
                />
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="glass-card p-6 border-red-500/20 bg-red-950/20 animate-fade-in-up stagger-4">
            <div className="flex items-center gap-3">
              <span className="text-red-400 text-xl">⚠️</span>
              <p className="text-red-200">Failed to load historical data: {error}</p>
            </div>
            <p className="text-zinc-400 text-sm mt-2 ml-9">
              Note: Extreme long ranges might exceed free API limits or lack archive data. Try a smaller range.
            </p>
          </div>
        ) : loading ? (
          <div className="animate-fade-in-up stagger-4">
            <LoadingState message="Processing massive datasets..." inline />
          </div>
        ) : data ? (
          <div className="animate-fade-in-up stagger-4">
            <HistoricalCharts weather={data.weather} aqi={data.aqi} />
          </div>
        ) : null}
      </main>
    </div>
  )
}
