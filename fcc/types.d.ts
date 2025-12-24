export type Statistics = {
  cpuUsage: number
  ramUsage: number
  storageUsage: number
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
    }
  }
}

export type UnsubscribeFunction = () => void
