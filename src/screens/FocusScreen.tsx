import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions, Animated, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { Info, Play, Pause, RotateCcw, SkipForward, ArrowLeft, Target, CheckCircle2, PartyPopper } from "lucide-react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import ConfettiCannon from "react-native-confetti-cannon";
import theme from "../data/color-theme";
import { useTaskManager } from "../hooks/useTaskManager";
import { useTimer } from "../context/TimerContext";
import { routeNames } from "../navigation/TabNavigator";
import {
    showFocusCompleteNotification,
    showActiveFocusNotification,
    cancelActiveFocusNotification,
    scheduleFocusCompletionNotification,
    cancelScheduledFocusCompletion,
} from "../services/NotificationService";

const { width } = Dimensions.get("window");
const SIZE = width * 0.8;
const STROKE_WIDTH = 20;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Arc properties
const ARC_LENGTH = CIRCUMFERENCE * 0.75;
const GAP_LENGTH = CIRCUMFERENCE * 0.25;

export default function FocusScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<Record<string, { duration?: number, taskId?: number, taskColor?: string, taskTitle?: string }>, string>>();
    const { setTaskStatus } = useTaskManager();
    const { timeLeft, isActive, durationMins, stopTimer, resumeTimer, endTimer, resetTimer: contextResetTimer, activeTaskId } = useTimer();

    // The route params are just for display on this screen.
    // If the timer is active globally and matching the route params, we use the global values.
    // For simplicity, we assume FocusScreen displays the active timer if there is one, otherwise the setup values.
    const displayDurationMins = durationMins || route.params?.duration || 25;
    const TOTAL_SECONDS = Math.max(displayDurationMins * 60, 1);
    const taskId = activeTaskId || route.params?.taskId;
    const primaryColor = route.params?.taskColor || theme.primary[4];
    const taskTitle = route.params?.taskTitle || "Focus Time";

    const [showConfetti, setShowConfetti] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Animation value for progress arc
    const animatedProgress = useRef(new Animated.Value(timeLeft)).current;

    // ── On mount: show the active-session badge + schedule background completion ─
    useEffect(() => {
        if (isActive) {
            // 1. Persistent badge so user knows a session is running
            showActiveFocusNotification(taskTitle, false);
            // 2. Alarm-manager trigger fires at endTime even if the app is killed
            const endTimestamp = Date.now() + timeLeft * 1000;
            scheduleFocusCompletionNotification(taskTitle, endTimestamp);
        } else {
            // Screen opened while paused (e.g. navigated back) — show paused state
            showActiveFocusNotification(taskTitle, true);
        }

        // Clean up badge when user leaves the screen without finishing
        return () => {
            cancelActiveFocusNotification();
            // NOTE: we intentionally leave the scheduled trigger alive here.
            // If the user leaves mid-session, the alarm will still fire at endTime.
            // It gets cancelled explicitly only on reset/skip/completion.
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Pause: cancel scheduled trigger (timer is frozen), update badge ─────────
    // ── Resume: re-schedule trigger at new endTime, update badge ────────────────
    useEffect(() => {
        if (timeLeft <= 0) return;
        if (isActive) {
            // Timer resumed — reschedule the trigger from the current timeLeft
            const endTimestamp = Date.now() + timeLeft * 1000;
            scheduleFocusCompletionNotification(taskTitle, endTimestamp);
            showActiveFocusNotification(taskTitle, false);
        } else {
            // Timer paused — cancel the trigger so it doesn't fire while frozen
            cancelScheduledFocusCompletion();
            showActiveFocusNotification(taskTitle, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive]);

    // Detect completion when timeLeft hits 0 naturally from an active state
    const prevTimeLeft = useRef(timeLeft);
    useEffect(() => {
        if (prevTimeLeft.current > 0 && timeLeft === 0 && !isActive) {
            handleCompletion();
        }
        prevTimeLeft.current = timeLeft;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, isActive]);

    useEffect(() => {
        Animated.timing(animatedProgress, {
            toValue: timeLeft,
            duration: 1000,
            useNativeDriver: false,
        }).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    const handleCompletion = async () => {
        setShowConfetti(true);
        setShowSuccessModal(true);
        if (taskId != null) {
            await setTaskStatus(taskId, "completed");
        }
        // Cancel the badge and the AlarmManager trigger (session is done in-app).
        // Then show the instant celebratory notification.
        await cancelActiveFocusNotification();
        await cancelScheduledFocusCompletion();
        await showFocusCompleteNotification(taskTitle);
    };

    const handleKeepItUp = () => {
        navigation.replace(routeNames.home);
    };

    const toggleTimer = () => {
        if (isActive) stopTimer();
        else resumeTimer();
    };

    const resetTimer = () => {
        contextResetTimer();
        animatedProgress.setValue(TOTAL_SECONDS);
        setShowConfetti(false);
        // Cancel both the badge and the scheduled alarm
        cancelActiveFocusNotification();
        cancelScheduledFocusCompletion();
    };

    const skipTimer = () => {
        endTimer();
        animatedProgress.setValue(0);
        // handleCompletion cancels both badge + trigger and shows the finish notification
        handleCompletion();
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}.${s.toString().padStart(2, "0")}`;
    };

    const AnimatedCircle = Animated.createAnimatedComponent(Circle);

    const dashOffset = animatedProgress.interpolate({
        inputRange: [0, TOTAL_SECONDS],
        outputRange: [ARC_LENGTH, 0]
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["top", "bottom"]}>
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
                    <ArrowLeft color={theme.text} size={24} />
                </TouchableOpacity>
                <Text style={{ color: theme.text, fontFamily: theme.fonts[600], fontSize: 20 }}>
                    Focus Timer
                </Text>
            </View>

            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                {/* Timer Circle */}
                <View style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}>
                    <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: "135deg" }] }}>
                        {/* Background Arc */}
                        <Circle
                            cx={SIZE / 2}
                            cy={SIZE / 2}
                            r={RADIUS}
                            stroke={theme.text + "15"}
                            strokeWidth={STROKE_WIDTH}
                            fill="none"
                            strokeDasharray={`${ARC_LENGTH} ${GAP_LENGTH}`}
                            strokeLinecap="round"
                        />
                        {/* Foreground Arc */}
                        <AnimatedCircle
                            cx={SIZE / 2}
                            cy={SIZE / 2}
                            r={RADIUS}
                            stroke={primaryColor}
                            strokeWidth={STROKE_WIDTH}
                            fill="none"
                            strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                        />
                    </Svg>

                    {/* Time Text Absolute Centered */}
                    <View style={{ position: "absolute", alignItems: "center" }}>
                        <Text style={{
                            color: theme.text,
                            fontFamily: theme.fonts[700],
                            fontSize: 64,
                            lineHeight: 74,
                            marginBottom: 8
                        }}>
                            {formatTime(timeLeft)}
                        </Text>
                        <Text style={{ color: theme.text + "80", fontFamily: theme.fonts[500], fontSize: 18 }}>
                            {isActive ? "Running" : (timeLeft === 0 ? "Finished" : "Paused")}
                        </Text>
                    </View>
                </View>

                {/* Info Pill */}
                <View style={{
                    backgroundColor: theme.text + "10",
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 30,
                    marginTop: 40,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8
                }}>
                    {taskId && <Target color={primaryColor} size={18} />}
                    <Text style={{ color: theme.text, fontFamily: theme.fonts[500], fontSize: 16 }}>
                        {taskTitle} ({displayDurationMins}m)
                    </Text>
                </View>
            </View>

            {/* Controls */}
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingBottom: 40,
                gap: 24
            }}>
                <TouchableOpacity
                    onPress={resetTimer}
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: theme.text + "10",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <RotateCcw color={theme.text} size={24} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={toggleTimer}
                    activeOpacity={0.8}
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: isActive ? primaryColor : theme.text,
                        alignItems: "center",
                        justifyContent: "center",
                        shadowColor: isActive ? primaryColor : theme.text,
                        shadowOpacity: 0.3,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 5
                    }}
                >
                    {isActive ? (
                        <Pause fill={theme.background} color={theme.background} size={32} />
                    ) : (
                        <Play fill={theme.background} color={theme.background} size={32} style={{ marginLeft: 4 }} />
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={skipTimer}
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: theme.text + "10",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <SkipForward color={theme.text} size={24} />
                </TouchableOpacity>
            </View>

            {/* Confetti overlay */}
            {showConfetti && (
                <View style={[StyleSheet.absoluteFillObject, { pointerEvents: "none", zIndex: 9999 }]}>
                    <ConfettiCannon
                        count={200}
                        origin={{ x: width / 2, y: -20 }}
                        fallSpeed={2500}
                        fadeOut={true}
                        autoStart={true}
                        onAnimationEnd={() => setShowConfetti(false)}
                    />
                </View>
            )}

            {/* Success Overlay — plain View avoids Modal lifecycle conflicts with navigation */}
            {showSuccessModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={[styles.iconContainer, { backgroundColor: primaryColor + "20" }]}>
                            <CheckCircle2 color={primaryColor} size={48} />
                        </View>

                        <Text style={styles.modalTitle}>Session Complete!</Text>
                        <Text style={styles.modalSubtitle}>
                            Great work! You've stayed focused and reached your goal.
                        </Text>

                        <Pressable
                            style={[styles.modalButton, { backgroundColor: primaryColor }]}
                            onPress={handleKeepItUp}
                        >
                            <PartyPopper color={theme.background} size={20} />
                            <Text style={styles.buttonText}>Keep it up</Text>
                        </Pressable>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.85)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        zIndex: 9998,
    },
    modalContent: {
        backgroundColor: theme.background,
        borderRadius: 32,
        padding: 32,
        width: "100%",
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.text + "10",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24
    },
    modalTitle: {
        fontSize: 28,
        fontFamily: theme.fonts[700],
        color: theme.text,
        marginBottom: 12,
        textAlign: "center"
    },
    modalSubtitle: {
        fontSize: 16,
        fontFamily: theme.fonts[400],
        color: theme.text + "80",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
        paddingHorizontal: 12
    },
    modalButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 20,
        gap: 10,
        width: "100%"
    },
    buttonText: {
        color: theme.background,
        fontSize: 18,
        fontFamily: theme.fonts[600]
    }
});
