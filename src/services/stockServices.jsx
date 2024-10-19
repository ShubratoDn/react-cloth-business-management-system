import { axiosRequest } from "configs/axiosConfig"

export const stockOverview = async (storeId, productName, page, size)=>{
    return await axiosRequest.get(`/stocks/overview?storeId=${storeId}&productName=${productName}&page=${page}&size=${size}`)
    .then((response) => response.data)
}