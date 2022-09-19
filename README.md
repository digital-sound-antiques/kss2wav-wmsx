# kss2wav-wmsx

KSS/MGS/BGM/MPK/OPX to WAV converter using WebMSX's sound engine.

# Install

```
git clone --recursive https://github.com/digital-sound-antiques/kss2wav-wmsx.git
cd kss2wav-wmsx
npm install
npm run build
npm link
```

if you use nodenv, `nodenv rehash` is required.

# Run

```
kss2wav-wmsx foobar.mgs
```

# Usage

```
kss2wav-wmsx

  KSS to WAV converter using WebMSX sound engine. 

SYNOPSIS

  kss2wav-wmsx [<option>] <file> 

OPTIONS

  -i, --input file        Specify input KSS/MGS/BGM/MPK/OPX file name.     
  -o, --output file       Specify output WAV file name.                    
  -d, --duration number   Maximum conversion duration in seconds.          
  -l, --loop number       Specify number of song loops to exit conversion. 
  -h, --help              Print this help.
```
