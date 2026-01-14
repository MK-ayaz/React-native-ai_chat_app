import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withDelay,
    withSequence
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';

export const Waveform: React.FC = () => {
    const bars = Array.from({ length: 5 });

    return (
        <View style={styles.container}>
            {bars.map((_, i) => (
                <WaveBar key={i} index={i} />
            ))}
        </View>
    );
};

const WaveBar: React.FC<{ index: number }> = ({ index }) => {
    const height = useSharedValue(4);

    useEffect(() => {
        height.value = withDelay(
            index * 150,
            withRepeat(
                withSequence(
                    withTiming(16, { duration: 400 }),
                    withTiming(4, { duration: 400 })
                ),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        height: height.value,
    }));

    return <Animated.View style={[styles.bar, animatedStyle]} />;
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 20,
        width: 30,
    },
    bar: {
        width: 3,
        backgroundColor: Colors.primary,
        marginHorizontal: 1,
        borderRadius: 2,
        shadowColor: Colors.primary,
        shadowOpacity: 0.5,
        shadowRadius: 3,
    },
});
