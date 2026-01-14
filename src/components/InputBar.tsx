import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Mic, Send, Paperclip, X } from 'lucide-react-native';
import { Colors, Gaps } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Waveform } from './Waveform';

interface InputBarProps {
    onSend: (text: string) => void;
    onVoice: () => void;
    isThinking: boolean;
    isListening?: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ onSend, onVoice, isThinking, isListening }) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim() && !isThinking) {
            onSend(text);
            setText('');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <BlurView intensity={30} tint="dark" style={styles.container}>
                <LinearGradient
                    colors={['rgba(0, 240, 255, 0.1)', 'transparent']}
                    style={styles.glow}
                />

                {isListening && (
                    <View style={styles.listeningOverlay}>
                        <Text style={styles.listeningText}>LISTENING...</Text>
                        <Waveform />
                    </View>
                )}

                <View style={styles.inputWrapper}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Paperclip size={20} color={Colors.textDim} />
                    </TouchableOpacity>

                    <TextInput
                        style={[styles.input, { maxHeight: 100 }]}
                        placeholder={isListening ? "" : "Initialize command..."}
                        placeholderTextColor={Colors.textDim}
                        value={text}
                        onChangeText={setText}
                        multiline
                        editable={!isThinking && !isListening}
                    />

                    <View style={styles.actions}>
                        {text.length > 0 ? (
                            <TouchableOpacity
                                style={[styles.sendButton, isThinking && styles.disabledButton]}
                                onPress={handleSend}
                                disabled={isThinking}
                            >
                                <Send size={20} color={Colors.primary} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.voiceButton, isListening && styles.activeVoiceButton]}
                                onPress={onVoice}
                            >
                                {isListening ? (
                                    <X size={20} color={Colors.error} />
                                ) : (
                                    <>
                                        <Mic size={20} color={Colors.primary} />
                                        <View style={styles.waveformDot} />
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </BlurView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Gaps.md,
        paddingTop: Gaps.md,
        paddingBottom: Platform.OS === 'ios' ? Gaps.xl : Gaps.md,
        backgroundColor: 'rgba(0,0,0,0.8)',
        overflow: 'hidden',
    },
    glow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        opacity: 0.5,
    },
    listeningOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 10,
    },
    listeningText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        marginRight: Gaps.md,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 24,
        paddingHorizontal: Gaps.sm,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        zIndex: 1,
    },
    attachButton: {
        padding: Gaps.sm,
    },
    input: {
        flex: 1,
        color: Colors.text,
        fontSize: 16,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
        paddingHorizontal: Gaps.sm,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sendButton: {
        padding: Gaps.sm,
    },
    voiceButton: {
        padding: Gaps.sm,
        position: 'relative',
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeVoiceButton: {
        backgroundColor: 'rgba(255, 0, 60, 0.1)',
        borderRadius: 22,
    },
    waveformDot: {
        position: 'absolute',
        right: 8,
        top: 8,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOpacity: 1,
        shadowRadius: 4,
    },
    disabledButton: {
        opacity: 0.3,
    }
});
