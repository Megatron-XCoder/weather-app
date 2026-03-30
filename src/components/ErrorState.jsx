import { AlertCircle, MapPinOff, RefreshCw } from 'lucide-react'

export default function ErrorState({ message, isLocationError = false }) {
  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center p-4">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="glass-card max-w-md w-full p-8 md:p-10 flex flex-col items-center text-center animate-fade-in-up z-10 border-red-500/20">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_30px_rgba(239,68,68,0.15)] animate-pulse">
          {isLocationError ? (
            <MapPinOff className="w-8 h-8 text-red-400" />
          ) : (
            <AlertCircle className="w-8 h-8 text-red-400" />
          )}
        </div>

        <h2 className="text-2xl font-display font-semibold text-white tracking-tight mb-3">
          {isLocationError ? 'Location Required' : 'System Error'}
        </h2>
        
        <p className="text-sm text-zinc-400 font-medium tracking-wide mb-8 leading-relaxed">
          {message}
        </p>

        <button
          onClick={handleReload}
          className="flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(185, 28, 28, 0.8))',
            boxShadow: '0 10px 20px -10px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
            color: '#fff'
          }}
        >
          <RefreshCw size={16} />
          Initialize Recovery
        </button>
        
        {isLocationError && (
          <p className="mt-6 text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
            Please allow location access in your browser settings.
          </p>
        )}
      </div>
    </div>
  )
}
