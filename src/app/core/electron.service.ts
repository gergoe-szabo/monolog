import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  isElectron: boolean = false;

  constructor() {
    // Use the explicit property for Electron environment detection
    this.isElectron = !!(window as any).isElectronEnvironment;

    if (!this.isElectron) {
      console.warn('Electron IPC methods were not loaded!');
    }
  }

  public on(channel: string, listener: (event: any, ...args: any[]) => void): void {
    if ((window as any).receiveFromElectron) {
      (window as any).receiveFromElectron(channel, listener);
    }
  }

  public once(channel: string, listener: (event: any, ...args: any[]) => void): void {
    if ((window as any).receiveFromElectron) {
      (window as any).receiveFromElectron(channel, (event: any, data: any) => {
        listener(event, data);
        this.removeListener(channel, listener);  // auto-remove after the event is received
      });
    }
  }

  public send(channel: string, ...args: any[]): void {
    if ((window as any).sendToElectron) {
      (window as any).sendToElectron(channel, ...args);
    }
  }

  public removeListener(channel: string, listener: (...args: any[]) => void): void {
    if ((window as any).removeElectronListener) {
      (window as any).removeElectronListener(channel, listener);
    }
  }
}
