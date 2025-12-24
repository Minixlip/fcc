type Statistics = {
  cpuUsage: number
  ramUsage: number
  storageUsage: number
}

type StaticData = {
  totalStorage: number
  cpuModel: string
  totalMemoryGB: number
}

interface Window {
  api: {
    getStaticData: () => Promise<StaticData>
    subscribeStatistics: (callback: (statistics: Statistics) => void) => void
    getAllInfo: () => Promise<MachineInfo>
  }
}

type MachineInfo = {
  cpuModel: string
  os: string
  hasBattery: boolean
  cpuSpeedGHz: string
}
