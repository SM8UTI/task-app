import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions, Animated, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { Info, Play, Pause, RotateCcw, SkipForward, ArrowLeft, Target } from "lucide-react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import ConfettiCannon from "react-native-confetti-cannon";
import theme from "../data/color-theme";
import { useTaskManager } from "../hooks/useTaskManager";
import { useTimer } from "../context/TimerContext";

const { width } = Dimensions.get("window");
const SIZE = width * 0.8;
const STROKE_WIDTH = 20;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Arc properties
const ARC_LENGTH = CIRCUMFERENCE * 0.75;
const GAP_LENGTH = CIRCUMFERENCE * 0.25;

export default function FocusScreen() {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<Record<string, { duration?: number, taskId?: number, taskColor?: string, taskTitle?: string }>, string>>();
    const { setTaskStatus } = useTaskManager();
    const { timeLeft, isActive, durationMins, stopTimer, resumeTimer, endTimer, resetTimer: contextResetTimer, activeTaskId } = useTimer();

    // The route params are just for display on this screen.
    // If the timer is active globally and matching the route params, we use the global values.
    // For simplicity, we assume FocusScreen displays the active timer if there is one, otherwise the setup values.
    const displayDurationMins = durationMins || route.params?.duration || 25;
    const TOTAL_SECONDS = displayDurationMins * 60;
    const taskId = activeTaskId || route.params?.taskId;
    const primaryColor = route.params?.taskColor || theme.primary[4];
    const taskTitle = route.params?.taskTitle || "Focus Time";

    const [showConfetti, setShowConfetti] = useState(false);

    // Animation value for progress
    const animatedProgress = useRef(new Animated.Value(TOTAL_SECONDS)).current;

    // Detect completion when timeLeft hits 0 naturally from an active state
    // We can do this by tracking previous time
    const prevTimeLeft = useRef(timeLeft);
    useEffect(() => {
        if (prevTimeLeft.current > 0 && timeLeft === 0 && !isActive) {
            handleCompletion();
        }
        prevTimeLeft.current = timeLeft;
    }, [timeLeft, isActive]);

    useEffect(() => {
        Animated.timing(animatedProgress, {
            toValue: timeLeft,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [timeLeft]);

    const handleCompletion = async () => {
        setShowConfetti(true);
        if (taskId != null) {
            await setTaskStatus(taskId, "completed");
        }
    };

    const toggleTimer = () => {
        if (isActive) stopTimer();
        else resumeTimer();
    };

    const resetTimer = () => {
        contextResetTimer();
        animatedProgress.setValue(TOTAL_SECONDS);
        setShowConfetti(false); // reset confetti just in case
    };

    const skipTimer = () => {
        endTimer();
        animatedProgress.setValue(0);
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
                <TouchableOpacity style={{ padding: 8, backgroundColor: theme.text + "10", borderRadius: 20 }}>
                    <Info color={theme.text} size={20} />
                </TouchableOpacity>
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
                            strokeDasharray={CIRCUMFERENCE}
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
                        {taskTitle} ({durationMins}m)
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
        </SafeAreaView>
    );
}
