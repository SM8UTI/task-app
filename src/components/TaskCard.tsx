import React, { useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    PanResponder,
    Dimensions,
} from "react-native";
import theme from "../data/color-theme";
import {
    ArrowLeft,
    ArrowRight,
    CalendarClock,
    Check,
    ChevronsRight,
    Trash2,
    Play
} from "lucide-react-native";
import { useTimer } from "../context/TimerContext";
import { useNavigation } from "@react-navigation/native";

// ─── Task type ───────────────────────────────────────────────────────────────
export type Task = {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: Date | string;
    tag?: string[];
    isCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    [key: string]: any;
};

// ─── Status constants ────────────────────────────────────────────────────────
const STATUS_ORDER = ["to-do", "in-progress", "completed"] as const;
type TaskStatus = (typeof STATUS_ORDER)[number];

const STATUS_LABELS: Record<string, string> = {
    "to-do": "To Do",
    "in-progress": "In Progress",
    completed: "Completed",
};

const getTomorrow = (): Date => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d;
};

// ─── Priority config (shared) ────────────────────────────────────────────────
export const PRIORITY_CONFIG: Record<
    string,
    { dot: string; label: string; bg: string }
> = {
    high: { dot: "#FF5757", label: "High Priority", bg: "#FF575715" },
    medium: { dot: "#a86d00ff", label: "Medium Priority", bg: "#FFB22415" },
    low: { dot: "#343434ff", label: "Low Priority", bg: "#61616115" },
};

// ─── Swipe-right helpers ─────────────────────────────────────────────────────
const getSwipeRightLabel = (status: string) => {
    if (status === "to-do") return "Move to In Progress";
    if (status === "in-progress") return "Mark as Done";
    return "Reschedule for Tomorrow";
};

const SwipeRightIcon = ({ status }: { status: string }) => {
    if (status === "in-progress") return <Check color={theme.white} size={24} />;
    if (status === "completed") return <CalendarClock color={theme.white} size={24} />;
    return <ChevronsRight color={theme.white} size={24} />;
};

// ─── Screen constants ────────────────────────────────────────────────────────
const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;
const ABSOLUTE_FILL = { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 };

// ─── Props ───────────────────────────────────────────────────────────────────
type TaskCardProps = {
    task: Task;
    bgColor: string;
    onPress: () => void;
    onAdvanceStatus?: () => void;
    onSetStatus?: (newStatus: string, newDueDate?: Date) => void;
    onDelete?: () => void;
    onComplete?: () => void;
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function TaskCard({
    task,
    bgColor,
    onPress,
    onAdvanceStatus,
    onSetStatus,
    onDelete,
    onComplete,
}: TaskCardProps) {
    const pan = useRef(new Animated.Value(0)).current;
    const [dismissed, setDismissed] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const { timeLeft, isActive, activeTaskId } = useTimer();
    const navigation = useNavigation<any>();

    // ── Status navigation ─────────────────────────────────────────────────
    const currentIdx = STATUS_ORDER.indexOf(task.status as TaskStatus);
    const prevStatus: TaskStatus | null = currentIdx > 0 ? STATUS_ORDER[currentIdx - 1] : null;
    const nextStatus: TaskStatus =
        task.status === "completed" ? "to-do" : STATUS_ORDER[Math.min(currentIdx + 1, 2)];
    const nextIsTomorrow = task.status === "completed";

    const priorityCfg = PRIORITY_CONFIG[task.priority] ?? null;
    const swipeRightLabel = getSwipeRightLabel(task.status);

    // ── PanResponder ──────────────────────────────────────────────────────
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gs) => {
                if (showStatusMenu) return false;
                return Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 10 && !dismissed;
            },
            onPanResponderMove: (_, gs) => pan.setValue(gs.dx),
            onPanResponderRelease: (_, gs) => {
                if (gs.dx > SWIPE_THRESHOLD) {
                    Animated.timing(pan, { toValue: SCREEN_WIDTH, duration: 250, useNativeDriver: true })
                        .start(() => { setDismissed(true); onAdvanceStatus?.() ?? onComplete?.(); });
                } else if (gs.dx < -SWIPE_THRESHOLD) {
                    Animated.timing(pan, { toValue: -SCREEN_WIDTH, duration: 250, useNativeDriver: true })
                        .start(() => { setDismissed(true); onDelete?.(); });
                } else {
                    Animated.spring(pan, { toValue: 0, useNativeDriver: true, bounciness: 12, speed: 20 }).start();
                }
            },
        })
    ).current;

    if (dismissed) return null;

    const handlePrevStatus = () => { if (!prevStatus) return; onSetStatus?.(prevStatus); setShowStatusMenu(false); };
    const handleNextStatus = () => { onSetStatus?.(nextStatus, nextIsTomorrow ? getTomorrow() : undefined); setShowStatusMenu(false); };

    return (
        <View style={{ position: "relative", width: "100%" }}>

            {/* ── LEFT bg (swipe right) ─────────────────────────────────── */}
            <Animated.View style={[
                ABSOLUTE_FILL,
                {
                    backgroundColor: theme.background,
                    borderRadius: theme.border.radius.main,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingLeft: 24,
                    opacity: pan.interpolate({ inputRange: [0, SWIPE_THRESHOLD], outputRange: [0, 1], extrapolate: "clamp" }),
                    transform: [{ scale: pan.interpolate({ inputRange: [0, SWIPE_THRESHOLD], outputRange: [0.95, 1], extrapolate: "clamp" }) }],
                },
            ]}>
                <View style={{ backgroundColor: theme.white + "20", height: 48, width: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" }}>
                    <SwipeRightIcon status={task.status} />
                </View>
                <Text style={{ fontFamily: theme.fonts[600], fontSize: 16, color: theme.white, marginLeft: 16 }}>
                    {swipeRightLabel}
                </Text>
            </Animated.View>

            {/* ── RIGHT bg (swipe left) ─────────────────────────────────── */}
            <Animated.View style={[
                ABSOLUTE_FILL,
                {
                    backgroundColor: theme.background,
                    borderRadius: theme.border.radius.main,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: 24,
                    opacity: pan.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0], extrapolate: "clamp" }),
                    transform: [{ scale: pan.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0.95], extrapolate: "clamp" }) }],
                },
            ]}>
                <Text style={{ fontFamily: theme.fonts[600], fontSize: 16, color: theme.error, marginRight: 16 }}>
                    Delete Task
                </Text>
                <View style={{ backgroundColor: theme.error + "25", height: 48, width: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" }}>
                    <Trash2 color={theme.error} size={24} />
                </View>
            </Animated.View>

            {/* ── Foreground card ───────────────────────────────────────── */}
            <Animated.View
                {...panResponder.panHandlers}
                style={{
                    transform: [
                        { translateX: pan },
                        { rotateZ: pan.interpolate({ inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH], outputRange: ["-12deg", "0deg", "12deg"], extrapolate: "clamp" }) },
                    ],
                }}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => showStatusMenu ? setShowStatusMenu(false) : onPress()}
                    onLongPress={task.status !== "to-do" ? () => setShowStatusMenu(true) : undefined}
                    delayLongPress={2000}
                    style={{
                        backgroundColor: bgColor,
                        borderRadius: theme.border.radius.main,
                        padding: 16,
                        paddingBottom: 20,
                        flexDirection: "column",
                        gap: 12,
                        overflow: "hidden",
                    }}
                >
                    {/* ── Description ───────────────────── */}
                    <Text style={{ fontFamily: theme.fonts[600], fontSize: 22, color: theme.background, lineHeight: 28 }} numberOfLines={2}>
                        {task.description}
                    </Text>

                    {/* ── Title ─────────────────────────── */}
                    <Text style={{ fontFamily: theme.fonts[400], fontSize: 16, color: theme.background + "94", lineHeight: 26 }} numberOfLines={1}>
                        {task.title.split("-")[1]?.trim() || task.title}
                    </Text>

                    {/* ── Bottom section: tags + priority ── */}
                    <View style={{ borderTopWidth: 1, borderColor: theme.background + "20", paddingTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        {/* Tags — max 2 visible, then "+N" overflow */}
                        <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap", flex: 1, alignItems: "center" }}>
                            {task.tag?.slice(0, 2).map((tagName: string, i: number) => (
                                <Text key={i} style={{ fontFamily: theme.fonts[500], fontSize: 13, color: theme.background + "80", textTransform: "capitalize" }}>
                                    #{tagName}
                                </Text>
                            ))}
                            {(task.tag?.length ?? 0) > 2 && (
                                <View style={{ backgroundColor: theme.white + "30", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
                                    <Text style={{ fontFamily: theme.fonts[600], fontSize: 11, color: theme.background + "90" }}>
                                        +{(task.tag?.length ?? 0) - 2}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                            {/* Timer Pill */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                    if (isActive && activeTaskId === task.id) {
                                        navigation.navigate("FocusScreen", { taskId: task.id, duration: Math.floor(timeLeft / 60) });
                                    } else {
                                        navigation.navigate("FocusSetupScreen", { taskId: task.id });
                                    }
                                }}
                                style={{ backgroundColor: isActive && activeTaskId === task.id ? theme.white : theme.background, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 44, flexDirection: "row", alignItems: "center", gap: 4 }}
                            >
                                <Play fill={isActive && activeTaskId === task.id ? theme.background : theme.white} color={isActive && activeTaskId === task.id ? theme.background : theme.white} size={10} />
                                <Text style={{ fontFamily: theme.fonts[700], fontSize: 11, color: isActive && activeTaskId === task.id ? theme.background : theme.white }}>
                                    {isActive && activeTaskId === task.id
                                        ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`
                                        : "Focus"}
                                </Text>
                            </TouchableOpacity>

                            {/* Priority pill */}
                            {priorityCfg && (
                                <View style={{ backgroundColor: theme.white, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 44, flexDirection: "row", alignItems: "center", gap: 5 }}>
                                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: priorityCfg.dot }} />
                                    <Text style={{ fontFamily: theme.fonts[500], fontSize: 12, color: theme.background }}>
                                        {priorityCfg.label.split(" ")[0]}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* ── Long-press status menu ────────── */}
                </TouchableOpacity>
            </Animated.View>
            {showStatusMenu && task.status !== "to-do" && (
                <View style={{ backgroundColor: theme.white + "10", justifyContent: "center", alignItems: "center", gap: 14, marginTop: -40, paddingTop: 40, paddingBottom: 12, borderBottomEndRadius: theme.border.radius.main, borderBottomStartRadius: theme.border.radius.main, borderWidth: 1, borderColor: theme.white + "10" }}>
                    <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 12 }}>
                        {/* ← Prev */}
                        {prevStatus ? (
                            <TouchableOpacity
                                style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 24 }}
                                onPress={handlePrevStatus}
                                activeOpacity={0.85}
                            >
                                <ArrowLeft size={14} color={theme.text} />
                                <Text style={{ fontFamily: theme.fonts[600], fontSize: 13, color: theme.white }}>
                                    {STATUS_LABELS[prevStatus]}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 24 }} />
                        )}

                        {/* Next → */}
                        <TouchableOpacity
                            style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: theme.white, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 24 }}
                            onPress={handleNextStatus}
                            activeOpacity={0.85}
                        >
                            <Text style={{ fontFamily: theme.fonts[600], fontSize: 13, color: theme.background }}>
                                {STATUS_LABELS[nextStatus]}
                            </Text>
                            {nextIsTomorrow && (
                                <Text style={{ fontFamily: theme.fonts[400], fontSize: 10, color: theme.background + "88" }}>
                                    Tomorrow
                                </Text>
                            )}
                            <ArrowRight size={14} color={theme.background} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View >
    );
}
