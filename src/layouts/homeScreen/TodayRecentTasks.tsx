import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
    Text,
    View,
    Modal,
    Animated,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    Pressable,
    PanResponder,
    Dimensions,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import theme from "../../data/color-theme";
import { Calendar1, Plus, CircleArrowOutUpRight } from "lucide-react-native";
import TaskDetailsInfo from "../../components/TaskDetailsInfo";
import AddTaskBottomSheet, { NewTaskData } from "../../components/AddTaskBottomSheet";
import AnimatedIconButton from "../../components/AnimatedIconButton";
import { routeNames } from "../../navigation/TabNavigator";
import { useTaskManager } from "../../hooks/useTaskManager";


function TodayRecentTasks() {
    const navigation = useNavigation<any>();
    const { tasks, saveNewTask, deleteTask, advanceTaskStatus } = useTaskManager();

    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [sheetVisible, setSheetVisible] = useState(false);
    const [isAddSheetVisible, setAddSheetVisible] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const slideAnim = React.useRef(new Animated.Value(0)).current;

    const handleSaveTask = async (data: NewTaskData) => {
        await saveNewTask(data);
        setAddSheetVisible(false);
    };

    const handleToggleComplete = async (taskId: number) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.status === "in-progress") {
            setShowConfetti(true);
        }
        await advanceTaskStatus(taskId);
        if (selectedTask?.id === taskId) {
            closeTaskSheet();
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        await deleteTask(taskId);
        if (selectedTask?.id === taskId) {
            closeTaskSheet();
        }
    };

    // openTaskSheet removed since it's unused

    const closeTaskSheet = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setSheetVisible(false);
            setTimeout(() => setSelectedTask(null), 300);
        });
    };

    const panResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    slideAnim.setValue(1 - gestureState.dy / 600);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 120 || gestureState.vy > 0.5) {
                    closeTaskSheet();
                } else {
                    Animated.spring(slideAnim, {
                        toValue: 1,
                        useNativeDriver: true,
                        bounciness: 0,
                    }).start();
                }
            },
        })
    ).current;

    // 1. Filter today's tasks
    const activeTasks = tasks.filter(t => !t.isCompleted);
    const today = new Date();
    const todayTasks = activeTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return (
            taskDate.getDate() === today.getDate() &&
            taskDate.getMonth() === today.getMonth() &&
            taskDate.getFullYear() === today.getFullYear()
        );
    });

    const displayMonth = today.toLocaleDateString("en-US", { month: "short" });
    const displayDate = today.getDate();

    const highPrioCount = todayTasks.filter(t => t.priority === "high").length;
    const mediumPrioCount = todayTasks.filter(t => t.priority === "medium").length;

    let dominantPriorityText = "Low";
    if (highPrioCount > 0) dominantPriorityText = "High";
    else if (mediumPrioCount > 0) dominantPriorityText = "Medium";

    // Top 3 tags by frequency across today's tasks
    const tagCounts: Record<string, number> = {};
    for (const task of todayTasks) {
        for (const tag of task.tag ?? []) {
            tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
        }
    }
    const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag]) => tag);

    return (
        <View style={{ paddingHorizontal: theme.padding.paddingMainX, marginTop: 12 }}>

            {/* ── Top Hero Card ── */}
            <View style={{
                backgroundColor: theme.primary[2],
                padding: 24,
                borderRadius: 40,
            }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Calendar1 stroke={theme.background} size={20} />
                        <Text style={{ fontFamily: theme.fonts[500], fontSize: 16, color: theme.background }}>
                            {displayDate} {displayMonth}
                        </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        <AnimatedIconButton
                            onPress={() => setAddSheetVisible(true)}
                            style={{
                                backgroundColor: theme.background, borderRadius: 120,
                                height: 48, width: 48, justifyContent: "center", alignItems: "center"
                            }}>
                            <Plus stroke={theme.text} size={24} />
                        </AnimatedIconButton>
                        <AnimatedIconButton
                            onPress={() => navigation.navigate(routeNames.tasks)}
                            style={{
                                backgroundColor: theme.white, borderRadius: 120,
                                height: 48, width: 48, justifyContent: "center", alignItems: "center"
                            }}
                        >
                            <CircleArrowOutUpRight stroke={theme.background} size={24} />
                        </AnimatedIconButton>
                    </View>
                </View>

                <View style={{ marginTop: 40 }}>
                    <Text style={{ fontFamily: theme.fonts[500], fontSize: 14, color: theme.background + "90", marginBottom: 4 }}>
                        Current tasks
                    </Text>
                    <Text style={{ fontFamily: theme.fonts[400], fontSize: 36, lineHeight: 44, color: theme.background }}>
                        You have{" "}
                        <Text style={{ fontFamily: theme.fonts[700] }}>
                            {String(todayTasks.length).padStart(2, "0")}
                        </Text>{"\n"}
                        tasks{" "}
                        <Text style={{ color: theme.background, fontFamily: theme.fonts[600], textTransform: "capitalize" }}>
                            {dominantPriorityText} ~
                        </Text>{"\n"}
                        for today
                    </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
                    {topTags.length > 0 ? (
                        topTags.map((tag, index) => (
                            <Text key={index} style={{ fontFamily: theme.fonts[500], fontSize: 13, color: theme.background + "80", textTransform: "capitalize" }}>
                                #{tag}
                            </Text>
                        ))
                    ) : (
                        <Text style={{ fontFamily: theme.fonts[500], fontSize: 13, color: theme.background + "50" }}>
                            No tags yet
                        </Text>
                    )}
                </View>
            </View>

            {/* ── Bottom Sheet Modal ── */}
            <Modal
                visible={sheetVisible}
                transparent
                animationType="none"
                statusBarTranslucent
                onRequestClose={closeTaskSheet}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.modalWrapper}
                >
                    <Animated.View style={[
                        styles.backdrop,
                        {
                            opacity: slideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1]
                            })
                        }
                    ]}>
                        <Pressable style={StyleSheet.absoluteFill} onPress={closeTaskSheet} />
                    </Animated.View>

                    <Animated.View
                        {...panResponder.panHandlers}
                        style={[
                            styles.sheet,
                            {
                                transform: [{
                                    translateY: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [600, 0]
                                    })
                                }]
                            }
                        ]}
                    >
                        <View style={styles.handleBar} />

                        {selectedTask && (
                            <TaskDetailsInfo
                                task={selectedTask}
                                onClose={closeTaskSheet}
                                onAdvanceStatus={() => handleToggleComplete(selectedTask.id)}
                                onDelete={() => handleDeleteTask(selectedTask.id)}
                            />
                        )}

                        <View style={{ height: Platform.OS === "ios" ? 40 : 20 }} />
                    </Animated.View>
                </KeyboardAvoidingView>
            </Modal>

            <AddTaskBottomSheet
                visible={isAddSheetVisible}
                onClose={() => setAddSheetVisible(false)}
                onSave={handleSaveTask}
            />

            {showConfetti && (
                <View style={[StyleSheet.absoluteFillObject, { pointerEvents: "none", zIndex: 9999 }]}>
                    <ConfettiCannon
                        count={200}
                        origin={{ x: Dimensions.get("window").width / 2, y: -20 }}
                        fallSpeed={2500}
                        fadeOut={true}
                        autoStart={true}
                        onAnimationEnd={() => setShowConfetti(false)}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    modalWrapper: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    sheet: {
        backgroundColor: theme.white,
        borderRadius: 36,
        margin: 16,
        marginBottom: 32,
        overflow: "hidden",
    },
    handleBar: {
        width: 56,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.background + "20",
        alignSelf: "center",
        marginTop: 14,
        marginBottom: 4,
    },
});

export default React.memo(TodayRecentTasks);