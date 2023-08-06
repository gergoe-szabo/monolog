import { Component } from '@angular/core';
import { TranscriptionService } from './core/transcription.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
  })
  export class AppComponent {
      constructor(private transcriptionService: TranscriptionService, private router: Router) {
          this.listenForMessages();
      }
  
      private listenForMessages(): void {
          window.addEventListener('message', (event) => {
              if (event.data.type === 'PYTHON_RESULTS') {
                  console.log("Received Python results:", event.data.payload);
                  this.transcriptionService.storeResults(event.data.payload);
                  this.router.navigate(['results']);
              } else if (event.data.type === 'PYTHON_ERROR') {
                  alert('An error occurred: ' + event.data.payload);
              }
          });
      }
  }