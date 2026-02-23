import { Text, View } from "react-native";
import theme from "../data/color-theme";
import HeaderHeroScreen from "../layouts/homeScreen/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import TodayRecentTasks from "../layouts/homeScreen/TodayRecentTasks";

export default function HomeScreen() {
    return (
        <SafeAreaView>
            <View>
                <HeaderHeroScreen />
                <TodayRecentTasks />
            </View>
        </SafeAreaView>
    )
}