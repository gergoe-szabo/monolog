import { Component, NgZone } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { TranscriptionService } from '../../core/transcription.service';
import { ElectronService } from '../../core/electron.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  audioUploaded: boolean = false;
  audioFilePath: string | null = null;

  constructor(
    public loadingController: LoadingController,
    private transcriptionService: TranscriptionService,
    private electronService: ElectronService,
    private navCtrl: NavController,
    private ngZone: NgZone
  ) {}

  async uploadAudio(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.audioUploaded = true;
      if (this.electronService.isElectron) {
        this.audioFilePath = (input.files[0] as any).path;
        console.log('Audio file uploaded:', input.files[0].name, 'Path:', this.audioFilePath);
      } else {
        this.audioFilePath = input.files[0].name;
        console.warn('Using file name instead of path in a non-Electron environment.');
      }
    } else {
      console.warn('No audio files selected.');
    }
  }

  async processAudio() {
    if (!this.audioFilePath) {
      console.warn("No audio file path available for processing.");
      return;
    }

    console.log('Attempting to process audio:', this.audioFilePath);

    const loading = await this.loadingController.create({
      message: 'Processing audio...',
    });
    await loading.present();

    const onSuccess = async (event: any, data: any) => {
      this.ngZone.run(async () => {
        console.log("Received 'audio-processed' event:", data);
        const audioFilename = (this.audioFilePath || 'Unknown File').split('/').pop();
        this.transcriptionService.storeResults(data, audioFilename);
        await this.dismissLoadingAndNavigate(loading);
        this.electronService.removeListener('audio-processed', onSuccess);
        this.electronService.removeListener('audio-process-error', onError);
      });
    };

    const onError = async (event: any, errorMessage: string) => {
      this.ngZone.run(async () => {
        console.error("Received 'audio-process-error' event:", errorMessage);
        await this.dismissLoadingAndNavigateOnError(loading);
        this.electronService.removeListener('audio-processed', onSuccess);
        this.electronService.removeListener('audio-process-error', onError);
      });
    };

    this.electronService.once('audio-processed', onSuccess);
    this.electronService.once('audio-process-error', onError);

    if (this.electronService.isElectron) {
      this.electronService.send('process-audio', this.audioFilePath);
      console.log("Sent 'process-audio' event:", this.audioFilePath);
    } else {
      console.warn('Cannot send audio to Electron in a non-Electron environment.');
    }
  }

  async dismissLoadingAndNavigate(loading: any) {
    try {
        await loading.dismiss();
        console.log('Loading dismissed');
        this.navCtrl.navigateForward('/results');
    } catch (error) {
        console.error('Error dismissing the loading spinner:', error);
    }
  }

  // Separate function to handle error dismissal
  async dismissLoadingAndNavigateOnError(loading: any) {
    try {
        await loading.dismiss();
        console.log('Loading dismissed after error');
    } catch (error) {
        console.error('Error dismissing the loading spinner after error:', error);
    }
  }
}
