import { axiosRequest } from "configs/axiosConfig";

export const createProduct = async () => {
    return [];
}

export const getAllProductCategories = async () => {
    return await axiosRequest.get("/product-categories")
        .then(resp => resp.data)
}