export class AudioManager {
  constructor() {
    this.sounds = {
      countdown: new Audio('./assets/countdown.mp3'),
      win: new Audio('./assets/win.mp3'),
      lose: new Audio('./assets/lose.mp3'),
      popup: new Audio('./assets/popup.mp3')
    };
    
    // Pre-load all sounds
    Object.values(this.sounds).forEach(sound => {
      sound.load();
    });
    
    // Add error handling
    Object.entries(this.sounds).forEach(([name, sound]) => {
      sound.addEventListener('error', (e) => {
        console.error(`Error loading ${name} sound:`, e);
      });
    });
  }
  
  playCountdown() {
    this.stopAll();
    this.sounds.countdown.currentTime = 0;
    this.sounds.countdown.play().catch(e => console.error('Error playing countdown sound:', e));
  }
  
  playWin() {
    this.stopAll();
    this.sounds.win.currentTime = 0;
    this.sounds.win.play().catch(e => console.error('Error playing win sound:', e));
  }
  
  playLose() {
    this.stopAll();
    this.sounds.lose.currentTime = 0;
    this.sounds.lose.play().catch(e => console.error('Error playing lose sound:', e));
  }
  
  playPopup() {
    // Don't stop other sounds for this one, just play it alongside
    this.sounds.popup.currentTime = 0;
    this.sounds.popup.play().catch(e => console.error('Error playing popup sound:', e));
  }
  
  stopAll() {
    Object.values(this.sounds).forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
  }
} 