export function formatDate(dateInput: string | Date | null | undefined): string {
    if (!dateInput) {
        return 'N/A'
    }

    try {
        const date = new Date(dateInput)

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid Date'
        }

        // Get components
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()

        return `${hours}:${minutes} ${day}/${month}/${year}`
    } catch (error) {
        return 'Invalid Date'
    }
}