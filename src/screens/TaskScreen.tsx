import React, { useCallback, useState, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ScrollView, Text, View, Animated, Modal, KeyboardAvoidingView, StyleSheet, PanResponder, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from "../data/color-theme";
import HeaderTaskScreen from "../layouts/TasksScreen/Header";
import TaskCard from "../components/TaskCard";
import AddTaskBottomSheet, { NewTaskData } from "../components/AddTaskBottomSheet";
import TaskDetailsInfo from "../components/TaskDetailsInfo";

const TASKS_STORAGE_KEY = "@myapp_tasks_data";

export default function TaskScreen() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [isAddSheetVisible, setAddSheetVisible] = useState(false);

    // Bottom Sheet State
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [sheetVisible, setSheetVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Tabs State
    const [currentTab, setCurrentTab] = useState("to-do");

    // Initial Load & Screen Focus Update
    useFocusEffect(
        useCallback(() => {
            loadTasks();
        }, [])
    );

    const loadTasks = async () => {
        try {
            const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
            if (storedTasks) {
                const parsed = JSON.parse(storedTasks);
                // Fix Date objects after JSON parse
                const formattedTasks = parsed.map((t: any) => ({
                    ...t,
                    dueDate: new Date(t.dueDate),
                    createdAt: new Date(t.createdAt),
                    updatedAt: new Date(t.updatedAt)
                }));
                // Sort by newest first
                formattedTasks.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
                setTasks(formattedTasks);
            } else {
                setTasks([]); // Start fresh if local storage is empty
            }
        } catch (error) {
            console.error("Failed to load tasks", error);
            setTasks([]);
        }
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

    const panResponder = useRef(
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

    const saveNewTask = async (data: NewTaskData) => {
        const newTask = {
            id: Date.now(),
            title: data.title,
            description: data.description,
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            priority: data.priority,
            category: "work", // Can add to form later
            status: data.status,
            dueDate: data.dueDate,
            tag: data.tag
        };

        const updatedTasks = [newTask, ...tasks];
        setTasks(updatedTasks);
        setAddSheetVisible(false);

        try {
            await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
        } catch (error) {
            console.error("Failed to save task", error);
        }
    };

    const deleteTask = async (taskId: number) => {
        const filteredTasks = tasks.filter(t => t.id !== taskId);
        setTasks(filteredTasks);
        try {
            await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(filteredTasks));
            if (selectedTask?.id === taskId) {
                closeTaskSheet();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const toggleTaskComplete = async (taskId: number) => {
        const updatedTasks = tasks.map(t => {
            if (t.id === taskId) {
                return { ...t, isCompleted: true, status: "completed" };
            }
            return t;
        });
        setTasks(updatedTasks);
        try {
            await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
            if (selectedTask?.id === taskId) {
                closeTaskSheet();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const taskColors = [theme.primary[1], theme.primary[3], theme.primary[4]];

    // Categorize Tasks
    const todoCount = tasks.filter(t => t.status === "to-do").length;
    const inProgressCount = tasks.filter(t => t.status === "in-progress").length;
    const completedCount = tasks.filter(t => t.status === "completed").length;

    const filteredTasks = tasks.filter(t => t.status === currentTab);

    return (
        <SafeAreaView style={{
            backgroundColor: theme.background
        }}
            edges={[
                "top", "left", "right"
            ]}>
            <ScrollView showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode="never"
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: 40
                }}
            >
                <HeaderTaskScreen
                    onAddTaskPress={() => setAddSheetVisible(true)}
                    currentTab={currentTab}
                    onTabChange={setCurrentTab}
                    todoCount={todoCount}
                    inProgressCount={inProgressCount}
                    completedCount={completedCount}
                    totalCount={tasks.length}
                />

                {/* Render the Task List */}
                <View style={{ paddingHorizontal: theme.padding.paddingMainX, marginTop: 20, flexDirection: 'column', gap: 16 }}>
                    {filteredTasks.length === 0 ? (
                        <Text style={{ fontFamily: theme.fonts[500], fontSize: 16, color: theme.text + "80", textAlign: "center", marginTop: 40 }}>
                            No {currentTab.replace("-", " ")} tasks.
                        </Text>
                    ) : (
                        filteredTasks.map((task, index) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                bgColor={taskColors[index % taskColors.length]}
                                onPress={() => openTaskSheet(task)}
                                onComplete={() => toggleTaskComplete(task.id)}
                                onDelete={() => deleteTask(task.id)}
                            />
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Existing Add Task Bottom Sheet */}

            <AddTaskBottomSheet
                visible={isAddSheetVisible}
                onClose={() => setAddSheetVisible(false)}
                onSave={saveNewTask}
            />

            {/* Task Details Bottom Sheet Modal */}
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
                                onComplete={() => toggleTaskComplete(selectedTask.id)}
                                onDelete={() => deleteTask(selectedTask.id)}
                            />
                        )}

                        <View style={{ height: Platform.OS === "ios" ? 40 : 20 }} />
                    </Animated.View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
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