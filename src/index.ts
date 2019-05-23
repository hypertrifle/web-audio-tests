export default class SoundTests {
   private _setUpComplete: boolean = false;
   constructor() {

      console.clear();

      document.body.innerHTML = `
<div class="ui">
<button id="playButton">Start</button>
</div>
`;

      const button: HTMLButtonElement = document.getElementById('playButton') as HTMLButtonElement;

      // @ts-ignore
      const audioContext: AudioContext = new window.AudioContext();
      const master_out: GainNode = audioContext.createGain();

      master_out.connect(audioContext.destination);
      master_out.gain.setValueAtTime(1, audioContext.currentTime);

      button.onmouseup = () => {
         // entry point (we need a user interaction to start the AudioContext)

      };

   }

}

// @ts-ignore
window.test = new SoundTests();
