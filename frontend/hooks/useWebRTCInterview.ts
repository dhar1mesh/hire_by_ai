"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export type ConnectionState =
  | "idle"
  | "requesting_permission"
  | "connecting"
  | "active"
  | "paused"
  | "disconnected"
  | "error";

export interface TranscriptItem {
  id: string;
  sender: "candidate" | "interviewer";
  text: string;
  timestamp: number;
  isFinal: boolean;
}

export interface UseWebRTCInterviewReturn {
  connectionState: ConnectionState;
  error: string | null;
  transcripts: TranscriptItem[];
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMicMuted: boolean;
  isVideoMuted: boolean;
  isAiSpeaking: boolean;
  isUserSpeaking: boolean;
  aiVolume: number; // 0 to 1
  userVolume: number; // 0 to 1
  startInterview: (customApiKey?: string) => Promise<void>;
  endInterview: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  sendTextMessage: (text: string) => void;
  cancelAiResponse: () => void;
}

export function useWebRTCInterview(): UseWebRTCInterviewReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);
  const [aiVolume, setAiVolume] = useState<number>(0);
  const [userVolume, setUserVolume] = useState<number>(0);

  // References to WebRTC & Audio internals
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Web Audio API refs for reactive visualizer
  const audioContextRef = useRef<AudioContext | null>(null);
  const aiAnalyserRef = useRef<AnalyserNode | null>(null);
  const userAnalyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Current active AI response buffer
  const currentAiResponseIdRef = useRef<string | null>(null);

  // Initialize hidden <audio> element for remote AI voice playback
  useEffect(() => {
    if (typeof window !== "undefined" && !audioElementRef.current) {
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioEl.setAttribute("playsinline", "true");
      audioElementRef.current = audioEl;
    }

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.srcObject = null;
      }
    };
  }, []);

  // Animation loop to measure real-time audio volumes for visualizer
  const startAudioMeters = useCallback(
    (aiAnalyser: AnalyserNode, userAnalyser: AnalyserNode) => {
      const aiData = new Uint8Array(aiAnalyser.frequencyBinCount);
      const userData = new Uint8Array(userAnalyser.frequencyBinCount);

      const checkVolumes = () => {
        // AI Audio Level
        aiAnalyser.getByteFrequencyData(aiData);
        let aiSum = 0;
        for (let i = 0; i < aiData.length; i++) {
          aiSum += aiData[i];
        }
        const aiAvg = aiSum / aiData.length;
        const normalizedAi = Math.min(1, (aiAvg / 128) * 1.5);
        setAiVolume(normalizedAi);
        if (normalizedAi > 0.05) {
          setIsAiSpeaking(true);
        }

        // User Audio Level
        userAnalyser.getByteFrequencyData(userData);
        let userSum = 0;
        for (let i = 0; i < userData.length; i++) {
          userSum += userData[i];
        }
        const userAvg = userSum / userData.length;
        const normalizedUser = Math.min(1, (userAvg / 128) * 1.5);
        setUserVolume(normalizedUser);

        animFrameRef.current = requestAnimationFrame(checkVolumes);
      };

      animFrameRef.current = requestAnimationFrame(checkVolumes);
    },
    []
  );

  // Clean up all resources
  const cleanup = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsAiSpeaking(false);
    setIsUserSpeaking(false);
    setAiVolume(0);
    setUserVolume(0);
  }, []);

  // WebRTC Start Method
  const startInterview = useCallback(
    async (customApiKey?: string) => {
      try {
        setError(null);
        setConnectionState("requesting_permission");

        // 1. Capture candidate webcam and high-fidelity microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
          },
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        });

        localStreamRef.current = stream;
        setLocalStream(stream);

        setConnectionState("connecting");

        // 2. Request ephemeral token from Next.js Node.js Session Broker
        const sessionHeaders: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (customApiKey) {
          sessionHeaders["x-openai-api-key"] = customApiKey;
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        const sessionRes = await fetch(`${backendUrl}/api/session`, {
          method: "POST",
          headers: sessionHeaders,
          body: JSON.stringify(customApiKey ? { apiKey: customApiKey } : {}),
        });

        if (!sessionRes.ok) {
          const errData = await sessionRes.json();
          throw new Error(errData.message || "Failed to authenticate session broker.");
        }

        const session = await sessionRes.json();
        const EPHEMERAL_KEY = session.client_secret?.value;

        if (!EPHEMERAL_KEY) {
          throw new Error("No client_secret returned from session broker.");
        }

        // 3. Initialize RTCPeerConnection
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        peerConnectionRef.current = pc;

        // 4. Set up Web Audio API for reactive visualizer
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;

        if (audioCtx.state === "suspended") {
          await audioCtx.resume();
        }

        // User mic analyser
        const userSource = audioCtx.createMediaStreamSource(stream);
        const userAnalyser = audioCtx.createAnalyser();
        userAnalyser.fftSize = 128;
        userSource.connect(userAnalyser);
        userAnalyserRef.current = userAnalyser;

        // AI remote audio analyser
        const aiAnalyser = audioCtx.createAnalyser();
        aiAnalyser.fftSize = 128;
        aiAnalyserRef.current = aiAnalyser;

        // 5. Handle incoming remote audio track from OpenAI Realtime
        pc.ontrack = (event) => {
          const rStream = event.streams[0];
          setRemoteStream(rStream);

          if (audioElementRef.current) {
            audioElementRef.current.srcObject = rStream;
            audioElementRef.current.play().catch((err) => {
              console.warn("Audio autoplay blocked or interrupted:", err);
            });
          }

          // Pipe remote audio into AI Analyser Node for visualizer pulse
          try {
            const remoteSource = audioCtx.createMediaStreamSource(rStream);
            remoteSource.connect(aiAnalyser);
          } catch (e) {
            console.error("Failed to connect remote audio to analyser:", e);
          }

          startAudioMeters(aiAnalyser, userAnalyser);
        };

        // 6. Add local audio track to PeerConnection
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          pc.addTrack(audioTrack, stream);
        }

        // 7. Create RTCDataChannel for real-time bidirectional events
        const dc = pc.createDataChannel("oai-events");
        dataChannelRef.current = dc;

        dc.onopen = () => {
          console.log("[WebRTC] OpenAI DataChannel connected successfully!");
          setConnectionState("active");

          // Trigger the initial conversation greeting from Sarah Chen
          const initialGreetingEvent = {
            type: "response.create",
            response: {
              modalities: ["audio", "text"],
              instructions:
                "Begin the interview immediately with a concise, professional 2-sentence opening greeting Alex Doe by name as Sarah Chen, Lead Technical Architect. Ask him to give a high-level overview of the High-Throughput Job Scheduler project.",
            },
          };
          dc.send(JSON.stringify(initialGreetingEvent));
        };

        dc.onclose = () => {
          console.log("[WebRTC] DataChannel closed.");
        };

        dc.onerror = (e) => {
          console.error("[WebRTC] DataChannel error:", e);
        };

        // 8. Process Realtime DataChannel Events
        dc.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            switch (data.type) {
              // User speech detected by server VAD
              case "input_audio_buffer.speech_started": {
                setIsUserSpeaking(true);
                break;
              }
              case "input_audio_buffer.speech_stopped": {
                setIsUserSpeaking(false);
                break;
              }

              // Candidate speech transcription (Whisper-1)
              case "conversation.item.input_audio_transcription.completed": {
                const candidateText = data.transcript?.trim();
                if (candidateText) {
                  setTranscripts((prev) => [
                    ...prev,
                    {
                      id: data.item_id || `cand-${Date.now()}`,
                      sender: "candidate",
                      text: candidateText,
                      timestamp: Date.now(),
                      isFinal: true,
                    },
                  ]);
                }
                break;
              }

              // AI voice streaming transcript delta
              case "response.audio_transcript.delta": {
                setIsAiSpeaking(true);
                const delta = data.delta;
                const responseId = data.response_id || "current-ai";
                currentAiResponseIdRef.current = responseId;

                setTranscripts((prev) => {
                  const last = prev[prev.length - 1];
                  if (last && last.sender === "interviewer" && !last.isFinal) {
                    return [
                      ...prev.slice(0, -1),
                      {
                        ...last,
                        text: last.text + delta,
                      },
                    ];
                  } else {
                    return [
                      ...prev,
                      {
                        id: responseId,
                        sender: "interviewer",
                        text: delta,
                        timestamp: Date.now(),
                        isFinal: false,
                      },
                    ];
                  }
                });
                break;
              }

              // AI turn completed
              case "response.audio_transcript.done": {
                const finalTranscript = data.transcript;
                setTranscripts((prev) => {
                  const last = prev[prev.length - 1];
                  if (last && last.sender === "interviewer") {
                    return [
                      ...prev.slice(0, -1),
                      {
                        ...last,
                        text: finalTranscript || last.text,
                        isFinal: true,
                      },
                    ];
                  }
                  return prev;
                });
                break;
              }

              case "response.done": {
                setIsAiSpeaking(false);
                break;
              }

              case "error": {
                console.error("[WebRTC Realtime Error]:", data.error);
                if (data.error?.message) {
                  setError(data.error.message);
                }
                break;
              }

              default:
                break;
            }
          } catch (e) {
            console.error("Error parsing Realtime event:", e);
          }
        };

        // 9. WebRTC Offer generation & SDP exchange
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const baseUrl = "https://api.openai.com/v1/realtime";
        const model = "gpt-4o-realtime-preview-2024-12-17";
        const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${EPHEMERAL_KEY}`,
            "Content-Type": "application/sdp",
          },
        });

        if (!sdpResponse.ok) {
          const sdpErr = await sdpResponse.text();
          throw new Error(`SDP negotiation failed with OpenAI (${sdpResponse.status}): ${sdpErr}`);
        }

        const answerSdp = await sdpResponse.text();
        const answer: RTCSessionDescriptionInit = {
          type: "answer",
          sdp: answerSdp,
        };

        await pc.setRemoteDescription(answer);
      } catch (err: any) {
        console.error("Failed to start WebRTC interview:", err);
        setError(err.message || "Failed to start interview.");
        setConnectionState("error");
        cleanup();
      }
    },
    [cleanup, startAudioMeters]
  );

  // End interview and tear down WebRTC connection
  const endInterview = useCallback(() => {
    cleanup();
    setConnectionState("disconnected");
  }, [cleanup]);

  // Toggle Microphone Mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // Toggle Video Camera
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  }, []);

  // Send textual message over DataChannel
  const sendTextMessage = useCallback((text: string) => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === "open") {
      const itemCreate = {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: text,
            },
          ],
        },
      };
      dataChannelRef.current.send(JSON.stringify(itemCreate));
      dataChannelRef.current.send(JSON.stringify({ type: "response.create" }));
    }
  }, []);

  // Interrupt / Cancel current AI speech
  const cancelAiResponse = useCallback(() => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === "open") {
      dataChannelRef.current.send(JSON.stringify({ type: "response.cancel" }));
      setIsAiSpeaking(false);
    }
  }, []);

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    connectionState,
    error,
    transcripts,
    localStream,
    remoteStream,
    isMicMuted,
    isVideoMuted,
    isAiSpeaking,
    isUserSpeaking,
    aiVolume,
    userVolume,
    startInterview,
    endInterview,
    toggleMute,
    toggleVideo,
    sendTextMessage,
    cancelAiResponse,
  };
}
