import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Animated, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Play, Timer } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import theme from "../data/color-theme";
import { useTaskManager } from "../hooks/useTaskManager";
import { useTimer } from "../context/TimerContext";
import { PRIORITY_CONFIG } from "../components/TaskCard";

const getCategory = (dueDate: string | Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const d = new Date(dueDate);
    const taskDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < -1) return "Overdue";
    return "Upcoming";
};

export default function FocusSetupScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { tasks, setTaskStatus } = useTaskManager();
    const { startTimer } = useTimer();

    const [duration, setDuration] = useState("25");
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(route.params?.taskId ?? null);
    const [isCustom, setIsCustom] = useState(false);

    const activeTasks = tasks.filter((t: any) => !t.isCompleted);
    const taskColors = [theme.primary[1], theme.primary[3], theme.primary[4]];

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (route.params?.taskId !== undefined) {
            setSelectedTaskId(route.params.taskId);
        }
    }, [route.params?.taskId]);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const startFocus = async () => {
        const mins = parseInt(duration) || 25;
        let taskColor = null;
        let taskTitle = null;

        if (selectedTaskId) {
            const taskIndex = activeTasks.findIndex((t: any) => t.id === selectedTaskId);
            if (taskIndex !== -1) {
                taskColor = taskColors[taskIndex % taskColors.length];
                taskTitle = activeTasks[taskIndex].title;
            }
            await setTaskStatus(selectedTaskId, "in-progress");
        }

        startTimer(selectedTaskId, mins);
        navigation.replace("FocusScreen", { duration: mins, taskId: selectedTaskId, taskColor, taskTitle });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["top", "bottom"]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color={theme.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Focus Setup</Text>
                <View style={{ width: 48 }} />
            </View>

            <Animated.ScrollView
                contentContainerStyle={styles.scrollContent}
                style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}
                showsVerticalScrollIndicator={false}
            >
                {/* Duration Display */}
                <View style={styles.durationDisplay}>
                    <Timer color={theme.primary[4]} size={48} style={{ marginBottom: 16 }} />
                    <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "center" }}>
                        {isCustom ? (
                            <TextInput
                                value={duration}
                                onChangeText={setDuration}
                                keyboardType="number-pad"
                                style={styles.customInput}
                                autoFocus
                                onBlur={() => setIsCustom(false)}
                                maxLength={3}
                                selectionColor={theme.primary[4]}
                            />
                        ) : (
                            <TouchableOpacity activeOpacity={0.8} onPress={() => setIsCustom(true)}>
                                <Text style={styles.durationBigText}>{duration}</Text>
                            </TouchableOpacity>
                        )}
                        <Text style={styles.durationUnitText}>min</Text>
                    </View>
                </View>

                {/* Quick Select */}
                <View style={styles.quickSelectRow}>
                    {[15, 25, 45, "Custom"].map(val => {
                        const isSelected = !isCustom && duration === val.toString();
                        const isCustomBtn = val === "Custom";

                        return (
                            <TouchableOpacity
                                key={val}
                                activeOpacity={0.8}
                                onPress={() => {
                                    if (isCustomBtn) {
                                        setIsCustom(true);
                                    } else {
                                        setIsCustom(false);
                                        setDuration(val.toString());
                                    }
                                }}
                                style={[
                                    styles.quickSelectBtn,
                                    (isSelected || (isCustom && isCustomBtn)) && styles.quickSelectBtnActive
                                ]}
                            >
                                <Text style={[
                                    styles.quickSelectText,
                                    (isSelected || (isCustom && isCustomBtn)) && styles.quickSelectTextActive
                                ]}>
                                    {val}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Task Selection */}
                <View style={styles.taskSection}>
                    <View style={styles.taskHeader}>
                        <Text style={styles.sectionTitle}>Link a Task</Text>
                        <Text style={styles.optionalText}>(Optional)</Text>
                    </View>

                    {activeTasks.length === 0 ? (
                        <View style={styles.emptyTaskState}>
                            <Text style={styles.emptyTaskText}>No active tasks available to focus on.</Text>
                        </View>
                    ) : (
                        ["Today", "Tomorrow", "Upcoming", "Yesterday", "Overdue"].map((category) => {
                            const categoryTasks = activeTasks.filter((t: any) => getCategory(t.dueDate) === category);
                            if (categoryTasks.length === 0) return null;

                            return (
                                <View key={category} style={{ marginBottom: 16 }}>
                                    {category !== "Today" && (
                                        <Text style={styles.categoryTitle}>{category}</Text>
                                    )}
                                    {categoryTasks.map((task: any, index: number) => {
                                        const isSelected = selectedTaskId === task.id;
                                        const bgColor = taskColors[index % taskColors.length];

                                        return (
                                            <TouchableOpacity
                                                key={task.id}
                                                activeOpacity={0.9}
                                                onPress={() => setSelectedTaskId(isSelected ? null : task.id)}
                                                style={{
                                                    backgroundColor: isSelected ? bgColor : theme.text + "08",
                                                    borderRadius: theme.border.radius.main,
                                                    padding: 16,
                                                    paddingBottom: 20,
                                                    flexDirection: "column",
                                                    gap: 12,
                                                    overflow: "hidden",
                                                    marginBottom: 12,
                                                    borderWidth: 1,
                                                    borderColor: isSelected ? bgColor : "transparent",
                                                }}
                                            >
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                    <View style={{ flex: 1, paddingRight: 16 }}>
                                                        <Text style={{ fontFamily: theme.fonts[600], fontSize: 22, color: isSelected ? theme.background : theme.text, lineHeight: 28 }} numberOfLines={2}>
                                                            {task.description || task.title}
                                                        </Text>
                                                        {task.description ? (
                                                            <Text style={{ fontFamily: theme.fonts[400], fontSize: 16, color: isSelected ? theme.background + "94" : theme.text + "80", lineHeight: 26, marginTop: 4 }} numberOfLines={1}>
                                                                {task.title.split("-")[1]?.trim() || task.title}
                                                            </Text>
                                                        ) : null}
                                                    </View>

                                                    <View style={[
                                                        styles.radioOuter,
                                                        isSelected ? { borderColor: theme.background, backgroundColor: "transparent" } : { borderColor: theme.text + "30" }
                                                    ]}>
                                                        {isSelected && <View style={[styles.radioInner, { backgroundColor: theme.background }]} />}
                                                    </View>
                                                </View>

                                                <View style={{ borderTopWidth: 1, borderColor: isSelected ? theme.background + "20" : theme.text + "10", paddingTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                                    <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap", flex: 1, alignItems: "center" }}>
                                                        {task.tag?.slice(0, 2).map((tagName: string, i: number) => (
                                                            <Text key={i} style={{ fontFamily: theme.fonts[500], fontSize: 13, color: isSelected ? theme.background + "80" : theme.text + "70", textTransform: "capitalize" }}>
                                                                #{tagName}
                                                            </Text>
                                                        ))}
                                                        {(task.tag?.length ?? 0) > 2 && (
                                                            <View style={{ backgroundColor: isSelected ? theme.white + "30" : theme.text + "15", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
                                                                <Text style={{ fontFamily: theme.fonts[600], fontSize: 11, color: isSelected ? theme.background + "90" : theme.text + "90" }}>
                                                                    +{(task.tag?.length ?? 0) - 2}
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>

                                                    {PRIORITY_CONFIG[task.priority] && (
                                                        <View style={{ backgroundColor: isSelected ? theme.white : theme.text + "15", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 5 }}>
                                                            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: PRIORITY_CONFIG[task.priority].dot }} />
                                                            <Text style={{ fontFamily: theme.fonts[500], fontSize: 12, color: isSelected ? theme.background : theme.text }}>
                                                                {PRIORITY_CONFIG[task.priority].label.split(" ")[0]}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            );
                        })
                    )}
                </View>
            </Animated.ScrollView>

            <View style={styles.bottomBar}>
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={startFocus}
                    style={styles.startButton}
                >
                    <Text style={styles.startButtonText}>Begin Session</Text>
                    <View style={styles.startButtonIcon}>
                        <Play fill={theme.background} color={theme.background} size={18} style={{ marginLeft: 2 }} />
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.text + "08",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        color: theme.text,
        fontFamily: theme.fonts[600],
        fontSize: 18,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 140,
    },
    durationDisplay: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 40,
    },
    durationBigText: {
        color: theme.text,
        fontFamily: theme.fonts[700],
        fontSize: 84,
        lineHeight: 100,
        letterSpacing: -2,
    },
    customInput: {
        color: theme.text,
        fontFamily: theme.fonts[700],
        fontSize: 84,
        height: 100,
        minWidth: 120,
        textAlign: "center",
    },
    durationUnitText: {
        color: theme.text + "60",
        fontFamily: theme.fonts[500],
        fontSize: 24,
        marginLeft: 8,
        marginBottom: 20,
    },
    quickSelectRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 48,
    },
    quickSelectBtn: {
        flex: 1,
        height: 52,
        borderRadius: 26,
        backgroundColor: theme.text + "08",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "transparent",
    },
    quickSelectBtnActive: {
        backgroundColor: theme.white,
        borderColor: theme.white,
    },
    quickSelectText: {
        color: theme.text + "80",
        fontFamily: theme.fonts[600],
        fontSize: 15,
    },
    quickSelectTextActive: {
        color: theme.background,
    },
    taskSection: {
        marginTop: 10,
    },
    taskHeader: {
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: 20,
        gap: 8,
    },
    sectionTitle: {
        color: theme.text,
        fontFamily: theme.fonts[600],
        fontSize: 20,
    },
    optionalText: {
        color: theme.text + "50",
        fontFamily: theme.fonts[400],
        fontSize: 14,
    },
    categoryTitle: {
        color: theme.text + "80",
        fontFamily: theme.fonts[600],
        fontSize: 14,
        marginBottom: 12,
        marginLeft: 4,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    emptyTaskState: {
        padding: 24,
        backgroundColor: theme.text + "05",
        borderRadius: 24,
        alignItems: "center",
    },
    emptyTaskText: {
        color: theme.text + "50",
        fontFamily: theme.fonts[500],
        fontSize: 15,
        textAlign: "center",
    },
    taskCard: {
        backgroundColor: theme.text + "05",
        borderWidth: 1.5,
        borderColor: "transparent",
        borderRadius: 24,
        padding: 20,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    taskCardLeft: {
        flex: 1,
        paddingRight: 16,
    },
    taskTitle: {
        color: theme.text,
        fontFamily: theme.fonts[600],
        fontSize: 17,
        marginBottom: 8,
        lineHeight: 24,
    },
    taskMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    priorityPill: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: theme.background,
        borderRadius: 12,
    },
    priorityText: {
        color: theme.text,
        fontSize: 11,
        fontFamily: theme.fonts[600],
        textTransform: "capitalize",
    },
    tagText: {
        color: theme.text + "70",
        fontSize: 13,
        fontFamily: theme.fonts[500],
        textTransform: "capitalize",
    },
    radioOuter: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: theme.text + "30",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.background,
    },
    radioInner: {
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    bottomBar: {
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === "ios" ? 16 : 32,
        paddingTop: 16,
        backgroundColor: theme.background,
        position: "absolute",
        bottom: 0,
        width: "100%",
        borderTopWidth: 1,
        borderColor: theme.text + "08",
    },
    startButton: {
        backgroundColor: theme.text,
        height: 64,
        borderRadius: 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    startButtonText: {
        color: theme.background,
        fontFamily: theme.fonts[600],
        fontSize: 18,
    },
    startButtonIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.text + "20",
        alignItems: "center",
        justifyContent: "center",
    }
});
