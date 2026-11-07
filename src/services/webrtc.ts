/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { VoiceCall, CallStatus } from '../types';

export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

export class WebRTCVoiceManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteAudioElement: HTMLAudioElement | null = null;
  private activeCallUnsubscribe: (() => void) | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.remoteAudioElement = document.createElement('audio');
      this.remoteAudioElement.autoplay = true;
    }
  }

  // Request real microphone audio stream
  public async getLocalAudio(): Promise<MediaStream> {
    if (this.localStream) return this.localStream;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.localStream = stream;
      return stream;
    } catch (err: any) {
      console.error("Microphone permission or hardware error:", err);
      throw new Error("تعذر الوصول إلى الميكروفون. يرجى منح إذن الميكروفون من إعدادات المتصفح.");
    }
  }

  // Toggle Mute
  public setMute(muted: boolean): boolean {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
      this.isMuted = muted;
    }
    return this.isMuted;
  }

  // Cleanup local stream and peer connection
  public cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    if (this.activeCallUnsubscribe) {
      this.activeCallUnsubscribe();
      this.activeCallUnsubscribe = null;
    }
    if (this.remoteAudioElement) {
      this.remoteAudioElement.srcObject = null;
    }
  }

  // Start outgoing call
  public async startCall(
    receiverId: string, 
    receiverName: string, 
    receiverAvatar: string,
    callerProfile: { id: string; name: string; avatar: string },
    onCallUpdate: (call: VoiceCall) => void
  ): Promise<string> {
    this.cleanup();
    const stream = await this.getLocalAudio();
    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const callDocRef = doc(db, 'voice_calls', callId);

    const pc = new RTCPeerConnection(RTC_CONFIG);
    this.peerConnection = pc;

    // Add local audio tracks
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    // Handle remote audio stream
    pc.ontrack = (event) => {
      if (this.remoteAudioElement && event.streams[0]) {
        this.remoteAudioElement.srcObject = event.streams[0];
      }
    };

    // Collect ICE Candidates for caller
    const callerCandidates: any[] = [];
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        callerCandidates.push(event.candidate.toJSON());
        updateDoc(callDocRef, { callerCandidates }).catch(() => {});
      }
    };

    // Create SDP Offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const callPayload: VoiceCall = {
      id: callId,
      callerId: callerProfile.id,
      callerName: callerProfile.name,
      callerAvatar: callerProfile.avatar,
      receiverId,
      receiverName,
      receiverAvatar,
      status: 'calling',
      offer: { type: offer.type, sdp: offer.sdp },
      callerCandidates: [],
      receiverCandidates: [],
      createdAt: new Date().toISOString()
    };

    await setDoc(callDocRef, callPayload);

    // Listen for answer and state changes
    this.activeCallUnsubscribe = onSnapshot(callDocRef, async (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as VoiceCall;
      onCallUpdate(data);

      if (data.status === 'connected' && data.answer && !pc.currentRemoteDescription) {
        const answerDesc = new RTCSessionDescription(data.answer);
        await pc.setRemoteDescription(answerDesc);

        // Add receiver candidates
        if (data.receiverCandidates && data.receiverCandidates.length > 0) {
          for (const cand of data.receiverCandidates) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (_) {}
          }
        }
      }

      if (data.status === 'ended' || data.status === 'rejected' || data.status === 'busy') {
        this.cleanup();
      }
    });

    return callId;
  }

  // Answer incoming call
  public async answerCall(
    callId: string, 
    onCallUpdate: (call: VoiceCall) => void
  ): Promise<void> {
    this.cleanup();
    const stream = await this.getLocalAudio();
    const callDocRef = doc(db, 'voice_calls', callId);
    const snap = await getDoc(callDocRef);
    if (!snap.exists()) throw new Error("المكالمة لم تعد متاحة.");

    const callData = snap.data() as VoiceCall;
    const pc = new RTCPeerConnection(RTC_CONFIG);
    this.peerConnection = pc;

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (this.remoteAudioElement && event.streams[0]) {
        this.remoteAudioElement.srcObject = event.streams[0];
      }
    };

    const receiverCandidates: any[] = [];
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        receiverCandidates.push(event.candidate.toJSON());
        updateDoc(callDocRef, { receiverCandidates }).catch(() => {});
      }
    };

    if (callData.offer) {
      await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
    }

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await updateDoc(callDocRef, {
      answer: { type: answer.type, sdp: answer.sdp },
      status: 'connected',
      startedAt: new Date().toISOString()
    });

    // Add caller candidates
    if (callData.callerCandidates && callData.callerCandidates.length > 0) {
      for (const cand of callData.callerCandidates) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (_) {}
      }
    }

    this.activeCallUnsubscribe = onSnapshot(callDocRef, (s) => {
      if (!s.exists()) return;
      const data = s.data() as VoiceCall;
      onCallUpdate(data);
      if (data.status === 'ended' || data.status === 'rejected') {
        this.cleanup();
      }
    });
  }

  // Reject call
  public async rejectCall(callId: string): Promise<void> {
    const callDocRef = doc(db, 'voice_calls', callId);
    await updateDoc(callDocRef, { status: 'rejected', endedAt: new Date().toISOString() }).catch(() => {});
    this.cleanup();
  }

  // End active call
  public async endCall(callId: string): Promise<void> {
    const callDocRef = doc(db, 'voice_calls', callId);
    await updateDoc(callDocRef, { status: 'ended', endedAt: new Date().toISOString() }).catch(() => {});
    this.cleanup();
  }
}

export const webrtcVoiceManager = new WebRTCVoiceManager();
