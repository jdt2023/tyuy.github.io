let localStream;
let remoteStream;
let peerConnection;
const chat = document.getElementById('chat');
const messageInput = document.getElementById('message');
const sendMessageButton = document.getElementById('sendMessageButton');
const startCallButton = document.getElementById('startCall');
const endCallButton = document.getElementById('endCall');

const config = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        }
    ]
};

startCallButton.addEventListener('click', async () => {
    try {
        startCallButton.disabled = true;
        endCallButton.disabled = false;

        // 获取本地音频流
        localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        remoteStream = new MediaStream();

        const remoteAudio = document.createElement('audio');
        remoteAudio.srcObject = remoteStream;
        remoteAudio.autoplay = true;
        document.body.appendChild(remoteAudio);

        peerConnection = new RTCPeerConnection(config);
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        peerConnection.ontrack = event => {
            event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
        };

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                // 发送ICE候选者到远端对等端
                console.log('ICE candidate:', event
