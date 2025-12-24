import { BrowserWindow } from 'electron'
import si from 'systeminformation'

const FAST_POLL_INTERVAL = 2000
const SLOW_POLL_INTERVAL = 60000

// 1. Define terms to hide
const EXCLUDED_TERMS = [
  'system',
  'electron',
  'node',
  'svchost',
  'service',
  'runtime',
  'host',
  'registry',
  'idle'
]

export function pollResources(mainWindow: BrowserWindow) {
  if (!mainWindow || mainWindow.isDestroyed()) return

  let latestStorageUsage = 0

  // --- Slow Poll (Storage) ---
  const updateStorage = async () => {
    try {
      const fsSize = await si.fsSize()
      const primaryDrive = fsSize.length > 0 ? fsSize[0] : null
      if (primaryDrive) latestStorageUsage = primaryDrive.use / 100
    } catch (error) {
      console.error(error)
    }
  }

  updateStorage()
  const slowInterval = setInterval(updateStorage, SLOW_POLL_INTERVAL)

  // --- Fast Poll (CPU, RAM, Processes) ---
  let isRunning = true
  const runFastPoll = async () => {
    if (!isRunning || mainWindow.isDestroyed()) return

    try {
      const [cpu, mem, processes] = await Promise.all([si.currentLoad(), si.mem(), si.processes()])

      // 2. Filter -> Sort -> Slice -> Map
      const topProcesses = processes.list
        .filter((p) => {
          // Remove 0% CPU processes
          if (p.cpu <= 0) return false

          // Remove excluded names
          const name = p.name.toLowerCase()
          return !EXCLUDED_TERMS.some((term) => name.includes(term))
        })
        .sort((a, b) => b.cpu - a.cpu) // Highest CPU first
        .slice(0, 10) // Take top 10
        .map((p) => ({
          pid: p.pid,
          name: p.name,
          cpu: p.cpu,
          memory: p.mem
        }))

      mainWindow.webContents.send('statistics', {
        cpuUsage: cpu.currentLoad,
        ramUsage: mem.active / mem.total,
        storageUsage: latestStorageUsage,
        topProcesses
      })
    } catch (error) {
      console.error(error)
    }

    if (isRunning) setTimeout(runFastPoll, FAST_POLL_INTERVAL)
  }

  runFastPoll()

  return () => {
    isRunning = false
    clearInterval(slowInterval)
  }
}

// Keep your static data function as is
export async function getStaticData() {
  const [cpu, mem, osInfo, battery] = await Promise.all([
    si.cpu(),
    si.mem(),
    si.osInfo(),
    si.battery()
  ])

  return {
    cpuModel: `${cpu.manufacturer} ${cpu.brand}`,
    os: `${osInfo.distro} ${osInfo.release}`,
    totalMemoryGB: Math.floor(mem.total / 1024 / 1024 / 1024),
    hasBattery: battery.hasBattery
  }
}
