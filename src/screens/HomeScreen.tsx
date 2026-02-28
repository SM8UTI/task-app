import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "../data/color-theme";
import HeaderHeroScreen from "../layouts/homeScreen/Header";
import TodayRecentTasks from "../layouts/homeScreen/TodayRecentTasks";
import { useStreak } from "../hooks/useStreak";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { WidgetPreview } from "react-native-android-widget";
import { TaskWidgetAndroid } from "../widget/TaskWidget";

const TASKS_KEY = "@myapp_tasks_data";

export default function HomeScreen() {
    const [tasks, setTasks] = useState<any[]>([]);

    useFocusEffect(
        useCallback(() => {
            AsyncStorage.getItem(TASKS_KEY).then(raw => {
                if (!raw) return setTasks([]);
                const parsed = JSON.parse(raw).map((t: any) => ({
                    ...t,
                    dueDate: new Date(t.dueDate),
                    createdAt: new Date(t.createdAt),
                    updatedAt: new Date(t.updatedAt),
                }));
                // Sort by newest first
                parsed.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
                setTasks(parsed);
            });
        }, [])
    );

    const { currentStreak } = useStreak(tasks);

    // Get today's recent task or any active task
    const activeTasks = tasks.filter(t => !t.isCompleted);
    const today = new Date();
    const todayTasks = activeTasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return (
            taskDate.getDate() === today.getDate() &&
            taskDate.getMonth() === today.getMonth() &&
            taskDate.getFullYear() === today.getFullYear()
        );
    });

    // Pick the most relevant task
    const recentTask = todayTasks.length > 0 ? todayTasks[0] : (activeTasks.length > 0 ? activeTasks[0] : null);

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.background }}
            edges={["top", "left", "right"]}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                bounces={false}
                overScrollMode="never"
            >
                <HeaderHeroScreen streak={currentStreak} />
                <TodayRecentTasks />

            </ScrollView>
        </SafeAreaView>
    );
}