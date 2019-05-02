export enum EaseType {
   NONE = 0,
   LINEAR,
   EXPONENTIAL,
}

export enum OscillatorType {
   NONE = '',
   SINE = 'sine',
   SQUARE = 'square',
   SAWTOOTH = 'sawtooth',
   TRIANGLE = 'triangle',
   CUSTOM = 'custom',
}

export enum BiquadFilterNodeType {
   NONE = 0,
   LOWPASS = 1,
}
export interface IAudioTimeRange {
   start: number;
   end: number;
}

export interface IInterpolationValueAndEase {
   values: IAudioTimeRange;
   ease?: EaseType;
   length?: number;
}

export interface IOscillatorConfig {
   frequency: IInterpolationValueAndEase;
   attack?: IInterpolationValueAndEase;
   decay?: IInterpolationValueAndEase;
   type: OscillatorType;
}

// https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
export interface IBiquadFilterConfig {
   type: BiquadFilterNodeType;
   frequency: number | IInterpolationValueAndEase;
   qFactor: number | IInterpolationValueAndEase;
}

export interface ISoundConfig {
   oscillator: IOscillatorConfig;
   biquadFilter?: IBiquadFilterConfig;
   volume?: number;
   length: number;
}

export class Sound {

   public outputNode: AudioNode;

   private _oscillators: Array<{node: OscillatorNode, config: IOscillatorConfig}> = [];
   private _oscillatorConnectionPoint: AudioNode;

   private _biquadFilters: BiquadFilterNode[] = [];
   private _context: AudioContext;
   private _length: number;

   private _masterVolume?: GainNode;
   private _gainEnvelope?: GainNode;
   private _config: ISoundConfig;

   constructor(audioContext: AudioContext, outputNode: AudioNode, config: ISoundConfig ) {
      this._context = audioContext;
      this.outputNode = this._oscillatorConnectionPoint = outputNode;
      this._length = config.length;
      this._config = config;

      // this is store the last item in our chain of nodes, so we can connect up as we go.
      let currentLastNode: AudioNode = this.outputNode;
      const now: number = audioContext.currentTime;

      // now we work backwards through our nodes so we can connect as we go.
      // we will end with the raw oscilator, and start with our post processing.

      if (config.volume) {
         // we we have a master volume change
         this._masterVolume = audioContext.createGain();
         this._masterVolume.gain.setValueAtTime(config.volume, now);

         // connect to last in chain and save refence for next.
         this._masterVolume.connect(currentLastNode);
         currentLastNode = this._masterVolume;
      }

      // biquadFilters
      if (config.biquadFilter) {
         // we have a biquadFilter config

      }

      if (config.oscillator) {

         // if we have any attack and decay envelope params we will need an additional gain node apply this effect.
         if ((config.oscillator.attack || config.oscillator.decay) && this._gainEnvelope === undefined)  {
            this._gainEnvelope = audioContext.createGain();
            this._gainEnvelope.connect(currentLastNode);
            currentLastNode = this._gainEnvelope;
         }

         // and finally add our osc.
         this._oscillatorConnectionPoint = currentLastNode;
         this.addOscillator(config.oscillator, currentLastNode);
      }

   }

   public addOscillator(oConfig: IOscillatorConfig, destinationNode: AudioNode) {
      const osc = this._context.createOscillator();

      if (oConfig.type) {
         osc.type = oConfig.type;
      }

      this._oscillators.push({node: osc, config: oConfig});
      osc.connect(destinationNode);

   }

   /**
    * oscillators are one use, thefire we must create a new one each time we wish to play the sound.
    *
    * @param {{node: OscillatorNode, config: IOscillatorConfig}} nodeConfigPair
    * @memberof Sound
    */
   public resetOscillator(nodeConfigPair: {node: OscillatorNode, config: IOscillatorConfig}) {

      // disconnect previous
      nodeConfigPair.node.disconnect();

      // create now oscillator
      nodeConfigPair.node = this._context.createOscillator();

      // re configure.
      if (nodeConfigPair.config.type) {
         nodeConfigPair.node.type = nodeConfigPair.config.type;
      }

      // finally connect it the disred output
      nodeConfigPair.node.connect(this._oscillatorConnectionPoint);
   }

   /**
    * play this configured sound.
    *
    * @memberof Sound
    */
   public play() {
      const now = this._context.currentTime;

      for (const osc of this._oscillators) {

         this.resetOscillator(osc);

         osc.node.frequency.setValueAtTime(osc.config.frequency.values.start, now);

         if (osc.config.frequency.values.end && osc.config.frequency.values.end !== osc.config.frequency.values.start) {
            // if there is an end frequency set, and it differs from the start value.
            switch (osc.config.frequency.ease) {

               case EaseType.EXPONENTIAL:
                  osc.node.frequency.exponentialRampToValueAtTime(osc.config.frequency.values.end, now + this._length);
                  break;

               default:
                  osc.node.frequency.linearRampToValueAtTime(osc.config.frequency.values.end, now + this._length);
                  break;
               }
         }

         if (osc.config.attack && this._gainEnvelope) {

            this._gainEnvelope.gain.cancelScheduledValues(now);

            const startValue = osc.config.attack.values.start || 0;
            const endValue = osc.config.attack.values.end || 1;

            this._gainEnvelope.gain.setValueAtTime(startValue, now);
            const length = (osc.config.attack.length || this._length / 2);

            switch (osc.config.attack.ease) {
               case EaseType.EXPONENTIAL :
                     this._gainEnvelope.gain.exponentialRampToValueAtTime(endValue, now + length  );
                     break;
               default:
                     this._gainEnvelope.gain.linearRampToValueAtTime(endValue, now + length  );
                     break;
            }
         }

         if (osc.config.decay && this._gainEnvelope) {

            const startValue = osc.config.decay.values.start || 1;
            const endValue = osc.config.decay.values.end || 0;

            const length = (osc.config.decay.length || this._length / 2);
            this._gainEnvelope.gain.setValueAtTime(startValue, now + this._length - length);

            switch (osc.config.decay.ease) {
               case EaseType.EXPONENTIAL :
                     this._gainEnvelope.gain.exponentialRampToValueAtTime(endValue, now + this._length  );
                     break;
               default:
                     this._gainEnvelope.gain.linearRampToValueAtTime(endValue, now + this._length  );
                     break;
            }
         }

         // we want to set all the interpolated params up here now.

         osc.node.start(this._context.currentTime);
         osc.node.stop(this._context.currentTime + this._length);
      }
   }

}

export interface IDrumPatch {
   kick?: Sound;
   snare?: Sound;
   lowTom?: Sound;
   midTom?: Sound;
   highTom?: Sound;
   hihatOpen?: Sound;
   hihiClose?: Sound;
   crash?: Sound;
   ride?: Sound;
   clap?: Sound;
   clave?: Sound;
   cowbell?: Sound;
}

export class Drum808 implements IDrumPatch {

   public kick: Sound;

   constructor(output: AudioNode, context: AudioContext) {

      this.kick = new Sound(context, output, {
         length: 0.5,
         oscillator: {
            frequency: {
               values: {start: 50, end: 40},
            },
            attack: {
               values: {
                  start: 0.0001,
                  end: 1,
               },
               length: 0.001,
            },
            decay: {
               values: {
                  start: 1,
                  end: 0.001,
               },
               length: 0.3,
            },
            type: OscillatorType.SINE,
         },
      });

   }
}

export default class SoundTests {
   private _setUpComplete: boolean = false;
   private _kit?: IDrumPatch;
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
         if (!this._setUpComplete) {
            this._kit = new Drum808(master_out, audioContext);
            this._setUpComplete = true;
            if (this._kit && this._kit.kick) {

            this._kit.kick.play();
            }
         } else {
            if (this._kit && this._kit.kick) {
            this._kit.kick.play();
         }
      }
      };

      document.addEventListener('keydown', (e: KeyboardEvent) => {
         if (this._kit) {
         switch (e.keyCode) {
            case 49:
            if (this._kit.kick) {
               this._kit.kick.play();
         }
      }
         }
      });

   }

}

// @ts-ignore
window.test = new SoundTests();
