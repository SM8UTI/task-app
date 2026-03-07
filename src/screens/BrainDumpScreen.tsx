import { View, Text, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform, Linking, Animated, PanResponder, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Trash2, Plus, Brain, Sparkles } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { encryptObject, decryptObject } from "../utils/security";
import theme from "../data/color-theme";
import YouTubePreview from "../components/YouTubePreview";
import { extractYouTubeId, hideYouTubeUrl } from "../utils/youtube";

// ─── Types ────────────────────────────────────────────────────────────────────

type DumpEntry = {
    id: number;
    text: string;
    createdAt: string;
};

const STORAGE_KEY = "@taskflow_braindump";
const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;
const ABSOLUTE_FILL = { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 };

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

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function BrainDumpScreen() {
    const [entries, setEntries] = useState<DumpEntry[]>([]);
    const [input, setInput] = useState("");
    const [activeTab, setActiveTab] = useState<"texts" | "links">("texts");

    const isLinkEntry = (text: string) => /(https?:\/\/[^\s]+)/g.test(text);

    const displayedEntries = entries.filter((entry) =>
        activeTab === "links" ? isLinkEntry(entry.text) : !isLinkEntry(entry.text)
    );

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

                {/* ── Tabs ─────────────────────────────────── */}
                <View
                    style={{
                        flexDirection: "row",
                        paddingHorizontal: theme.padding.paddingMainX,
                        marginTop: 24,
                        marginBottom: 10,
                        gap: 12,
                    }}
                >
                    {(["texts", "links"] as const).map((tab) => {
                        const isActive = activeTab === tab;
                        const count = entries.filter(e => tab === "links" ? isLinkEntry(e.text) : !isLinkEntry(e.text)).length;

                        return (
                            <Pressable
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 6,
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    borderRadius: 16,
                                    backgroundColor: isActive ? theme.primary[1] + "15" : theme.text + "05",
                                    borderWidth: 1,
                                    borderColor: isActive ? theme.primary[1] + "30" : "transparent"
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: theme.fonts[600],
                                        fontSize: 14,
                                        color: isActive ? theme.primary[1] : theme.text + "50",
                                        textTransform: "capitalize",
                                    }}
                                >
                                    {tab}
                                </Text>
                                <View style={{ backgroundColor: isActive ? theme.primary[1] + "20" : theme.text + "10", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
                                    <Text style={{ fontFamily: theme.fonts[600], fontSize: 11, color: isActive ? theme.primary[1] : theme.text + "50" }}>
                                        {count}
                                    </Text>
                                </View>
                            </Pressable>
                        )
                    })}
                </View>

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
                    {displayedEntries.length === 0 ? (
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
                                {activeTab === "texts" ? "Your mind is clear" : "No links saved yet"}
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
                                {activeTab === "texts"
                                    ? "Type a thought above and tap + to capture it"
                                    : "Share links from other apps to save them here"}
                            </Text>
                        </View>
                    ) : (
                        /* ── Entry cards ───────────────────── */
                        displayedEntries.map(entry => (
                            <BrainDumpCard
                                key={entry.id}
                                entry={entry}
                                onDelete={() => deleteEntry(entry.id)}
                            />
                        ))
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── Brain Dump Card ─────────────────────────────────────────────────────────

function BrainDumpCard({ entry, onDelete }: { entry: DumpEntry; onDelete: () => void }) {
    const youtubeId = extractYouTubeId(entry.text);
    const pan = useRef(new Animated.Value(0)).current;
    const [dismissed, setDismissed] = useState(false);

    const latestCb = useRef({ onDelete });
    latestCb.current = { onDelete };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gs) => {
                return gs.dx < -10 && Math.abs(gs.dx) > Math.abs(gs.dy) && !dismissed;
            },
            onPanResponderMove: (_, gs) => pan.setValue(Math.min(0, gs.dx)),
            onPanResponderRelease: (_, gs) => {
                if (gs.dx < -SWIPE_THRESHOLD) {
                    Animated.timing(pan, { toValue: -SCREEN_WIDTH, duration: 250, useNativeDriver: true })
                        .start(() => {
                            setDismissed(true);
                            latestCb.current.onDelete();
                        });
                } else {
                    Animated.spring(pan, { toValue: 0, useNativeDriver: true, bounciness: 12, speed: 20 }).start();
                }
            },
        })
    ).current;

    if (dismissed) return null;

    return (
        <View style={{ marginBottom: 10 }}>
            {/* ── RIGHT bg (swipe left) ── */}
            <Animated.View style={[
                ABSOLUTE_FILL,
                {
                    backgroundColor: theme.text + "08",
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: theme.error + "15",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: 24,
                    opacity: pan.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0], extrapolate: "clamp" }),
                    transform: [{ scale: pan.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0.95], extrapolate: "clamp" }) }],
                },
            ]}>
                <Text style={{ fontFamily: theme.fonts[600], fontSize: 13, color: theme.error, marginRight: 16 }}>
                    Delete
                </Text>
                <View style={{ backgroundColor: theme.error + "25", height: 36, width: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" }}>
                    <Trash2 color={theme.error} size={16} />
                </View>
            </Animated.View>

            {/* ── Foreground card ── */}
            <Animated.View
                {...panResponder.panHandlers}
                style={{
                    transform: [
                        { translateX: pan },
                        { rotateZ: pan.interpolate({ inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH], outputRange: ["-12deg", "0deg", "12deg"], extrapolate: "clamp" }) },
                    ],
                    backgroundColor: theme.background,
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
                {!youtubeId && (
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
                )}

                {/* Text + timestamp */}
                <View style={{ flex: 1, gap: 6 }}>
                    {youtubeId && <YouTubePreview youtubeId={youtubeId} />}
                    {!!hideYouTubeUrl(entry.text) && (
                        <Text
                            style={{
                                fontFamily: theme.fonts[400],
                                fontSize: 14,
                                color: theme.text,
                                lineHeight: 21,
                            }}
                        >
                            {hideYouTubeUrl(entry.text).split(/(https?:\/\/[^\s]+)/g).map((part, index) => {
                                if (part.match(/(https?:\/\/[^\s]+)/g)) {
                                    return (
                                        <Text
                                            key={index}
                                            style={{ textDecorationLine: 'underline', color: theme.primary?.[1] || theme.text }}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                Linking.openURL(part).catch(err => console.log("Couldn't load page", err));
                                            }}
                                        >
                                            {part}
                                        </Text>
                                    );
                                }
                                return part;
                            })}
                        </Text>
                    )}
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
            </Animated.View>
        </View>
    );
}


