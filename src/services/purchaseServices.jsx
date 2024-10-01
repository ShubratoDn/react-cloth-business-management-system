import { axiosRequest } from "configs/axiosConfig"


export const addPurchase = async (values) => {
    return await axiosRequest.post(`/purchases`, values).then((resp) => resp.data)
}

export const updatePurchase = async (id, poNumber, values) => {
    return await axiosRequest.put(`/purchases/${id}/${poNumber}`, values).then((resp) => resp.data)
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

export const findPurchaseByIdAndPO = async (id, po)=>{
    return await axiosRequest.get(`/purchases/${id}/${po}`).then((resp)=>resp.data)
}