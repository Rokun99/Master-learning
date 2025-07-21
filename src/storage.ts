import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Feedback {
    like: string;
    wish: string;
    whatIf: string;
}

export interface ChatMessage {
    sender: 'user' | 'ai' | 'system';
    text: string;
    timestamp: number;
    type?: 'text' | 'image' | 'feedback';
    imageUrl?: string; // for type 'image'
    feedback?: Feedback; // for type 'feedback'
}

export interface JournalEntry {
    dayId: number;
    content: ChatMessage[];
    completedAt?: number; // Timestamp of completion
}

export interface DnaReportData {
    archetype: { name: string; description: string };
    themes: string[];
    breakthrough: { day: number; quote: string };
    pathForward: string[];
    wordCloud: { text: string; value: number }[];
    generatedAt: number;
}

interface BadgeRecord {
    id: string;
    unlockedAt: number; // timestamp
}

export interface ReminderSubscription {
    email: string;
    subscribed: boolean;
}

interface AppDB extends DBSchema {
    journal: {
        key: number;
        value: JournalEntry;
        indexes: { 'dayId': number };
    };
    settings: {
        key: string;
        value: any;
    };
    achievements: {
        key: string; // badge.id
        value: BadgeRecord;
    };
    dnaReport: {
        key: 'userReport';
        value: DnaReportData;
    };
    reminders: {
        key: 'subscription';
        value: ReminderSubscription;
    };
}

let dbPromise: Promise<IDBPDatabase<AppDB>>;

const DB_NAME = 'MasterLernenDB';
const DB_VERSION = 7; 

const getDB = () => {
    if (!dbPromise) {
        dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion) {
                if (oldVersion < 1) {
                    if (!db.objectStoreNames.contains('journal')) {
                        const journalStore = db.createObjectStore('journal', { keyPath: 'dayId' });
                        journalStore.createIndex('dayId', 'dayId', { unique: true });
                    }
                    if (!db.objectStoreNames.contains('settings')) {
                        db.createObjectStore('settings');
                    }
                }
                if (oldVersion < 2) {
                     if (!db.objectStoreNames.contains('achievements')) {
                        db.createObjectStore('achievements', { keyPath: 'id' });
                    }
                }
                if (oldVersion < 5) {
                    if (!db.objectStoreNames.contains('dnaReport')) {
                        db.createObjectStore('dnaReport');
                    }
                }
                if (oldVersion < 7) {
                    if (!db.objectStoreNames.contains('reminders')) {
                        db.createObjectStore('reminders');
                    }
                }
            },
        });
    }
    return dbPromise;
};

export { getDB };