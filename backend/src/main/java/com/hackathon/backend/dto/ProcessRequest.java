package com.hackathon.backend.dto;

import lombok.Data;

@Data
public class ProcessRequest {
    private String image;
    private String audioText;
    private String timestamp;
    private String detailLevel; // "summary", "moderate", "verbose"
}
