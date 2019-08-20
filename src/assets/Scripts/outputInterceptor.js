class OutputInterceptor extends AudioWorkletProcessor {
  constructor(options) {
    super();
  }

  static get parameterDescriptors() {
  }

  process(inputs, outputs, parameters) {
    let max = 0;
    inputs[0].forEach((inputChannel, index) => {
      const outputChannel = outputs[0][index];
      // console.log(inputChannel);
      inputChannel.forEach((value, index) => {
        outputChannel[index] = value;
        let absVal = Math.abs(value);
        if (absVal > max) {
          max = absVal;
        }
      })
    })

    return true;
  }
}

registerProcessor('OutputInterceptor', OutputInterceptor);
