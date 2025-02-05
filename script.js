const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const captureBtn = document.getElementById('capture');
const switchBtn = document.getElementById('switchCamera');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const invertBtn = document.getElementById('invert');
const flashBtn = document.getElementById('flash');
const downloadLink = document.getElementById('download');

let currentStream = null;
let isFrontCamera = true;
let zoom = 1;
let isInverted = false;
let track = null;

// Start Camera
async function startCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        const constraints = {
            video: {
                facingMode: isFrontCamera ? 'user' : 'environment',
                zoom: zoom
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = stream;
        video.srcObject = stream;

        track = stream.getVideoTracks()[0];
    } catch (err) {
        alert('Error accessing camera: ' + err);
    }
}

// Switch Camera
switchBtn.addEventListener('click', () => {
    isFrontCamera = !isFrontCamera;
    startCamera();
});

// Capture Image
captureBtn.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.filter = isInverted ? 'invert(1)' : 'none';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Save Image
    downloadLink.href = canvas.toDataURL('image/jpeg');
    downloadLink.style.display = 'inline';
});

// Zoom In & Out
zoomInBtn.addEventListener('click', () => changeZoom(0.1));
zoomOutBtn.addEventListener('click', () => changeZoom(-0.1));

function changeZoom(amount) {
    if (track && track.getCapabilities().zoom) {
        let capabilities = track.getCapabilities();
        zoom = Math.min(Math.max(zoom + amount, capabilities.zoom.min), capabilities.zoom.max);

        track.applyConstraints({ advanced: [{ zoom }] });
    }
}

// Invert Color
invertBtn.addEventListener('click', () => {
    isInverted = !isInverted;
    video.style.filter = isInverted ? 'invert(1)' : 'none';
});

// Flashlight Toggle
flashBtn.addEventListener('click', () => {
    if (track && track.getCapabilities().torch) {
        let torchState = track.getSettings().torch;
        track.applyConstraints({ advanced: [{ torch: !torchState }] });
    } else {
        alert('Flash not supported on this device.');
    }
});

// Start Camera on Load
startCamera();