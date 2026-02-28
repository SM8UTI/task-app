import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
    CalendarClock,
    Calendar1,
    CheckCircle,
    ChevronsRight,
    Trash2,
} from "lucide-react-native";
import theme from "../data/color-theme";
import AnimatedIconButton from "./AnimatedIconButton";
import { Task, PRIORITY_CONFIG } from "./TaskCard";

// ─── Status cycling helpers ────────────────────────────────────────────────
const STATUS_ORDER = ["to-do", "in-progress", "completed"] as const;
type TaskStatus = (typeof STATUS_ORDER)[number];

const getTomorrow = (): Date => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d;
};

type AdvanceCfg = { label: string; color: string; Icon: React.ReactNode };

const getAdvanceCfg = (status: string): AdvanceCfg => {
    if (status === "to-do")
        return {
            label: "Move to In Progress",
            color: theme.success,
            Icon: <ChevronsRight color={theme.white} size={18} />,
        };
    if (status === "in-progress")
        return {
            label: "Mark as Done",
            color: theme.success,
            Icon: <CheckCircle color={theme.white} size={18} />,
        };
    // completed → reschedule to tomorrow
    return {
        label: "Reschedule for Tomorrow",
        color: "#4A7FD6",
        Icon: <CalendarClock color={theme.white} size={18} />,
    };
};

// ─── Status display config ───────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    "to-do": { label: "To Do", color: "#888888", bg: "#88888818" },
    "in-progress": { label: "In Progress", color: "#4A7FD6", bg: "#4A7FD618" },
    "completed": { label: "Completed", color: "#003e28ff", bg: "#34D39918" },
};

// ─── Date label ─────────────────────────────────────────────────────────────
const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const getDateLabel = (dueDate: Date | string): string => {
    const d = new Date(dueDate);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (isSameDay(d, now)) return "Today";
    if (isSameDay(d, tomorrow)) return "Tomorrow";
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

// ─── Props ──────────────────────────────────────────────────────────────────
type TaskProps = {
    task: Task;
    onClose: () => void;
    /** Cycles status: to-do → in-progress → completed → to-do (tomorrow) */
    onAdvanceStatus?: () => void;
    onDelete?: () => void;
};

// ─── Component ──────────────────────────────────────────────────────────────
export default function TaskDetailsInfo({ task, onClose, onAdvanceStatus, onDelete }: TaskProps) {
    const tDate = new Date(task.dueDate);
    const timeStr = tDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
    const dateLabel = getDateLabel(task.dueDate);

    const advanceCfg = getAdvanceCfg(task.status);
    const priorityCfg = PRIORITY_CONFIG[task.priority] ?? null;
    const statusCfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG["to-do"];

    return (
        <View style={styles.container}>
            {/* ── Top row: date + priority + status ─────────── */}
            <View style={styles.topRow}>
                <View style={styles.datePill}>
                    <Calendar1 size={14} color={theme.background + "80"} />
                    <Text style={styles.datePillText}>
                        {dateLabel}, {timeStr}
                    </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                    {/* Status pill */}
                    <View style={[styles.priorityPill, { backgroundColor: statusCfg.bg }]}>
                        <View style={[styles.priorityDot, { backgroundColor: statusCfg.color }]} />
                        <Text style={[styles.priorityLabel, { color: statusCfg.color }]}>
                            {statusCfg.label}
                        </Text>
                    </View>

                    {/* Priority pill */}
                    {priorityCfg && (
                        <View style={[styles.priorityPill, { backgroundColor: priorityCfg.bg }]}>
                            <View style={[styles.priorityDot, { backgroundColor: priorityCfg.dot }]} />
                            <Text style={[styles.priorityLabel, { color: priorityCfg.dot }]}>
                                {priorityCfg.label}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* ── Title & Description ───────────────────────── */}
            <Text style={styles.title}>{task.title}</Text>
            <Text style={styles.description}>{task.description}</Text>

            {/* ── Tags ─────────────────────────────────────── */}
            {task.tag && task.tag.length > 0 && (
                <View style={styles.tagRow}>
                    {task.tag.map((tag: string, idx: number) => (
                        <Text key={idx} style={styles.tagText}>#{tag}</Text>
                    ))}
                </View>
            )}

            {/* ── Action buttons ───────────────────────────── */}
            <View style={styles.actionRow}>
                {/* Advance status button */}
                <View style={{ flex: 1 }}>
                    <AnimatedIconButton
                        style={[styles.advanceBtn, { backgroundColor: advanceCfg.color }]}
                        onPress={onAdvanceStatus}
                    >
                        {advanceCfg.Icon}
                        <Text style={styles.advanceBtnLabel}>{advanceCfg.label}</Text>
                    </AnimatedIconButton>
                </View>

                {/* Delete button */}
                <AnimatedIconButton
                    style={styles.deleteBtn}
                    onPress={onDelete}
                >
                    <Trash2 color={theme.error} size={24} />
                </AnimatedIconButton>
            </View>
        </View>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingBottom: 8,
        paddingTop: 20,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        flexWrap: "wrap",
        gap: 12,
    },
    datePill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    datePillText: {
        fontFamily: theme.fonts[500],
        fontSize: 14,
        color: theme.background + "88",
    },
    priorityPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    priorityDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    priorityLabel: {
        fontFamily: theme.fonts[600],
        fontSize: 12,
    },
    title: {
        fontFamily: theme.fonts[500],
        fontSize: 16,
        color: theme.background + "90",
        marginBottom: 2,
        lineHeight: 40,
    },
    description: {
        fontFamily: theme.fonts[700],
        fontSize: 24,
        color: theme.background,
        marginBottom: 20,
        lineHeight: 36,
    },
    tagRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 24,
        flexWrap: "wrap",
        borderTopWidth: 1,
        borderColor: theme.background + "10",
        paddingTop: 16,
    },
    tagText: {
        fontFamily: theme.fonts[500],
        fontSize: 15,
        color: theme.background + "80",
        textTransform: "capitalize",
    },
    actionRow: {
        flexDirection: "row",
        gap: 12,
        borderTopWidth: 1,
        borderColor: theme.background + "10",
        paddingTop: 20,
    },
    advanceBtn: {
        width: "100%",
        height: 64,
        borderRadius: 120,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    advanceBtnLabel: {
        fontFamily: theme.fonts[500],
        fontSize: 15,
        color: theme.white,
    },
    deleteBtn: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.error + "30",
        backgroundColor: theme.error + "18",
    },
});
