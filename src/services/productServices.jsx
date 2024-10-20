import { axiosRequest } from "configs/axiosConfig";
import { jsonToFormData } from "./utils";

export const createProduct = async (values) => {
    values.productImage == null && delete values.productImage;
    const productDetails = jsonToFormData(values);
    return await axiosRequest.post("/products", productDetails )
        .then(resp => resp.data)
}

export const searchAllProductCategories = async (value) => {
    return await axiosRequest.get("/product-categories/search?query="+value)
        .then(resp => resp.data)
}

export const getAllProductList = async () => {
    return await axiosRequest.get("/products")
        .then(resp => resp.data)
}


export const searchProducts = async (query, page, size)=>{
    return await axiosRequest.get(`/products/search?page=${page}&size=${size}&query=${query}`)
    .then((response) => response.data)
}