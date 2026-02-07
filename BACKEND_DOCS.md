# Backend Documentation

## Overview
This is a Spring Boot 3 backend application designed to assist deaf-blind users by converting images and audio into text descriptions. It uses:
- **Azure OpenAI (GPT-4 Vision)** for image analysis.
- **Azure Cognitive Services** for speech-to-text transcription.
- **Spring Boot Web** for RESTful API endpoints.

## Prerequisites
- **Java 17** or higher.
- **Maven** (included via `mvnw` wrapper).
- **Azure API Keys** (configured in `src/main/resources/application.properties`).

## How to Run
1. Open a terminal in the `backend` directory.
2. Run the application using the Maven wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```
   (On Windows Command Prompt, use `mvnw spring-boot:run`)
3. The server will start on port **8080**.

## API Endpoints

### 1. Image Analysis
- **URL**: `http://<YOUR_IP>:8080/api/analysis/image`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "image": "base64_encoded_image_string...",
    "detailLevel": "low"  // Options: "low", "medium", "high"
  }
  ```
- **Response**:
  ```json
  {
    "description": "A detailed description of the image..."
  }
  ```

### 2. Audio Transcription
- **URL**: `http://<YOUR_IP>:8080/api/analysis/audio`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "audioData": "base64_encoded_audio_string..."
  }
  ```
- **Response**:
  ```json
  {
    "transcription": "The transcribed text from the audio..."
  }
  ```

## Project Structure
- **`src/main/java/com/hackathon/backend/`**:
  - **`controller/`**: Contains `AnalysisController.java` which defines the API endpoints.
  - **`service/`**: Contains the business logic:
    - `ImageAnalysisService.java`: Handles Azure OpenAI calls.
    - `SpeechService.java`: Handles Azure Speech calls.
    - `LoggingService.java`: Logs all responses to `log.json`.
  - **`dto/`**: Data Transfer Objects (POJOs) for JSON request/response bodies.
  - **`config/`**: Configuration files (e.g., `WebConfig.java` for CORS).

## Configuration
The application is configured via `src/main/resources/application.properties`.
**Important**: Ensure your Azure Endpoint and Key are set correctly.

```properties
azure.openai.endpoint=<YOUR_ENDPOINT>
azure.openai.key=<YOUR_KEY>
azure.openai.deployment-name=gpt-4-vision-preview
azure.speech.key=<YOUR_SPEECH_KEY>
azure.speech.region=<YOUR_SPEECH_REGION>
```

## Redundant Files & Folders
The following packages are currently unused (no database integration yet) and can be ignored or deleted:
- `src/main/java/com/hackathon/backend/model/`
- `src/main/java/com/hackathon/backend/repository/`

The `package-info.java` files in other packages are also placeholders and can be removed:
- `src/main/java/com/hackathon/backend/config/package-info.java`
- `src/main/java/com/hackathon/backend/dto/package-info.java`
- `src/main/java/com/hackathon/backend/exception/package-info.java`
- `src/main/java/com/hackathon/backend/service/package-info.java`
