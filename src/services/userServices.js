import { axiosRequest } from "../configs/axiosConfig"


//user login service
export const userLogin = async (loginDetails) => {
    return await axiosRequest.post("/auth/login", loginDetails)
        .then((response) => response.data)
}


export const userRegister = async (userDetails) =>{
    return await axiosRequest.post("/auth/register", userDetails)
        .then((response) => response.data)
}