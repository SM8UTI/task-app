import React, { useState, useEffect } from "react";
import { View, Text, Linking, TouchableOpacity } from "react-native";
import {
    CalendarClock,
    Calendar1,
    CheckCircle,
    ChevronsRight,
    Trash2,
    Play,
    Tag,
    Youtube,
} from "lucide-react-native";
import theme from "../data/color-theme";
import AnimatedIconButton from "./AnimatedIconButton";
import { Task, PRIORITY_CONFIG } from "./TaskCard";
import { useTimer } from "../context/TimerContext";
import { useNavigation } from "@react-navigation/native";
import { extractYouTubeId, hideYouTubeUrl } from "../utils/youtube";
import YouTubePreview from "./YouTubePreview";

// ─── Status cycling helpers ────────────────────────────────────────────────────
// Not using STATUS_ORDER and TaskStatus here as it is only used locally as array iteration keys
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
    return {
        label: "Reschedule for Tomorrow",
        color: "#4A7FD6",
        Icon: <CalendarClock color={theme.white} size={18} />,
    };
};

// ─── Status display config ─────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    "to-do": { label: "To Do", color: "#888888", bg: "#88888818" },
    "in-progress": { label: "In Progress", color: "#4A7FD6", bg: "#4A7FD618" },
    "completed": { label: "Completed", color: "#34D399", bg: "#34D39918" },
};

// ─── Date helpers ──────────────────────────────────────────────────────────────
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

// ─── Props ─────────────────────────────────────────────────────────────────────
type TaskProps = {
    task: Task;
    onClose: () => void;
    onAdvanceStatus?: () => void;
    onDelete?: () => void;
};

// ─── Component ─────────────────────────────────────────────────────────────────
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
    const youtubeId = extractYouTubeId(task.description);
    const descriptionText = hideYouTubeUrl(task.description);
    const isTimerActiveForTask = isActive && activeTaskId === task.id;

    // Fetch YouTube oEmbed metadata for the prominent info block
    const [ytMeta, setYtMeta] = useState<{ title: string; author: string } | null>(null);
    useEffect(() => {
        if (!youtubeId) return;
        setYtMeta(null);
        let alive = true;
        fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`)
            .then(r => r.json())
            .then(data => {
                if (alive && data?.title) {
                    setYtMeta({ title: data.title, author: data.author_name });
                }
            })
            .catch(() => { });
        return () => { alive = false; };
    }, [youtubeId]);

    return (
        <View style={{ paddingHorizontal: 24, paddingBottom: 8, paddingTop: 20 }}>

            {/* ── Title + date row ────────────────────────────────────────────── */}
            <Text style={{
                fontFamily: theme.fonts[700],
                fontSize: 22,
                color: theme.background,
                lineHeight: 30,
                marginBottom: 8,
            }}>
                {task.title}
            </Text>

            {/* ── Meta row: date, priority, status pills ──────────────────────── */}
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 20,
            }}>
                {/* Date pill */}
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    backgroundColor: theme.background + "0C",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 20,
                }}>
                    <Calendar1 size={13} color={theme.background + "70"} />
                    <Text style={{
                        fontFamily: theme.fonts[500],
                        fontSize: 13,
                        color: theme.background + "80",
                    }}>
                        {dateLabel}, {timeStr}
                    </Text>
                </View>

                {/* Priority pill — matches TaskCard style exactly */}
                {priorityCfg && (
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 20,
                        backgroundColor: priorityCfg.bg,
                    }}>
                        <View style={{
                            width: 7,
                            height: 7,
                            borderRadius: 4,
                            backgroundColor: priorityCfg.dot,
                        }} />
                        <Text style={{
                            fontFamily: theme.fonts[500],
                            fontSize: 13,
                            color: priorityCfg.dot,
                        }}>
                            {priorityCfg.label.split(" ")[0]}
                        </Text>
                    </View>
                )}

                {/* Status pill */}
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor: statusCfg.bg,
                }}>
                    <View style={{
                        width: 7,
                        height: 7,
                        borderRadius: 4,
                        backgroundColor: statusCfg.color,
                    }} />
                    <Text style={{
                        fontFamily: theme.fonts[500],
                        fontSize: 13,
                        color: statusCfg.color,
                    }}>
                        {statusCfg.label}
                    </Text>
                </View>

                {/* Focus / timer pill — matches TaskCard pill exactly */}
                {task.status !== "completed" && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            onClose();
                            setTimeout(() => {
                                if (isTimerActiveForTask) {
                                    navigation.navigate("FocusScreen", {
                                        taskId: task.id,
                                        duration: Math.floor(timeLeft / 60),
                                        taskTitle: task.title,
                                    });
                                } else {
                                    navigation.navigate("FocusSetupScreen", { taskId: task.id });
                                }
                            }, 300);
                        }}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 5,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 20,
                            // matches TaskCard: white bg when active, dark when idle
                            backgroundColor: isTimerActiveForTask
                                ? theme.background
                                : theme.background + "10",
                        }}
                    >
                        <Play
                            fill={isTimerActiveForTask ? theme.white : theme.background + "70"}
                            color={isTimerActiveForTask ? theme.white : theme.background + "70"}
                            size={10}
                        />
                        <Text style={{
                            fontFamily: theme.fonts[700],
                            fontSize: 13,
                            color: isTimerActiveForTask ? theme.white : theme.background + "80",
                        }}>
                            {isTimerActiveForTask
                                ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`
                                : "Focus"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* ── YouTube preview + description card ──────────────────────────── */}
            {(youtubeId || !!descriptionText) && (
                <View style={{
                    backgroundColor: theme.background + "08",
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.background + "10",
                    marginBottom: 16,
                    overflow: "hidden",
                }}>
                    {/* Thumbnail — YouTubePreview without its own meta text so we render ours */}
                    {youtubeId && (
                        <YouTubePreview
                            youtubeId={youtubeId}
                            textColor={theme.background}
                            bgColor={theme.background + "08"}
                            showMeta={false}
                        />
                    )}

                    {/* ── YouTube info block (title + channel) ────────────── */}
                    {youtubeId && (
                        <View style={{
                            paddingHorizontal: 14,
                            paddingTop: 4,
                            paddingBottom: 14,
                            gap: 6,
                        }}>
                            {/* Video title */}
                            <Text style={{
                                fontFamily: theme.fonts[700],
                                fontSize: 15,
                                color: theme.background,
                                lineHeight: 22,
                            }} numberOfLines={2}>
                                {ytMeta ? ytMeta.title : "Loading video title…"}
                            </Text>
                            {/* Channel name row with YouTube icon */}
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                            }}>
                                <Youtube size={13} color="#FF0000" />
                                <Text style={{
                                    fontFamily: theme.fonts[500],
                                    fontSize: 13,
                                    color: theme.background + "70",
                                }} numberOfLines={1}>
                                    {ytMeta ? ytMeta.author : "YouTube"}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Description text */}
                    {!!descriptionText && (
                        <Text style={{
                            fontFamily: theme.fonts[500],
                            fontSize: 15,
                            color: theme.background + "90",
                            lineHeight: 24,
                            padding: 16,
                            paddingTop: youtubeId ? 0 : 16,
                        }}>
                            {descriptionText.split(/(https?:\/\/[^\s]+)/g).map((part, index) => {
                                if (part.match(/(https?:\/\/[^\s]+)/g)) {
                                    return (
                                        <Text
                                            key={index}
                                            style={{
                                                textDecorationLine: "underline",
                                                color: theme.primary?.[4] || theme.background,
                                            }}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                Linking.openURL(part).catch(err =>
                                                    console.log("Couldn't load page", err)
                                                );
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
                </View>
            )}

            {/* ── Tags row ────────────────────────────────────────────────────── */}
            {task.tag && task.tag.length > 0 && (
                <View style={{
                    flexDirection: "row",
                    gap: 6,
                    flexWrap: "wrap",
                    alignItems: "center",
                    marginBottom: 20,
                }}>
                    <Tag size={13} color={theme.background + "50"} />
                    {task.tag.map((tag: string, idx: number) => (
                        <View key={idx} style={{
                            backgroundColor: theme.background + "0C",
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 20,
                        }}>
                            <Text style={{
                                fontFamily: theme.fonts[500],
                                fontSize: 13,
                                color: theme.background + "70",
                                textTransform: "capitalize",
                            }}>
                                #{tag}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* ── Action buttons ───────────────────────────────────────────────── */}
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
                            height: 56,
                            borderRadius: 120,
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 10,
                            backgroundColor: advanceCfg.color,
                        }}
                        onPress={onAdvanceStatus}
                    >
                        {advanceCfg.Icon}
                        <Text style={{
                            fontFamily: theme.fonts[600],
                            fontSize: 15,
                            color: theme.white,
                        }}>
                            {advanceCfg.label}
                        </Text>
                    </AnimatedIconButton>
                </View>

                {/* Delete button */}
                <AnimatedIconButton
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: theme.error + "30",
                        backgroundColor: theme.error + "18",
                    }}
                    onPress={onDelete}
                >
                    <Trash2 color={theme.error} size={22} />
                </AnimatedIconButton>
            </View>
        </View>
    );
}
