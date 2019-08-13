class VadProcessor extends AudioWorkletProcessor {
  sensitivityValue = 0;
  falloffValue = 0;
  currentFalloffTime = 0;
  active = false;
  timer = 0;
  constructor(options) {
    super();
    console.log(options);
    this.sensitivityValue = options.parameterData.sensitivity;
    this.falloffValue = options.parameterData.fallOff;
  }

  static get parameterDescriptors() {
    return [
      {
        name: 'sensitivity',
        defaultValue: this.sensitivityValue,
        minValue: 0,
        maxValue: 1,
        automationRate: 'k-rate'
      },
      {
        name: 'falloff',
        defaultValue: this.falloffValue,
        minValue: 0,
        maxValue: 1000,
        automationRate: 'k-rate'
      }
    ]
  }

  process(inputs, outputs, parameters) {
    let max = 0;
    inputs[0].forEach((inputChannel, index) => {
      const outputChannel = outputs[0][index];
      inputChannel.forEach((value, index) => {
        outputChannel[index] = value;
        let absVal = Math.abs(value);
        if (absVal > max) {
          max = absVal;
        }
      })
    })
    if (!this.active && max > parameters.sensitivity[0]) {
      this.timer = Date.now();
      this.active = true;
      this.port.postMessage('activate');
      this.currentFalloffTime = parameters.falloff[0];
    } else if (this.active) {
      if (max > parameters.sensitivity[0]) {
        this.currentFalloffTime = parameters.falloff[0];
      }
      this.currentFalloffTime-= 2.6;
      if (this.currentFalloffTime <= 0) {
        this.timer = Date.now() - this.timer;
        console.log(this.timer);
        this.active = false;
        this.port.postMessage('deactivate');
      }
    }
    return true;
  }
}

registerProcessor('VadProcessor', VadProcessor);
