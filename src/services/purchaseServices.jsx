import { axiosRequest } from "configs/axiosConfig"
import { jsonToFormData } from "./utils"


export const addPurchase = async (values)=>{
    return await axiosRequest.post(`/purchases`,values).then((resp)=>resp.data)
}