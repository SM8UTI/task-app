import React, { useRef, useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    Modal,
    Animated,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    Pressable,
    PanResponder,
    ScrollView,
} from "react-native";
import theme from "../data/color-theme";
import AnimatedIconButton from "./AnimatedIconButton";
import { X, ArrowDown, ArrowRight, ArrowUp, CheckCircle } from "lucide-react-native";

export type NewTaskData = {
    title: string;
    description: string;
    dueDate: Date;
    priority: "high" | "medium" | "low";
    status: "to-do" | "in-progress" | "completed";
    tag: string[];
};

type Props = {
    visible: boolean;
    onClose: () => void;
    onSave: (task: NewTaskData) => void;
};

export default function AddTaskBottomSheet({ visible, onClose, onSave }: Props) {
    const slideAnim = useRef(new Animated.Value(0)).current;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState("");
    const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");

    // Local state for when the modal is actually mounted (for exit animation)
    const [isMounted, setIsMounted] = useState(visible);

    useEffect(() => {
        if (visible) {
            setIsMounted(true);
            setTitle("");
            setDescription("");
            setTags([]);
            setCurrentTag("");
            setPriority("medium");
            Animated.spring(slideAnim, {
                toValue: 1,
                useNativeDriver: true,
                bounciness: 0,
                speed: 14,
            }).start();
        } else if (isMounted) {
            closeSheet();
        }
    }, [visible]);

    const closeSheet = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setIsMounted(false);
            onClose();
        });
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    slideAnim.setValue(1 - gestureState.dy / 600);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 120 || gestureState.vy > 0.5) {
                    onClose(); // Triggers the useEffect to close it
                } else {
                    Animated.spring(slideAnim, {
                        toValue: 1,
                        useNativeDriver: true,
                        bounciness: 0,
                    }).start();
                }
            },
        })
    ).current;

    const onTagTextChange = (text: string) => {
        if (text.endsWith(",")) {
            const newTag = text.replace(",", "").trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setCurrentTag("");
        } else {
            setCurrentTag(text);
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleSave = () => {
        if (!title.trim()) return;

        let finalTags = [...tags];
        if (currentTag.trim().length > 0) {
            finalTags.push(currentTag.trim());
        }

        onSave({
            title,
            description,
            priority,
            status: "to-do",
            tag: finalTags.length ? finalTags : ["general"],
            dueDate: new Date(),
        });
    };

    if (!isMounted) return null;

    return (
        <Modal
            visible={isMounted}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.modalWrapper}
            >
                {/* Backdrop */}
                <Animated.View style={[
                    styles.backdrop,
                    {
                        opacity: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1]
                        })
                    }
                ]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                </Animated.View>

                {/* Sheet */}
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[
                        styles.sheet,
                        {
                            transform: [{
                                translateY: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [600, 0]
                                })
                            }]
                        }
                    ]}
                >
                    {/* Drag handle */}
                    <View style={styles.handleBar} />

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: Platform.OS === "ios" ? 40 : 20 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottomWidth: 1, borderColor: theme.background + "20" }}>
                            <Text style={{ fontFamily: theme.fonts[600], fontSize: 22, color: theme.background, paddingBottom: 16 }}>
                                New Task
                            </Text>

                        </View>

                        <Text style={styles.label}>Task Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="E.g., Design a new website"
                            placeholderTextColor={theme.background + "50"}
                            value={title}
                            onChangeText={setTitle}

                        />

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                            placeholder="Details about the task..."
                            placeholderTextColor={theme.background + "50"}
                            multiline
                            value={description}
                            onChangeText={setDescription}
                        />

                        <Text style={styles.label}>Tags (type comma to add)</Text>
                        <View style={[styles.input, { paddingVertical: 10, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }]}>
                            {tags.map(t => (
                                <View key={t} style={{ backgroundColor: theme.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Text style={{ color: theme.white, fontFamily: theme.fonts[500], fontSize: 13 }}>#{t}</Text>
                                    <Pressable onPress={() => removeTag(t)}>
                                        <X size={14} color={theme.white} />
                                    </Pressable>
                                </View>
                            ))}
                            <TextInput
                                style={{ flex: 1, minWidth: 100, fontSize: 16, fontFamily: theme.fonts[500], color: theme.background, paddingVertical: 4 }}
                                placeholder={tags.length === 0 ? "work, urgent..." : ""}
                                placeholderTextColor={theme.background + "50"}
                                value={currentTag}
                                onChangeText={onTagTextChange}
                                onSubmitEditing={() => onTagTextChange(currentTag + ",")}
                                blurOnSubmit={false}
                            />
                        </View>

                        <Text style={styles.label}>Priority</Text>
                        <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
                            {(["low", "medium", "high"] as const).map((p) => {
                                const isSelected = priority === p;
                                const isHigh = p === "high";

                                const getIcon = () => {
                                    if (p === "low") return <ArrowDown size={18} color={isSelected ? theme.white : theme.background} />;
                                    if (p === "medium") return <ArrowRight size={18} color={isSelected ? theme.white : theme.background} />;
                                    return <ArrowUp size={18} color={isSelected ? theme.white : theme.error} />;
                                };

                                return (
                                    <AnimatedIconButton
                                        key={p}
                                        onPress={() => setPriority(p as any)}
                                        style={{
                                            flex: 1,
                                            paddingVertical: 12,
                                            borderRadius: 500,
                                            borderWidth: 1,
                                            borderColor: isSelected
                                                ? (isHigh ? theme.errorDark : theme.background)
                                                : (isHigh ? theme.errorDark + "20" : theme.background + "20"),
                                            backgroundColor: isSelected
                                                ? (isHigh ? theme.errorDark : theme.background)
                                                : "transparent",
                                            alignItems: "center",
                                            flexDirection: "row",
                                            justifyContent: "center",
                                            gap: 6,
                                            paddingHorizontal: 16,
                                        }}
                                    >
                                        {getIcon()}
                                        <Text style={{
                                            color: isSelected ? theme.white : (isHigh ? theme.error : theme.background),
                                            fontFamily: theme.fonts[500],
                                            textTransform: "capitalize"
                                        }}>{p}</Text>
                                    </AnimatedIconButton>
                                )
                            })}
                        </View>

                        <AnimatedIconButton
                            style={{
                                width: "100%",
                                height: 56,
                                borderRadius: 28,
                                backgroundColor: theme.success,
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 10,
                                opacity: title.trim().length ? 1 : 0.5
                            }}
                            onPress={handleSave}
                            disabled={!title.trim().length}
                        >
                            <CheckCircle color={theme.white} size={20} />
                            <Text style={{
                                fontFamily: theme.fonts[500],
                                fontSize: 16,
                                color: theme.white
                            }}>Save Task</Text>
                        </AnimatedIconButton>
                    </ScrollView>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalWrapper: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    sheet: {
        backgroundColor: theme.white,
        borderRadius: 36,
        margin: 16,
        marginBottom: 32,
        overflow: "hidden",
        maxHeight: "85%", // Ensure long forms become scrollable
    },
    handleBar: {
        width: 56,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.background + "20",
        alignSelf: "center",
        marginTop: 14,
        marginBottom: 4,
    },
    label: {
        fontFamily: theme.fonts[600],
        fontSize: 14,
        color: theme.background + "80",
        marginBottom: 8,
    },
    input: {
        backgroundColor: theme.background + "08",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        fontFamily: theme.fonts[500],
        color: theme.background,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: theme.background + "10"
    }
});
