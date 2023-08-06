import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranscriptionService {

  private results: any = null;
  private filename: string = '';  // added to store the filename

  storeResults(data: any, filename: string = 'Unknown File'): void {    // added filename parameter
      if (data && data.transcript && data.key_terms) {
         console.log('Storing results:', data);
         this.results = data;
         this.filename = filename;  // store the filename
      } else {
         console.warn('Received incomplete data:', data);
      }
  }

  getResults(): any {
    return this.results;
  }

  getFilename(): string {  // new method to retrieve the filename
    return this.filename;
  }

  clearResults(): void {
    this.results = null;
    this.filename = '';  // clear the filename as well
  }
}