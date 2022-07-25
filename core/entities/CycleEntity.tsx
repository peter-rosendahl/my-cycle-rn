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



export enum TimeInMs {
    OneSecond = 1000,
    FiveSeconds = 5000,
    SevenSeconds = 7000,
    TenSeconds = 10000,
    FifteenSeconds = 15000,
    ThirtySeconds = 30000,
    Minute = 60000,
    Hour = 3600000,
    Day = 86400000,
    Week = 604800000,
    Month = 2678400000,
    year = 31536000000,
    leapYear = 31622400000
}