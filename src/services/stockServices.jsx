import { axiosRequest } from "configs/axiosConfig"

export const stockOverview = async (storeId, productId, productName, page, size)=>{
    return await axiosRequest.get(`/stocks/overview?storeId=${storeId}&productId=${productId}&productName=${productName}&page=${page}&size=${size}`)
    .then((response) => response.data)
}