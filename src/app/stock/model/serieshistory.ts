export class SeriesHistory {
    name: string;
    data: number[];

    constructor(name: string) {
        this.name = name;
        this.data = [];
    }
}

export const seriesHistory: SeriesHistory[] = [
    new SeriesHistory('Open'),
    new SeriesHistory('High'),
    new SeriesHistory('Low'),
    new SeriesHistory('Close'),
];