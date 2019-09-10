class OutputInterceptor extends AudioWorkletProcessor {
  inputChannels;
  outputChannel;
  outputChannel2;
  count = 0;
  constructor(options) {
    super();
  }

  static get parameterDescriptors() {
  }

  process(inputs, outputs, parameters) {
    this.inputChannels = inputs[0];
    this.outputChannels = outputs[0];
    if (this.inputChannels[0][0] != 0) {
      console.log(this.inputChannels[0]);
      console.log(this.count);
      this.count++;
    }
    this.inputChannels.forEach(channel => {
      channel.forEach((value, index) => {
        this.outputChannels.forEach(outChannel => {
          outChannel[index] = value;
        })
      })
    })

    return true;
  }
}

registerProcessor('OutputInterceptor', OutputInterceptor);
