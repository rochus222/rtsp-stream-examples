const socket = new WebSocket("ws://localhost:1234/");
socket.binaryType = 'arraybuffer';

const mimeCodec = 'video/mp4; codecs="avc1.4d002a"';

const video = document.querySelector('#wsVideo');
const mediaSource = new MediaSource();
const queue = [];
mediaSource.addEventListener("sourceopen", () => {
  buffer = mediaSource.addSourceBuffer(mimeCodec);
  buffer.mode = "sequence";
  const handleData = () => {
    setTimeout(() => {
      if (queue.length > 0 && !buffer.updating) {
        buffer.appendBuffer(queue.shift());
        if (video.paused) {
          video.play();
        }
      }
      return handleData();
    }, 10);
  };
  handleData();
});

socket.onmessage = async function (event) {
  queue.push(event.data);
};

video.src = URL.createObjectURL(mediaSource);

