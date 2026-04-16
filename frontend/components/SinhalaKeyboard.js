import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

const sinhalaChars = [
    'අ', 'ආ', 'ඇ', 'ඈ', 'ඉ', 'ඊ', 'උ', 'ඌ', 'එ', 'ඒ', 'ඓ', 'ඔ', 'ඕ', 'ඖ',
    'ක', 'ඛ', 'ග', 'ඝ', 'ඞ', 'ඟ',
    'ච', 'ඡ', 'ජ', 'ඣ', 'ඤ', 'ඥ',
    'ට', 'ඨ', 'ඩ', 'ඪ', 'ණ', 'ඬ',
    'ත', 'ථ', 'ද', 'ධ', 'න', 'ඳ',
    'ප', 'ඵ', 'බ', 'භ', 'ම', 'ඹ',
    'ය', 'ර', 'ල', 'ව', 'ශ', 'ෂ', 'ස', 'හ', 'ළ', 'ෆ'
];

export default function SinhalaKeyboard({ onKeyPress, onClose }) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Sinhala Keyboard</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.keyGrid}>
                {sinhalaChars.map((char) => (
                    <TouchableOpacity key={char} style={styles.key} onPress={() => onKeyPress(char)}>
                        <Text style={styles.keyText}>{char}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.keySpace} onPress={() => onKeyPress(' ')}>
                    <Text style={styles.keyText}>Space</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#E5E7EB',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    title: { fontSize: 16, fontWeight: 'bold' },
    closeBtn: { backgroundColor: '#EF4444', paddingHorizontal: 10, borderRadius: 5, justifyContent: 'center' },
    closeText: { color: '#FFF' },
    keyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 5,
    },
    key: {
        width: 35,
        height: 40,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        elevation: 2,
    },
    keySpace: {
        width: 150,
        height: 40,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        elevation: 2,
    },
    keyText: {
        fontSize: 18,
        color: '#111827',
    }
});
