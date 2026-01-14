import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { Colors, Gaps } from '../theme/colors';
import { Message } from '../types';
import { Share2, Copy } from 'lucide-react-native';

interface ChatBubbleProps {
    message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
    const isUser = message.sender === 'user';

    const handleCopy = async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await Clipboard.setStringAsync(message.text);
        } catch (e) {
            // Fallback for missing native module before rebuild
            console.warn("Native Module (Clipboard/Haptics) not linked yet.");
        }
    };

    const handleShare = async () => {
        try {
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert("Error", "Sharing is not available on this device");
                return;
            }
            // In a real app we might share a file, but here we share text
            // Note: expo-sharing works best with files. For text we use the built-in Share from RN
            // But we've installed Sharing for production file export capabilities.
            const { Share } = require('react-native');
            await Share.share({
                message: message.text,
                title: 'Antigravity Response'
            });
        } catch (e) {
            console.warn("Sharing failed", e);
        }
    };

    const markdownStyles = StyleSheet.create({
        body: {
            color: Colors.text,
            fontSize: 15,
            lineHeight: 22,
        },
        code_inline: {
            backgroundColor: Colors.surfaceLight,
            color: Colors.primary,
            paddingHorizontal: 4,
            borderRadius: 4,
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        },
        code_block: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: Colors.primary,
            padding: Gaps.md,
            borderRadius: 12,
            marginVertical: Gaps.sm,
            borderWidth: 1,
            borderColor: 'rgba(0, 240, 255, 0.2)',
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        },
        link: {
            color: Colors.primary,
            textDecorationLine: 'underline',
        },
        strong: {
            fontWeight: 'bold',
            color: Colors.primary,
        },
    });

    return (
        <View style={[
            styles.wrap,
            isUser ? styles.userWrap : styles.agentWrap
        ]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onLongPress={handleCopy}
                style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.agentBubble
                ]}
            >
                {!isUser && (
                    <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
                )}
                <Markdown style={markdownStyles}>
                    {message.text}
                </Markdown>

                {!isUser && message.text !== '...' && (
                    <View style={styles.bubbleActions}>
                        <TouchableOpacity onPress={handleCopy} style={styles.actionIcon}>
                            <Copy size={14} color={Colors.textDim} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleShare} style={styles.actionIcon}>
                            <Share2 size={14} color={Colors.textDim} />
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
            <Text style={styles.timestamp}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: {
        marginVertical: Gaps.sm,
        maxWidth: '85%',
    },
    userWrap: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    agentWrap: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    bubble: {
        padding: Gaps.md,
        borderRadius: 20,
        overflow: 'hidden',
    },
    userBubble: {
        backgroundColor: Colors.surfaceLight,
        borderBottomRightRadius: 4,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    agentBubble: {
        backgroundColor: 'rgba(10, 10, 10, 0.7)',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(0, 240, 255, 0.3)',
    },
    bubbleActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        paddingTop: 8,
    },
    actionIcon: {
        marginLeft: 12,
        opacity: 0.7,
    },
    timestamp: {
        color: Colors.textDim,
        fontSize: 10,
        marginTop: 4,
        letterSpacing: 1,
    },
});
