import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type TimerContextType = {
    activeTaskId: number | null;
    timeLeft: number;
    isActive: boolean;
    durationMins: number;
    startTimer: (taskId: number | null, duration: number) => void;
    stopTimer: () => void;
    resumeTimer: () => void;
    endTimer: () => void;
    resetTimer: () => void;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
    const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [durationMins, setDurationMins] = useState(0);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            // Timer ended
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft]);

    const startTimer = (taskId: number | null, duration: number) => {
        const seconds = duration * 60;
        setDurationMins(duration);
        setActiveTaskId(taskId);
        setTimeLeft(seconds);
        setIsActive(true);
    };

    const stopTimer = () => setIsActive(false);
    const resumeTimer = () => setIsActive(true);

    const endTimer = () => {
        setIsActive(false);
        setTimeLeft(0);
        setActiveTaskId(null);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(durationMins * 60);
    };

    return (
        <TimerContext.Provider value={{ activeTaskId, timeLeft, isActive, durationMins, startTimer, stopTimer, resumeTimer, endTimer, resetTimer }}>
            {children}
        </TimerContext.Provider>
    );
}

export function useTimer() {
    const context = useContext(TimerContext);
    if (context === undefined) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context;
}
