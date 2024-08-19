import { axiosRequest } from "configs/axiosConfig"

export const addRole = async (roleDetails)=>{
    return await axiosRequest.post("/roles/", roleDetails)
    .then((response) => response.data)
}


export const searchRoles = async (query, page, size)=>{
    return await axiosRequest.get(`/roles/search?page=${page}&size=${size}&query=${query}`)
    .then((response) => response.data)
}


export const updateRoleStatus = async (id) => {
    return await axiosRequest.put(`/roles/${id}/updateStatus`)
    .then((response) => response.data);
};


export const getAllRoles = async ()=>{
    return await axiosRequest.get(`/roles/all`)
    .then((response) => response.data)
}