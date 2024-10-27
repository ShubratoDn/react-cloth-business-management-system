import { axiosRequest } from "configs/axiosConfig"


export const addPurchase = async (values) => {
    return await axiosRequest.post(`/purchases`, values).then((resp) => resp.data)
}

export const updatePurchase = async (id, poNumber, values) => {
    return await axiosRequest.put(`/purchases/${id}/${poNumber}`, values).then((resp) => resp.data)
}


export const updatePurchaseStatus = async (requestBody) => {
    return await axiosRequest.put(`/purchases/update-purchase-status`, requestBody).then((resp) => resp.data)
}


export const searchPurchase = async (storeId, supplierId, poNumber, status, fromDate, toDate, page, size) => {
    return await axiosRequest.get(`/purchases/search`, {
        params: {
            storeId: storeId || '',  // Default to empty string if undefined
            supplierId: supplierId || '',
            poNumber: poNumber || '',
            status: status || '',
            fromDate: fromDate || '',
            toDate: toDate || '',
            page: page || 0,         // Default to 0 if page is not provided
            size: size || 10         // Default to 10 if size is not provided
        }
    }).then((resp) => resp.data)
}

export const findPurchaseByIdAndPO = async (id, po) => {
    return await axiosRequest.get(`/purchases/${id}/${po}`).then((resp) => resp.data)
}

export const generatePOPdf = async (id, po) => {
    return await axiosRequest.get(`/purchases/generate-pdf/${id}/${po}`).then((resp) => resp.data)
}


export const downloadPurchaseReport = async (id, po) => {
    try {
        const response = await axiosRequest.get(`/purchases/generate-pdf/${id}/${po}`, {
            responseType: 'blob', // Important to handle binary data
        });

        // Create a link element, set it as a download, and trigger it
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${po}.pdf`); // Set the filename
        document.body.appendChild(link);
        link.click();

        // Clean up
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to download report:', error);
        alert('Could not download the report. Please try again.');
    }
};