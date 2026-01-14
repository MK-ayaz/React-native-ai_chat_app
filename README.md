# Niffler AI - Local Chat Client

Niffler is a high-performance, offline-first AI chat application built with React Native and ExecuTorch. It runs Llama 3.2 1B natively on your device.

## Features
- **Local Inference**: Runs Llama 3.2 1B entirely on-device using `react-native-executorch`.
- **Privacy Focused**: No data leaves your device.
- **Streaming Response**: Real-time typewriter effect.
- **Sessions**: Save and manage multiple chat histories.
- **Code Highlighting**: Proper markdown rendering for code blocks.
- **Haptic Feedback**: Tactile interactions.

## Prerequisites
- Node.js > 18
- React Native Development Environment (Android Studio / Xcode)
- CMake (for building ExecuTorch)

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Android Setup**
   Ensure you have the NDK installed (version 26.1.10909125 or similar recommended for ExecuTorch).
   ```bash
   npx expo run:android
   ```

3. **iOS Setup**
   ```bash
   npx expo run:ios
   ```

## Models
The app is configured to download `Llama 3.2 1B` from HuggingFace.
- Model URL: `https://huggingface.co/software-mansion/react-native-executorch-llama-3.2/resolve/main/llama-3.2-1B/spinquant/llama3_2_spinquant.pte`
- Tokenizer: `tokenizer.json` + `tokenizer_config.json`

## Roadmap
- [ ] Whisper (STT) Integration
- [ ] Vision Model Support
- [ ] RAG (Retrieval Augmented Generation)

## Troubleshooting
**"Maximum update depth exceeded"**:
This typically happens if the chat list updates too frequently. We use an optimized `FlatList` with `inverted={true}` to handle streaming efficiently.

## License
MIT
