import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
    ArrowLeft,
    Mail,
    Github,
    Globe,
    ExternalLink,
} from "lucide-react-native";
import theme from "../data/color-theme";

// ─── Data ────────────────────────────────────────────────────────────────────

const LINKS = [
    {
        id: "email",
        label: "Email Support",
        value: "smrutiranjannayak5403@gmail.com",
        sublabel: "Drop us a message anytime",
        icon: Mail,
        color: theme.primary[1],
        onPress: () => Linking.openURL("mailto:smrutiranjannayak5403@gmail.com"),
    },
    {
        id: "github",
        label: "GitHub Repository",
        value: "SM8UTI / TaskFlow-app",
        sublabel: "View source code & raise issues",
        icon: Github,
        color: theme.primary[2],
        onPress: () => Linking.openURL("https://github.com/SM8UTI/TaskFlow-app"),
    },
    {
        id: "website",
        label: "Official Website",
        value: "taskflow.tsconnects.com",
        sublabel: "News, updates & documentation",
        icon: Globe,
        color: theme.primary[3],
        onPress: () => Linking.openURL("https://taskflow.tsconnects.com/"),
    },
    {
        id: "producthunt",
        label: "Product Hunt",
        value: "TaskFlow — Master Your Day",
        sublabel: "Leave a review & support us 🙌",
        icon: ExternalLink,
        color: theme.primary[4],
        onPress: () =>
            Linking.openURL(
                "https://www.producthunt.com/products/taskflow-master-your-day?utm_source=other&utm_medium=social",
            ),
    },
];

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function HelpSupportScreen() {
    const navigation = useNavigation<any>();

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.background }}
            edges={["top", "left", "right"]}
        >
            {/* ── Header ─────────────────────────────────────── */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: theme.padding.paddingMainX,
                    paddingTop: 12,
                    paddingBottom: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.text + "10",
                }}
            >
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={({ pressed }) => ({
                        width: 44,
                        height: 44,
                        borderRadius: 44,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: pressed ? theme.text + "18" : theme.text + "0E",
                    })}
                >
                    <ArrowLeft size={20} color={theme.text} strokeWidth={2} />
                </Pressable>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text
                        style={{
                            fontFamily: theme.fonts[700],
                            fontSize: 20,
                            color: theme.text,
                        }}
                    >
                        Help & Support
                    </Text>
                </View>

                {/* Spacer */}
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode="never"
                contentContainerStyle={{
                    paddingHorizontal: theme.padding.paddingMainX,
                    paddingTop: 24,
                    paddingBottom: 56,
                    gap: 20,
                }}
            >
                {/* ── Intro card ─────────────────────────────── */}
                <View
                    style={{
                        backgroundColor: theme.primary[3] + "12",
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: theme.primary[3] + "25",
                        padding: 20,
                        gap: 8,
                    }}
                >
                    <Text
                        style={{
                            fontFamily: theme.fonts[600],
                            fontSize: 16,
                            color: theme.text,
                        }}
                    >
                        We're here to help 👋
                    </Text>
                    <Text
                        style={{
                            fontFamily: theme.fonts[400],
                            fontSize: 13,
                            color: theme.text + "70",
                            lineHeight: 20,
                        }}
                    >
                        Have a bug report, feature request, or just want to say hi? Reach out through
                        any of the channels below.
                    </Text>
                </View>

                {/* ── Contact & links section label ────────── */}
                <Text
                    style={{
                        fontFamily: theme.fonts[500],
                        fontSize: 12,
                        color: theme.text + "70",
                        letterSpacing: 0.4,
                        textTransform: "uppercase",
                    }}
                >
                    Contact & Links
                </Text>

                {/* ── Link rows card ─────────────────────────── */}
                <View
                    style={{
                        backgroundColor: theme.text + "08",
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: theme.text + "10",
                        overflow: "hidden",
                    }}
                >
                    {LINKS.map((item, idx) => (
                        <View key={item.id}>
                            <Pressable
                                onPress={item.onPress}
                                style={({ pressed }) => ({
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingVertical: 14,
                                    paddingHorizontal: 16,
                                    gap: 14,
                                    backgroundColor: pressed ? theme.text + "0D" : "transparent",
                                })}
                            >
                                {/* Icon */}
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: item.color + "18",
                                    }}
                                >
                                    <item.icon size={18} color={item.color} strokeWidth={2} />
                                </View>

                                {/* Text */}
                                <View style={{ flex: 1, gap: 2 }}>
                                    <Text
                                        style={{
                                            fontFamily: theme.fonts[500],
                                            fontSize: 15,
                                            color: theme.text,
                                        }}
                                    >
                                        {item.label}
                                    </Text>
                                    <Text
                                        style={{
                                            fontFamily: theme.fonts[400],
                                            fontSize: 12,
                                            color: theme.text + "55",
                                        }}
                                        numberOfLines={1}
                                    >
                                        {item.sublabel}
                                    </Text>
                                </View>

                                {/* Value + chevron */}
                                <View style={{ alignItems: "flex-end", gap: 2 }}>
                                    <ExternalLink size={15} color={item.color} strokeWidth={2} />
                                </View>
                            </Pressable>

                            {/* Divider (skip after last) */}
                            {idx < LINKS.length - 1 && (
                                <View
                                    style={{
                                        height: 1,
                                        backgroundColor: theme.text + "0D",
                                        marginHorizontal: 16,
                                    }}
                                />
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
