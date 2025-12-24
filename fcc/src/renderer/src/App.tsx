import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Activity, Disc, Cpu, Server, LayoutGrid } from 'lucide-react'

// Components
import { StatCard } from './components/StatCard'
import { SidebarItem } from './components/SidebarItem'

// Types
import { Statistics, View } from 'types'
import { ProcessTable } from './components/ProcessTable'

function App() {
  const [activeView, setActiveView] = useState<View>('DASHBOARD')
  const [stats, setStats] = useState<Statistics | null>(null)
  const [cpuHistory, setCpuHistory] = useState<{ time: number; value: number }[]>([])

  useEffect(() => {
    const unsubscribe = window.api.subscribeStatistics((newStats) => {
      setStats(newStats)
      setCpuHistory((prev) => {
        const newData = { time: Date.now(), value: Math.round(newStats.cpuUsage) }
        const newHistory = [...prev, newData]
        if (newHistory.length > 30) newHistory.shift()
        return newHistory
      })
    })
    return unsubscribe
  }, [])

  return (
    <div className="flex h-screen bg-gray-900 font-sans text-gray-100 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Activity size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">SysMon</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <SidebarItem
            view="DASHBOARD"
            activeView={activeView}
            label="Dashboard"
            icon={LayoutGrid}
            onClick={setActiveView}
          />
          <SidebarItem
            view="CPU"
            activeView={activeView}
            label="Processor"
            icon={Cpu}
            onClick={setActiveView}
          />
          <SidebarItem
            view="STORAGE"
            activeView={activeView}
            label="Storage"
            icon={Server}
            onClick={setActiveView}
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500 px-2">v1.0.0 • Connected</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold capitalize">{activeView.toLowerCase()} Monitor</h2>
            <p className="text-gray-400 text-sm mt-1">Real-time performance metrics</p>
          </div>
        </header>

        {activeView === 'DASHBOARD' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="CPU Usage"
                value={Math.round(stats?.cpuUsage ?? 0)}
                color="bg-blue-500"
                icon={Cpu}
              />
              <StatCard
                title="RAM Usage"
                value={Math.round((stats?.ramUsage ?? 0) * 100)}
                color="bg-purple-500"
                icon={Activity}
              />
              <StatCard
                title="Storage"
                value={Math.round((stats?.storageUsage ?? 0) * 100)}
                color="bg-orange-500"
                icon={Disc}
              />
            </div>

            {/* Big Chart - FIXED LAYOUT */}
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg h-96 flex flex-col">
              <h3 className="text-gray-400 font-medium mb-6">CPU History</h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cpuHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#374151',
                        borderRadius: '8px'
                      }}
                      itemStyle={{ color: '#60A5FA' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ... Other views (CPU, STORAGE) remain the same ... */}
        {activeView === 'CPU' && (
          <div className="flex flex-col gap-6">
            <StatCard
              title="CPU Usage"
              value={Math.round(stats?.cpuUsage ?? 0)}
              color="bg-blue-500"
              icon={Cpu}
            />
            <ProcessTable processes={stats?.topProcesses ?? []} />
          </div>
        )}

        {activeView === 'STORAGE' && (
          <StatCard
            title="Storage Usage"
            value={Math.round((stats?.storageUsage ?? 0) * 100)}
            color="bg-orange-500"
            icon={Disc}
          />
        )}
      </main>
    </div>
  )
}

export default App
