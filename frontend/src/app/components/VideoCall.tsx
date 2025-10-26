import React, { useRef, useState } from "react";
import { Button, Group, Box } from "@mantine/core";

interface VideoCallProps {
  signalingSocket: any;
  userId: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ signalingSocket, userId }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [inCall, setInCall] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  // Basic STUN server for NAT traversal (free)
  const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];

  const startCall = async () => {
    setInCall(true);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    peerConnection.current = new RTCPeerConnection({ iceServers });
    stream
      .getTracks()
      .forEach((track) => peerConnection.current!.addTrack(track, stream));

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        signalingSocket.emit("webrtc-candidate", {
          candidate: event.candidate,
          userId,
        });
      }
    };
    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Create offer and send to other user
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    signalingSocket.emit("webrtc-offer", { offer, userId });
    setCallActive(true);
  };

  // Listen for signaling events
  React.useEffect(() => {
    if (!signalingSocket) return;
    signalingSocket.on(
      "webrtc-offer",
      async ({
        offer,
        from,
      }: {
        offer: RTCSessionDescriptionInit;
        from: string;
      }) => {
        if (!peerConnection.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          peerConnection.current = new RTCPeerConnection({ iceServers });
          stream
            .getTracks()
            .forEach((track) =>
              peerConnection.current!.addTrack(track, stream)
            );
          peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
              signalingSocket.emit("webrtc-candidate", {
                candidate: event.candidate,
                userId,
              });
            }
          };
          peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
          };
        }
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        signalingSocket.emit("webrtc-answer", { answer, userId });
        setCallActive(true);
      }
    );
    signalingSocket.on(
      "webrtc-answer",
      async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        }
      }
    );
    signalingSocket.on(
      "webrtc-candidate",
      async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        if (peerConnection.current) {
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        }
      }
    );
    return () => {
      signalingSocket.off("webrtc-offer");
      signalingSocket.off("webrtc-answer");
      signalingSocket.off("webrtc-candidate");
    };
  }, [signalingSocket, userId]);

  const endCall = () => {
    setInCall(false);
    setCallActive(false);
    if (localVideoRef.current) {
      (localVideoRef.current.srcObject as MediaStream)
        ?.getTracks()
        .forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
  };

  return (
    <Box ml={"md"}>
      <Group>
        {!inCall ? (
          <Button onClick={startCall} color="indigo">
            Start Video Call
          </Button>
        ) : (
          <Button onClick={endCall} color="red">
            End Call
          </Button>
        )}
      </Group>
      <Group mt={16}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={{ width: 180, borderRadius: 8, background: "#222" }}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: 180, borderRadius: 8, background: "#222" }}
        />
      </Group>
      {callActive && (
        <Box mt={8} color="green">
          Video call active
        </Box>
      )}
    </Box>
  );
};

export default VideoCall;
