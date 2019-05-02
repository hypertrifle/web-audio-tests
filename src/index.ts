
/*





*/





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
   volume?:number;
}

export class Sound {

   private _oscillators:OscillatorNode[] = [];
   private _biquadFilters:BiquadFilterNode[] = [];
   private _context: AudioContext;

   private _gainNode?:GainNode;
   
   public outputNode:AudioNode;

   constructor(audioContext: AudioContext, outputNode:AudioNode, config: SoundConfig ) {
      this._context = audioContext;
      this.outputNode = outputNode;

      // this is store the last item in our chain of nodes, so we can connect up as we go.
      let currentLastNode:AudioNode = this.outputNode;
      const now:number = audioContext.currentTime;

      //now we work backwards through our nodes so we can connect as we go.
      //we will end with the raw oscilator, and start with our post processing.


      if(config.volume){
         //we we have a master volume change
         this._gainNode = audioContext.createGain();
         this._gainNode.gain.setValueAtTime(config.volume,now);

         //connect to last in chain and save refence for next.
         this._gainNode.connect(currentLastNode);
         currentLastNode = this._gainNode;
      }

      //biquadFilters
      if(config.biquadFilters){
         //we have biquadFilter config(s)
         if(config.biquadFilters instanceof Array){
            //multiple biquadFilter
         
         
         
         } else {
            //single biquadFilters.


         }

      }

      if(config.oscillator){
         //we have oscilator config(s)
         if(config.oscillator instanceof Array){
            //multiple oscilators
         
         
         
         } else {
            //single oscilator.


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
