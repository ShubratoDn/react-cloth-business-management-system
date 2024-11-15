import { axiosRequest } from "configs/axiosConfig"

export const addSale = async (values) => {
    return await axiosRequest.post(`/sales`, values).then((resp) => resp.data)
}