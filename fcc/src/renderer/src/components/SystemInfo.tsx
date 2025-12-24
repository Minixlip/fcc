// src/components/SystemInfo.tsx
import { useEffect, useState } from 'react'

// Define the shape of the data
interface SystemSpecs {
  cpuModel: string
  os: string
  totalMemoryGB: string
  battery: string
  gpuModel: string
  storageDevices: string
  pcName: string
  hostname: string
}

export function SystemInfo() {
  const [specs, setSpecs] = useState<SystemSpecs | null>(null)

  useEffect(() => {
    // Fetch data via IPC when component mounts
    // Ensure you have this exposed in preload.ts: window.electron.getStaticData()
    const fetchData = async () => {
      const data = await window.api.getStaticData()
      setSpecs(data)
    }
    fetchData()
  }, [])

  if (!specs) return <div className="p-8 text-center text-gray-400">Loading specs...</div>

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-white">System Specifications</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="CPU" value={specs.cpuModel} icon="🧠" />
        <InfoCard title="GPU" value={specs.gpuModel} icon="🎮" />
        <InfoCard title="Memory (RAM)" value={specs.totalMemoryGB} icon="💾" />
        <InfoCard title="Operating System" value={specs.os} icon="🖥️" />
        <InfoCard title="Storage" value={specs.storageDevices} icon="💿" />
        <InfoCard title="PC Model" value={specs.pcName} icon="💻" />
        <InfoCard title="Hostname" value={specs.hostname} icon="🏷️" />
        <InfoCard title="Battery" value={specs.battery} icon="🔋" />
      </div>
    </div>
  )
}

// Simple helper component for the cards
function InfoCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider">{title}</h3>
      </div>
      <p className="text-white font-semibold text-lg truncate" title={value}>
        {value}
      </p>
    </div>
  )
}
