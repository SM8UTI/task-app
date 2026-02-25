import { Text, ScrollView, View } from "react-native";
import theme from "../data/color-theme";
import HeaderHeroScreen from "../layouts/homeScreen/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import TodayRecentTasks from "../layouts/homeScreen/TodayRecentTasks";

export default function HomeScreen() {
    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.background }}
            edges={['top', 'left', 'right']}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                bounces={false}
                overScrollMode="never" // For Android
            >
                <HeaderHeroScreen />
                <TodayRecentTasks />
            </ScrollView>
        </SafeAreaView>
    )
}