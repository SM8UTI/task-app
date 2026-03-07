import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, ChevronLeft, ChevronRight, Flame, CheckCircle2, TrendingUp } from "lucide-react-native";
import theme from "../data/color-theme";
import { useStreak, toDateKey, StreakLog } from "../hooks/useStreak";
import { useTaskManager } from "../hooks/useTaskManager";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
];
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfWeek = (y: number, m: number) => new Date(y, m, 1).getDay();

// ─── Day cell ─────────────────────────────────────────────────────────────────

type DayCellProps = {
    day: number;
    dateKey: string;
    log: StreakLog;
    isToday: boolean;
    isFuture: boolean;
    isSelected: boolean;
    onPress: () => void;
};

function DayCell({ day, dateKey, log, isToday, isFuture, isSelected, onPress }: DayCellProps) {
    const record = log[dateKey];
    const hasTasks = record && record.total > 0;
    const allDone = hasTasks && record.completed >= record.total;
    const partial = hasTasks && record.completed > 0 && !allDone;
    const missed = hasTasks && !isFuture && record.completed === 0;

    let circleBg = "transparent";
    let numColor = isFuture ? theme.text + "20" : theme.text + "50";
    let borderColor = "transparent";
    let dotColor: string | null = null;

    if (isToday && !allDone) {
        borderColor = theme.text + "50";
        numColor = theme.text;
    }
    if (allDone) {
        circleBg = "#34D39928";
        numColor = "#34D399";
        dotColor = "#34D399";
    } else if (partial) {
        circleBg = "#FFCA2822";
        numColor = "#FFCA28";
        dotColor = "#FFCA28";
    } else if (missed) {
        circleBg = "#FF575720";
        numColor = "#FF5757";
        dotColor = "#FF575770";
    }

    if (isSelected) {
        circleBg = theme.primary[3] + "30";
        borderColor = theme.primary[3];
        numColor = theme.primary[3];
    }

    return (
        <Pressable
            onPress={onPress}
            style={{ flex: 1, alignItems: "center", paddingVertical: 4 }}
        >
            <View
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: circleBg,
                    borderWidth: isToday || isSelected ? 1.5 : 0,
                    borderColor,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text
                    style={{
                        fontFamily: allDone ? theme.fonts[700] : theme.fonts[500],
                        fontSize: 13,
                        color: numColor,
                    }}
                >
                    {day}
                </Text>
            </View>
            <View style={{ height: 6, marginTop: 2, justifyContent: "center", alignItems: "center" }}>
                {dotColor && (
                    <View
                        style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: dotColor }}
                    />
                )}
            </View>
        </Pressable>
    );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function CalendarScreen() {
    const navigation = useNavigation<any>();
    const { tasks } = useTaskManager();
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

    const { currentStreak, log } = useStreak(tasks);

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);
    const todayKey = toDateKey(today);

    const prevMonth = () => {
        setSelectedDateKey(null);
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        setSelectedDateKey(null);
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    };
    const isAtCurrentMonth =
        viewYear === today.getFullYear() && viewMonth === today.getMonth();

    // Global stats
    const allKeys = Object.keys(log);
    const totalDays = allKeys.filter(k => log[k].total > 0).length;
    const perfectDays = allKeys.filter(
        k => log[k].total > 0 && log[k].completed >= log[k].total,
    ).length;
    const totalDone = allKeys.reduce((s, k) => s + log[k].completed, 0);

    // Monthly bar graph
    const maxCompletedInMonth = Math.max(
        1,
        ...Array.from({ length: daysInMonth }, (_, i) => {
            const dk = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
            return log[dk]?.completed || 0;
        }),
    );

    // Grid cells
    const cells: (number | null)[] = [
        ...Array(firstDayOfWeek).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    // Selected day detail
    const selectedRecord = selectedDateKey ? log[selectedDateKey] : null;

    const STAT_CARDS = [
        { label: "Active Days", value: String(totalDays).padStart(2, "0"), color: theme.primary[3] },
        { label: "Perfect Days", value: String(perfectDays).padStart(2, "0"), color: "#34D399" },
        { label: "Tasks Done", value: String(totalDone).padStart(2, "0"), color: theme.primary[2] },
    ];

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.background }}
            edges={["top", "left", "right"]}
        >
            {/* ── Header ──────────────────────────────────── */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: theme.padding.paddingMainX,
                    paddingTop: 12,
                    paddingBottom: 14,
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

                <View style={{ alignItems: "center", gap: 1 }}>
                    <Text
                        style={{
                            fontFamily: theme.fonts[700],
                            fontSize: 18,
                            color: theme.text,
                        }}
                    >
                        Calendar
                    </Text>
                    <Text
                        style={{
                            fontFamily: theme.fonts[400],
                            fontSize: 12,
                            color: theme.text + "50",
                        }}
                    >
                        {totalDays} active days tracked
                    </Text>
                </View>

                {/* Spacer */}
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode="never"
                contentContainerStyle={{ paddingBottom: 48 }}
            >
                {/* ── Hero streak card ───────────────────────── */}
                <View
                    style={{
                        paddingHorizontal: theme.padding.paddingMainX,
                        marginTop: 20,
                    }}
                >
                    <View
                        style={{
                            backgroundColor: theme.primary[3],
                            borderRadius: 28,
                            padding: 22,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <Flame size={20} stroke={theme.background} fill={theme.background} />
                                <Text
                                    style={{
                                        fontFamily: theme.fonts[500],
                                        fontSize: 15,
                                        color: theme.background,
                                    }}
                                >
                                    Daily Streak
                                </Text>
                            </View>
                            <View
                                style={{
                                    backgroundColor: theme.background + "20",
                                    paddingHorizontal: 12,
                                    paddingVertical: 5,
                                    borderRadius: 20,
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: theme.fonts[500],
                                        fontSize: 12,
                                        color: theme.background,
                                    }}
                                >
                                    {MONTH_NAMES[today.getMonth()].slice(0, 3)} {today.getFullYear()}
                                </Text>
                            </View>
                        </View>

                        <View style={{ marginTop: 24 }}>
                            <Text
                                style={{
                                    fontFamily: theme.fonts[400],
                                    fontSize: 30,
                                    lineHeight: 42,
                                    color: theme.background,
                                }}
                            >
                                You have{" "}
                                <Text style={{ fontFamily: theme.fonts[700] }}>
                                    {String(currentStreak).padStart(2, "0")}
                                </Text>
                                {"\n"}
                                {currentStreak === 1 ? "day" : "days"}{" "}
                                <Text style={{ fontFamily: theme.fonts[600] }}>in a row ~{" "}</Text>
                                {currentStreak === 0 ? "start today! 🌱" : "keep it up 🔥"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ── Global stat chips ──────────────────────── */}
                <View
                    style={{
                        flexDirection: "row",
                        gap: 8,
                        paddingHorizontal: theme.padding.paddingMainX,
                        marginTop: 12,
                    }}
                >
                    {STAT_CARDS.map(({ label, value, color }) => (
                        <View
                            key={label}
                            style={{
                                flex: 1,
                                backgroundColor: theme.text + "07",
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: color + "25",
                                paddingVertical: 12,
                                paddingHorizontal: 10,
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: theme.fonts[700],
                                    fontSize: 20,
                                    color,
                                }}
                            >
                                {value}
                            </Text>
                            <Text
                                style={{
                                    fontFamily: theme.fonts[400],
                                    fontSize: 11,
                                    color: theme.text + "55",
                                    textAlign: "center",
                                }}
                            >
                                {label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* ── Calendar grid card ─────────────────────── */}
                <View
                    style={{
                        marginHorizontal: theme.padding.paddingMainX,
                        marginTop: 16,
                        backgroundColor: theme.text + "06",
                        borderRadius: 28,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: theme.text + "10",
                    }}
                >
                    {/* Month navigation */}
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 20,
                        }}
                    >
                        <Pressable
                            onPress={prevMonth}
                            style={({ pressed }) => ({
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: pressed ? theme.text + "15" : theme.text + "0C",
                                justifyContent: "center",
                                alignItems: "center",
                            })}
                        >
                            <ChevronLeft size={18} color={theme.text + "90"} />
                        </Pressable>

                        <Text
                            style={{
                                fontFamily: theme.fonts[600],
                                fontSize: 15,
                                color: theme.text,
                            }}
                        >
                            {MONTH_NAMES[viewMonth]} {viewYear}
                        </Text>

                        <Pressable
                            onPress={nextMonth}
                            disabled={isAtCurrentMonth}
                            style={({ pressed }) => ({
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: pressed ? theme.text + "15" : theme.text + "0C",
                                justifyContent: "center",
                                alignItems: "center",
                                opacity: isAtCurrentMonth ? 0.25 : 1,
                            })}
                        >
                            <ChevronRight size={18} color={theme.text + "90"} />
                        </Pressable>
                    </View>

                    {/* Day-of-week labels */}
                    <View style={{ flexDirection: "row", marginBottom: 6 }}>
                        {DAY_LABELS.map((d, i) => (
                            <View key={i} style={{ flex: 1, alignItems: "center" }}>
                                <Text
                                    style={{
                                        fontFamily: theme.fonts[600],
                                        fontSize: 11,
                                        color: theme.text + "40",
                                        letterSpacing: 0.5,
                                    }}
                                >
                                    {d}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Grid rows */}
                    {Array.from({ length: cells.length / 7 }, (_, row) => (
                        <View key={row} style={{ flexDirection: "row" }}>
                            {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
                                if (!day) return <View key={col} style={{ flex: 1 }} />;
                                const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                return (
                                    <DayCell
                                        key={col}
                                        day={day}
                                        dateKey={dateKey}
                                        log={log}
                                        isToday={dateKey === todayKey}
                                        isFuture={dateKey > todayKey}
                                        isSelected={selectedDateKey === dateKey}
                                        onPress={() =>
                                            setSelectedDateKey(
                                                selectedDateKey === dateKey ? null : dateKey,
                                            )
                                        }
                                    />
                                );
                            })}
                        </View>
                    ))}

                    {/* Legend */}
                    <View
                        style={{
                            flexDirection: "row",
                            gap: 20,
                            flexWrap: "wrap",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 20,
                            paddingTop: 16,
                            borderTopWidth: 1,
                            borderTopColor: theme.text + "0D",
                        }}
                    >
                        {[
                            { dot: "#34D399", label: "All done" },
                            { dot: "#FFCA28", label: "Partial" },
                            { dot: "#FF5757", label: "Missed" },
                        ].map(({ dot, label }) => (
                            <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                <View
                                    style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dot }}
                                />
                                <Text
                                    style={{
                                        fontFamily: theme.fonts[400],
                                        fontSize: 11,
                                        color: theme.text + "55",
                                    }}
                                >
                                    {label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ── Selected day detail panel ──────────────── */}
                {selectedDateKey && (
                    <View
                        style={{
                            marginHorizontal: theme.padding.paddingMainX,
                            marginTop: 12,
                            backgroundColor: theme.primary[3] + "12",
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: theme.primary[3] + "25",
                            padding: 16,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 14,
                        }}
                    >
                        <View
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 14,
                                backgroundColor: theme.primary[3] + "20",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <CheckCircle2 size={22} color={theme.primary[3]} strokeWidth={2} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text
                                style={{
                                    fontFamily: theme.fonts[600],
                                    fontSize: 14,
                                    color: theme.text,
                                }}
                            >
                                {MONTH_NAMES[parseInt(selectedDateKey.split("-")[1], 10) - 1]}{" "}
                                {parseInt(selectedDateKey.split("-")[2], 10)},{" "}
                                {selectedDateKey.split("-")[0]}
                            </Text>
                            <Text
                                style={{
                                    fontFamily: theme.fonts[400],
                                    fontSize: 13,
                                    color: theme.text + "70",
                                    marginTop: 2,
                                }}
                            >
                                {selectedRecord
                                    ? `${selectedRecord.completed} of ${selectedRecord.total} task${selectedRecord.total !== 1 ? "s" : ""} completed`
                                    : "No tasks recorded this day"}
                            </Text>
                        </View>
                    </View>
                )}

                {/* ── Monthly activity bar graph ─────────────── */}
                <View
                    style={{
                        marginHorizontal: theme.padding.paddingMainX,
                        marginTop: 12,
                        backgroundColor: theme.text + "07",
                        borderRadius: 24,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: theme.text + "10",
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 20,
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <TrendingUp size={16} color={theme.primary[4]} strokeWidth={2} />
                            <Text
                                style={{
                                    fontFamily: theme.fonts[500],
                                    fontSize: 14,
                                    color: theme.text,
                                }}
                            >
                                Activity Graph
                            </Text>
                        </View>
                        <Text
                            style={{
                                fontFamily: theme.fonts[400],
                                fontSize: 11,
                                color: theme.text + "40",
                            }}
                        >
                            {MONTH_NAMES[viewMonth].slice(0, 3)}
                        </Text>
                    </View>

                    <View
                        style={{
                            flexDirection: "row",
                            height: 90,
                            alignItems: "flex-end",
                            justifyContent: "space-between",
                        }}
                    >
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                            const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                            const completed = log[dateKey]?.completed || 0;
                            const isToday = dateKey === todayKey;
                            const isSelected = selectedDateKey === dateKey;
                            const hPercent =
                                completed > 0
                                    ? Math.max(12, (completed / maxCompletedInMonth) * 100)
                                    : 4;
                            const barColor = isToday
                                ? theme.primary[3]
                                : completed > 0
                                    ? theme.primary[4]
                                    : theme.text + "12";

                            return (
                                <Pressable
                                    key={day}
                                    onPress={() =>
                                        setSelectedDateKey(
                                            selectedDateKey === dateKey ? null : dateKey,
                                        )
                                    }
                                    style={{
                                        flex: 1,
                                        alignItems: "center",
                                        paddingHorizontal: 1,
                                        height: "100%",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <View
                                        style={{
                                            width: "100%",
                                            maxWidth: 8,
                                            height: `${hPercent}%` as any,
                                            backgroundColor: isSelected
                                                ? theme.text
                                                : barColor,
                                            borderRadius: 4,
                                        }}
                                    />
                                </Pressable>
                            );
                        })}
                    </View>

                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginTop: 10,
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: theme.fonts[500],
                                fontSize: 11,
                                color: theme.text + "40",
                            }}
                        >
                            1
                        </Text>
                        <Text
                            style={{
                                fontFamily: theme.fonts[500],
                                fontSize: 11,
                                color: theme.text + "40",
                            }}
                        >
                            {Math.floor(daysInMonth / 2)}
                        </Text>
                        <Text
                            style={{
                                fontFamily: theme.fonts[500],
                                fontSize: 11,
                                color: theme.text + "40",
                            }}
                        >
                            {daysInMonth}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
