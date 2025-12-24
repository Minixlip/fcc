import { contextBridge, ipcRenderer } from 'electron'

const api = {
  getStaticData: () => ipcRenderer.invoke('getStaticData'),
  subscribeStatistics: (callback) => {
    const listener = (_event, stats): void => callback(stats)
    ipcRenderer.on('statistics', listener)
    return () => ipcRenderer.off('statistics', listener)
  },
  killProcess: (pid: number) => ipcRenderer.invoke('killProcess', pid)
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('api', api)
} else {
  window.api = api
}
