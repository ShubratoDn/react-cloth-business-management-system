import { axiosRequest } from "configs/axiosConfig";
import { jsonToFormData } from "./utils";

export const createProduct = async (values) => {
    const productDetails = jsonToFormData(values);
    return await axiosRequest.post("/products", productDetails )
        .then(resp => resp.data)
}

export const getAllProductCategories = async (value) => {
    return await axiosRequest.get("/product-categories/search?query="+value)
        .then(resp => resp.data)
}