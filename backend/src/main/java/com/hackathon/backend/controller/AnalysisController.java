package com.hackathon.backend.controller;

import com.hackathon.backend.dto.AudioRequest;
import com.hackathon.backend.dto.ProcessRequest;
import com.hackathon.backend.service.LoggingService;
import com.hackathon.backend.service.SpeechService;
import com.hackathon.backend.service.ImageAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analysis")
@CrossOrigin(origins = "*")
public class AnalysisController {

    private final ImageAnalysisService imageAnalysisService;
    private final SpeechService speechService;
    private final LoggingService loggingService;

    @Autowired
    public AnalysisController(ImageAnalysisService imageAnalysisService, 
                              SpeechService speechService, 
                              LoggingService loggingService) {
        this.imageAnalysisService = imageAnalysisService;
        this.speechService = speechService;
        this.loggingService = loggingService;
    }

    @PostMapping("/image")
    public Map<String, String> processImage(@RequestBody ProcessRequest request) {
        String description = imageAnalysisService.processRequest(request);
        
        Map<String, String> response = new HashMap<>();
        response.put("description", description);
        response.put("status", "success");

        loggingService.logResponse("image_analysis", response);
        return response;
    }

    @PostMapping("/audio")
    public Map<String, String> processAudio(@RequestBody AudioRequest request) {
        String transcription = speechService.transcribeBase64Audio(request.getAudioData());
        
        Map<String, String> response = new HashMap<>();
        response.put("transcription", transcription);
        response.put("status", "success");

        loggingService.logResponse("audio_transcription", response);
        return response;
    }
}
