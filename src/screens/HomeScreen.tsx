import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "../data/color-theme";
import HeaderHeroScreen from "../layouts/homeScreen/Header";
import TodayRecentTasks from "../layouts/homeScreen/TodayRecentTasks";
import { useStreak } from "../hooks/useStreak";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

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
                setTasks(parsed);
            });
        }, [])
    );

    const { currentStreak } = useStreak(tasks);

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