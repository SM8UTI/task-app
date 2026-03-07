import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "../data/color-theme";
import HeaderHeroScreen from "../layouts/homeScreen/Header";
import TodayRecentTasks from "../layouts/homeScreen/TodayRecentTasks";
import { useStreak } from "../hooks/useStreak";
import { useTaskManager } from "../hooks/useTaskManager";
import StartTimerList from "../layouts/homeScreen/StartTimerList";
import WeeklyFocusWidget from "../layouts/homeScreen/WeeklyFocusWidget";

export default function HomeScreen() {
    const { tasks } = useTaskManager();
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
                <StartTimerList />
                <WeeklyFocusWidget />
            </ScrollView>
        </SafeAreaView>
    );
}