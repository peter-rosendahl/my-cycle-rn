export type RecordType = "Temperature" | "Ovulation" | "Spot bleed";

export interface IDateRecord {
    recordDate: Date;
    recordType: RecordType | string;
    recordValue?: number;
    daysInCycle?: number;
}

export interface ICycle {
    startDate: Date;
    periodEndDate: Date | null;
    endDate: Date | null;
    periodDuration?: number;
    cycleDuration?: number;
}