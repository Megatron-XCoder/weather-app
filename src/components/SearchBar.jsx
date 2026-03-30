import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { useLocation } from '../context/LocationContext'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { setManualLocation } = useLocation()
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([])
      return
    }

    const fetchCities = async () => {
      setLoading(true)
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`)
        const data = await res.json()
        setResults(data.results || [])
      } catch (error) {
        console.error("Geocoding failed", error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchCities, 500)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (city) => {
    const cityName = city.admin1 ? `${city.name}, ${city.admin1}, ${city.country_code}` : `${city.name}, ${city.country_code}`
    setManualLocation(city.latitude, city.longitude, cityName)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative z-50 w-full max-w-sm">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-zinc-400 group-focus-within:text-cyan-400 transition-colors" />
        </div>
        <input
          type="text"
          className="w-full bg-black/40 border border-white/10 rounded-full pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 backdrop-blur-xl transition-all shadow-inner"
          placeholder="Search for a city..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Loader2 size={14} className="animate-spin text-zinc-500" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#121214]/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
          <ul className="max-h-64 overflow-y-auto p-2">
            {results.map((city) => (
              <li key={city.id}>
                <button
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-3"
                  onClick={() => handleSelect(city)}
                >
                  <MapPin size={16} className="text-zinc-500 shrink-0" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-white truncate">{city.name}</span>
                    <span className="text-[10px] text-zinc-500 truncate uppercase tracking-widest">
                      {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
