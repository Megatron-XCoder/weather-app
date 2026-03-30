import { Loader2 } from 'lucide-react'

export default function LoadingState({ message = 'Loading...', inline = false }) {
  if (inline) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-4 animate-fade-in-up">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 border-t-2 border-cyan-400 rounded-full animate-spin" style={{ animationDuration: '1s' }} />
          <div className="absolute inset-2 border-r-2 border-indigo-400 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
          <div className="absolute inset-4 bg-white/5 rounded-full" />
        </div>
        <p className="text-zinc-400 text-sm font-medium tracking-wide animate-pulse">{message}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center gap-6">
      <div className="relative w-24 h-24 flex items-center justify-center animate-fade-in-up stagger-1">
        <div className="absolute inset-0 rounded-full box-border border-[3px] border-transparent border-t-cyan-500 border-l-blue-500 animate-[spin_2s_linear_infinite]" />
        <div className="absolute inset-2 rounded-full box-border border-[3px] border-transparent border-b-indigo-500 border-r-violet-500 animate-[spin_3s_linear_infinite_reverse]" />
        <div className="absolute inset-4 bg-gradient-to-br from-white/10 to-transparent rounded-full backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]" />
        <Loader2 className="animate-spin text-white w-6 h-6 z-10" />
      </div>
      
      <div className="flex flex-col items-center animate-fade-in-up stagger-2">
        <h2 className="text-2xl font-display font-semibold text-white tracking-tight mb-2">Initializing</h2>
        <p className="text-zinc-500 text-sm font-medium tracking-wide animate-pulse">{message}</p>
      </div>
    </div>
  )
}
