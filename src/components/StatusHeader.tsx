import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { GravityCore, AgentState } from './GravityCore';
import { Colors, Gaps } from '../theme/colors';
import { Menu, Zap } from 'lucide-react-native';

interface StatusHeaderProps {
    state: AgentState;
    downloadProgress?: number;
    onClear?: () => void;
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({ state, downloadProgress, onClear }) => {
    const getStatusText = () => {
        if (downloadProgress !== undefined && downloadProgress < 100) {
            if (downloadProgress <= 0) return 'Initializing Core...';
            return `Downloading Core: ${Math.round(downloadProgress)}%`;
        }
        switch (state) {
            case 'thinking': return 'Synthesizing...';
            case 'error': return 'Core Variance Detected';
            default: return 'Online';
        }
    };

    return (
        <BlurView intensity={20} style={styles.blurContainer} tint="dark">
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <View style={styles.left}>
                        <GravityCore state={state} />
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>NIFFLER AI</Text>
                            <Text style={[
                                styles.status,
                                { color: state === 'error' ? Colors.error : Colors.textSecondary }
                            ]}>
                                {getStatusText()}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.right}>
                        <View style={styles.iconButton}>
                            <Zap size={20} color={Colors.primary} />
                        </View>
                        <TouchableOpacity
                            style={[styles.iconButton, { marginLeft: Gaps.md }]}
                            onPress={onClear}
                        >
                            <Menu size={24} color={Colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
            <View style={[styles.border, { backgroundColor: state === 'thinking' ? Colors.secondary : Colors.primary }]} />
        </BlurView>
    );
};

const styles = StyleSheet.create({
    blurContainer: {
        paddingTop: 0,
        borderBottomWidth: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    safeArea: {
        width: '100%',
    },
    content: {
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Gaps.lg,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textContainer: {
        marginLeft: Gaps.sm,
    },
    title: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
        fontFamily: 'System',
    },
    status: {
        fontSize: 11,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginTop: 2,
        fontWeight: '600',
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: Gaps.xs,
    },
    border: {
        height: 1,
        width: '100%',
        opacity: 0.3,
    }
});
