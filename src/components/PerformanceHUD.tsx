import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors, Gaps } from '../theme/colors';
import { Cpu, Activity } from 'lucide-react-native';

interface PerformanceHUDProps {
    inferenceSpeed: number;
}

export const PerformanceHUD: React.FC<PerformanceHUDProps> = ({ inferenceSpeed }) => {
    return (
        <View style={styles.container}>
            <View style={styles.item}>
                <Cpu size={12} color={Colors.primary} style={styles.icon} />
                <Text style={styles.label}>ENGINE:</Text>
                <Text style={styles.value}>EXECUTORCH</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.item}>
                <Activity size={12} color={Colors.secondary} style={styles.icon} />
                <Text style={styles.label}>INFERENCE:</Text>
                <Text style={styles.value}>{inferenceSpeed}ms</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.item}>
                <View style={styles.statusDot} />
                <Text style={styles.label}>NPU:</Text>
                <Text style={styles.value}>ACTIVE</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Gaps.md,
    },
    icon: {
        marginRight: 4,
    },
    label: {
        color: Colors.textDim,
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    value: {
        color: Colors.text,
        fontSize: 9,
        fontWeight: '900',
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    divider: {
        width: 1,
        height: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#00FF41', // Matrix Green
        marginRight: 4,
        shadowColor: '#00FF41',
        shadowOpacity: 0.5,
        shadowRadius: 2,
    }
});
