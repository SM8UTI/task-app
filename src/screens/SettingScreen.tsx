import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
    Info,
    BarChart2,
    CalendarDays,
    Cpu,
    ChevronRight,
    ExternalLink,
    HelpCircle,
} from "lucide-react-native";
import theme from "../data/color-theme";

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string; icon: any; color: string }) {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: theme.padding.paddingMainX,
                marginTop: 28,
                marginBottom: 10,
            }}
        >
            <Text
                style={{
                    fontFamily: theme.fonts[500],
                    fontSize: 12,
                    color: theme.text + "70",
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                    marginBottom: 4,
                }}
            >
                {title}
            </Text>
        </View>
    );
}

function SettingRow({
    label,
    sublabel,
    icon: Icon,
    iconColor,
    onPress,
    rightElement,
}: {
    label: string;
    sublabel?: string;
    icon: any;
    iconColor: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 14,
                paddingHorizontal: 16,
                gap: 14,
                backgroundColor: pressed ? theme.text + "0D" : "transparent",
            })}
        >
            <View
                style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: iconColor + "18",
                }}
            >
                <Icon size={18} color={iconColor} strokeWidth={2} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontFamily: theme.fonts[500], fontSize: 15, color: theme.text }}>
                    {label}
                </Text>
                {sublabel ? (
                    <Text
                        style={{
                            fontFamily: theme.fonts[400],
                            fontSize: 12,
                            color: theme.text + "55",
                        }}
                    >
                        {sublabel}
                    </Text>
                ) : null}
            </View>
            <View>{rightElement ?? <ChevronRight size={18} color={theme.text + "40"} />}</View>
        </Pressable>
    );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

function SettingScreen() {
    const navigation = useNavigation<any>();

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.background }}
            edges={["top", "left", "right"]}
        >
            {/* ── Page Heading ──────────────────────────────── */}
            <View
                style={{
                    paddingHorizontal: theme.padding.paddingMainX,
                    paddingTop: 12,
                    paddingBottom: 20,
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
                    Settings
                </Text>
                <Text
                    style={{
                        fontFamily: theme.fonts[400],
                        fontSize: 14,
                        color: theme.text + "50",
                        marginTop: 2,
                    }}
                >
                    App information & resources
                </Text>
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode="never"
                contentContainerStyle={{ paddingBottom: 48 }}
            >
                {/* ══════════════════════════════════════════════ */}
                {/*  ANALYTICS LINK SECTION                       */}
                {/* ══════════════════════════════════════════════ */}
                <SectionHeader title="Analytics" icon={BarChart2} color={theme.primary[3]} />
                <View
                    style={{
                        marginHorizontal: theme.padding.paddingMainX,
                        backgroundColor: theme.text + "08",
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: theme.text + "10",
                        overflow: "hidden",
                    }}
                >
                    <SettingRow
                        label="View Analytics"
                        sublabel="Tasks, streaks, weekly focus & more"
                        icon={BarChart2}
                        iconColor={theme.primary[3]}
                        onPress={() => navigation.navigate("AnalyticsScreen")}
                        rightElement={
                            <ExternalLink size={16} color={theme.primary[3]} strokeWidth={2} />
                        }
                    />
                    <View
                        style={{
                            height: 1,
                            backgroundColor: theme.text + "0D",
                            marginHorizontal: 16,
                        }}
                    />
                    <SettingRow
                        label="Calendar"
                        sublabel="View tasks by date & schedule"
                        icon={CalendarDays}
                        iconColor={theme.primary[1]}
                        onPress={() => navigation.navigate("CalendarScreen")}
                        rightElement={
                            <ExternalLink size={16} color={theme.primary[1]} strokeWidth={2} />
                        }
                    />
                </View>

                {/* ══════════════════════════════════════════════ */}
                {/*  ABOUT SECTION                                */}
                {/* ══════════════════════════════════════════════ */}
                <SectionHeader title="About" icon={Info} color={theme.primary[2]} />
                <View
                    style={{
                        marginHorizontal: theme.padding.paddingMainX,
                        backgroundColor: theme.text + "08",
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: theme.text + "10",
                        overflow: "hidden",
                    }}
                >
                    <SettingRow
                        label="App Version"
                        sublabel="TaskFlow v1.0.0 "
                        icon={Cpu}
                        iconColor={theme.primary[2]}
                        rightElement={
                            <View
                                style={{
                                    paddingHorizontal: 10,
                                    paddingVertical: 4,
                                    borderRadius: 20,
                                    backgroundColor: theme.primary[2] + "20",
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: theme.fonts[600],
                                        fontSize: 11,
                                        color: theme.primary[2],
                                    }}
                                >
                                    Latest
                                </Text>
                            </View>
                        }
                    />
                    <View
                        style={{
                            height: 1,
                            backgroundColor: theme.text + "0D",
                            marginHorizontal: 16,
                        }}
                    />
                    <SettingRow
                        label="Help & Support"
                        sublabel="Contact, GitHub, website & more"
                        icon={HelpCircle}
                        iconColor={theme.primary[3]}
                        onPress={() => navigation.navigate("HelpSupportScreen")}
                        rightElement={
                            <ExternalLink size={16} color={theme.primary[3]} strokeWidth={2} />
                        }
                    />
                </View>

                {/* ══════════════════════════════════════════════ */}
                {/*  COPYRIGHT SECTION                            */}
                {/* ══════════════════════════════════════════════ */}
                <View
                    style={{
                        alignItems: "center",
                        paddingHorizontal: theme.padding.paddingMainX,
                        paddingTop: 36,
                    }}
                >
                    <View
                        style={{
                            width: 40,
                            height: 2,
                            borderRadius: 2,
                            backgroundColor: theme.text + "15",
                            marginBottom: 16,
                        }}
                    />
                    <Text
                        style={{
                            fontFamily: theme.fonts[500],
                            fontSize: 13,
                            color: theme.text + "90",
                            textAlign: "center",
                        }}
                    >
                        Copyright © {new Date().getFullYear()} Sm8uti - Smruti Ranjan Nayak
                    </Text>
                    <Text
                        style={{
                            fontFamily: theme.fonts[400],
                            fontSize: 12,
                            color: theme.text + "80",
                            textAlign: "center",
                            lineHeight: 20,
                            marginTop: 6,
                        }}
                    >
                        Built with ❤️ for Privacy · sm8uti.com{"\n"}
                        Your data never leaves your device.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default SettingScreen;
