import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

const EMOJI_PRESETS = [
  '💼', '🏃', '❤️', '💰', '🎨', '🍎', '🎯', '🤝',
  '🛒', '🚀', '👨‍👩‍👧‍👦', '😄', '📖', '🏋️', '🎮', '📸',
  '🎵', '🌿', '✈️', '🏠', '🎓', '💻', '🔬', '🌟',
  '⚽', '🎸', '🧘', '🍕', '📱', '🔑', '💡', '🎁',
  '📋', '⚡', '📝', '🔄', '✅', '⭐', '🔥', '💎',
];

interface Props {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.presets}>
        {EMOJI_PRESETS.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            onPress={() => onChange(emoji)}
            style={[styles.emojiBtn, value === emoji && styles.selected]}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        label="O escribe un emoji"
        value={value}
        onChangeText={(t) => onChange(t.slice(-2))} // keep last emoji
        mode="outlined"
        style={styles.input}
        dense
        placeholder="🎯"
        maxLength={4}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  emojiBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  selected: { backgroundColor: '#EAE8FF', borderWidth: 2, borderColor: '#6C63FF' },
  emoji: { fontSize: 20 },
  input: { maxWidth: 180 },
});
