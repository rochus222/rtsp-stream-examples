const imageSocket = new WebSocket("ws://localhost:1233/");
const image = document.querySelector('#image');
imageSocket.onmessage = function (event) {
  image.src = 'data:image/jpeg;base64,' + event.data;
}

