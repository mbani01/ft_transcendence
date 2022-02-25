
export type Rank = 'Beginner' | 'Novice' | 'Graduate' | 'Expert' | 'Master' | 'Grand Master' | 'Legend';

export interface IStats {
    games: number;
    wins: number;
    totalScore: any;
    rankPoints: string;
};