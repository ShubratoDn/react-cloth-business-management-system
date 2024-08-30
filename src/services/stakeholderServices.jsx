import { axiosRequest } from "configs/axiosConfig";
import { jsonToFormData } from "./utils";

export const addStakeholder = async (details)=>{

    const formData = jsonToFormData(details)
    !details.stakeHolderImage && formData.delete("stakeHolderImage");

    return await axiosRequest.post("/stakeholders", formData)
    .then((response) => response.data)
}