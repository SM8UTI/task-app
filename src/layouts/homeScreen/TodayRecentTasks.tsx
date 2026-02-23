import { Text, TouchableOpacity, View } from "react-native";
import theme from "../../data/color-theme";
import { taskData } from "../../data/temp-mock-data/task";
import { Calendar1, Plus, Share2, MoreHorizontal, Link2, CircleArrowOutUpRight } from "lucide-react-native";

export default function TodayRecentTasks() {
    // 1. Check and filter today's tasks
    const today = new Date();
    const todayTasks = taskData.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.getDate() === today.getDate() &&
            taskDate.getMonth() === today.getMonth() &&
            taskDate.getFullYear() === today.getFullYear();
    });

    const displayMonth = today.toLocaleDateString("en-US", { month: "short" });
    const displayDate = today.getDate();

    // 2. Cycle choosing colors from your custom primary values & white
    const taskColors = [theme.primary[1], theme.primary[3], theme.primary[4]];

    return (
        <View style={{
            paddingHorizontal: theme.padding.paddingMainX,
            marginTop: 12,
            paddingBottom: 120 // Prevents bottom items from getting hidden by TabNavigator
        }}>
            {/* Top Green Hero Card */}
            <View style={{
                backgroundColor: theme.primary[2],
                padding: 24,
                borderRadius: 40, // More aggressive rounding per the image
            }}>
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8
                    }}>
                        <Calendar1 stroke={theme.background} size={20} />
                        <Text style={{
                            fontFamily: theme.fonts[500],
                            fontSize: 16,
                            color: theme.background
                        }}>
                            {displayDate} {displayMonth}
                        </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity style={{
                            backgroundColor: theme.background,
                            borderRadius: 120,
                            height: 48,
                            width: 48,
                            justifyContent: "center",
                            alignItems: "center"
                        }}>
                            <Plus stroke={theme.text} size={24} />
                        </TouchableOpacity>
                        <TouchableOpacity style={{
                            backgroundColor: theme.white,
                            borderRadius: 120,
                            height: 48,
                            width: 48,
                            justifyContent: "center",
                            alignItems: "center"
                        }}>
                            <CircleArrowOutUpRight stroke={theme.background} size={24} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ marginTop: 40 }}>
                    <Text style={{
                        fontFamily: theme.fonts[500],
                        fontSize: 14,
                        color: theme.background + "90",
                        marginBottom: 4
                    }}>
                        Current tasks
                    </Text>
                    <Text style={{
                        fontFamily: theme.fonts[400],
                        fontSize: 36,
                        lineHeight: 44,
                        color: theme.background,
                    }}>
                        You have <Text style={{ fontFamily: theme.fonts[700] }}>{String(todayTasks.length).padStart(2, "0")}</Text>{"\n"}
                        tasks <Text style={{ color: theme.background, fontFamily: theme.fonts[600] }}>High ~</Text>{"\n"}
                        for today
                    </Text>
                </View>

                <View style={{
                    flexDirection: "row",
                    gap: 12,
                    marginTop: 24,
                    flexWrap: "wrap",
                }}>
                    {
                        ["shopping", "renovation", "planning"].map((tag, index) => (
                            <Text key={index} style={{
                                fontFamily: theme.fonts[500],
                                fontSize: 13,
                                color: theme.background + "80"
                            }}>#{tag}</Text>
                        ))
                    }
                </View>
            </View>

            {/* Render Map of Tasks */}
            <View style={{
                flexDirection: "column",
                gap: 12,
                marginTop: 12
            }}>
                {
                    taskData.map((task, index) => {
                        const tDate = new Date(task.dueDate);
                        const dayNum = tDate.getDate();
                        const dayStr = tDate.toLocaleDateString("en-US", { weekday: "short" });

                        // Select dynamic color based on mapping order
                        const bgColor = taskColors[index % taskColors.length];

                        return (
                            <View key={task.id} style={{
                                backgroundColor: bgColor,
                                borderRadius: 40,
                                padding: 12,
                                flexDirection: "row",
                                alignItems: "center"
                            }}>
                                {/* Left Black Circle  */}
                                <View style={{
                                    backgroundColor: theme.background,
                                    width: 68,
                                    height: 68,
                                    borderRadius: 34,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "column"
                                }}>
                                    <Text style={{
                                        fontFamily: theme.fonts[700],
                                        fontSize: 20,
                                        color: theme.text,
                                        lineHeight: 24
                                    }}>{dayNum}</Text>
                                    <Text style={{
                                        fontFamily: theme.fonts[400],
                                        fontSize: 12,
                                        color: theme.text + "90",
                                        lineHeight: 14
                                    }}>{dayStr}</Text>
                                </View>

                                {/* Middle Title/Description */}
                                <View style={{
                                    flex: 1,
                                    paddingHorizontal: 16
                                }}>
                                    <Text style={{
                                        fontFamily: theme.fonts[700],
                                        fontSize: 18,
                                        color: theme.background,
                                    }} numberOfLines={1}>
                                        {task.title.split('-')[1]?.trim() || task.title}
                                    </Text>
                                    <Text style={{
                                        fontFamily: theme.fonts[500],
                                        fontSize: 12,
                                        color: theme.background + "80",
                                        marginTop: 2
                                    }} numberOfLines={1}>
                                        {task.description}
                                    </Text>
                                </View>

                                {/* Right Side Actions */}
                                <View style={{
                                    flexDirection: "row",
                                    gap: 8,
                                    marginRight: 4
                                }}>
                                    <TouchableOpacity style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 22,
                                        borderWidth: 1,
                                        borderColor: theme.background + "20",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}>
                                        <MoreHorizontal color={theme.background} size={20} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 22,
                                        backgroundColor: theme.background,
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}>
                                        <Link2 color={theme.text} size={20} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                }
            </View>
        </View>
    )
}