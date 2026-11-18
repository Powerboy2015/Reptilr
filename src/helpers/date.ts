export function TimeDifference(date1: Date, date2: Date): { hours: number, minutes: number, seconds: number } {
    const diffMs = Math.abs(date2.getTime() - date1.getTime()); // difference in milliseconds

    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);

    return { hours, minutes, seconds };
}
export function localDate(date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
