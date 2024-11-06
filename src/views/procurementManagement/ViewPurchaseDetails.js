import { Button } from '@coreui/coreui';
import { cilPrint } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react';
import { BASE_URL } from 'configs/axiosConfig';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCurrentUserInfo, userHasRole } from 'services/auth';
import { downloadPurchaseReport, findPurchaseByIdAndPO, generatePOPdf, updatePurchaseStatus } from 'services/purchaseServices';
import { formatDate } from 'services/utils';
import Page404 from 'views/pages/page404/Page404';

const ViewPurchaseDetails = ({ purchaseInfoFromViewPage, transactionDetails, isRequestForUpdateStatus }) => {
    const [isLoading, setLoading] = useState(true);
    const [isDownloading, setDownloading] = useState(false);
    const [message, setMessage] = useState({});


    const [purchase, setPurchase] = useState(null);
    const { id, transactionNumber } = useParams();


    useEffect(() => {
        setPurchase(purchaseInfoFromViewPage);
    }, [purchaseInfoFromViewPage, id, transactionNumber])

    useEffect(() => {
        if (isRequestForUpdateStatus) {
            setPurchase(transactionDetails);
        }
    }, [isRequestForUpdateStatus])


    useEffect(() => {
        setLoading(false)
        if (!isRequestForUpdateStatus) {
            if (id && transactionNumber) {
                setLoading(true)
                findPurchaseByIdAndPO(id, transactionNumber)
                    .then((data) => {
                        console.log(data)
                        if ((getCurrentUserInfo().id === data.processedBy.id) || userHasRole("ROLE_PURCHASE_GET")) {
                            data && setPurchase(data)
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                    .finally(() => {
                        setLoading(false)
                    })
            }
        }
    }, [id, transactionNumber])



    const [showRejectModal, setShowRejectModal] = useState(false); // State to control the reject modal visibility
    const [rejectedNote, setRejectedNote] = useState(""); // State to capture the reject note

    const navigate = useNavigate();

    const updateStatus = (status) => {
        const requestBody = {
            id: purchase.id,
            transactionNumber: purchase.transactionNumber,
            transactionStatus: status,
            rejectedNote: status === "REJECTED" ? rejectedNote : "", // Set the rejectedNote only for "REJECTED" status      
        };


        updatePurchaseStatus(requestBody)
            .then((data) => {
                toast.success("Purchase Order (" + transactionNumber + ") status updated !!", {
                    position: "bottom-center",
                    theme: "dark",
                })
                navigate(`/procurement/view-purchase-details/${id}/${transactionNumber}`)
            })
            .catch((err) => {
                console.log(err)
            })
            .finally(() => {

            })

    }


    // Function to handle the Reject button click
    const handleRejectClick = () => {
        setShowRejectModal(true); // Show the reject modal
    };


    // Function to handle modal submission
    const handleRejectSubmit = () => {
        setShowRejectModal(false); // Close the modal
        updateStatus("REJECTED"); // Update the status with the rejection reason
    };



    const handleDownload = async () => {
        setDownloading(true);
        try {
            downloadPurchaseReport(purchase.id, purchase.transactionNumber);
        } catch (error) {
            alert('Could not download the report. Please try again.');
        } finally {
            setTimeout(() => {
                setDownloading(false);
            }, 1000)
        }
    };


    return (
        <>
            {isLoading ? <div>Please Wait</div>
                :
                (purchase == null ? <Page404></Page404>
                    :

                    <CCard>
                        <CCardHeader className='d-flex justify-content-between'>
                            {isRequestForUpdateStatus ? <h4>Update Purchase Status</h4>
                                : <h4>Purchase Details</h4>}
                            <div>
                                <button className='btn btn-success' onClick={handleDownload} disabled={isDownloading}>
                                    <CIcon icon={cilPrint}></CIcon> &nbsp;
                                    {isDownloading ? 'Downloading...' : 'PDF'}
                                </button> &nbsp;
                                {purchaseInfoFromViewPage && <Link target='_blank' to={`/procurement/view-purchase-details/${purchase.id}/${purchase.transactionNumber}`} className='btn btn-info'>View in separate page</Link>}
                            </div>
                        </CCardHeader>
                        <CCardBody className='purchase-details-card-body'>
                            <table className="purchase-details-view-table table table-bordered table-striped">
                                <tbody>
                                    <tr>
                                        <th>Purchase Order</th>
                                        <td>{purchase.transactionNumber}</td>
                                    </tr>
                                    <tr>
                                        <th>Store</th>
                                        <td>
                                            <p><b>Name : </b>{purchase.store.storeName}</p>
                                            <p><b>Code:</b> {purchase.store.storeCode}</p>
                                            <p><b>Address:</b> {purchase.store.address}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Supplier</th>
                                        <td>
                                            <p><b>Name : </b>{purchase.partner.name}</p>
                                            <p><b>Phone : </b>{purchase.partner.phone}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Purchase Date</th>
                                        <td>
                                            {formatDate(purchase.transactionDate)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Total Amount</th>
                                        <td>
                                            {purchase.totalAmount} Taka
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Status</th>
                                        <td>
                                            {purchase.transactionStatus === "REJECTED" ? <b style={{color:"red"}}>{purchase.transactionStatus}</b> :purchase.transactionStatus}
                                            
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Remark</th>
                                        <td>
                                            {purchase.remark}
                                        </td>
                                    </tr>
                                    {purchase.transactionStatus === "REJECTED" &&

                                        <>
                                            <tr>
                                                <th>Rejected By</th>
                                                <td>
                                                    {purchase.rejectedBy.name}
                                                </td>
                                            </tr>

                                            <tr>
                                                <th>Rejected Date</th>
                                                <td>
                                                    {formatDate(purchase.rejectedDate)}
                                                </td>
                                            </tr>

                                            <tr>
                                                <th>Reason</th>
                                                <td>
                                                    {purchase.rejectedNote}
                                                </td>
                                            </tr>
                                        </>
                                    }

                                </tbody>
                            </table>


                            <br></br>
                            <h4>Products Info</h4>

                            <table className="purchase-details-view-table table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Size</th>
                                        <th>Category</th>
                                        <th>Unit Price</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchase.transactionDetails && purchase.transactionDetails.length > 0 ? (
                                        purchase.transactionDetails.map((detail) => (
                                            <tr key={detail.id}>
                                                <td>{detail.id}</td>
                                                <td>
                                                    {detail.image ? (
                                                        <img src={BASE_URL + detail.image} alt={detail.product.name} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "50%", display: "block", margin: "0 auto" }} />
                                                    ) : (
                                                        <img src={BASE_URL + detail.product.image} alt={detail.product.name} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "50%", display: "block", margin: "0 auto" }} />
                                                    )}
                                                </td>
                                                <td>{detail.product.name}</td>
                                                <td>{detail.product.size}</td>
                                                <td>{detail.product.category ? detail.product.category.name : 'N/A'}</td>
                                                <td>{detail.price}</td>
                                                <td>{detail.quantity}</td>
                                                <td>{detail.price * detail.quantity}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center">No Products Found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <table>
                                <tbody>
                                    <tr>
                                        <th>Discount {purchase.discountRemark && "(" + purchase.discountRemark + ")"}:</th>
                                        <td>{purchase.discountAmount} Tk</td>
                                    </tr>
                                    <tr>
                                        <th>Charge {purchase.chargeRemark && "(" + purchase.chargeRemark + ")"}:</th>
                                        <td>{purchase.chargeAmount} Tk</td>
                                    </tr>
                                </tbody>
                            </table>

                        </CCardBody>

                        {isRequestForUpdateStatus &&
                            <CCardFooter style={{ textAlign: 'right' }}>
                                {purchase.transactionStatus === "CLOSED" && <div className='text-info text-center'>The purchase order has been closed! No action available to perform.</div>}
                                {(purchase.transactionStatus === "SUBMITTED" || purchase.transactionStatus === "REJECTED" || purchase.transactionStatus === "REJECTED_MODIFIED") && (
                                    <button className='btn btn-success btn-sm me-2' onClick={() => updateStatus("APPROVED")}>
                                        Approve
                                    </button>
                                )}
                                {/* {(purchase.transactionStatus === "SUBMITTED") && <button className='btn btn-danger btn-sm me-2' onClick={() => updateStatus("REJECTED")}>Reject</button>} */}
                                {(purchase.transactionStatus === "SUBMITTED" || purchase.transactionStatus === "REJECTED_MODIFIED") && (
                                    <button className='btn btn-danger btn-sm me-2' onClick={handleRejectClick}>
                                        Reject
                                    </button>
                                )}
                                {(purchase.transactionStatus === "APPROVED" || purchase.transactionStatus === "REJECTED" || purchase.transactionStatus === "REJECTED_MODIFIED") && <button onClick={() => updateStatus("CLOSED")} className='btn btn-warning btn-sm me-2'>Close</button>}
                            </CCardFooter>
                        }
                    </CCard>

                )}


            {/* Reject Reason Modal */}
            <CModal visible={showRejectModal} onClose={() => setShowRejectModal(false)}>
                <CModalHeader closeButton>
                    <CModalTitle>Reject Purchase Order</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <label>Please provide a reason for rejection:</label>
                    <textarea
                        className='form-control mt-2'
                        rows='4'
                        value={rejectedNote}
                        onChange={(e) => setRejectedNote(e.target.value)}
                        placeholder='Enter rejection reason here...'
                    />
                </CModalBody>
                <CModalFooter>
                    <CButton className='btn btn-secondary' onClick={() => setShowRejectModal(false)}>
                        Cancel
                    </CButton>
                    <CButton className='btn btn-danger' onClick={handleRejectSubmit} disabled={!rejectedNote.trim()}>
                        Reject Purchase
                    </CButton>
                </CModalFooter>
            </CModal>


        </>
    );
}

export default ViewPurchaseDetails
