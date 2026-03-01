```tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import theme from "../../data/color-theme";
import { Play, Pause } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useTimer } from "../../context/TimerContext";
import { useTaskManager } from "../../hooks/useTaskManager";

export default function StartTimerList() {
    const navigation = useNavigation<any>();
    const { timeLeft, isActive, activeTaskId, durationMins } = useTimer();
    const { tasks } = useTaskManager();

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const totalSeconds = durationMins * 60;
    const hasActiveSession = isActive || (timeLeft > 0 && timeLeft < totalSeconds);
    const progress = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;

    const activeTask = activeTaskId ? tasks.find((t: any) => t.id === activeTaskId) : null;
    const taskTitle = activeTask ? activeTask.title : "Focus Session";

    // Stylize the active vs inactive timer blocks
    const isActiveTimer = hasActiveSession;
    const cardBgColor = isActiveTimer ? theme.white : theme.text + "08";
    const borderColor = isActiveTimer ? theme.white : theme.text + "15";
    const titleColor = isActiveTimer ? theme.background : theme.text;
    const subtitleColor = isActiveTimer ? theme.background + "90" : theme.text + "60";
    const iconContainerBg = isActiveTimer ? theme.background : theme.text + "15";
    const iconColor = isActiveTimer ? theme.white : theme.text;

    return (
        <View style={{ paddingHorizontal: theme.padding.paddingMainX, marginTop: 12, marginBottom: 24 }}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                    if (hasActiveSession) {
                        navigation.navigate("FocusScreen", {
                            duration: durationMins,
                            taskId: activeTaskId,
                            taskTitle
                        });
                    } else {
                        navigation.navigate("FocusSetupScreen");
                    }
                }}
                style={{
                    backgroundColor: cardBgColor,
                    borderWidth: 1,
                    borderColor: borderColor,
                    borderRadius: theme.border.radius.main,
                    padding: 20,
                    paddingHorizontal: 24,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    overflow: "hidden"
                }}>
                
                {isActiveTimer && (
                    <View style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        backgroundColor: theme.background + "15",
                    }}>
                        <View style={{
                            height: "100%",
                            width: `${progress *
