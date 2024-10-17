/**
 * Converts a JSON object into FormData.
 * @param {Object} json - The JSON object to convert.
 * @param {FormData} formData - The FormData object to append to.
 * @param {string} parentKey - The key of the parent object, used for nested objects.
 * @returns {FormData} - The populated FormData object.
 */
export function jsonToFormData(json, formData = new FormData(), parentKey = '') {
    Object.keys(json).forEach(key => {
        const value = json[key];
        const formKey = parentKey ? `${parentKey}[${key}]` : key;

        if (value instanceof Date) {
            formData.append(formKey, value.toISOString());
        } else if (value instanceof File || value instanceof Blob) {
            formData.append(formKey, value);
        } else if (typeof value === 'object' && value !== null) {
            jsonToFormData(value, formData, formKey);
        } else {
            formData.append(formKey, value);
        }
    });

    return formData;
}


export function formatDate(dateString) {
    // Create a new Date object from the input string
    const date = new Date(dateString);
    
    // Get day, month (in abbreviated form), and year
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2); // Last 2 digits of the year

    // If input contains time, format both date and time
    if (dateString.includes('T')) {
        // Get hours and minutes in 12-hour format
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        // Convert 24-hour format to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // The hour '0' should be '12'
        
        // Return the full date and time format
        return `${day}-${month}-${year}, ${hours}:${minutes} ${ampm}`;
    } else {
        // Return only the date if time is not included
        return `${day}-${month}-${year}`;
    }
}
