import { Text, View } from "react-native";
import theme from "../../data/color-theme";
import AnimatedIconButton from "../../components/AnimatedIconButton";
import { Plus } from "lucide-react-native";
type Props = {
    onAddTaskPress: () => void;
    currentTab: string;
    onTabChange: (tab: string) => void;
    todoCount: number;
    inProgressCount: number;
    completedCount: number;
    totalCount: number;
};

export default function HeaderTaskScreen({
    onAddTaskPress,
    currentTab,
    onTabChange,
    todoCount,
    inProgressCount,
    completedCount,
    totalCount
}: Props) {


    return (
        <View style={{
            paddingHorizontal: theme.padding.paddingMainX,
        }}>
            <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: theme.text + "10",
                paddingBottom: 16,
            }}>
                <View style={{
                    gap: 2,
                    flexDirection: "column",
                }}>
                    <Text style={{
                        fontSize: 24,
                        color: theme.text,
                        fontFamily: theme.fonts[700],
                    }}>
                        Tasks
                    </Text>
                    <Text style={{
                        fontSize: 14,
                        color: theme.text + "90",
                        fontFamily: theme.fonts[400],
                    }}>
                        {String(totalCount).padStart(2, "0")} tasks
                    </Text>
                </View>
                <View>
                    <AnimatedIconButton
                        onPress={onAddTaskPress}
                        style={
                            {
                                backgroundColor: theme.primary[2],
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                borderRadius: theme.border.radius.main,
                            }
                        }>
                        <Plus size={24} />
                        <Text style={{
                            fontSize: 15,
                            fontFamily: theme.fonts[500],
                        }}>Add Task</Text>
                    </AnimatedIconButton>
                </View>
            </View>
            <View style={{
                flexDirection: "row",
                gap: 8,
                marginTop: 16,
            }}>
                {
                    [
                        {
                            label: "To do",
                            value: "to-do",
                            valueCount: todoCount,
                        },
                        {
                            label: "In Progress",
                            value: "in-progress",
                            valueCount: inProgressCount,
                        },
                        {
                            label: "Completed",
                            value: "completed",
                            valueCount: completedCount,
                        }
                    ].map((item, index) => {
                        return (
                            <AnimatedIconButton key={index} onPress={() => onTabChange(item.value)} style={{
                                backgroundColor: currentTab === item.value ? theme.white : theme.white + "10",
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                borderRadius: theme.border.radius.main,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                            }}>
                                <Text style={{
                                    color: currentTab === item.value ? theme.background : theme.text + "90",
                                    fontFamily: theme.fonts[500],
                                }}>{item.label}</Text>
                                {
                                    currentTab !== item.value && (
                                        <View style={{
                                            backgroundColor: theme.white + "10",
                                            borderRadius: theme.border.radius.main,
                                            width: 24,
                                            height: 24,
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}>
                                            <Text style={{
                                                color: currentTab === item.value ? theme.background : theme.text + "90",
                                                fontFamily: theme.fonts[500],
                                            }}>{item.valueCount}</Text>
                                        </View>
                                    )
                                }
                            </AnimatedIconButton>
                        )
                    })
                }
            </View>
        </View>
    )
}