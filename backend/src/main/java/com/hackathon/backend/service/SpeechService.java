package com.hackathon.backend.service;

import com.microsoft.cognitiveservices.speech.*;
import com.microsoft.cognitiveservices.speech.audio.AudioConfig;
import com.microsoft.cognitiveservices.speech.audio.PushAudioInputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.concurrent.Future;

@Service
public class SpeechService {
    private static final Logger logger = LoggerFactory.getLogger(SpeechService.class);

    @Value("${azure.speech.key}")
    private String speechKey;

    @Value("${azure.speech.region}")
    private String speechRegion;

    public String transcribeBase64Audio(String base64Audio) {
        if (speechKey == null || speechKey.isEmpty() || "YOUR_AZURE_SPEECH_KEY".equals(speechKey)) {
            logger.warn("Azure Speech key is missing. Simulation mode.");
            return "Simulation: This is a transcribed text from audio.";
        }

        try {
            byte[] audioBytes = Base64.getDecoder().decode(base64Audio);
            
            SpeechConfig speechConfig = SpeechConfig.fromSubscription(speechKey, speechRegion);
            PushAudioInputStream pushStream = PushAudioInputStream.create();
            AudioConfig audioConfig = AudioConfig.fromStreamInput(pushStream);
            
            SpeechRecognizer recognizer = new SpeechRecognizer(speechConfig, audioConfig);
            
            pushStream.write(audioBytes);
            pushStream.close();

            Future<SpeechRecognitionResult> task = recognizer.recognizeOnceAsync();
            SpeechRecognitionResult result = task.get();

            if (result.getReason() == ResultReason.RecognizedSpeech) {
                return result.getText();
            } else {
                logger.error("Speech recognition failed: {}", result.getReason());
                return "Error: Could not recognize speech.";
            }
        } catch (Exception e) {
            logger.error("Error in speech transcription", e);
            return "Error: " + e.getMessage();
        }
    }
}
