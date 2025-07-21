export interface DayData {
    id: number;
    title: string; 
    subtitle: string;
    introduction: string;
    sections: {
        title: string;
        content: (string | { type: 'list'; items: string[] })[];
    }[];
    exercise: {
        title: string;
        description: string;
        specialFeature?: 'feedback' | 'visualize';
    };
    takeaways: string[];
}

// Data now contains translation keys for the new program
export const courseData: DayData[] = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    title: `course.${i + 1}.title`,
    subtitle: `course.${i + 1}.subtitle`,
    introduction: `course.${i + 1}.introduction`,
    sections: [
        {
            title: `course.${i + 1}.sections.0.title`,
            content: [
                `course.${i + 1}.sections.0.content.0`,
                `course.${i + 1}.sections.0.content.1`,
                `course.${i + 1}.sections.0.content.2`,
                `course.${i + 1}.sections.0.content.3`,
            ]
        }
    ],
    exercise: {
        title: `course.${i + 1}.exercise.title`,
        description: `course.${i + 1}.exercise.description`
    },
    takeaways: [
        `course.${i + 1}.takeaways.0`,
    ]
}));

export interface Badge {
    id: string;
    icon: string; // Icon name from Header.tsx
    condition: (completedDays: Set<number>) => boolean;
}

export const gamificationData: { badges: Badge[] } = {
    badges: [
        { id: 'start', icon: 'sparkles', condition: (completed) => completed.has(1) },
        { id: 'milestone1', icon: 'award', condition: (completed) => completed.has(7) },
        { id: 'milestone2', icon: 'flag', condition: (completed) => completed.has(14) },
        { id: 'milestone3', icon: 'rocket', condition: (completed) => completed.has(21) },
        { id: 'finish', icon: 'trophy', condition: (completed) => completed.size >= 30 },
        { id: 'reflection-pro', icon: 'edit-3', condition: (completed) => completed.size >= 10 },
        { id: 'dna_report', icon: 'brain-circuit', condition: () => false }, // Awarded manually
    ]
};