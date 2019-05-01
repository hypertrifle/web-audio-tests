
export interface AudioTimeRange {
   start:number;
   end:number;
}

export enum EaseType {
   NONE = 0,
   LINEAR,
   EXPONENTIAL
}

export interface InterpolationValueAndEase {
   value:number;
   ease?:EaseType;
}

export interface OscillatorConfig {
   frequency:number|AudioTimeRange;
   attack?:InterpolationValueAndEase;
   decay?:InterpolationValueAndEase;
}


//https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
export interface BiquadFilterConfig {

}

export interface SoundConfig {
   oscillator: OscillatorConfig|OscillatorConfig[];
   biquadFilters?:BiquadFilterConfig|BiquadFilterConfig[];
}

export class Sound {

   oscillators:OscillatorNode[] = [];
   biquadFilters:BiquadFilterNode[] = [];
   outputNode:AudioNode;
   context: AudioContext;

   constructor(audioContext: AudioContext, outputNode:AudioNode, config: SoundConfig ) {
      this.context = audioContext;
      this.outputNode = outputNode;

      if(config.oscillator){
         //we have oscilator config(s)
         if(config.oscillator instanceof Array){
            //multiple oscilators
         
         
         
         } else {
            //single oscilator.


         }

      }
      if(config.biquadFilters){
         //we have biquadFilter config(s)
         if(config.biquadFilters instanceof Array){
            //multiple biquadFilter
         
         
         
         } else {
            //single biquadFilters.


         }

      }
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

      const button: HTMLButtonElement = document.getElementById('playButton') as HTMLButtonElement;
      
      //@ts-ignore
      const audioContext: AudioContext = new window.AudioContext();


      const master_out: GainNode = audioContext.createGain();
      master_out.connect(audioContext.destination);
      master_out.gain.setValueAtTime(1, audioContext.currentTime);

      const compressor: DynamicsCompressorNode = audioContext.createDynamicsCompressor();
      compressor.threshold.value = 0.5;
      compressor.knee.value = 40;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.4;
      compressor.release.value = 0.52;
      compressor.connect(master_out);

      button.onmouseup = () => {

         const oscillator: OscillatorNode = audioContext.createOscillator();
         const osc_volume: GainNode = audioContext.createGain();
         oscillator.type = 'sine';
         oscillator.frequency.setValueAtTime(70, audioContext.currentTime); // value in hertz

         // fade out on end of sound.
         osc_volume.gain.setValueAtTime(1, audioContext.currentTime);
         osc_volume.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.4);

         oscillator.connect(osc_volume);
         osc_volume.connect(compressor);

         oscillator.start();
         oscillator.onended;
         oscillator.stop(audioContext.currentTime + 0.4);
      };
   }

}

new SoundTests();
