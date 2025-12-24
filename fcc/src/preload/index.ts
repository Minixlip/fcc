import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getStaticData: () => {
    return ipcRenderer.invoke('getStaticData') as Promise<StaticData>
  },

  subscribeStatistics: (callback: (statistics: Statistics) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, statistics: Statistics): void => {
      callback(statistics)
    }

    ipcRenderer.on('statistics', listener)
  },

  getAllInfo: () => {
    return ipcRenderer.invoke('getAllInfo') as Promise<MachineInfo>
  }
} satisfies Window['api']

// Expose the APIs to the renderer process

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
