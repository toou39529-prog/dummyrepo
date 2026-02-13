// types/paytaca.d.ts
interface PaytacaWindow {
  paytaca?: {
    requestAccounts: () => Promise<string[]>
    getNetwork: () => Promise<string>
    sendTransaction: (params: any) => Promise<string>
    signMessage: (message: string, address: string) => Promise<string>
    getCapabilities: () => Promise<any>
    on: (event: string, callback: Function) => void
    removeListener: (event: string, callback: Function) => void
  }
}

declare global {
  interface Window extends PaytacaWindow {}
}

export {}