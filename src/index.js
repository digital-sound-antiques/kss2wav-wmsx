const fs = require('fs');
const path = require('path');
const commandLineArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");

const { KSS, KSSPlay } = require('libkss-js');
const { WaveFile } = require('wavefile');

const optionDefinitions = [
  {
    name: "input",
    alias: "i",
    typeLabel: "{underline file}",
    defaultOption: true,
    description: "Specify input KSS/MGS/BGM/MPK/OPX file name.",
    type: String,
  },
  {
    name: "output",
    alias: "o",
    typeLabel: "{underline file}",
    description: "Specify output WAV file name.",
    type: String
  },
  {
    name: "duration",
    alias: "d",
    description: "Maximum conversion duration in seconds.",
    defaultValue: 180,
    type: Number
  },
  {
    name: "loop",
    alias: "l",
    description: "Specify number of song loops to exit conversion.",
    defaultValue: 2,
    type: Number
  },
  {
    name: "no-opll",
    description: "Disable OPLL.",
    type: Boolean
  },
  {
    name: "no-psg",
    description: "Disable PSG.",
    type: Boolean
  },
  {
    name: "help",
    alias: "h",
    description: "Print this help.",
    type: Boolean
  },
];

const sections = [
  {
    header: "kss2wav-wmsx",
    content: "KSS to WAV converter using WebMSX sound engine."
  },
  {
    header: "SYNOPSIS",
    content: ["{underline kss2wav-wmsx} [<option>] <file>"]
  },
  {
    header: "OPTIONS",
    optionList: optionDefinitions
  },
];

const CPU_CLOCK = 3579545;
const RATE = 49716;
const FM_DIV = 72;
const PSG_DIV = 32;

function convert(kss, duration, loop, noOpll, noPsg) {
  const ym2413 = new wmsx.YM2413Audio();
  const psg = new wmsx.PSG();
  const psgAudio = psg.getAudioChannel();

  ym2413.reset();
  psg.reset();

  const kssplay = new KSSPlay(RATE);

  kssplay.setData(kss);
  kssplay.reset();
  kssplay.setIOWriteHandler((_, a, d) => {
    if (a === 0xA0) {
      psg.outputA0(d);
    } else if (a === 0xA1) {
      psg.outputA1(d);
    } else if (a === 0x7c) {
      ym2413.output7C(d);
    } else if (a === 0x7d) {
      ym2413.output7D(d);
    }
  });

  const samples = [];
  let psgSample = 0, fmSample = 0;
  for (let i = 0; i < CPU_CLOCK * duration; i++) {
    if (i % (CPU_CLOCK * 10) == 0) {
      process.stderr.write('.');
    }
    if (!noPsg && i % PSG_DIV == 0) {
      // rough rate conversion
      psgSample = psgAudio.nextSample() * 512;
    }
    if (i % FM_DIV == 0) {
      if (!noOpll) {
        fmSample = ym2413.nextSample();
      }

      kssplay.calcSilent(1);
      if (kssplay.getStopFlag() != 0) {
        break;
      }
      if (loop > 0 && kssplay.getLoopCount() >= loop) {
        break;
      }
      samples.push((fmSample + psgSample) << 6);
    }
  }

  kssplay.release();

  return samples;
}

async function main() {

  const options = commandLineArgs(optionDefinitions, { argv: process.argv });

  if (options.help || options.input == null) {
    console.error(commandLineUsage(sections));
    return;
  }

  if (options.output == null) {
    options.output = path.basename(options.input).replace(/\.([a-z0-9]+)$/i, '.wav');

  }

  await KSSPlay.initialize(); // must be called before using KSSPlay.

  const data = fs.readFileSync(options.input);
  const kss = new KSS(data);
  samples = convert(kss, options.duration, options.loop, options["no-opll"], options["no-psg"]);
  kss.release();

  const wav = new WaveFile();
  wav.fromScratch(1, RATE, "16", samples);
  console.error(`\nOutput: ${options.output}`);
  fs.writeFileSync(options.output, wav.toBuffer());

}

main();