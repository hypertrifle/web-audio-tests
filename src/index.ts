
export interface OscillatorConfig {

}

export interface SoundConfig {
   oscillator:OscillatorConfig|OscillatorConfig[];
      
}


export class Sound {

   constructor(audioContext :AudioContext, config:SoundConfig ){

   }

}

export default class SoundTests {
   constructor() {

      console.clear();

      document.body.innerHTML = 
      `
      <div class="ui">
      <button id="playButton">Start</button>
      </div>
      `;


      const button: HTMLButtonElement = document.getElementById("playButton") as HTMLButtonElement;
      const audioContext: AudioContext = new window.AudioContext();

      const master_out: GainNode = audioContext.createGain();
      master_out.connect(audioContext.destination);
      master_out.gain.setValueAtTime(1, audioContext.currentTime)

      const compressor: DynamicsCompressorNode = audioContext.createDynamicsCompressor();
      compressor.threshold.value = 0.5;
      compressor.knee.value = 40;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.4;
      compressor.release.value = 0.52;
      compressor.connect(master_out);

      button.onmouseup = () => {


         let oscillator: OscillatorNode = audioContext.createOscillator();
         let osc_volume: GainNode = audioContext.createGain();
         oscillator.type = 'sine';
         oscillator.frequency.setValueAtTime(70, audioContext.currentTime); // value in hertz

         //fade out on end of sound.
         osc_volume.gain.setValueAtTime(1, audioContext.currentTime);
         osc_volume.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.4);


         oscillator.connect(osc_volume);
         osc_volume.connect(compressor);

         oscillator.start();
         oscillator.onended
         oscillator.stop(audioContext.currentTime + 0.4);
      }
   }


};

new SoundTests();