import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
    ArrowLeft,
    CheckCircle2,
    Flame,
    Target,
    TrendingUp,
    ListTodo,
} from "lucide-react-native";
import theme from "../data/color-theme";
import { useTaskManager } from "../hooks/useTaskManager";
import { useStreak, toDateKey } from "../hooks/useStreak";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getLast7Days(): string[] {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(toDateKey(d));
    }
    return days;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: string | number;
    icon: any;
    color: string;
}) {
    return (
        <View
            style={{
                width: "47.5%",
                backgroundColor: theme.text + "08",
                borderRadius: 20,
                borderWidth: 1,
                borderColor: color + "20",
                padding: 16,
                gap: 8,
            }}
        >
            <View
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: color + "20",
                }}
            >
                <Icon size={20} color={color} strokeWidth={2} />
            </View>
            <Text
                style={{
                    fontFamily: theme.fonts[700],
                    fontSize: 26,
                    color,
                }}
            >
                {value}
            </Text>
            <Text
                style={{
                    fontFamily: theme.fonts[400],
                    fontSize: 12,
                    color: theme.text + "60",
                }}
            >
                {label}
            </Text>
        </View>
    );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
    const navigation = useNavigation<any>();
    const { tasks } = useTaskManager();
    const { currentStreak, log } = useStreak(tasks);

    // ── Derived stats ──
    const completedCount = tasks.filter(t => t.status === "completed" || t.isCompleted).length;
    const todoCount = tasks.filter(t => t.status === "to-do").length;
    const inProgressCount = tasks.filter(t => t.status === "in-progress").length;
    const totalTasks = tasks.length;

    const last7Keys = getLast7Days();
    const maxCompleted = Math.max(1, ...last7Keys.map(k => log[k]?.completed ?? 0));

    const BREAKDOWN = [
        { label: "To Do", count: todoCount, color: theme.primary[1] },
        { label: "In Progress", count: inProgressCount, color: theme.primary[3] },
        { label: "Completed", count: completedCount, color: theme.primary[2] },
    ];

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.background }}
            edges={["top", "left", "right"]}
        >
            {/* ── Header ────────────────────────────────────── */}
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
                        Analytics
                    </Text>
                </View>

                {/* Spacer to balance header */}
                <View style={{ width: 40, height: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode="never"
                contentContainerStyle={{
                    paddingHorizontal: theme.padding.paddingMainX,
                    paddingTop: 24,
                    paddingBottom: 48,
                }}
            >
                {/* ── Overview Stat Cards ───────────────────── */}
                <Text
                    style={{
                        fontFamily: theme.fonts[600],
                        fontSize: 12,
                        color: theme.text + "70",
                        letterSpacing: 0.8,
                        textTransform: "uppercase",
                        marginBottom: 12,
                    }}
                >
                    Overview
                </Text>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                    <StatCard label="Completed" value={completedCount} icon={CheckCircle2} color={theme.primary[2]} />
                    <StatCard label="Streak" value={`${currentStreak}d`} icon={Flame} color={theme.primary[4]} />
                    <StatCard label="In Progress" value={inProgressCount} icon={TrendingUp} color={theme.primary[3]} />
                    <StatCard label="To Do" value={todoCount} icon={ListTodo} color={theme.primary[1]} />
                </View>

                {/* ── Total tasks pill ─────────────────────── */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        alignSelf: "center",
                        marginTop: 14,
                        backgroundColor: theme.text + "0C",
                        borderRadius: 20,
                        paddingHorizontal: 14,
                        paddingVertical: 7,
                    }}
                >
                    <Target size={16} color={theme.text + "80"} strokeWidth={2} />
                    <Text
                        style={{
                            fontFamily: theme.fonts[400],
                            fontSize: 13,
                            color: theme.text + "70",
                        }}
                    >
                        {totalTasks} total task{totalTasks !== 1 ? "s" : ""} on device
                    </Text>
                </View>

                {/* ── Weekly bar chart ─────────────────────── */}
                <Text
                    style={{
                        fontFamily: theme.fonts[600],
                        fontSize: 12,
                        color: theme.text + "70",
                        letterSpacing: 0.8,
                        textTransform: "uppercase",
                        marginBottom: 16,
                        marginTop: 28,
                    }}
                >
                    This Week's Activity
                </Text>

                <View
                    style={{
                        backgroundColor: theme.text + "08",
                        borderRadius: theme.border.radius.main,
                        borderWidth: 1,
                        borderColor: theme.text + "10",
                        padding: 16,
                    }}
                >
                    {/* Bars */}
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "flex-end",
                            gap: 6,
                            height: 120,
                            marginBottom: 12,
                        }}
                    >
                        {last7Keys.map((dateKey, i) => {
                            const record = log[dateKey];
                            const completed = record?.completed ?? 0;
                            const total = record?.total ?? 0;
                            const barH = Math.max(4, Math.round((completed / maxCompleted) * 90));
                            const isToday = i === 6;
                            const isFullDay = total > 0 && completed >= total;
                            const dayName = DAYS_SHORT[new Date(dateKey + "T12:00:00").getDay()];

                            return (
                                <View
                                    key={dateKey}
                                    style={{
                                        flex: 1,
                                        alignItems: "center",
                                        justifyContent: "flex-end",
                                        gap: 5,
                                    }}
                                >
                                    {completed > 0 && (
                                        <Text
                                            style={{
                                                fontFamily: theme.fonts[600],
                                                fontSize: 10,
                                                color: isToday ? theme.primary[3] : theme.text + "60",
                                            }}
                                        >
                                            {completed}
                                        </Text>
                                    )}
                                    <View
                                        style={{
                                            width: "100%",
                                            borderRadius: 6,
                                            minHeight: 4,
                                            height: barH,
                                            backgroundColor: isToday
                                                ? theme.primary[3]
                                                : isFullDay
                                                    ? theme.primary[3]
                                                    : theme.text + "18",
                                        }}
                                    />
                                    <Text
                                        style={{
                                            fontFamily: isToday ? theme.fonts[600] : theme.fonts[500],
                                            fontSize: 10,
                                            color: isToday ? theme.primary[3] : theme.text + "50",
                                        }}
                                    >
                                        {dayName}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    {/* Legend */}
                    <View
                        style={{
                            flexDirection: "row",
                            gap: 16,
                            justifyContent: "center",
                            borderTopWidth: 1,
                            borderTopColor: theme.text + "0D",
                            paddingTop: 12,
                        }}
                    >
                        {[
                            { label: "Today", bg: theme.primary[3] },
                            { label: "All done", bg: theme.primary[2] + "90" },
                            { label: "Partial / none", bg: theme.text + "18" },
                        ].map(({ label, bg }) => (
                            <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                <View
                                    style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: bg }}
                                />
                                <Text
                                    style={{
                                        fontFamily: theme.fonts[400],
                                        fontSize: 11,
                                        color: theme.text + "70",
                                    }}
                                >
                                    {label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ── Task breakdown ───────────────────────── */}
                <Text
                    style={{
                        fontFamily: theme.fonts[600],
                        fontSize: 13,
                        color: theme.text + "70",
                        letterSpacing: 0.8,
                        textTransform: "uppercase",
                        marginBottom: 12,
                        marginTop: 28,
                    }}
                >
                    Task Breakdown
                </Text>

                <View
                    style={{
                        backgroundColor: theme.text + "08",
                        borderRadius: theme.border.radius.main,
                        borderWidth: 1,
                        borderColor: theme.text + "10",
                        padding: 16,
                    }}
                >
                    {BREAKDOWN.map(({ label, count, color }, idx) => {
                        const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                        return (
                            <View key={label}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        paddingVertical: 12,
                                    }}
                                >
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                        <View
                                            style={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: 5,
                                                backgroundColor: color,
                                            }}
                                        />
                                        <Text
                                            style={{
                                                fontFamily: theme.fonts[500],
                                                fontSize: 14,
                                                color: theme.text,
                                            }}
                                        >
                                            {label}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                        <Text
                                            style={{
                                                fontFamily: theme.fonts[700],
                                                fontSize: 16,
                                                color,
                                            }}
                                        >
                                            {count}
                                        </Text>
                                        <Text
                                            style={{
                                                fontFamily: theme.fonts[400],
                                                fontSize: 12,
                                                color: theme.text + "50",
                                                width: 36,
                                                textAlign: "right",
                                            }}
                                        >
                                            {pct}%
                                        </Text>
                                    </View>
                                </View>

                                {/* Progress bar */}
                                <View
                                    style={{
                                        height: 4,
                                        backgroundColor: theme.text + "12",
                                        borderRadius: 4,
                                        marginBottom: 2,
                                    }}
                                >
                                    <View
                                        style={{
                                            height: 4,
                                            borderRadius: 4,
                                            width: `${pct}%` as any,
                                            backgroundColor: color,
                                        }}
                                    />
                                </View>

                                {idx < BREAKDOWN.length - 1 && (
                                    <View
                                        style={{
                                            height: 1,
                                            backgroundColor: theme.text + "0D",
                                        }}
                                    />
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* ── Streak banner ────────────────────────── */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 14,
                        marginTop: 24,
                        backgroundColor: theme.primary[4] + "15",
                        borderRadius: theme.border.radius.main,
                        borderWidth: 1,
                        borderColor: theme.primary[4] + "30",
                        padding: 16,
                    }}
                >
                    <Flame size={22} color={theme.primary[4]} strokeWidth={2} />
                    <View style={{ flex: 1, gap: 4 }}>
                        <Text
                            style={{
                                fontFamily: theme.fonts[600],
                                fontSize: 15,
                                color: theme.text,
                            }}
                        >
                            {currentStreak > 0 ? `${currentStreak}-Day Streak 🔥` : "Start Your Streak"}
                        </Text>
                        <Text
                            style={{
                                fontFamily: theme.fonts[400],
                                fontSize: 12,
                                color: theme.text + "70",
                                lineHeight: 18,
                            }}
                        >
                            {currentStreak > 0
                                ? "Complete all today's tasks to keep it going!"
                                : "Complete all tasks today to begin your streak."}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
