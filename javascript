let localStream;
let remoteStream;
let peerConnection;
const chat = document.getElementById('chat');
const messageInput = document.getElementById('message');
const startCallButton = document.getElementById('startCall');
const endCallButton = document.getElementById('endCall');

const config = {
    iceServers: [
        {
            urls: "stun:stun.stunprotocol.org"
        }
    ]
};

startCallButton.addEventListener('click', async () => {
    try {
        startCallButton.disabled = true;
        endCallButton.disabled = false;

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
                // Send the candidate to the remote peer
                // sendCandidate(event.candidate);
            }
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        // Send the offer to the remote peer
        // sendOffer(offer);

        // For demo purposes, we simulate the remote peer here
        simulateRemotePeer(offer);
    } catch (error) {
        console.error('Error starting call:', error);
        startCallButton.disabled = false;
        endCallButton.disabled = true;
    }
});

endCallButton.addEventListener('click', () => {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    startCallButton.disabled = false;
    endCallButton.disabled = true;
});

messageInput.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = messageInput.value;
    if (message.trim()) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.className = 'message user';
        chat.appendChild(messageElement);
        chat.scrollTop = chat.scrollHeight; // Scroll to the bottom
        messageInput.value = '';
        
        // Simulate receiving the same message for demo purposes
        setTimeout(() => {
            const remoteMessageElement = document.createElement('div');
            remoteMessageElement.textContent = message;
            remoteMessageElement.className = 'message remote';
            chat.appendChild(remoteMessageElement);
            chat.scrollTop = chat.scrollHeight; // Scroll to the bottom
        }, 500);
    }
}

// Simulate remote peer for demo purposes
async function simulateRemotePeer(offer) {
    const remotePeerConnection = new RTCPeerConnection(config);
    remotePeerConnection.onicecandidate = event => {
        if (event.candidate) {
            peerConnection.addIceCandidate(event.candidate);
        }
    };
    remotePeerConnection.ontrack = event => {
        event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track
