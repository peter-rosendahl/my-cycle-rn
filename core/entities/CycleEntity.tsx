export type RecordType = "Temperature" | "Ovulation" | "Spot bleed";

export interface IDateRecord {
    recordDate: Date;
    recordType: RecordType;
    recordValue?: number;
}

export interface ICycle {
    startDate: Date;
    periodEndDate: Date | null;
    endDate: Date | null;
}