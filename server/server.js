var coreAudio = require("node-core-audio"),
    express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    FFT = require('fft'),
    BUFFER_SIZE = 256,

    engine = coreAudio.createNewAudioEngine(),
    fft = new FFT.complex( BUFFER_SIZE / 2, false ),
    fftBuffer = new Float32Array(BUFFER_SIZE);

engine.setOptions({
    framesPerBuffer: BUFFER_SIZE,
    inputDevice: 1,
    interleaved: false
});
engine.addAudioCallback(processAudio);

app.use(express.static('lib'));
app.use(express.static('visualizations'));
app.get('/', function(req, res){
  res.sendfile('client/index.html');
});

io.on('connection', function(socket){});

http.listen(3000, function(){});

/**
 * Apply a Fast Fourier Transform (fft) to the time series data provided
 * by the core-audio module, and send this data through a web socket
 * to any listening clients in the format:
 *
 * { ft: fourier transform array, ts: time series array }
 *
 * @param {Array} inputBuffer
 */
function processAudio(inputBuffer) {
    var ts = new Float32Array(inputBuffer[0]), ft;
    fft.simple(fftBuffer, ts, 'complex');
    ft = fftBuffer.slice(0, BUFFER_SIZE / 2);

    io.emit('sample', {ft: ft, ts: ts} );
}