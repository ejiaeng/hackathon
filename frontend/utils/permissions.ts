import { Camera } from '@capacitor/camera';
import { VoiceRecorder } from 'capacitor-voice-recorder';

export const requestAppPermissions = async () => {
  try {
    // 1. Request Camera Permission
    const cameraStatus = await Camera.requestPermissions();
    console.log('Camera permission status:', cameraStatus.camera);

    // 2. Request Microphone (Audio) Permission
    const audioStatus = await VoiceRecorder.requestAudioRecordingPermission();
    console.log('Audio permission status:', audioStatus.value);

    // Note: Haptics (Vibration) does not require a runtime permission prompt on Android,
    // it only needs the permission in AndroidManifest.xml which is already set.

    return {
      camera: cameraStatus.camera,
      audio: audioStatus.value ? 'granted' : 'denied',
    };
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return null;
  }
};
