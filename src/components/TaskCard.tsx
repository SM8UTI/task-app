import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated, PanResponder, Dimensions, StyleSheet } from "react-native";
import theme from "../data/color-theme";
import { taskData } from "../data/temp-mock-data/task";
import { Calendar1, Check, Trash2 } from "lucide-react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;

type TaskCardProps = {
    task: typeof taskData[0];
    bgColor: string;
    onPress: () => void;
    onComplete?: () => void;
    onDelete?: () => void;
};

export default function TaskCard({ task, bgColor, onPress, onComplete, onDelete }: TaskCardProps) {
    const tDate = new Date(task.dueDate);
    const dayNum = tDate.getDate();
    // E.g., short format for time: "10:45 PM"
    const timeStr = tDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    const pan = useRef(new Animated.Value(0)).current;
    const [isCompleted, setIsCompleted] = useState(false);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            // Only capture pan if horizontal movement is greater than vertical (to allow list scroll)
            onMoveShouldSetPanResponder: (_, gestureState) => {
                const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
                const isIntentionalSwipe = Math.abs(gestureState.dx) > 10;
                return isHorizontalSwipe && isIntentionalSwipe && !isCompleted;
            },
            onPanResponderMove: (_, gestureState) => {
                pan.setValue(gestureState.dx);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx > SWIPE_THRESHOLD) {
                    // Trigger complete animation (swipe right)
                    Animated.timing(pan, {
                        toValue: SCREEN_WIDTH,
                        duration: 250,
                        useNativeDriver: true,
                    }).start(() => {
                        setIsCompleted(true);
                        if (onComplete) onComplete();
                    });
                } else if (gestureState.dx < -SWIPE_THRESHOLD) {
                    // Trigger delete animation (swipe left)
                    Animated.timing(pan, {
                        toValue: -SCREEN_WIDTH,
                        duration: 250,
                        useNativeDriver: true,
                    }).start(() => {
                        setIsCompleted(true);
                        if (onDelete) onDelete();
                    });
                } else {
                    // Snap back if threshold is not met
                    Animated.spring(pan, {
                        toValue: 0,
                        useNativeDriver: true,
                        bounciness: 12,
                        speed: 20
                    }).start();
                }
            },
        })
    ).current;

    // Optional: Render nothing or a collapsed state if already completed
    // (This works well depending on if the parent removes the task from the list)
    if (isCompleted) {
        return null;
    }

    return (
        <View style={{ position: "relative", width: "100%" }}>
            {/* --- Left Background Action: "Complete" (Swipe Right) --- */}
            <Animated.View style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: theme.background,
                borderRadius: theme.border.radius.main,
                flexDirection: "row",
                alignItems: "center",
                paddingLeft: 24,
                opacity: pan.interpolate({
                    inputRange: [0, SWIPE_THRESHOLD],
                    outputRange: [0, 1],
                    extrapolate: 'clamp'
                }),
                transform: [
                    {
                        scale: pan.interpolate({
                            inputRange: [0, SWIPE_THRESHOLD],
                            outputRange: [0.95, 1],
                            extrapolate: 'clamp'
                        })
                    }
                ]
            }}>
                <View style={{
                    backgroundColor: theme.white + "20",
                    height: 48,
                    width: 48,
                    borderRadius: 24,
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <Check color={theme.white} size={24} />
                </View>
                <Text style={{ fontFamily: theme.fonts[600], fontSize: 18, color: theme.white, marginLeft: 16 }}>
                    Task Finished
                </Text>
            </Animated.View>

            {/* --- Right Background Action: "Delete" (Swipe Left) --- */}
            <Animated.View style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: theme.background, // Light red matching TaskDetailsInfo
                borderRadius: theme.border.radius.main,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 24,
                opacity: pan.interpolate({
                    inputRange: [-SWIPE_THRESHOLD, 0],
                    outputRange: [1, 0],
                    extrapolate: 'clamp'
                }),
                transform: [
                    {
                        scale: pan.interpolate({
                            inputRange: [-SWIPE_THRESHOLD, 0],
                            outputRange: [1, 0.95],
                            extrapolate: 'clamp'
                        })
                    }
                ]
            }}>
                <Text style={{ fontFamily: theme.fonts[600], fontSize: 18, color: theme.error, marginRight: 16 }}>
                    Delete Task
                </Text>
                <View style={{
                    backgroundColor: theme.error + "20", // using theme.error with 20% opacity (hex equivalent is fine if preferred, or string concat)
                    height: 48,
                    width: 48,
                    borderRadius: 24,
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <Trash2 color={theme.error} size={24} />
                </View>
            </Animated.View>

            {/* Foreground Swipeable Card */}
            <Animated.View
                {...panResponder.panHandlers}
                style={{
                    transform: [
                        { translateX: pan },
                        {
                            rotateZ: pan.interpolate({
                                inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                                outputRange: ["-12deg", "0deg", "12deg"],
                                extrapolate: 'clamp' // Clamps the rotation so it limits to 12deg
                            })
                        }
                    ]
                }}
            >
                <TouchableOpacity
                    key={task.id}
                    activeOpacity={0.9}
                    onPress={onPress}
                    style={{
                        backgroundColor: bgColor,
                        borderRadius: theme.border.radius.main,
                        padding: 16,
                        paddingBottom: 20,
                        flexDirection: "column",
                        gap: 12
                    }}
                >
                    {/* Top row with Date info */}
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}>
                        <View style={{
                            backgroundColor: theme.white,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 20,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6
                        }}>
                            <Calendar1 size={14} color={theme.background} />
                            <Text style={{
                                fontFamily: theme.fonts[500],
                                fontSize: 12,
                                color: theme.background,
                                borderRadius: 100,
                            }}>
                                Today, {timeStr}
                            </Text>
                        </View>

                        {/* You could optionally put a status indicator or urgency pill here */}
                        {task.priority === "high" && (
                            <View style={{
                                backgroundColor: theme.white,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 12,
                            }}>
                                <Text style={{
                                    fontFamily: theme.fonts[500],
                                    fontSize: 12,
                                    color: theme.background,
                                    textTransform: 'capitalize'
                                }}>High</Text>
                            </View>
                        )}
                    </View>

                    {/* Middle Title/Description */}
                    <View style={{ marginTop: 4 }}>
                        <Text style={{
                            fontFamily: theme.fonts[600],
                            fontSize: 22,
                            color: theme.background,
                            lineHeight: 28
                        }} numberOfLines={2}>
                            {task.description}
                        </Text>
                        <Text style={{
                            fontFamily: theme.fonts[400],
                            fontSize: 16,
                            color: theme.background + "94",
                            lineHeight: 26,
                            marginTop: 8,
                        }} numberOfLines={1}>
                            {task.title.split('-')[1]?.trim() || task.title}
                        </Text>
                    </View>

                    {/* Bottom Row Tags */}
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, borderTopWidth: 1, borderColor: theme.background + "20", paddingTop: 12 }}>
                        {task.tag && task.tag.map((tagName, index) => (
                            <Text key={index} style={{
                                fontFamily: theme.fonts[500],
                                fontSize: 14,
                                color: theme.background + "80",
                                textTransform: "capitalize",
                            }}>#{tagName}</Text>
                        ))}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
