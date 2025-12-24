import { BrowserWindow } from 'electron'
import si from 'systeminformation'
import { StaticData } from '../../types'

const POLLING_INTERVAL = 1000

export function pollResources(mainWindow: BrowserWindow): NodeJS.Timeout {
  const interval = setInterval(async () => {
    const [cpu, mem, graphics, fsSize] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.graphics(),
      si.fsSize()
    ])

    const storageUsage = fsSize.length > 0 ? fsSize[0].use : 0

    mainWindow.webContents.send('statistics', {
      cpuUsage: cpu.currentLoad,
      ramUsage: mem.active / mem.total,
      storageUsage: storageUsage / 100 // Normalize to 0-1
    })
  }, POLLING_INTERVAL)

  return interval
}

export async function getStaticData(): Promise<StaticData> {
  const [cpu, mem, osInfo, battery] = await Promise.all([
    si.cpu(),
    si.mem(),
    si.osInfo(),
    si.battery()
  ])

  return {
    cpuModel: `${cpu.manufacturer} ${cpu.brand}`,
    os: `${osInfo.distro} ${osInfo.release}`,
    totalMemoryGB: Math.floor(mem.total / 1024 / 1024 / 1024)
  }
}
