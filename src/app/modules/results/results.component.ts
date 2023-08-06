// #results.component.ts

import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';  
import { TranscriptionService } from '../../core/transcription.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {

  keyTerms: string = '';
  keyPhrases: string[] = [];
  transcript: string[] = [];
  filename: string = '';  
  transcriptVisible: boolean = false; 

  constructor(private transcriptionService: TranscriptionService, private loadingController: LoadingController) { }

  async ngOnInit(): Promise<void> {
    // Dismiss any active loading instance right when the component initializes
    const loadingElement = await this.loadingController.getTop();
    if (loadingElement) {
      loadingElement.dismiss().then(() => {
        console.log('Loading dismissed from ResultsComponent');
      });
    }

    const results = this.transcriptionService.getResults();
    this.filename = this.transcriptionService.getFilename();  
    if (results) {
      this.keyTerms = results.key_terms.join(' · ');
      this.keyPhrases = results.key_phrases;
      this.transcript = results.transcript.split('. ');
    } else {
      console.warn('No results available.');
    }
  }

  downloadTranscript(): void {
    const content = [
        'Key Terms:',
        this.keyTerms,
        '\nKey Phrases:',
        ...this.keyPhrases,
        '\nTranscript:',
        this.transcript.join('. ')
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = this.filename ? `${this.filename}.txt` : 'transcript.txt';
    anchor.click();

    window.URL.revokeObjectURL(url);
}
}
