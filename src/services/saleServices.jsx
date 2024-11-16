import { axiosRequest } from "configs/axiosConfig"

export const addSale = async (values) => {
    return await axiosRequest.post(`/sales`, values).then((resp) => resp.data)
}


export const searchSale = async (storeId, supplierId, poNumber, status, fromDate, toDate, page, size) => {
    return await axiosRequest.get(`/sales/search`, {
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