import React, { useState, useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
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
} from "react-native";
import theme from "../../data/color-theme";
import { Calendar1, Plus, CircleArrowOutUpRight } from "lucide-react-native";
import TaskDetailsInfo from "../../components/TaskDetailsInfo";
import AddTaskBottomSheet, { NewTaskData } from "../../components/AddTaskBottomSheet";
import AnimatedIconButton from "../../components/AnimatedIconButton";
import TaskCard from "../../components/TaskCard";
import { routeNames } from "../../navigation/TabNavigator";


function TodayRecentTasks() {
    const navigation = useNavigation<any>();
    const [tasks, setTasks] = useState<any[]>([]);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [sheetVisible, setSheetVisible] = useState(false);
    const [isAddSheetVisible, setAddSheetVisible] = useState(false);

    const slideAnim = React.useRef(new Animated.Value(0)).current;

    const saveNewTask = async (data: NewTaskData) => {
        const newTask = {
            id: Date.now(),
            title: data.title,
            description: data.description,
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            priority: data.priority,
            category: "work",
            status: data.status,
            dueDate: data.dueDate,
            tag: data.tag
        };

        const updatedTasks = [newTask, ...tasks];
        // Sort by newest first
        updatedTasks.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
        setTasks(updatedTasks);
        setAddSheetVisible(false);

        try {
            await AsyncStorage.setItem("@myapp_tasks_data", JSON.stringify(updatedTasks));
        } catch (error) {
            console.error("Failed to save task", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadTasks();
        }, [])
    );

    const loadTasks = async () => {
        try {
            const storedTasks = await AsyncStorage.getItem("@myapp_tasks_data");
            if (storedTasks) {
                const parsed = JSON.parse(storedTasks);
                const formattedTasks = parsed.map((t: any) => ({
                    ...t,
                    dueDate: new Date(t.dueDate),
                    createdAt: new Date(t.createdAt),
                    updatedAt: new Date(t.updatedAt)
                }));
                formattedTasks.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
                setTasks(formattedTasks);
            } else {
                setTasks([]);
            }
        } catch (error) {
            console.error("Failed to load tasks", error);
            setTasks([]);
        }
    };

    const toggleTaskComplete = async (taskId: number) => {
        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, isCompleted: true, status: "completed" } : t);
        setTasks(updatedTasks);
        try {
            await AsyncStorage.setItem("@myapp_tasks_data", JSON.stringify(updatedTasks));
            if (selectedTask?.id === taskId) {
                closeTaskSheet();
            }
        } catch (error) { }
    };

    const deleteTask = async (taskId: number) => {
        const filteredTasks = tasks.filter(t => t.id !== taskId);
        setTasks(filteredTasks);
        try {
            await AsyncStorage.setItem("@myapp_tasks_data", JSON.stringify(filteredTasks));
            if (selectedTask?.id === taskId) {
                closeTaskSheet();
            }
        } catch (error) { }
    };

    const openTaskSheet = (task: any) => {
        setSelectedTask(task);
        setSheetVisible(true);
        Animated.spring(slideAnim, {
            toValue: 1,
            useNativeDriver: true,
            bounciness: 0,
            speed: 14,
        }).start();
    };

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

    // 2. Cycle colors
    const taskColors = [theme.primary[1], theme.primary[3], theme.primary[4]];

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
                    {["shopping", "renovation", "planning"].map((tag, index) => (
                        <Text key={index} style={{ fontFamily: theme.fonts[500], fontSize: 13, color: theme.background + "80", textTransform: "capitalize" }}>
                            #{tag}
                        </Text>
                    ))}
                </View>
            </View>

            {/* ── Task List ── */}
            <View style={{ flexDirection: "column", gap: 12, marginTop: 12 }}>
                {activeTasks.length === 0 ? (
                    <Text style={{ fontFamily: theme.fonts[500], fontSize: 16, color: theme.background + "60", textAlign: "center", marginTop: 20 }}>
                        No active tasks for today.
                    </Text>
                ) : (
                    activeTasks.map((task, index) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            bgColor={taskColors[index % taskColors.length]}
                            onPress={() => openTaskSheet(task)}
                            onAdvanceStatus={() => toggleTaskComplete(task.id)}
                            onDelete={() => deleteTask(task.id)}
                        />
                    ))
                )}
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
                    {/* Backdrop */}
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

                    {/* Sheet */}
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
                        {/* Drag handle */}
                        <View style={styles.handleBar} />

                        {selectedTask && (
                            <TaskDetailsInfo
                                task={selectedTask}
                                onClose={closeTaskSheet}
                                onAdvanceStatus={() => toggleTaskComplete(selectedTask.id)}
                                onDelete={() => deleteTask(selectedTask.id)}
                            />
                        )}

                        <View style={{ height: Platform.OS === "ios" ? 40 : 20 }} />
                    </Animated.View>
                </KeyboardAvoidingView>
            </Modal>

            {/* ── Add Task Bottom Sheet Modal ── */}
            <AddTaskBottomSheet
                visible={isAddSheetVisible}
                onClose={() => setAddSheetVisible(false)}
                onSave={saveNewTask}
            />
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