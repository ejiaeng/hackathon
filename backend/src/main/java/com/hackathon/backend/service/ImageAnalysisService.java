package com.hackathon.backend.service;

import com.azure.ai.openai.OpenAIClient;
import com.azure.ai.openai.OpenAIClientBuilder;
import com.azure.ai.openai.models.*;
import com.azure.core.credential.AzureKeyCredential;
import com.hackathon.backend.dto.ProcessRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ImageAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(ImageAnalysisService.class);

    @Value("${azure.openai.key}")
    private String apiKey;

    @Value("${azure.openai.endpoint}")
    private String endpoint;

    @Value("${azure.openai.deployment-name}")
    private String deploymentName;

    public String processRequest(ProcessRequest request) {
        logger.info("Processing request with detail level: {}", request.getDetailLevel());

        if (apiKey == null || apiKey.isEmpty() || "YOUR_AZURE_OPENAI_KEY".equals(apiKey)) {
            logger.warn("Azure OpenAI API key is missing or default. Running in simulation mode.");
            return "Simulation: Backend received image and audio. " +
                   "Detail level: " + request.getDetailLevel() + ". " +
                   "Audio text: " + request.getAudioText();
        }

        try {
            OpenAIClient client = new OpenAIClientBuilder()
                    .credential(new AzureKeyCredential(apiKey))
                    .endpoint(endpoint)
                    .buildClient();

            List<ChatRequestMessage> chatMessages = new ArrayList<>();

            // System Prompt based on detail level
            String systemPrompt = "You are an assistant for a deaf-blind user. " +
                    "Analyze the provided image and audio text. " +
                    "Output a description that will be converted to vibrations/haptics. ";
            
            if ("verbose".equalsIgnoreCase(request.getDetailLevel())) {
                systemPrompt += "Provide a highly detailed, word-for-word description of the scene and audio context.";
            } else if ("moderate".equalsIgnoreCase(request.getDetailLevel())) {
                systemPrompt += "Provide a moderate summary, capturing key elements and actions.";
            } else {
                systemPrompt += "Provide a brief, high-level summary.";
            }
            
            chatMessages.add(new ChatRequestSystemMessage(systemPrompt));

            // User Message
            List<ChatMessageContentItem> contentItems = new ArrayList<>();
            
            if (request.getAudioText() != null && !request.getAudioText().isEmpty()) {
                contentItems.add(new ChatMessageTextContentItem("Audio Context: " + request.getAudioText()));
            }

            if (request.getImage() != null && !request.getImage().isEmpty()) {
                String imageUrl = request.getImage();
                if (!imageUrl.startsWith("http") && !imageUrl.startsWith("data:")) {
                     imageUrl = "data:image/jpeg;base64," + imageUrl;
                }
                contentItems.add(new ChatMessageImageContentItem(new ChatMessageImageUrl(imageUrl)));
            }

            if (contentItems.isEmpty()) {
                logger.warn("No content items provided in request.");
                return "No input provided.";
            }

            chatMessages.add(new ChatRequestUserMessage(contentItems));

            ChatCompletionsOptions options = new ChatCompletionsOptions(chatMessages);
            options.setMaxTokens(500);

            logger.info("Sending request to Azure OpenAI...");
            ChatCompletions chatCompletions = client.getChatCompletions(deploymentName, options);
            String response = chatCompletions.getChoices().get(0).getMessage().getContent();
            
            logger.info("Received response from Azure OpenAI.");
            return response;

        } catch (Exception e) {
            logger.error("Error processing request with Azure OpenAI", e);
            throw new RuntimeException("Failed to process request: " + e.getMessage());
        }
    }
}
