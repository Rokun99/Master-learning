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
export const courseData: DayData[] = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    let specialFeature: 'feedback' | 'visualize' | undefined = undefined;
    if (day === 7) specialFeature = 'feedback';
    if (day === 17) specialFeature = 'visualize';

    return {
        id: day,
        title: `course.${day}.title`,
        subtitle: `course.${day}.subtitle`,
        introduction: `course.${day}.introduction`,
        sections: [
            {
                title: `course.${day}.sections.0.title`,
                content: [
                    `course.${day}.sections.0.content.0`,
                    `course.${day}.sections.0.content.1`,
                    `course.${day}.sections.0.content.2`,
                    `course.${day}.sections.0.content.3`,
                ]
            }
        ],
        exercise: {
            title: `course.${day}.exercise.title`,
            description: `course.${day}.exercise.description`,
            specialFeature: specialFeature,
        },
        takeaways: [
            `course.${day}.takeaways.0`,
        ]
    }
});

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