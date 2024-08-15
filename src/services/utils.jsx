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
