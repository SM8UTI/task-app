import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
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

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.background }}
            edges={["top", "left", "right"]}
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

            <TaskListContent
                currentTab={currentTab}
                tasks={tasks}
                onOpenTask={openTaskSheet}
                onAdvanceStatus={(id) => advanceTaskStatus(id)}
                onSetStatus={(id, status, dueDate) => setTaskStatus(id, status as any, dueDate)}
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
                        advanceTaskStatus(selectedTask.id);
                        closeTaskSheet();
                    }
                }}
                onDelete={() =>
                    selectedTask && deleteTask(selectedTask.id, () => closeTaskSheet())
                }
            />
        </SafeAreaView>
    );
}