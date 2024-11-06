import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { userHasRole } from "services/auth";
import { findPurchaseByIdAndPO } from "services/purchaseServices";
import ViewPurchaseDetails from "./ViewPurchaseDetails";
import Page401 from "views/pages/page401/Page401";

const UpdatePurchaseStatus = () => {
    const [isLoading, setLoading] = useState(true);
    const [unauthorizedAccess, setUnauthorizedAccess] = useState(false);
    const [message, setMessage] = useState("");

    const [transaction, setTransaction] = useState(null);
    const { id, transactionNumber } = useParams();

    useEffect(() => {
        setLoading(false);
        if (userHasRole("ROLE_PURCHASE_AUTHORIZATION")) {
            if (id && transactionNumber) {
                setLoading(true);
                findPurchaseByIdAndPO(id, transactionNumber)
                    .then((data) => {
                        data && ((data.transactionStatus !== "OPEN" && data.transactionStatus !== "REJECTED") ? setTransaction(data) : setMessage("Transaction Status is not in updating stage"));
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            }
        } else {
            setUnauthorizedAccess(true);
        }
    }, [id, transactionNumber]);

    return (
        <>
            {isLoading ? (
                <div>Please wait</div>
            ) :  message ? <h1>{message}</h1> :
            unauthorizedAccess ? (
                <Page401></Page401>
            ) : (
                <ViewPurchaseDetails transactionDetails={transaction} isRequestForUpdateStatus={true}></ViewPurchaseDetails>
            )}
        </>
    );
};

export default UpdatePurchaseStatus;
