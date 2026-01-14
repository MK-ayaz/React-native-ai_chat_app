import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    useSharedValue,
    interpolateColor
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';

export type AgentState = 'idle' | 'thinking' | 'error';

interface GravityCoreProps {
    state: AgentState;
}

export const GravityCore: React.FC<GravityCoreProps> = ({ state }) => {
    const pulse = useSharedValue(1);

    useEffect(() => {
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const getCoreColor = () => {
        'worklet';
        switch (state) {
            case 'thinking': return Colors.secondary;
            case 'error': return Colors.error;
            default: return Colors.primary;
        }
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pulse.value }],
            shadowColor: getCoreColor(),
            backgroundColor: getCoreColor(),
            shadowOpacity: 0.8,
            shadowRadius: 15,
            elevation: 20,
        };
    });

    const outerPulseStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pulse.value * 1.5 }],
            opacity: 1 - (pulse.value - 1) * 2,
            borderColor: getCoreColor(),
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.outerPulse, outerPulseStyle]} />
            <Animated.View style={[styles.core, animatedStyle]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    core: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    outerPulse: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
    },
});
