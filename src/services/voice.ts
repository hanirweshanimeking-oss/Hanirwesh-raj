import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useNovaStore, NovaMode } from '../store/novaStore';

class VoiceService {
  private recording: Audio.Recording | null = null;

  async startRecording() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return false;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;
      return true;
    } catch (err) {
      console.error('Failed to start recording', err);
      return false;
    }
  }

  async stopRecordingAndTranscribe(): Promise<string | null> {
    if (!this.recording) return null;

    try {
      await this.recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      
      const uri = this.recording.getURI();
      this.recording = null;

      if (!uri) return null;

      // In a real production app, send `uri` to Whisper API here.
      // Mocking transcription for this build.
      console.log(`Audio saved to ${uri}. Mocking Whisper transcription...`);
      return "Nova, tell me about your day.";

    } catch (error) {
      console.error('Failed to stop recording', error);
      return null;
    }
  }
}

export const voiceService = new VoiceService();

export const processVoiceResponse = async (text: string, mode: NovaMode) => {
  const store = useNovaStore.getState();
  store.setIsSpeaking(true);

  // Clean the text of markdown/tool outputs before speaking
  const spokenText = text.replace(/\*\[.*?\]\*/g, '').trim();

  // Different voice configs based on mode (simulated via pitch/rate tweaks)
  let pitch = 1.0;
  let rate = 1.0;

  if (mode === 'GF') {
    pitch = 1.2; // Softer, slightly higher
    rate = 0.9;
  } else if (mode === 'Madam') {
    pitch = 0.8; // Lower, firmer
    rate = 1.1; // Faster, sharper
  } else if (mode === 'Dev') {
    pitch = 1.0; // Neutral
    rate = 1.0;
  }

  Speech.speak(spokenText, {
    language: 'en-US',
    pitch,
    rate,
    onDone: () => {
      useNovaStore.getState().setIsSpeaking(false);
      useNovaStore.getState().setEmotion('neutral');
    },
    onStopped: () => {
      useNovaStore.getState().setIsSpeaking(false);
      useNovaStore.getState().setEmotion('neutral');
    },
    onError: () => {
      useNovaStore.getState().setIsSpeaking(false);
      useNovaStore.getState().setEmotion('neutral');
    }
  });
};
