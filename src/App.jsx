import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LocationProvider } from './context/LocationContext'
import Navbar from './components/Navbar'
import CurrentWeather from './pages/CurrentWeather'
import HistoricalWeather from './pages/HistoricalWeather'

function App() {
  return (
    <BrowserRouter>
      <LocationProvider>
        <div className="min-h-screen" style={{ background: '#0a0f1a' }}>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<CurrentWeather />} />
              <Route path="/history" element={<HistoricalWeather />} />
            </Routes>
          </main>
        </div>
      </LocationProvider>
    </BrowserRouter>
  )
}

export default App
