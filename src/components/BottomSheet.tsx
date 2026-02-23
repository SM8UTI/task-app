import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
    useEffect,
} from 'react';
import {
    View,
    Modal,
    Animated,
    PanResponder,
    StyleSheet,
    TouchableWithoutFeedback,
    Dimensions,
    StyleProp,
    ViewStyle,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetProps {
    /** Height of the bottom sheet */
    height?: number;
    /** Duration of the open and close animations */
    animationDuration?: number;
    /** Whether the sheet can be closed by dragging it down */
    closeOnDragDown?: boolean;
    /** Whether the sheet should close when the background mask is pressed */
    closeOnPressMask?: boolean;
    /** Distance from dragging action to trigger close sheet */
    dragFromTopOnly?: boolean;
    /** Velocity to trigger swipe down close */
    closeOnPressBack?: boolean;
    /** Custom styles for different parts of the component */
    customStyles?: {
        wrapper?: StyleProp<ViewStyle>;
        container?: StyleProp<ViewStyle>;
        draggableIcon?: StyleProp<ViewStyle>;
    };
    /** Callback fired when the sheet opens */
    onOpen?: () => void;
    /** Callback fired when the sheet closes */
    onClose?: () => void;
    /** Content to display inside the sheet */
    children?: React.ReactNode;
}

export type BottomSheetRef = {
    open: () => void;
    close: () => void;
};

const CustomBottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
    (
        {
            height = 260,
            animationDuration = 250,
            closeOnDragDown = true,
            closeOnPressMask = true,
            dragFromTopOnly = false,
            closeOnPressBack = true,
            customStyles = {},
            onOpen,
            onClose,
            children,
        },
        ref
    ) => {
        const [modalVisible, setModalVisible] = useState(false);

        // Instead of using animatedHeight and panY separately, 
        // we use a single pan value that handles both opening (0) and closing (height)
        const panY = useRef(new Animated.Value(height)).current;

        const resetPanY = () => {
            Animated.timing(panY, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        };

        const closeSheet = () => {
            Animated.timing(panY, {
                toValue: height,
                duration: animationDuration,
                useNativeDriver: true,
            }).start(() => {
                setModalVisible(false);
                if (onClose) onClose();
            });
        };

        const openSheet = () => {
            setModalVisible(true);
        };

        useImperativeHandle(ref, () => ({
            open: openSheet,
            close: closeSheet,
        }));

        useEffect(() => {
            if (modalVisible) {
                // Start from hidden, slide up to 0 (visible)
                panY.setValue(height);
                Animated.timing(panY, {
                    toValue: 0,
                    duration: animationDuration,
                    useNativeDriver: true,
                }).start(() => {
                    if (onOpen) onOpen();
                });
            }
        }, [modalVisible, height, animationDuration, onOpen, panY]);

        const panResponder = useRef(
            PanResponder.create({
                onStartShouldSetPanResponder: (e, gestureState) => {
                    if (!closeOnDragDown) return false;
                    if (dragFromTopOnly) {
                        return gestureState.y0 < 100; // rough heuristic if they want top only
                    }
                    return true;
                },
                onPanResponderMove: (_, gestureState) => {
                    if (gestureState.dy > 0) {
                        panY.setValue(gestureState.dy);
                    }
                },
                onPanResponderRelease: (_, gestureState) => {
                    if (gestureState.vy > 0.5 || gestureState.dy > height / 3) {
                        closeSheet();
                    } else {
                        resetPanY();
                    }
                },
            })
        ).current;

        // Mask opacity fades based on how far down the sheet is
        const maskOpacity = panY.interpolate({
            inputRange: [0, height],
            outputRange: [0.5, 0],
            extrapolate: 'clamp',
        });

        if (!modalVisible) return null;

        return (
            <Modal
                transparent
                visible={modalVisible}
                animationType="none"
                onRequestClose={closeOnPressBack ? closeSheet : undefined}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={[styles.wrapper, customStyles.wrapper]}
                >
                    <TouchableWithoutFeedback onPress={closeOnPressMask ? closeSheet : undefined}>
                        <Animated.View style={[styles.mask, { opacity: maskOpacity }]} />
                    </TouchableWithoutFeedback>

                    <Animated.View
                        {...(closeOnDragDown && !dragFromTopOnly ? panResponder.panHandlers : {})}
                        style={[
                            styles.container,
                            { height },
                            customStyles.container,
                            { transform: [{ translateY: panY }] },
                        ]}
                    >
                        {closeOnDragDown && (
                            <View
                                {...(dragFromTopOnly ? panResponder.panHandlers : {})}
                                style={styles.draggableContainer}
                            >
                                <View style={[styles.draggableIcon, customStyles.draggableIcon]} />
                            </View>
                        )}
                        {children}
                    </Animated.View>
                </KeyboardAvoidingView>
            </Modal>
        );
    }
);

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    mask: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
    },
    container: {
        backgroundColor: '#ffffff',
        width: '100%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
    },
    draggableContainer: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 15,
    },
    draggableIcon: {
        width: 35,
        height: 5,
        borderRadius: 5,
        backgroundColor: '#ccc',
    },
});

export default CustomBottomSheet;
