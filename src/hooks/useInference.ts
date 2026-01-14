import { useState, useCallback } from 'react';
import { useLLM } from 'react-native-executorch';
import { Message } from '../types';

const MODEL_URL = 'https://huggingface.co/software-mansion/react-native-executorch-llama-3.2/resolve/main/llama-3.2-1B/spinquant/llama3_2_spinquant.pte';
const TOKENIZER_URL = 'https://huggingface.co/software-mansion/react-native-executorch-llama-3.2/resolve/main/tokenizer.json';
const CONFIG_URL = 'https://huggingface.co/software-mansion/react-native-executorch-llama-3.2/resolve/main/tokenizer_config.json';

const SYSTEM_PROMPT = `You are the ANTIGRAVITY Agent, a high-performance local AI assistant. 
Your personality is minimalist, efficient, and slightly futuristic. 
You provide detailed technical answers and maintain a professional tone. 
Respond concisely unless asked for depth.`;

export const useInference = () => {
    const [inferenceTime, setInferenceTime] = useState(0);

    const {
        isGenerating,
        generate,
        interrupt,
        downloadProgress,
        response: streamingResponse,
    } = useLLM({
        model: {
            modelSource: MODEL_URL,
            tokenizerSource: TOKENIZER_URL,
            tokenizerConfigSource: CONFIG_URL,
        },
    });

    const runInference = useCallback(async (text: string, history: Message[]) => {
        const start = Date.now();

        try {
            const formattedHistory = history.map(m => ({
                role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant' | 'system',
                content: m.text
            }));

            const context = [
                { role: 'system' as 'system', content: SYSTEM_PROMPT },
                ...formattedHistory,
                { role: 'user' as 'user', content: text }
            ];

            const result = await generate(context);

            const end = Date.now();
            const duration = end - start;
            setInferenceTime(duration);

            return {
                response: result as unknown as string,
                time: duration
            };
        } catch (error: any) {
            console.error("Inference Error:", error);
            return {
                response: `[Local Engine Error]: ${error.message}`,
                time: 0
            };
        }
    }, [generate]);

    const isDownloading = downloadProgress !== undefined && downloadProgress < 1.0;

    return {
        runInference,
        isProcessing: isGenerating || isDownloading,
        inferenceTime,
        interrupt,
        downloadProgress: (downloadProgress || 0) * 100,
        isDownloading,
        streamingResponse,
        isGenerating
    };
};
