export type AppProcess = {
  pid: number
  name: string
  cpu: number
  memory: number
}

export type Statistics = {
  cpuUsage: number
  ramUsage: number
  storageUsage: number
  topProcesses: AppProcess[]
}

export type StaticData = {
  totalStorage?: number
  cpuModel: string
  totalMemoryGB: number
  os: string
}

export type View = 'CPU' | 'RAM' | 'STORAGE' | 'DASHBOARD'

declare global {
  interface Window {
    api: {
      getStaticData: () => Promise<StaticData>
      subscribeStatistics: (callback: (statistics: Statistics) => void) => UnsubscribeFunction
      killProcess: (pid: number) => Promise<boolean>
      getStaticData: () => Promise<SystemSpecs>
    }
  }
}

export type UnsubscribeFunction = () => void
