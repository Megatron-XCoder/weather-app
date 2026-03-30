import { useState } from 'react'
import { useLocation } from '../context/LocationContext'
import { useWeatherDay } from '../hooks/useWeather'
import SearchBar from '../components/SearchBar'
import { SingleDatePicker } from '../components/DatePicker'
import WeatherMetrics from '../components/WeatherMetrics'
import HourlyCharts from '../components/HourlyCharts'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import { CloudRain } from 'lucide-react'

export default function CurrentWeather() {
  const { location, locationError } = useLocation()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isFahrenheit, setIsFahrenheit] = useState(false)

  const { data, loading, error } = useWeatherDay(location?.lat, location?.lon, selectedDate)

  if (locationError) {
    return <ErrorState message={locationError} isLocationError={true} />
  }

  if (loading || !location) {
    return <LoadingState message="Analyzing atmospheric data..." />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  return (
    <div className="min-h-screen bg-app">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-8 pt-24 md:pt-[112px] relative z-20">
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-semibold text-white tracking-tight animate-fade-in-up stagger-1">
              Atmospheric Overview
            </h1>
            <p className="text-zinc-400 text-sm mt-1 animate-fade-in-up stagger-2">
              Real-time telemetry and 24-hour synthesis
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full lg:w-auto gap-3 animate-fade-in-up stagger-3">
            <SearchBar />
            <div className="shrink-0 flex sm:justify-start">
              <SingleDatePicker selectedDate={selectedDate} onChange={setSelectedDate} />
            </div>
          </div>
        </div>

        <div className="space-y-12 animate-fade-in-up stagger-4">
          <WeatherMetrics 
            weatherData={data?.weather} 
            aqiData={data?.aqi} 
            selectedDate={selectedDate} 
          />
          
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <HourlyCharts 
            weather={data?.weather} 
            aqi={data?.aqi}
            isFahrenheit={isFahrenheit}
            onToggleFahrenheit={setIsFahrenheit}
          />
        </div>

      </main>
    </div>
  )
}
