import { axiosRequest } from "configs/axiosConfig";
import { jsonToFormData } from "./utils";

export const addStakeholder = async (details) => {
    let store = details.store;
    delete details.store;

    const formData = jsonToFormData(details)
    details.stakeHolderImage == null && formData.delete("stakeHolderImage");
    formData.append("store.id", store.value);
    // console.log(formData)

    // Display the key/value pairs
    // for (var pair of formData.entries()) {
    //     console.log(pair[0] + ', ' + pair[1]);
    // }

    return await axiosRequest.post("/stakeholders", formData)
        .then((response) => response.data)
}


export const fetchSuppliersByStoreId = async (storeId) =>{
    return await axiosRequest.get(`/stakeholders/type/supplier/store/${storeId}`).then((resp)=>resp.data)
}