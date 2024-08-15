import { axiosRequest } from "../configs/axiosConfig"
import { jsonToFormData } from "./utils"


//user login service
export const userLogin = async (loginDetails) => {
    return await axiosRequest.post("/auth/login", loginDetails)
        .then((response) => response.data)
}


export const userRegister = async (userDetails) =>{
    const formData = jsonToFormData(userDetails)
    return await axiosRequest.post("/auth/register", formData)
        .then((response) => response.data)
}