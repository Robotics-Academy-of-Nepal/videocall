let client;
let localAudioTrack;
let localVideoTrack;

const channelName = "test_channel"; // Replace with your channel name
const token = null; // Set token to null or an empty string if you are testing without authentication


async function joinCall() {
    if (typeof AgoraRTC === 'undefined') {
        console.error('AgoraRTC SDK not found');
        return;
    }

    client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    try {
        // Join the channel. Use null for token if not using authentication
        await client.join(APP_ID, channelName, token);
        console.log('Joined the channel successfully');

        // Create and initialize local tracks
        [localAudioTrack, localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        console.log('Local tracks initialized successfully');

        // Play local video and publish tracks
        localVideoTrack.play("local_stream");
        await client.publish([localAudioTrack, localVideoTrack]);
        console.log('Local tracks published successfully');

        // Handle remote stream events
        client.on("stream-added", async function (evt) {
            const remoteStream = evt.stream;
            try {
                await client.subscribe(remoteStream);
                console.log('Subscribed to remote stream');

                remoteStream.on("play", () => {
                    console.log('Remote stream playing');
                    remoteStream.play("remote_stream");
                });

            } catch (error) {
                console.error("Error subscribing to remote stream:", error);
            }
        });

        client.on("stream-removed", function (evt) {
            const remoteStream = evt.stream;
            remoteStream.stop();
            console.log('Remote stream stopped');
        });

        client.on("peer-leave", function (evt) {
            console.log('Peer left the channel');
        });

    } catch (err) {
        console.error("Error joining channel:", err);
    }
}

function leaveCall() {
    if (client) {
        client.leave(function () {
            console.log('Left the channel successfully');
            // Clean up local tracks after leaving the channel
            if (localAudioTrack) localAudioTrack.close();
            if (localVideoTrack) localVideoTrack.close();
        }, function (err) {
            console.error("Error leaving channel:", err);
        });
    } else {
        console.warn('Client not initialized');
    }
}
