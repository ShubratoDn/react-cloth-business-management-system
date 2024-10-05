import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { userHasRole } from "services/auth";
import { findPurchaseByIdAndPO } from "services/purchaseServices";
import ViewPurchaseDetails from "./ViewPurchaseDetails";
import Page401 from "views/pages/page401/Page401";

const UpdatePurchaseStatus = () => {
  const [isLoading, setLoading] = useState(true);
  const [unauthorizedAccess, setUnauthorizedAccess] = useState(false);

  const [purchase, setPurchase] = useState(null);
  const { id, poNumber } = useParams();

  useEffect(() => {
    setLoading(false);
    if (userHasRole("ROLE_PURCHASE_AUTHORIZATION")) {
      if (id && poNumber) {
        setLoading(true);
        findPurchaseByIdAndPO(id, poNumber)
          .then((data) => {
            data && (data.purchaseStatus !== "OPEN" && data.purchaseStatus !== "REJECTED_MODIFIED") && setPurchase(data);
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
  }, [id, poNumber]);

  return (
    <>
      {isLoading ? (
        <div>Please wait</div>
      ) : unauthorizedAccess ? (
        <Page401></Page401>
      ) : (
        <ViewPurchaseDetails purchaseDetails={purchase} isRequestForUpdateStatus={true}></ViewPurchaseDetails>
      )}
    </>
  );
};

export default UpdatePurchaseStatus;
