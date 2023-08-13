const socket = io.connect('http://' + document.domain + ':' + location.port);

const localVideo = document.getElementById('local-video');
const remoteVideos = document.getElementById('remote-videos');

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localVideo.srcObject = stream;
        socket.emit('join', { room: 'default' });

        socket.on('peer_joined', () => {
            const peerConnection = new RTCPeerConnection();

            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });

            peerConnection.ontrack = event => {
                const remoteVideo = document.createElement('video');
                remoteVideo.srcObject = event.streams[0];
                remoteVideo.autoplay = true;
                remoteVideos.appendChild(remoteVideo);
            };

            peerConnection.createOffer()
                .then(offer => peerConnection.setLocalDescription(offer))
                .then(() => {
                    socket.emit('offer', { sdp: peerConnection.localDescription });
                });

            socket.on('answer', answer => {
                peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            });

            socket.on('ice_candidate', iceCandidate => {
                peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
            });
        });
    })
    .catch(error => console.error('Error accessing media devices:', error));
