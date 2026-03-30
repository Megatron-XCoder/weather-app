import { useState } from 'react'
import { format, subDays, isAfter, isBefore, startOfDay } from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

function SingleDatePicker({ selectedDate, onChange }) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(new Date(selectedDate))

  const today = startOfDay(new Date())
  const minDate = subDays(today, 730)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const handleDayClick = (day) => {
    const clicked = new Date(year, month, day)
    if (isBefore(clicked, minDate) || isAfter(clicked, today)) return
    onChange(clicked)
    setOpen(false)
  }

  const isSelected = (day) => {
    const d = new Date(year, month, day)
    return format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  }

  const isDisabled = (day) => {
    const d = new Date(year, month, day)
    return isBefore(d, minDate) || isAfter(d, today)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-sm"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#f4f4f5'
        }}
      >
        <Calendar size={16} className="text-cyan-400" />
        <span className="font-display tracking-tight text-[15px] mt-0.5">{format(selectedDate, 'MMMM d, yyyy')}</span>
      </button>

      {open && (
        <div className="absolute top-full mt-3 z-50 rounded-3xl p-5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] w-80 animate-fade-in-up"
          style={{
            background: 'rgba(24,24,27,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
          }}>
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={handlePrevMonth}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
              <ChevronLeft size={16} />
            </button>
            <span className="text-white font-display font-semibold tracking-tight text-base">
              {months[month]} {year}
            </span>
            <button onClick={handleNextMonth}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-3">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-center text-[10px] uppercase tracking-widest text-zinc-500 font-bold py-1">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const sel = isSelected(day)
              const dis = isDisabled(day)
              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  disabled={dis}
                  className={`w-9 h-9 mx-auto flex items-center justify-center rounded-full font-display text-sm transition-all duration-200 ${
                    sel
                      ? 'text-zinc-900 font-bold shadow-[0_4px_10px_rgba(6,182,212,0.3)]'
                      : dis
                        ? 'text-zinc-700 cursor-not-allowed'
                        : 'text-zinc-300 hover:bg-cyan-500/10 hover:text-cyan-300 font-medium'
                  }`}
                  style={sel ? { background: '#06b6d4' } : {}}
                >
                  {day}
                </button>
              )
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <button
              onClick={() => { onChange(today); setOpen(false) }}
              className="w-full text-center text-sm text-cyan-400 hover:text-cyan-300 font-medium py-2 rounded-xl transition-all hover:bg-cyan-500/5"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DateRangePicker({ startDate, endDate, onChange }) {
  const [open, setOpen] = useState(false)
  const [selecting, setSelecting] = useState('start')
  const [viewDate, setViewDate] = useState(new Date(startDate || new Date()))
  const [tempStart, setTempStart] = useState(startDate)
  const [tempEnd, setTempEnd] = useState(endDate)

  const today = startOfDay(new Date())
  const maxRange = 730

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const handleDayClick = (day) => {
    const clicked = startOfDay(new Date(year, month, day))
    if (isAfter(clicked, today)) return

    if (selecting === 'start') {
      setTempStart(clicked)
      setTempEnd(null)
      setSelecting('end')
    } else {
      if (isBefore(clicked, tempStart)) {
        setTempStart(clicked)
        setTempEnd(null)
        setSelecting('end')
        return
      }
      const diffDays = Math.round((clicked - tempStart) / (1000 * 60 * 60 * 24))
      if (diffDays > maxRange) {
        alert('Maximum date range is 2 years.')
        return
      }
      setTempEnd(clicked)
      setSelecting('start')
      onChange(tempStart, clicked)
      setOpen(false)
    }
  }

  const getDayState = (day) => {
    const d = startOfDay(new Date(year, month, day))
    const isStart = tempStart && format(d, 'yyyy-MM-dd') === format(tempStart, 'yyyy-MM-dd')
    const isEnd = tempEnd && format(d, 'yyyy-MM-dd') === format(tempEnd, 'yyyy-MM-dd')
    const inRange = tempStart && tempEnd && isAfter(d, tempStart) && isBefore(d, tempEnd)
    const disabled = isAfter(d, today)
    return { isStart, isEnd, inRange, disabled }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-sm"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#f4f4f5'
        }}
      >
        <Calendar size={16} className="text-violet-400" />
        <span className="font-display tracking-tight text-[15px] mt-0.5">
          {startDate && endDate
            ? `${format(startDate, 'MMM d, yyyy')} – ${format(endDate, 'MMM d, yyyy')}`
            : 'Select date range'}
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 md:left-auto mt-3 z-50 rounded-3xl p-5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] w-80 animate-fade-in-up"
          style={{
            background: 'rgba(24,24,27,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
          }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4 text-center">
            {selecting === 'start' ? 'Select start date' : 'Select end date (max 2yr)'}
          </p>

          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
              <ChevronLeft size={16} />
            </button>
            <span className="text-white font-display font-semibold tracking-tight text-base">{months[month]} {year}</span>
            <button onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-3">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-center text-[10px] uppercase tracking-widest text-zinc-500 font-bold py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const { isStart, isEnd, inRange, disabled } = getDayState(day)
              return (
                <button
                  key={day}
                  onClick={() => !disabled && handleDayClick(day)}
                  disabled={disabled}
                  className={`relative w-9 h-9 mx-auto flex items-center justify-center rounded-full font-display text-sm transition-all duration-200 ${
                    (isStart || isEnd)
                      ? 'text-zinc-900 font-bold shadow-[0_4px_10px_rgba(139,92,246,0.3)] z-10'
                      : inRange
                        ? 'text-violet-300 font-medium'
                        : disabled
                          ? 'text-zinc-700 cursor-not-allowed'
                          : 'text-zinc-300 hover:bg-white/5 font-medium'
                  }`}
                  style={(isStart || isEnd) ? { background: '#8b5cf6' } : {}}
                >
                  {/* Custom continuous connecting background for range */}
                  {inRange && <div className="absolute inset-0 bg-violet-500/10 rounded-full scale-[1.1]" />}
                  {isStart && tempEnd && <div className="absolute top-1/2 -translate-y-1/2 right-[-20%] w-[140%] h-7 bg-violet-500/10 -z-10" />}
                  {isEnd && tempStart && <div className="absolute top-1/2 -translate-y-1/2 left-[-20%] w-[140%] h-7 bg-violet-500/10 -z-10" />}
                  
                  <span className="relative z-10">{day}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export { SingleDatePicker, DateRangePicker }
