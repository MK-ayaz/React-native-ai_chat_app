import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, KeyboardAvoidingView, Platform, StatusBar, Alert, Text, TouchableOpacity } from 'react-native';
import { StatusHeader } from '../components/StatusHeader';
import { ChatBubble } from '../components/ChatBubble';
import { InputBar } from '../components/InputBar';
import { PerformanceHUD } from '../components/PerformanceHUD';
import { AgentState } from '../components/GravityCore';
import { Message } from '../types';
import { Colors, Gaps } from '../theme/colors';
import { useInference } from '../hooks/useInference';
import * as Haptics from 'expo-haptics';

// Defensive import for native persistence
let AsyncStorage: any;
try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
    console.warn("AsyncStorage native module not found.");
}

const STORAGE_KEY = '@antigravity_messages';

const INITIAL_MESSAGES: Message[] = [
    {
        id: '1',
        text: 'System online. Antigravity Agent initialized. Neural core ready for interaction.',
        sender: 'agent',
        timestamp: Date.now(),
    },
];

export const ChatScreen: React.FC = () => {
    const [isInitialized, setIsInitialized] = useState(false);

    if (!isInitialized) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <StatusBar barStyle="light-content" />
                <StatusHeader state="idle" />
                <TouchableOpacity
                    style={styles.initButton}
                    onPress={async () => {
                        try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch (e) { }
                        setIsInitialized(true);
                    }}
                >
                    <Text style={styles.initButtonText}>INITIALIZE NEURAL CORE</Text>
                </TouchableOpacity>
                <Text style={styles.versionText}>ANTIGRAVITY v2.0 READY</Text>
            </View>
        );
    }

    return <ChatInterior />;
};

const ChatInterior: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isListening, setIsListening] = useState(false);

    // Now useInference only runs AFTER the user clicks Initialize
    const {
        runInference,
        isProcessing,
        inferenceTime,
        downloadProgress,
        streamingResponse,
        isGenerating
    } = useInference();

    const flatListRef = useRef<FlatList>(null);

    // Initial Load
    useEffect(() => {
        const loadMessages = async () => {
            try {
                if (AsyncStorage) {
                    const saved = await AsyncStorage.getItem(STORAGE_KEY);
                    if (saved) {
                        setMessages(JSON.parse(saved));
                        return;
                    }
                }
                setMessages(INITIAL_MESSAGES);
            } catch (e) {
                setMessages(INITIAL_MESSAGES);
            }
        };
        loadMessages();
    }, []);

    // Save
    useEffect(() => {
        if (messages.length > 0 && AsyncStorage) {
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages)).catch(() => { });
        }
    }, [messages]);

    // Streaming Updates
    useEffect(() => {
        if (isGenerating && streamingResponse) {
            setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.sender === 'agent') {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                        ...lastMsg,
                        text: streamingResponse
                    };
                    return newMessages;
                }
                return prev;
            });
        }
    }, [streamingResponse, isGenerating]);

    const handleClear = () => {
        Alert.alert(
            "Wipe Memory",
            "Execute neural clear of current session?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                        setMessages(INITIAL_MESSAGES);
                        if (AsyncStorage) {
                            await AsyncStorage.removeItem(STORAGE_KEY).catch(() => { });
                        }
                    }
                }
            ]
        );
    };

    const handleSend = async (text: string) => {
        if (isProcessing || isListening) return;

        try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) { }

        const userMsg: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: Date.now(),
        };

        const placeholderAgentMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: '...',
            sender: 'agent',
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMsg, placeholderAgentMsg]);

        try {
            await runInference(text, messages);
        } catch (error) {
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = "Critical Error: Local connection to ExecuTorch lost.";
                return newMessages;
            });
        }
    };

    const handleVoice = async () => {
        if (isProcessing) return;
        try { await Haptics.selectionAsync(); } catch (e) { }

        if (isListening) {
            setIsListening(false);
            return;
        }

        setIsListening(true);
        setTimeout(() => {
            setIsListening(false);
            handleSend("Summarize recent neural architecture breakthroughs.");
        }, 3000);
    };

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const agentState: AgentState = (isGenerating || isProcessing) ? 'thinking' : 'idle';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <StatusHeader
                state={agentState}
                downloadProgress={downloadProgress}
                onClear={handleClear}
            />

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <ChatBubble message={item} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={scrollToBottom}
            />

            <PerformanceHUD inferenceSpeed={inferenceTime} />
            <InputBar
                onSend={handleSend}
                onVoice={handleVoice}
                isThinking={isGenerating}
                isListening={isListening}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    listContent: {
        paddingHorizontal: Gaps.md,
        paddingBottom: Gaps.xl,
        paddingTop: Gaps.md,
    },
    initButton: {
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 240, 255, 0.1)',
        marginTop: 20,
    },
    initButtonText: {
        color: Colors.primary,
        fontWeight: '900',
        letterSpacing: 2,
    },
    versionText: {
        color: Colors.textDim,
        marginTop: 20,
        fontSize: 10,
    }
});
