export function TimeDifference(date1: Date, date2: Date): { hours: number, minutes: number, seconds: number } {
    const diffMs = Math.abs(date2.getTime() - date1.getTime()); // difference in milliseconds

    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);

    return { hours, minutes, seconds };
}