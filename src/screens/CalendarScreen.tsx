import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react-native";
import theme from "../data/color-theme";
import { useStreak, toDateKey, StreakLog } from "../hooks/useStreak";

const TASKS_STORAGE_KEY = "@myapp_tasks_data";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
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
};

function DayCell({ day, dateKey, log, isToday, isFuture }: DayCellProps) {
    const record = log[dateKey];
    const hasTasks = record && record.total > 0;
    const allDone = hasTasks && record.completed >= record.total;
    const partial = hasTasks && record.completed > 0 && !allDone;
    const missed = hasTasks && !isFuture && record.completed === 0;

    // Derive cell look
    let circleBg = "transparent";
    let numColor = theme.text + "50";
    let borderColor = "transparent";
    let dotColor: string | null = null;

    if (isToday && !allDone) {
        borderColor = theme.white + "40";
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
    if (isFuture) numColor = theme.text + "20";

    return (
        <View style={{ flex: 1, alignItems: "center", paddingVertical: 4 }}>
            <View style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: circleBg,
                borderWidth: isToday ? 1.5 : 0,
                borderColor,
                justifyContent: "center", alignItems: "center",
            }}>
                <Text style={{ fontFamily: allDone ? theme.fonts[700] : theme.fonts[500], fontSize: 13, color: numColor }}>
                    {day}
                </Text>
            </View>
            {/* indicator dot */}
            <View style={{ height: 6, marginTop: 2, justifyContent: "center", alignItems: "center" }}>
                {dotColor && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: dotColor }} />}
            </View>
        </View>
    );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function CalendarScreen() {
    const [tasks, setTasks] = useState<any[]>([]);
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const { currentStreak, log } = useStreak(tasks);

    useFocusEffect(
        React.useCallback(() => {
            AsyncStorage.getItem(TASKS_STORAGE_KEY).then(raw => {
                if (!raw) return setTasks([]);
                const parsed = JSON.parse(raw).map((t: any) => ({
                    ...t,
                    dueDate: new Date(t.dueDate),
                    createdAt: new Date(t.createdAt),
                    updatedAt: new Date(t.updatedAt),
                }));
                setTasks(parsed);
            });
        }, [])
    );

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);
    const todayKey = toDateKey(today);

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    };
    const isAtCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

    // Stats
    const allKeys = Object.keys(log);
    const totalDays = allKeys.filter(k => log[k].total > 0).length;
    const perfectDays = allKeys.filter(k => log[k].total > 0 && log[k].completed >= log[k].total).length;
    const totalDone = allKeys.reduce((s, k) => s + log[k].completed, 0);

    // Grid cells
    const cells: (number | null)[] = [
        ...Array(firstDayOfWeek).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const stats = [
        { label: "Day Streak", value: currentStreak, accent: "#FF8C00" },
        { label: "Perfect Days", value: perfectDays, accent: "#34D399" },
        { label: "Tasks Done", value: totalDone, accent: theme.primary[3] },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["top", "left", "right"]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode="never"
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* ── Page heading ─────────────────────────────── */}
                <View style={{ paddingHorizontal: theme.padding.paddingMainX, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.text + "10" }}>
                    <Text style={{ fontFamily: theme.fonts[700], fontSize: 24, color: theme.text }}>
                        Calendar
                    </Text>
                    <Text style={{ fontFamily: theme.fonts[400], fontSize: 14, color: theme.text + "90", marginTop: 2 }}>
                        {String(totalDays).padStart(2, "0")} active days tracked
                    </Text>
                </View>

                {/* ── Hero streak card ─────────────────────────── */}
                <View style={{ paddingHorizontal: theme.padding.paddingMainX, marginTop: 20 }}>
                    <View style={{
                        backgroundColor: theme.primary[3],
                        borderRadius: 40,
                        padding: 24,
                        overflow: "hidden",
                    }}>
                        {/* top row: icon label + date pill */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <Flame size={20} stroke={theme.background} fill={theme.background} />
                                <Text style={{ fontFamily: theme.fonts[500], fontSize: 16, color: theme.background }}>
                                    Daily Streak
                                </Text>
                            </View>
                            <View style={{ backgroundColor: theme.background + "15", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                                <Text style={{ fontFamily: theme.fonts[500], fontSize: 13, color: theme.background }}>
                                    {MONTH_NAMES[today.getMonth()].slice(0, 3)} {today.getFullYear()}
                                </Text>
                            </View>
                        </View>

                        {/* streak number block — mirrors home "XX tasks" layout */}
                        <View style={{ marginTop: 32 }}>

                            <Text style={{ fontFamily: theme.fonts[400], fontSize: 32, lineHeight: 44, color: theme.background }}>
                                You have{" "}
                                <Text style={{ fontFamily: theme.fonts[700] }}>
                                    {String(currentStreak).padStart(2, "0")}
                                </Text>
                                {"\n"}
                                {currentStreak === 1 ? "day" : "days"}{" "}
                                <Text style={{ fontFamily: theme.fonts[600], color: theme.background }}>
                                    in a row ~ {""}
                                </Text>

                                {currentStreak === 0 ? "start today! 🌱" : "keep it up 🔥"}
                            </Text>
                        </View>
                    </View>
                </View>



                {/* ── Calendar card ────────────────────────────── */}
                <View style={{
                    marginHorizontal: theme.padding.paddingMainX,
                    marginTop: 20,
                    backgroundColor: theme.white + "06",
                    borderRadius: 32,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: theme.white + "10",
                }}>
                    {/* Month nav row */}
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                        <TouchableOpacity onPress={prevMonth} style={{
                            width: 36, height: 36, borderRadius: 18,
                            backgroundColor: theme.white + "10",
                            justifyContent: "center", alignItems: "center",
                        }}>
                            <ChevronLeft size={18} color={theme.text + "90"} />
                        </TouchableOpacity>

                        <Text style={{ fontFamily: theme.fonts[600], fontSize: 16, color: theme.text }}>
                            {MONTH_NAMES[viewMonth]} {viewYear}
                        </Text>

                        <TouchableOpacity
                            onPress={nextMonth}
                            disabled={isAtCurrentMonth}
                            style={{
                                width: 36, height: 36, borderRadius: 18,
                                backgroundColor: theme.white + "10",
                                justifyContent: "center", alignItems: "center",
                                opacity: isAtCurrentMonth ? 0.25 : 1,
                            }}
                        >
                            <ChevronRight size={18} color={theme.text + "90"} />
                        </TouchableOpacity>
                    </View>

                    {/* Day-of-week labels */}
                    <View style={{ flexDirection: "row", marginBottom: 6 }}>
                        {DAY_LABELS.map((d, i) => (
                            <View key={i} style={{ flex: 1, alignItems: "center" }}>
                                <Text style={{ fontFamily: theme.fonts[600], fontSize: 11, color: theme.text + "40", letterSpacing: 0.5 }}>
                                    {d}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Grid */}
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
                                    />
                                );
                            })}
                        </View>
                    ))}

                    {/* Legend */}
                    <View style={{ flexDirection: "row", gap: 24, marginTop: 24, flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
                        {[
                            { dot: "#34D399", label: "All done" },
                            { dot: "#FFCA28", label: "Partial" },
                            { dot: "#FF5757", label: "Missed" },
                        ].map(({ dot, label }) => (
                            <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dot }} />
                                <Text style={{ fontFamily: theme.fonts[400], fontSize: 11, color: theme.text + "55" }}>
                                    {label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ── Stat pills ───────────────────────────────── */}
                <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: theme.padding.paddingMainX, marginTop: 14 }}>
                    {stats.map(({ label, value, accent }) => (
                        <View key={label} style={{
                            flex: 1,
                            backgroundColor: theme.white + "08",
                            borderRadius: theme.border.radius.main,
                            paddingVertical: 16,
                            paddingHorizontal: 12,
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: theme.white + "10",
                        }}>
                            <Text style={{ fontFamily: theme.fonts[700], fontSize: 24, color: accent }}>
                                {String(value).padStart(2, "0")}
                            </Text>
                            <Text style={{ fontFamily: theme.fonts[400], fontSize: 11, color: theme.text + "60", marginTop: 4, textAlign: "center" }}>
                                {label}
                            </Text>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
