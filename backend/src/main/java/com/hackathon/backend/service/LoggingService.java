package com.hackathon.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class LoggingService {
    private static final Logger logger = LoggerFactory.getLogger(LoggingService.class);
    private final ObjectMapper objectMapper;
    private static final String LOG_FILE = "log.json";

    public LoggingService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    public void logResponse(String type, Object response) {
        try {
            Map<String, Object> logEntry = new HashMap<>();
            logEntry.put("timestamp", System.currentTimeMillis());
            logEntry.put("type", type);
            logEntry.put("data", response);

            String jsonString = objectMapper.writeValueAsString(logEntry);
            
            synchronized (this) {
                try (FileWriter writer = new FileWriter(LOG_FILE, true)) {
                    writer.write(jsonString + "\n");
                }
            }
            logger.info("Logged {} response to {}", type, LOG_FILE);
        } catch (IOException e) {
            logger.error("Failed to log to json file", e);
        }
    }
}
