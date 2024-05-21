const videoContainer = document.getElementById('vid-container')
const video = document.getElementById('video'); // Main video output

const emojiImg = document.getElementById('emoji-img');
let lastRandom = 0;

const screenshot1 = document.getElementById('ss-1'); 
const screenshot2 = document.getElementById('ss-2');
const imgCanvas = document.createElement('canvas'); // placeholder to take video screenshot
const ctx = imgCanvas.getContext('2d');

imgCanvas.width = 640;
imgCanvas.height = 480;

function takeScreenshot() {
  ctx.drawImage(video, 0, 0, imgCanvas.width, imgCanvas.height); // take the screenshot from the vid
  var dataURI = imgCanvas.toDataURL('image/jpeg');

  // san siya iddisplay
  screenshot1.src = dataURI;
}

function changeEmoji() {
  let randomNumber;
  do {
    randomNumber = Math.floor(Math.random() * 5) + 1;
  } while (lastRandom === randomNumber);

  lastRandom = randomNumber;
  emojiImg.src = `./emojis/${randomNumber}.png`
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => console.error(err));
    changeEmoji()
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  videoContainer.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})

document.addEventListener('DOMContentLoaded', (event) => {
  document.addEventListener('keydown', function(event) {
      if (event.code === 'Space') {
          takeScreenshot();
          changeEmoji();
      }
  });
});