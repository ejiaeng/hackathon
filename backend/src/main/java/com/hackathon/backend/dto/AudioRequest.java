package com.hackathon.backend.dto;

import lombok.Data;

@Data
public class AudioRequest {
    private String audioData; // Base64 encoded audio
    private String format;    // e.g., "wav", "mp3"
}
