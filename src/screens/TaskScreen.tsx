import React, { useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfettiCannon from "react-native-confetti-cannon";
import theme from "../data/color-theme";
import { useTaskManager } from "../hooks/useTaskManager";
import { useTaskSheet } from "../hooks/useTaskSheet";
import HeaderTaskScreen from "../layouts/TasksScreen/Header";
import TaskListContent from "../layouts/TasksScreen/TaskListContent";
import TaskDetailsSheet from "../layouts/TasksScreen/TaskDetailsSheet";
import AddTaskBottomSheet from "../components/AddTaskBottomSheet";

export default function TaskScreen() {
    const [isAddSheetVisible, setAddSheetVisible] = useState(false);
    const [currentTab, setCurrentTab] = useState("to-do");
    const [showConfetti, setShowConfetti] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Task data & CRUD
    const {
        tasks,
        todoCount,
        inProgressCount,
        completedCount,
        saveNewTask,
        deleteTask,
        toggleTaskComplete,
        advanceTaskStatus,
        setTaskStatus,
    } = useTaskManager();

    // Bottom sheet animation & selection
    const {
        selectedTask,
        sheetVisible,
        slideAnim,
        panResponder,
        openTaskSheet,
        closeTaskSheet,
    } = useTaskSheet();

    // ── Apply search filter ──
    const safeQuery = searchQuery.trim().toLowerCase();
    const filteredTasks = tasks.filter(t =>
        t.title.toLowerCase().includes(safeQuery) ||
        t.description.toLowerCase().includes(safeQuery)
    );

    const filteredTodoCount = filteredTasks.filter(t => t.status === "to-do").length;
    const filteredInProgressCount = filteredTasks.filter(t => t.status === "in-progress").length;
    const filteredCompletedCount = filteredTasks.filter(t => t.status === "completed").length;

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.background }}
            edges={["top", "left", "right"]}
        >
            <HeaderTaskScreen
                onAddTaskPress={() => setAddSheetVisible(true)}
                currentTab={currentTab}
                onTabChange={setCurrentTab}
                todoCount={filteredTodoCount}
                inProgressCount={filteredInProgressCount}
                completedCount={filteredCompletedCount}
                totalCount={filteredTasks.length}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <TaskListContent
                currentTab={currentTab}
                tasks={filteredTasks}
                onOpenTask={openTaskSheet}
                onAdvanceStatus={(id) => advanceTaskStatus(id, (tid, nextStatus) => {
                    if (nextStatus === "completed") setShowConfetti(true);
                })}
                onSetStatus={(id, status, dueDate) => setTaskStatus(id, status as any, dueDate, () => {
                    if (status === "completed") setShowConfetti(true);
                })}
                onDelete={(id) =>
                    deleteTask(id, (tid) => {
                        if (selectedTask?.id === tid) closeTaskSheet();
                    })
                }
            />

            {/* Add Task Bottom Sheet */}
            <AddTaskBottomSheet
                visible={isAddSheetVisible}
                onClose={() => setAddSheetVisible(false)}
                onSave={(data) =>
                    saveNewTask(data, () => setAddSheetVisible(false))
                }
            />

            {/* Task Details Bottom Sheet */}
            <TaskDetailsSheet
                visible={sheetVisible}
                selectedTask={selectedTask}
                slideAnim={slideAnim}
                panHandlers={panResponder.panHandlers}
                onClose={closeTaskSheet}
                onAdvanceStatus={() => {
                    if (selectedTask) {
                        advanceTaskStatus(selectedTask.id, (tid, nextStatus) => {
                            if (nextStatus === "completed") setShowConfetti(true);
                        });
                        closeTaskSheet();
                    }
                }}
                onDelete={() =>
                    selectedTask && deleteTask(selectedTask.id, () => closeTaskSheet())
                }
            />

            {/* ── Confetti Celebration ── */}
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
        </SafeAreaView>
    );
}