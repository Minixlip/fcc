import { useEffect, useState, JSX } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

function App(): JSX.Element {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [staticData, setStaticData] = useState<StaticData | null>(null)
  const [machineInfo, setMachineInfo] = useState<MachineInfo | null>(null)

  // We keep a history of CPU data for the chart (last 30 points)
  const [cpuHistory, setCpuHistory] = useState<{ time: number; value: number }[]>([])

  useEffect(() => {
    // 1. Get Static Data on mount
    ;(async () => {
      const data = await window.api.getStaticData()
      setStaticData(data)
      const info = await window.api.getAllInfo()
      setMachineInfo(info)
    })()

    // 2. Subscribe to real-time stats
    const unsubscribe = window.api.subscribeStatistics((newStats) => {
      setStats(newStats)

      // Update Chart History
      setCpuHistory((prev) => {
        const newData = { time: Date.now(), value: Math.round(newStats.cpuUsage * 100) }
        const newHistory = [...prev, newData]
        if (newHistory.length > 50) newHistory.shift() // Keep only last 50 ticks
        return newHistory
      })
    })

    return unsubscribe
  }, [])

  // Helper to format percentages
  const formatPercent = (val: number | undefined): string => {
    if (val === undefined) return '0%'
    return `${Math.round(val * 100)}%`
  }

  // Helper for color coding (Green -> Yellow -> Red)
  const getStatusColor = (percentage: number): string => {
    if (percentage > 0.9) return 'bg-red-500'
    if (percentage > 0.7) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="h-screen w-full bg-gray-900 text-white p-6 font-sans overflow-y-scroll flex flex-col gap-6">
      {/* HEADER */}
      <header className="flex justify-between items-center pb-4 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">System Monitor</h1>
          <p className="text-gray-400 text-sm mt-1">{machineInfo?.cpuModel}</p>
          <p className="text-gray-400 text-sm mt-1">{machineInfo?.os ?? 'Scanning OS...'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Memory</p>
          <p className="font-mono text-xl">{staticData?.totalMemoryGB} GB</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Desktop / Laptop</p>
          <p className="font-mono text-xl">{machineInfo?.hasBattery ? 'Desktop' : 'Laptop'}</p>
        </div>
      </header>

      {/* MAIN CONTENT GRID */}
      <main className="flex-1 grid grid-cols-2 gap-6">
        {/* LEFT COL: CPU GRAPH */}
        <div className="col-span-2 lg:col-span-1 bg-gray-800/50 rounded-xl p-6 border border-gray-700 shadow-xl backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-200">CPU Load</h2>
            <span className="text-2xl font-mono text-blue-400 font-bold">
              {formatPercent(stats?.cpuUsage)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cpuHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                  itemStyle={{ color: '#60A5FA' }}
                  labelStyle={{ display: 'none' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: '#60A5FA' }}
                  isAnimationActive={false} // Disable animation for smoother realtime updates
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT COL: RAM & STORAGE */}
        <div className="col-span-2 lg:col-span-1 flex flex-col gap-6">
          {/* RAM CARD */}
          <div className="flex-1 bg-gray-800/50 rounded-xl p-6 border border-gray-700 shadow-xl">
            <div className="flex justify-between mb-2">
              <h2 className="text-gray-300 font-medium">RAM Usage</h2>
              <span className="font-mono text-gray-400">{formatPercent(stats?.ramUsage)}</span>
            </div>

            {/* Custom Progress Bar */}
            <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${getStatusColor(stats?.ramUsage ?? 0)}`}
                style={{ width: `${(stats?.ramUsage ?? 0) * 100}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Active</p>
                <p className="text-lg font-mono text-white">
                  {((stats?.ramUsage ?? 0) * (staticData?.totalMemoryGB ?? 0)).toFixed(1)} GB
                </p>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Free</p>
                <p className="text-lg font-mono text-gray-400">
                  {((1 - (stats?.ramUsage ?? 0)) * (staticData?.totalMemoryGB ?? 0)).toFixed(1)} GB
                </p>
              </div>
            </div>
          </div>

          {/* STORAGE CARD */}
          <div className="flex-1 bg-gray-800/50 rounded-xl p-6 border border-gray-700 shadow-xl">
            <div className="flex justify-between mb-2">
              <h2 className="text-gray-300 font-medium">Storage</h2>
              <span className="font-mono text-gray-400">{formatPercent(stats?.storageUsage)}</span>
            </div>

            {/* Custom Progress Bar */}
            <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-purple-500 transition-all duration-500 ease-out`}
                style={{ width: `${(stats?.storageUsage ?? 0) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-right">
              Total Capacity: {staticData?.totalStorage} GB
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
