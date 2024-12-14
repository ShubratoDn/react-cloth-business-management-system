import { axiosRequest } from "configs/axiosConfig"

export const downloadProfitabilityReport = async (storeId, supplierId, poNumber, status, fromDate, toDate, type) => {
    // Construct the URL with query parameters
    const baseUrl = '/reports/profitability';
    const queryParams = new URLSearchParams({
        storeId: storeId || '',
        supplierId: supplierId || '',
        poNumber: poNumber || '',
        transactionStatus: status || '',
        fromDate: fromDate || '',
        toDate: toDate || '',
        transactionType: type || '',
    });

    const fullUrl = `${baseUrl}?${queryParams.toString()}`;
    // console.log('Request URL:', fullUrl); // Print the full URL with parameters

    return await axiosRequest.post(
        baseUrl,
        { 
                
        },
        {
            params: queryParams,
            responseType: 'blob', // Ensure we handle binary data
        }
    )
    .then((response) => {
        console.log(response);

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `profitability_report.xlsx`);
        document.body.appendChild(link);
        link.click();
    })
    .catch((error) => {
        console.error('Error downloading report:', error);
        throw error;
    });
};
