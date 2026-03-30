import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const LocationContext = createContext(null)

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [locationLoading, setLocationLoading] = useState(true)
  const [cityName, setCityName] = useState('Your Location')

  const fetchLocation = useCallback(() => {
    setLocationLoading(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lon: longitude })
        setLocationLoading(false)

        // Reverse geocode to get city name
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
          const data = await res.json()
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            'Unknown Location'
          const country = data.address?.country_code?.toUpperCase() || ''
          setCityName(country ? `${city}, ${country}` : city)
        } catch {
          setCityName('Your Location')
        }
      },
      (error) => {
        let msg = 'Unable to retrieve your location.'
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location access denied. Please enable GPS permissions.'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable.'
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.'
        }
        setLocationError(msg)
        setLocationLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }, [])

  const setManualLocation = useCallback((lat, lon, name) => {
    setLocation({ lat, lon })
    setCityName(name)
    setLocationError(null)
  }, [])

  useEffect(() => {
    fetchLocation()
  }, [fetchLocation])

  return (
    <LocationContext.Provider
      value={{ location, locationError, locationLoading, cityName, fetchLocation, setManualLocation }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  return useContext(LocationContext)
}
