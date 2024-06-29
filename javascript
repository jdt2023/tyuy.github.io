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
                console.log('ICE candidate:', event.candidate);
            }
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        // 模拟远端对等端
        simulateRemotePeer(offer);
    } catch (error) {
        console.error('启动通话时出错:', error);
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
        chat.scrollTop = chat.scrollHeight; // 滚动到底部
        messageInput.value = '';
        
        // 模拟接收到同样的消息用于展示
        setTimeout(() => {
            const remoteMessageElement = document.createElement('div');
            remoteMessageElement.textContent = message;
            remoteMessageElement.className = 'message remote';
            chat.appendChild(remoteMessageElement);
            chat.scrollTop = chat.scrollHeight; // 滚动到底部
        }, 500);
    }
}

// 模拟远端对等端
async function simulateRemotePeer(offer) {
    const remotePeerConnection = new RTCPeerConnection(config);
    remotePeerConnection.onicecandidate = event => {
        if (event.candidate) {
            peerConnection.addIceCandidate(event.candidate);
        }
    };
    remotePeerConnection.ontrack = event => {
        event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
    };

    await remotePeerConnection.setRemoteDescription(offer);
    const answer = await remotePeerConnection.createAnswer();
    await remotePeerConnection.setLocalDescription(answer);
    await peerConnection.setRemoteDescription(answer);

    localStream.getTracks().forEach(track => remotePeerConnection.addTrack(track, localStream));
}
