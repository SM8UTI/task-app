import React, { useState, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import theme from "../../data/color-theme";
import { taskData } from "../../data/temp-mock-data/task";
import { Calendar1, Plus, Share2, MoreHorizontal, Link2, CircleArrowOutUpRight, X, Trash2, CheckCircle } from "lucide-react-native";
import BottomSheet, { BottomSheetRef } from "../../components/BottomSheet";
import TaskDetailsInfo from "../../components/TaskDetailsInfo";

export default function TodayRecentTasks() {
    const bottomSheetRef = useRef<BottomSheetRef>(null);
    const [selectedTask, setSelectedTask] = useState<typeof taskData[0] | null>(null);

    const openTaskSheet = (task: typeof taskData[0]) => {
        setSelectedTask(task);
        bottomSheetRef.current?.open();
    };

    const closeTaskSheet = () => {
        bottomSheetRef.current?.close();
    };

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
                            <TouchableOpacity
                                key={task.id}
                                activeOpacity={0.9}
                                onPress={() => openTaskSheet(task)}
                                style={{
                                    backgroundColor: bgColor,
                                    borderRadius: 40,
                                    padding: 12,
                                    flexDirection: "row",
                                    alignItems: "center"
                                }}
                            >
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
                            </TouchableOpacity>
                        );
                    })
                }
            </View>

            <BottomSheet
                ref={bottomSheetRef}
                height={350}
                animationDuration={300}
                closeOnDragDown={true}
                closeOnPressMask={true}
                customStyles={{
                    container: {
                        backgroundColor: theme.white,
                        borderTopLeftRadius: 36,
                        borderTopRightRadius: 36,
                    },
                    draggableIcon: {
                        backgroundColor: theme.background + "20",
                        width: 56,
                        height: 6,
                        borderRadius: 3,
                    },
                }}
            >
                {selectedTask && (
                    <TaskDetailsInfo
                        task={selectedTask}
                        onClose={closeTaskSheet}
                        onComplete={() => console.log("Complete Task clicked")}
                        onDelete={() => console.log("Delete Task clicked")}
                    />
                )}
            </BottomSheet>
        </View>
    )
}