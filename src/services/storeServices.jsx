import { axiosRequest } from "configs/axiosConfig"
import { jsonToFormData } from "./utils"

export const addStore = async (storeDetails)=>{
    const formData = jsonToFormData(storeDetails)
    !storeDetails.storeImage && formData.delete("storeImage");

    return await axiosRequest.post("/stores/", formData)
    .then((response) => response.data)
}

export const searchStores = async (query, page, size)=>{
    return await axiosRequest.get(`/stores/search?page=${page}&size=${size}&query=${query}`)
    .then((response) => response.data)
}


export const updateUserAssignedStore = async (user, store )=>{
    return await axiosRequest.put( `/users/${user.id}/stores/${store.id}/assign`)
}

export const getAllStores = async ()=>{
    return await axiosRequest.get(`/stores`)
    .then((response) => response.data)
}