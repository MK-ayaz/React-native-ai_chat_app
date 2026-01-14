import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { Colors, Gaps } from '../theme/colors';
import { Message } from '../types';
import { Share2, Copy, RefreshCw } from 'lucide-react-native';

interface ChatBubbleProps {
    message: Message;
    onRegenerate?: () => void;
    isLast?: boolean;
}

// Custom Code Block Renderer
const CodeBlock = ({ content }: { content: string }) => {
    const handleCopyCode = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await Clipboard.setStringAsync(content);
    };

    return (
        <View style={styles.codeBlockContainer}>
            <View style={styles.codeBlockHeader}>
                <Text style={styles.codeBlockLang}>CODE</Text>
                <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
                    <Copy size={12} color={Colors.textDim} />
                    <Text style={styles.copyText}>COPY</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.codeBlockContent}>{content.replace(/\n$/, '')}</Text>
        </View>
    );
};

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onRegenerate, isLast }) => {
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
            backgroundColor: 'transparent',
            padding: 0,
            borderRadius: 0,
            marginVertical: Gaps.sm,
            borderWidth: 0,
            borderColor: 'transparent',
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
                <Markdown
                    style={markdownStyles}
                    rules={{
                        fence: (node, children, parent, styles) => (
                            <CodeBlock key={node.key} content={node.content} />
                        ),
                        code_block: (node, children, parent, styles) => (
                            <CodeBlock key={node.key} content={node.content} />
                        ),
                    }}
                >
                    {message.text}
                </Markdown>

                {!isUser && message.text !== '...' && (
                    <View style={styles.bubbleActions}>
                        {isLast && onRegenerate && (
                            <TouchableOpacity onPress={onRegenerate} style={styles.actionIcon}>
                                <RefreshCw size={14} color={Colors.textDim} />
                            </TouchableOpacity>
                        )}
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
    codeBlockContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 8,
        overflow: 'hidden',
    },
    codeBlockHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    codeBlockLang: {
        color: Colors.textDim,
        fontSize: 10,
        fontWeight: 'bold',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    copyText: {
        color: Colors.textDim,
        fontSize: 10,
        marginLeft: 4,
    },
    codeBlockContent: {
        color: '#e0e0e0',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 12,
        padding: 12,
    }
});
