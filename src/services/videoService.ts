export interface MediaState {
  hasVideo: boolean;
  hasAudio: boolean;
  isScreenSharing: boolean;
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  error: string | null;
}

class VideoService {
  /**
   * Request local media stream with real browser APIs
   */
  public async getLocalStream(video = true, audio = true): Promise<MediaStream | null> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
        audio: audio
      });
      return stream;
    } catch (err) {
      console.warn('Media devices not accessible or user denied permission:', err);
      return null;
    }
  }

  /**
   * Request screen sharing stream
   */
  public async getScreenStream(): Promise<MediaStream | null> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      return null;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      return stream;
    } catch (err) {
      console.warn('Screen sharing cancelled or unavailable:', err);
      return null;
    }
  }

  public stopStream(stream: MediaStream | null) {
    if (!stream) return;
    stream.getTracks().forEach(track => {
      try {
        track.stop();
      } catch (e) {
        console.warn('Failed to stop track:', e);
      }
    });
  }
}

export const videoService = new VideoService();
