import { View, Text, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Trash2, Plus, Brain, Sparkles } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { encryptObject, decryptObject } from "../utils/security";
import theme from "../data/color-theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type DumpEntry = {
    id: number;
    text: string;
    createdAt: string;
};

const STORAGE_KEY = "@taskflow_braindump";

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function BrainDumpScreen() {
    const [entries, setEntries] = useState<DumpEntry[]>([]);
    const [input, setInput] = useState("");
    const [pressingId, setPressingId] = useState<number | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadEntries();
        }, []),
    );

    const loadEntries = async () => {
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const decrypted: DumpEntry[] | null = decryptObject(raw);
            if (decrypted) {
                setEntries(decrypted);
            } else {
                const parsed = JSON.parse(raw);
                setEntries(Array.isArray(parsed) ? parsed : []);
            }
        } catch {
            setEntries([]);
        }
    };

    const persist = async (updated: DumpEntry[]) => {
        try {
            const encrypted = encryptObject(updated);
            await AsyncStorage.setItem(STORAGE_KEY, encrypted);
        } catch { }
    };

    const addEntry = () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        const newEntry: DumpEntry = {
            id: Date.now(),
            text: trimmed,
            createdAt: new Date().toISOString(),
        };
        const updated = [newEntry, ...entries];
        setEntries(updated);
        persist(updated);
        setInput("");
    };

    const deleteEntry = (id: number) => {
        const updated = entries.filter(e => e.id !== id);
        setEntries(updated);
        persist(updated);
    };

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        const t = new Date();
        const isToday =
            d.getDate() === t.getDate() &&
            d.getMonth() === t.getMonth() &&
            d.getFullYear() === t.getFullYear();
        return isToday ? "Today" : d.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.background }}
            edges={["top", "left", "right"]}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                {/* ── Header ─────────────────────────────────── */}
                <View
                    style={{
                        paddingHorizontal: theme.padding.paddingMainX,
                        paddingTop: 12,
                        paddingBottom: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.text + "10",
                    }}
                >
                    <Text
                        style={{
                            fontFamily: theme.fonts[700],
                            fontSize: 24,
                            color: theme.text,
                        }}
                    >
                        Brain Dump
                    </Text>
                    <Text
                        style={{
                            fontFamily: theme.fonts[400],
                            fontSize: 13,
                            color: theme.text + "50",
                            marginTop: 2,
                        }}
                    >
                        Capture every thought, clear your mind
                    </Text>
                </View>

                {/* ── Input card ─────────────────────────────── */}
                {/* Matches: theme.text + "08", borderRadius 20, borderWidth 1, borderColor theme.text + "10" */}
                <View
                    style={{
                        marginHorizontal: theme.padding.paddingMainX,
                        marginTop: 16,
                        backgroundColor: theme.text + "08",
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: theme.text + "10",
                        flexDirection: "row",
                        alignItems: "flex-end",
                        gap: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                    }}
                >
                    <View
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            backgroundColor: theme.primary[1] + "18",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 2,
                        }}
                    >
                        <Sparkles size={16} color={theme.primary[1]} strokeWidth={2} />
                    </View>

                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        onSubmitEditing={addEntry}
                        placeholder="What's on your mind?"
                        placeholderTextColor={theme.text + "30"}
                        multiline
                        returnKeyType="done"
                        blurOnSubmit
                        style={{
                            flex: 1,
                            fontFamily: theme.fonts[400],
                            fontSize: 14,
                            color: theme.text,
                            minHeight: 40,
                            maxHeight: 110,
                            paddingTop: 10,
                            paddingBottom: 10,
                        }}
                    />

                    <Pressable
                        onPress={addEntry}
                        style={({ pressed }) => ({
                            width: 38,
                            height: 38,
                            borderRadius: 12,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: input.trim()
                                ? pressed
                                    ? theme.primary[1] + "CC"
                                    : theme.primary[1]
                                : theme.text + "12",
                            marginBottom: 2,
                        })}
                    >
                        <Plus
                            size={20}
                            color={input.trim() ? theme.background : theme.text + "35"}
                            strokeWidth={2.5}
                        />
                    </Pressable>
                </View>

                {/* ── Section label (count) ──────────────────── */}
                {entries.length > 0 && (
                    <Text
                        style={{
                            fontFamily: theme.fonts[500],
                            fontSize: 12,
                            color: theme.text + "50",
                            letterSpacing: 0.4,
                            textTransform: "uppercase",
                            paddingHorizontal: theme.padding.paddingMainX,
                            marginTop: 24,
                            marginBottom: 10,
                        }}
                    >
                        {entries.length} thought{entries.length !== 1 ? "s" : ""}
                    </Text>
                )}

                {/* ── Entries list ───────────────────────────── */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    overScrollMode="never"
                    contentContainerStyle={{
                        paddingHorizontal: theme.padding.paddingMainX,
                        paddingBottom: 48,
                        gap: 10,
                    }}
                >
                    {entries.length === 0 ? (
                        /* ── Empty state ───────────────────── */
                        <View
                            style={{
                                alignItems: "center",
                                paddingTop: 72,
                                gap: 14,
                            }}
                        >
                            <View
                                style={{
                                    width: 76,
                                    height: 76,
                                    borderRadius: 24,
                                    backgroundColor: theme.primary[1] + "15",
                                    borderWidth: 1,
                                    borderColor: theme.primary[1] + "20",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Brain size={34} color={theme.primary[1]} strokeWidth={1.5} />
                            </View>
                            <Text
                                style={{
                                    fontFamily: theme.fonts[600],
                                    fontSize: 17,
                                    color: theme.text + "60",
                                }}
                            >
                                Your mind is clear
                            </Text>
                            <Text
                                style={{
                                    fontFamily: theme.fonts[400],
                                    fontSize: 13,
                                    color: theme.text + "35",
                                    textAlign: "center",
                                    lineHeight: 20,
                                    maxWidth: 220,
                                }}
                            >
                                Type a thought above and tap{" "}
                                <Text style={{ color: theme.primary[1], fontFamily: theme.fonts[600] }}>
                                    +
                                </Text>{" "}
                                to capture it
                            </Text>
                        </View>
                    ) : (
                        /* ── Entry cards ───────────────────── */
                        entries.map(entry => (
                            <View
                                key={entry.id}
                                style={{
                                    backgroundColor: theme.text + "08",
                                    borderRadius: 20,
                                    borderWidth: 1,
                                    borderColor: theme.text + "10",
                                    padding: 16,
                                    flexDirection: "row",
                                    alignItems: "flex-start",
                                    gap: 14,
                                }}
                            >
                                {/* Accent icon badge */}
                                <View
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 10,
                                        backgroundColor: theme.primary[1] + "15",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <Sparkles size={15} color={theme.primary[1]} strokeWidth={2} />
                                </View>

                                {/* Text + timestamp */}
                                <View style={{ flex: 1, gap: 6 }}>
                                    <Text
                                        style={{
                                            fontFamily: theme.fonts[400],
                                            fontSize: 14,
                                            color: theme.text,
                                            lineHeight: 21,
                                        }}
                                    >
                                        {entry.text}
                                    </Text>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 6,
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 4,
                                                height: 4,
                                                borderRadius: 2,
                                                backgroundColor: theme.primary[1] + "60",
                                            }}
                                        />
                                        <Text
                                            style={{
                                                fontFamily: theme.fonts[400],
                                                fontSize: 11,
                                                color: theme.text + "80",
                                            }}
                                        >
                                            {formatDate(entry.createdAt)} · {formatTime(entry.createdAt)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Delete btn */}
                                <Pressable
                                    onPress={() => deleteEntry(entry.id)}
                                    onPressIn={() => setPressingId(entry.id)}
                                    onPressOut={() => setPressingId(null)}
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 10,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: pressingId === entry.id ? theme.error + "18" : theme.text + "08",
                                        borderWidth: 1,
                                        borderColor: pressingId === entry.id ? theme.error + "25" : theme.text + "0D",
                                    }}
                                >
                                    <Trash2
                                        size={14}
                                        color={pressingId === entry.id ? theme.error : theme.text + "35"}
                                        strokeWidth={2}
                                    />
                                </Pressable>
                            </View>
                        ))
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
