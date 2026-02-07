Project Orchestration Rules
Tech Stack: Next.js (Frontend), Capacitor (android), Spring Boot (Java Backend).

Communication: All frontend-to-backend calls must use the Windows local IP (not localhost).

Permissions: Always include NSCameraUsageDescription and NSMicrophoneUsageDescription when generating iOS-related files.

Code Style: Use TypeScript for Frontend and Java 17+ for Backend.
This app will be a image/audio to vibration app for deaf blind people. It has a front end service which records audio and video and sends photos to a backend java service which works with azure speech sdk and azure openai to turn images and audio into vibrations. Users can define how much detail they want back from summaries to word for word. 
