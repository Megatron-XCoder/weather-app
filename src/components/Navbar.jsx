import { NavLink, useLocation as useReactLocation } from 'react-router-dom'
import { MapPin, RefreshCw, Sun, LayoutDashboard, LineChart } from 'lucide-react'
import { useLocation } from '../context/LocationContext'

export default function Navbar() {
  const { cityName, locationLoading, fetchLocation } = useLocation()
  const routerLocation = useReactLocation()

  return (
    <>
      <div className="fixed top-0 inset-x-0 z-50 flex justify-center p-4 md:p-6 pointer-events-none">
        <header className="pointer-events-auto flex items-center justify-between px-4 sm:px-6 py-3 rounded-full w-full max-w-5xl animate-fade-in-up shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] border border-white/5 backdrop-blur-2xl bg-black/40">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0">
              <Sun size={16} className="text-white" />
            </div>
            <span className="font-display font-semibold text-white tracking-tight text-lg">
              WeatherLens
            </span>
          </div>

          {/* Premium Segmented Control (Desktop Only) */}
          <nav className="hidden md:flex relative items-center p-1.5 rounded-full bg-black/60 border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `relative z-10 px-7 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
               {({ isActive }) => (
                <>
                  {isActive && <div className="absolute inset-0 bg-white/10 rounded-full shadow-[0_2px_8px_rgba(255,255,255,0.1)] border border-white/10 -z-10" />}
                  <LayoutDashboard size={14} className={isActive ? "text-cyan-400" : "text-zinc-500"} />
                  Current
                </>
              )}
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `relative z-10 px-7 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
               {({ isActive }) => (
                <>
                  {isActive && <div className="absolute inset-0 bg-white/10 rounded-full shadow-[0_2px_8px_rgba(255,255,255,0.1)] border border-white/10 -z-10" />}
                  <LineChart size={14} className={isActive ? "text-purple-400" : "text-zinc-500"} />
                  Historical
                </>
              )}
            </NavLink>
          </nav>

          {/* Location & Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 group">
              <MapPin size={14} className="text-zinc-400 group-hover:text-cyan-400 transition-colors shrink-0" />
              <span className="text-xs sm:text-sm text-zinc-300 max-w-[100px] sm:max-w-[140px] truncate font-medium">{cityName}</span>
            </div>
            <div className="w-px h-4 bg-white/10 hidden sm:block mx-1" />
            <button
              onClick={fetchLocation}
              disabled={locationLoading}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white border border-white/5"
              title="Refresh location"
            >
              <RefreshCw size={14} className={locationLoading ? 'animate-spin text-cyan-400' : ''} />
            </button>
          </div>
        </header>
      </div>

      {/* Floating Bottom Nav (Mobile Only) */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto flex items-center gap-2 p-1.5 rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-2xl bg-black/60">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'text-white bg-white/15 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <LayoutDashboard size={16} />
            <span>Current</span>
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'text-white bg-white/15 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <LineChart size={16} />
            <span>History</span>
          </NavLink>
        </nav>
      </div>
    </>
  )
}
