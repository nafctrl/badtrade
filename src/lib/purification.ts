export function getNextPurificationDate(now: Date = new Date()): Date {
    const target = new Date(now)
    target.setHours(23, 0, 0, 0)

    // Check today first
    if (target.getDate() % 3 === 0 && target > now) {
        return target
    }

    // Keep adding 1 day until we find a multiple of 3
    // Limit loop to avoid infinite (though unlikely)
    for (let i = 0; i < 35; i++) {
        target.setDate(target.getDate() + 1)
        // Reset time to 23:00 just in case DST or something shifts it, though setDate handles it usually.
        // Actually setDate preserves time.
        // Important: check if date is multiple of 3.
        if (target.getDate() % 3 === 0) {
            return target
        }
    }

    return target
}

// Debug offset in milliseconds
let debugOffsetMs = 0

export function setDebugOffset(amountMs: number) {
    debugOffsetMs = amountMs
}

export function getPurificationProgress(): { progress: number; timeRemainingMs: number; nextDate: Date } {
    const now = new Date(Date.now() + debugOffsetMs)
    const nextDate = getNextPurificationDate(now)

    // Previous cycle assumed to be 3 days (72 hours) ago?
    // Not necessarily. If today is 1st (prev was 30th? or 27th?).
    // From 30th to 3rd is 3 or 4 days depending on month.
    // Simpler approach: Define "start" as "next - 3 days" for visual consistency,
    // or calculate previous purification date strictly.

    // Let's iterate backwards to find previous date.
    const prevDate = new Date(nextDate)
    for (let i = 0; i < 10; i++) {
        prevDate.setDate(prevDate.getDate() - 1)
        if (prevDate.getDate() % 3 === 0) {
            break;
        }
    }

    const totalDuration = nextDate.getTime() - prevDate.getTime()
    const elapsed = now.getTime() - prevDate.getTime()

    // Clamp progress 0-100
    let progress = (elapsed / totalDuration) * 100
    progress = Math.max(0, Math.min(100, progress))

    const timeRemainingMs = nextDate.getTime() - now.getTime()

    return { progress, timeRemainingMs, nextDate }
}
