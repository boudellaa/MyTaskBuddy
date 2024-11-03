const client = require("../connection.js");

const insertDailyTasks = async (query, values) => {
    const startDate = new Date(values[1]); // date from the input
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // Assuming a week-long daily task insertion

    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
        const newValues = [...values];
        newValues[1] = d.toISOString().split('T')[0]; // Update date in values array
        await client.query(query, newValues);
    }
}

const insertWeeklyTasks = async (query, values) => {
    try {
        const startDate = new Date(values[1]);
        const year = startDate.getFullYear();
        const month = startDate.getMonth();
        const dayOfWeek = startDate.getDay(); // Get the day of the week from the startDate (0=Sunday, 1=Monday, ..., 6=Saturday)

        // Find all occurrences of the specified day of the week in the current month
        let weekNumber = 1;
        while (true) {
            const taskDate = getNthWeekdayOfMonth(year, month, dayOfWeek, weekNumber);
            if (!taskDate) break; // No more valid dates in this month

            taskDate.setDate(taskDate.getDate() + 1);

            const adjustedValues = [...values];
            adjustedValues[1] = taskDate.toISOString().split('T')[0]; // Convert to the date format (YYYY-MM-DD)

            await client.query(query, adjustedValues);
            weekNumber++;
        }
    } catch (err) {
        console.error('Error inserting tasks:', err.stack);
    }
};

// Helper function to find the nth occurrence of a specific weekday in a month
const getNthWeekdayOfMonth = (year, month, weekday, n) => {
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // Get the day of the week for the 1st of the month
    let dayOffset = weekday - firstDayOfMonth; // Calculate the difference from the target weekday

    if (dayOffset < 0) {
        dayOffset += 7; // Adjust if the target weekday is before the first day of the month
    }

    const day = 1 + dayOffset + (n - 1) * 7; // Calculate the date for the nth occurrence

    // Check if the calculated day is within the same month
    const date = new Date(year, month, day, 0, 0, 0);

    if (date.getMonth() !== month) {
        return null; // Return null if the date is outside the current month
    }
    return date;
};


const insertMonthlyTasks = async (query, values) => {
    const selectedDate = new Date(values[1]);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const weekday = selectedDate.getDay();  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Calculate the week number (1st, 2nd, 3rd, etc.) of the selected date within the month
    const weekNumber = Math.ceil(selectedDate.getDate() / 7);

    // Loop through the next 12 months or as many months as you need
    for (let i = 0; i < 12; i++) {
        const currentMonth = (month + i) % 12;
        const currentYear = year + Math.floor((month + i) / 12);

        const recurringDate = getNthWeekdayOfMonth(currentYear, currentMonth, weekday, weekNumber);

        if (recurringDate) {
            const newValues = [...values];
            newValues[1] = recurringDate;

            // Insert the task with the new date
            await client.query(query, newValues);
        }
    }
};

const deleteRecurringTasks = async (taskId) => {
    const deleteQuery = `
        DELETE FROM tasks 
        WHERE series_id = (
            SELECT series_id 
            FROM tasks 
            WHERE id = $1
        );
    `;

    await client.query(deleteQuery, [taskId]);
};

module.exports = {
    insertDailyTasks,
    insertWeeklyTasks,
    insertMonthlyTasks,
    deleteRecurringTasks
};