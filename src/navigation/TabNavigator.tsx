import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import TaskScreen from "../screens/TaskScreen";
import theme from "../data/color-theme";
import { LayoutDashboard, ListTodo } from "lucide-react-native";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: theme.text,
            tabBarInactiveTintColor: theme.text + "80",
            tabBarStyle: {
                backgroundColor: theme.background,
                borderColor: theme.text + "20",
                height: 100,
                paddingTop: 8
            },
            tabBarLabelStyle: {
                fontFamily: theme.fonts[500],
                fontSize: 12,
                marginTop: 8
            }
        }}>
            <Tab.Screen options={{
                tabBarIcon: ({ focused }) => (
                    <LayoutDashboard color={focused ? theme.text : theme.text + "60"} size={24} />
                )
            }} name="Home" component={HomeScreen} />
            <Tab.Screen options={{
                tabBarIcon: ({ focused }) => (
                    <ListTodo color={focused ? theme.text : theme.text + "60"} size={24} />
                )
            }} name="Task" component={TaskScreen} />
        </Tab.Navigator>
    )
}
