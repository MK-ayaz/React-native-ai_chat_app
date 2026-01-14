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
        text: 'System online. Niffler Agent initialized. Ready to dig for answers.',
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
                    <Text style={styles.initButtonText}>INITIALIZE NIFFLER CORE</Text>
                </TouchableOpacity>
                <Text style={styles.versionText}>NIFFLER AI READY</Text>
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
                        const parsedMessages = JSON.parse(saved);
                        // QUICK MIGRATION: Check if old Antigravity text exists
                        if (parsedMessages.length > 0 && parsedMessages[0].text.includes("Antigravity Agent initialized")) {
                            console.log("Migrating legacy chat history...");
                            setMessages(INITIAL_MESSAGES);
                            // Force overwrite next save
                            return;
                        }
                        setMessages(parsedMessages);
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

    const handleRegenerate = async () => {
        if (isProcessing || messages.length < 2) return;

        try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) { }

        // Find last user message
        const lastAgentIndex = messages.length - 1;
        const lastUserIndex = messages.length - 2;

        if (messages[lastAgentIndex].sender !== 'agent' || messages[lastUserIndex].sender !== 'user') return;

        const userText = messages[lastUserIndex].text;
        const newHistory = messages.slice(0, lastUserIndex); // Remove last user and agent msg from history sent to model
        // Wait, runInference takes (text, history). 
        // If we want to regenerate the response to 'userText', the history passed should be everything BEFORE 'userText'.

        // Update UI to show Thinking
        setMessages(prev => {
            const next = [...prev];
            next[lastAgentIndex] = {
                ...next[lastAgentIndex],
                text: '...',
                timestamp: Date.now()
            };
            return next;
        });

        try {
            // We pass newHistory (messages before the last user prompt) logic is handled by runInference appending the prompt
            await runInference(userText, newHistory);
        } catch (error) {
            setMessages(prev => {
                const next = [...prev];
                next[lastAgentIndex].text = "Error regenerating response.";
                return next;
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
            handleSend("Tell me about the hidden treasures of knowledge.");
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
                renderItem={({ item, index }) => (
                    <ChatBubble
                        message={item}
                        isLast={index === messages.length - 1}
                        onRegenerate={index === messages.length - 1 && item.sender === 'agent' ? handleRegenerate : undefined}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
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
