import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ScrollView,
} from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Sinhala character rows ───────────────────────────────────────────────────
const ROWS = [
    // Vowels
    ['අ', 'ආ', 'ඇ', 'ඈ', 'ඉ', 'ඊ', 'උ', 'ඌ', 'එ', 'ඒ'],
    ['ඓ', 'ඔ', 'ඕ', 'ඖ', 'ං', 'ඃ', 'ා', 'ැ', 'ෑ', 'ි'],
    // Vowel diacritics
    ['ී', 'ු', 'ූ', 'ෘ', 'ෙ', 'ේ', 'ෛ', 'ො', 'ෝ', 'ෞ'],
    // Consonants row 1
    ['ක', 'ඛ', 'ග', 'ඝ', 'ඟ', 'ච', 'ඡ', 'ජ', 'ඣ', 'ඤ'],
    // Consonants row 2
    ['ට', 'ඨ', 'ඩ', 'ඪ', 'ණ', 'ත', 'ථ', 'ද', 'ධ', 'න'],
    // Consonants row 3
    ['ප', 'ඵ', 'බ', 'භ', 'ම', 'ය', 'ර', 'ල', 'ව', 'ශ'],
    // Consonants row 4
    ['ෂ', 'ස', 'හ', 'ළ', 'ෆ', 'ඥ', 'ඦ', 'ඬ', 'ඳ', 'ඹ'],
    // Hal kirima & zero-width joiner helpers
    ['්', '්‍ර', 'ි', 'ී', '‍', '\u200D'],
];

// Each key occupies (SCREEN_W - padding) / 10 width
const PAD = 16;
const GAP = 4;
const KEY_W = Math.floor((Math.min(SCREEN_W, 420) - PAD * 2 - GAP * 9) / 10);
const KEY_H = 38;

export default function SinhalaKeyboard({ onKeyPress, onClose }) {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>⌨️ සිංහල යතුරු පුවරුව</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <Text style={styles.closeText}>✕ Close</Text>
                </TouchableOpacity>
            </View>

            {/* Key rows */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
            >
                {ROWS.map((row, rowIdx) => (
                    <View key={rowIdx} style={styles.row}>
                        {row.map((char, i) => (
                            <TouchableOpacity
                                key={`${rowIdx}-${i}`}
                                style={styles.key}
                                onPress={() => onKeyPress(char)}
                                activeOpacity={0.6}
                            >
                                <Text style={styles.keyText}>{char}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}

                {/* Bottom row: Space & Backspace */}
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.key, styles.spaceKey]}
                        onPress={() => onKeyPress('SPACE')}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.specialKeyText}>Space</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.key, styles.backspaceKey]}
                        onPress={() => onKeyPress('BACKSPACE')}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.specialKeyText}>⌫</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#DDE3ED',
        borderRadius: 16,
        padding: PAD,
        marginTop: 10,
        // Fixed height so it doesn't overflow its parent ScrollView
        maxHeight: 320,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1F2937',
    },
    closeBtn: {
        backgroundColor: '#7C3AED',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    closeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: GAP,
        marginBottom: GAP,
    },
    key: {
        width: KEY_W,
        height: KEY_H,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 2,
    },
    spaceKey: {
        width: KEY_W * 5 + GAP * 4,
        backgroundColor: '#E0E7FF',
    },
    backspaceKey: {
        width: KEY_W * 4 + GAP * 3,
        backgroundColor: '#FEE2E2',
    },
    keyText: {
        fontSize: 16,
        color: '#111827',
        fontFamily: undefined, // let OS pick best Sinhala font
        includeFontPadding: false,
    },
    specialKeyText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
    },
});
