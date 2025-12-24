import osUtils from 'os-utils'
import fs from 'fs'
import os from 'os'
import { BrowserWindow } from 'electron'
import si from 'systeminformation'

const POLLING_INTERVAL = 2000 // 5 seconds

export function pollResources(mainWindow: BrowserWindow): void {
  setInterval(async () => {
    const cpuUsage = await getCPUUsage()
    const ramUsage = getRamUsage()
    const storageData = getStorageData()
    mainWindow.webContents.send('statistics', {
      cpuUsage,
      ramUsage,
      storageUsage: storageData.usage
    })
  }, POLLING_INTERVAL)
}

function getCPUUsage(): Promise<number> {
  return new Promise((resolve) => {
    osUtils.cpuUsage(resolve)
  })
}

function getRamUsage(): number {
  return 1 - osUtils.freememPercentage()
}

function getStorageData(): { total: number; usage: number } {
  const stats = fs.statfsSync(process.platform === 'win32' ? 'C://' : '/')
  const total = stats.bsize * stats.blocks
  const free = stats.bsize * stats.bfree

  return {
    total: Math.floor(total / 1_000_000_000),
    usage: 1 - free / total
  }
}

export function getStaticData(): StaticData {
  const totalStorage = getStorageData().total
  const cpuModel = os.cpus()[0].model
  const totalMemoryGB = Math.floor(osUtils.totalmem() / 1024)

  return {
    totalStorage,
    cpuModel,
    totalMemoryGB
  }
}

export async function getAllInfo(): Promise<MachineInfo> {
  const [cpu, osInfo, battery] = await Promise.all([si.cpu(), si.osInfo(), si.battery()])

  return {
    cpuModel: `${cpu.manufacturer} ${cpu.brand} ${cpu.efficiencyCores ? cpu.efficiencyCores : 0 + cpu.performanceCores ? cpu.performanceCores : 0} Threads`,
    os: `${osInfo.distro} ${osInfo.release} (${osInfo.arch}) ${osInfo.hostname} PC`,
    hasBattery: battery.hasBattery,
    cpuSpeedGHz: cpu.speed.toFixed(2)
  }
}
