import { BrowserWindow } from 'electron'
import si from 'systeminformation'

const FAST_POLL_INTERVAL = 2000 // Increased to 2s for better stability
const SLOW_POLL_INTERVAL = 60000

export function pollResources(mainWindow: BrowserWindow) {
  if (!mainWindow || mainWindow.isDestroyed()) return

  let latestStorageUsage = 0

  // 1. Slow Poll (Storage)
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

  // 2. Fast Poll (CPU, RAM, Processes)
  let isRunning = true
  const runFastPoll = async () => {
    if (!isRunning || mainWindow.isDestroyed()) return

    try {
      const [cpu, mem, processes] = await Promise.all([si.currentLoad(), si.mem(), si.processes()])

      // Sort by CPU usage and take top 10
      const topProcesses = processes.list
        .sort((a, b) => b.cpu - a.cpu)
        .slice(0, 10)
        .map((p) => ({
          pid: p.pid,
          name: p.name,
          cpu: p.cpu,
          memory: p.mem // This is usually % usage
        }))

      mainWindow.webContents.send('statistics', {
        cpuUsage: cpu.currentLoad,
        ramUsage: mem.active / mem.total,
        storageUsage: latestStorageUsage,
        topProcesses // <--- Send the new data
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
