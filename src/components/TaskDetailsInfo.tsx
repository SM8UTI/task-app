import React from "react";
import { View, Text } from "react-native";
import {
    CalendarClock,
    Calendar1,
    CheckCircle,
    ChevronsRight,
    Trash2,
    Play,
} from "lucide-react-native";
import theme from "../data/color-theme";
import AnimatedIconButton from "./AnimatedIconButton";
import { Task, PRIORITY_CONFIG } from "./TaskCard";
import { useTimer } from "../context/TimerContext";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";

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
    const { timeLeft, isActive, activeTaskId } = useTimer();
    const navigation = useNavigation<any>();

    const advanceCfg = getAdvanceCfg(task.status);
    const priorityCfg = PRIORITY_CONFIG[task.priority] ?? null;
    const statusCfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG["to-do"];

    return (
        <View style={{ paddingHorizontal: 24, paddingBottom: 8, paddingTop: 20 }}>
            {/* ── Top row: date + priority + status ─────────── */}
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
                flexWrap: "wrap",
                gap: 12,
            }}>


                <View style={{
                    flexDirection: "column",
                    gap: 2,
                }}>
                    <Text style={{
                        fontFamily: theme.fonts[500],
                        fontSize: 16,
                        color: theme.background + "90",
                        marginBottom: 2,
                        lineHeight: 40,
                    }}>{task.title}</Text>
                    <View style={{
                        flexDirection: "row",
                        gap: 6,
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%"
                    }}>
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                        }}>
                            <Calendar1 size={14} color={theme.background + "80"} />
                            <Text style={{
                                fontFamily: theme.fonts[500],
                                fontSize: 14,
                                color: theme.background + "88",
                            }}>
                                {dateLabel}, {timeStr}
                            </Text>
                        </View>
                        {/* Priority pill */}
                        {priorityCfg && (
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 5,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                borderRadius: 20,
                                backgroundColor: priorityCfg.bg
                            }}>
                                <View style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: 4,
                                    backgroundColor: priorityCfg.dot
                                }} />
                                <Text style={{
                                    fontFamily: theme.fonts[600],
                                    fontSize: 12,
                                    color: priorityCfg.dot
                                }}>
                                    {priorityCfg.label}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>




            </View>
            <View style={{
                backgroundColor: theme.background + "10",
                padding: 24,
                borderRadius: 12,
                marginBottom: 12,
            }}>
                <Text style={{
                    fontFamily: theme.fonts[600],
                    fontSize: 18,
                    color: theme.background + "90",
                    lineHeight: 32,
                }}>{task.description}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 6, alignItems: "center", marginBottom: 24 }}>
                {/* Timer Pill */}
                {task.status !== "completed" && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            // First close the modal, then navigate
                            onClose();
                            setTimeout(() => {
                                if (isActive && activeTaskId === task.id) {
                                    navigation.navigate("FocusScreen", { taskId: task.id, duration: Math.floor(timeLeft / 60) });
                                } else {
                                    navigation.navigate("FocusSetupScreen", { taskId: task.id });
                                }
                            }, 300); // Wait for modal to close
                        }}
                    >
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 5,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 20,
                            backgroundColor: isActive && activeTaskId === task.id ? theme.primary[4] : theme.background + "10"
                        }}>
                            <Play fill={isActive && activeTaskId === task.id ? theme.white : theme.background + "80"} color={isActive && activeTaskId === task.id ? theme.white : theme.background + "80"} size={10} />
                            <Text style={{
                                fontFamily: theme.fonts[600],
                                fontSize: 13,
                                color: isActive && activeTaskId === task.id ? theme.white : theme.background + "80",
                                marginLeft: 2
                            }}>
                                {isActive && activeTaskId === task.id
                                    ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`
                                    : "Focus"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Status pill */}
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 20,
                    backgroundColor: statusCfg.bg
                }}>
                    <View style={{
                        width: 7,
                        height: 7,
                        borderRadius: 4,
                        backgroundColor: statusCfg.color
                    }} />
                    <Text style={{
                        fontFamily: theme.fonts[600],
                        fontSize: 12,
                        color: statusCfg.color
                    }}>
                        {statusCfg.label}
                    </Text>
                </View>

            </View>



            {/* ── Tags ─────────────────────────────────────── */}
            {task.tag && task.tag.length > 0 && (
                <View style={{
                    flexDirection: "row",
                    gap: 8,
                    marginBottom: 24,
                    flexWrap: "wrap",
                    borderTopWidth: 1,
                    borderColor: theme.background + "10",
                    paddingTop: 16,
                }}>
                    {task.tag.map((tag: string, idx: number) => (
                        <Text key={idx} style={{
                            fontFamily: theme.fonts[500],
                            fontSize: 15,
                            color: theme.background + "80",
                            textTransform: "capitalize",
                        }}>#{tag}</Text>
                    ))}
                </View>
            )}

            {/* ── Action buttons ───────────────────────────── */}
            <View style={{
                flexDirection: "row",
                gap: 12,
                borderTopWidth: 1,
                borderColor: theme.background + "10",
                paddingTop: 20,
            }}>
                {/* Advance status button */}
                <View style={{ flex: 1 }}>
                    <AnimatedIconButton
                        style={{
                            width: "100%",
                            height: 64,
                            borderRadius: 120,
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 10,
                            backgroundColor: advanceCfg.color
                        }}
                        onPress={onAdvanceStatus}
                    >
                        {advanceCfg.Icon}
                        <Text style={{
                            fontFamily: theme.fonts[500],
                            fontSize: 15,
                            color: theme.white,
                        }}>{advanceCfg.label}</Text>
                    </AnimatedIconButton>
                </View>

                {/* Delete button */}
                <AnimatedIconButton
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: theme.error + "30",
                        backgroundColor: theme.error + "18",
                    }}
                    onPress={onDelete}
                >
                    <Trash2 color={theme.error} size={24} />
                </AnimatedIconButton>
            </View>
        </View>
    );
}
