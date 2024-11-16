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

const ViewSaleDetails = ({ saleInfoFromViewPage, transactionDetails, isRequestForUpdateStatus }) => {
    const [isLoading, setLoading] = useState(true);
    const [isDownloading, setDownloading] = useState(false);
    const [message, setMessage] = useState({});


    const [sale, setSale] = useState(null);
    const { id, transactionNumber } = useParams();


    useEffect(() => {
        setSale(saleInfoFromViewPage);
    }, [saleInfoFromViewPage, id, transactionNumber])

    useEffect(() => {
        if (isRequestForUpdateStatus) {
            setSale(transactionDetails);
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
                            data && setSale(data)
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
            id: sale.id,
            transactionNumber: sale.transactionNumber,
            transactionStatus: status,
            rejectedNote: status === "REJECTED" ? rejectedNote : "", // Set the rejectedNote only for "REJECTED" status      
        };


        updatePurchaseStatus(requestBody)
            .then((data) => {
                toast.success("Sale Order (" + transactionNumber + ") status updated !!", {
                    position: "bottom-center",
                    theme: "dark",
                })
                navigate(`/procurement/view-sale-details/${id}/${transactionNumber}`)
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
            downloadPurchaseReport(sale.id, sale.transactionNumber);
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
                (sale == null ? <Page404></Page404>
                    :

                    <CCard>
                        <CCardHeader className='d-flex justify-content-between'>
                            {isRequestForUpdateStatus ? <h4>Update Sale Status</h4>
                                : <h4>Sale Details</h4>}
                            <div>
                                <button className='btn btn-success' onClick={handleDownload} disabled={isDownloading}>
                                    <CIcon icon={cilPrint}></CIcon> &nbsp;
                                    {isDownloading ? 'Downloading...' : 'PDF'}
                                </button> &nbsp;
                                {saleInfoFromViewPage && <Link target='_blank' to={`/procurement/view-sale-details/${sale.id}/${sale.transactionNumber}`} className='btn btn-info'>View in separate page</Link>}
                            </div>
                        </CCardHeader>
                        <CCardBody className='purchase-details-card-body'>
                            <table className="purchase-details-view-table table table-bordered table-striped">
                                <tbody>
                                    <tr>
                                        <th>Sale Order</th>
                                        <td>{sale.transactionNumber}</td>
                                    </tr>
                                    <tr>
                                        <th>Transaction Type</th>
                                        <td>{sale.transactionType}</td>
                                    </tr>
                                    <tr>
                                        <th>Store</th>
                                        <td>
                                            <p><b>Name : </b>{sale.store.storeName}</p>
                                            <p><b>Code:</b> {sale.store.storeCode}</p>
                                            <p><b>Address:</b> {sale.store.address}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Customer</th>
                                        <td>
                                            <p><b>Name : </b>{sale.partner.name}</p>
                                            <p><b>Phone : </b>{sale.partner.phone}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Sale Date</th>
                                        <td>
                                            {formatDate(sale.transactionDate)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Total Amount</th>
                                        <td>
                                            {sale.totalAmount} Taka
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Status</th>
                                        <td>
                                            {sale.transactionStatus === "REJECTED" ? <b style={{color:"red"}}>{sale.transactionStatus}</b> :sale.transactionStatus}
                                            
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Remark</th>
                                        <td>
                                            {sale.remark}
                                        </td>
                                    </tr>
                                    {sale.transactionStatus === "REJECTED" &&

                                        <>
                                            <tr>
                                                <th>Rejected By</th>
                                                <td>
                                                    {sale.rejectedBy.name}
                                                </td>
                                            </tr>

                                            <tr>
                                                <th>Rejected Date</th>
                                                <td>
                                                    {formatDate(sale.rejectedDate)}
                                                </td>
                                            </tr>

                                            <tr>
                                                <th>Reason</th>
                                                <td>
                                                    {sale.rejectedNote}
                                                </td>
                                            </tr>
                                        </>
                                    }

                                </tbody>
                            </table>


                            <br></br>
                            <h4>Products Info</h4>

                            <table className="sale-details-view-table table table-bordered table-striped">
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
                                    {sale.transactionDetails && sale.transactionDetails.length > 0 ? (
                                        sale.transactionDetails.map((detail) => (
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
                                        <th>Discount {sale.discountRemark && "(" + sale.discountRemark + ")"}:</th>
                                        <td>{sale.discountAmount} Tk</td>
                                    </tr>
                                    <tr>
                                        <th>Charge {sale.chargeRemark && "(" + sale.chargeRemark + ")"}:</th>
                                        <td>{sale.chargeAmount} Tk</td>
                                    </tr>
                                </tbody>
                            </table>

                        </CCardBody>

                        {isRequestForUpdateStatus &&
                            <CCardFooter style={{ textAlign: 'right' }}>
                                {sale.transactionStatus === "CLOSED" && <div className='text-info text-center'>The sale order has been closed! No action available to perform.</div>}
                                {(sale.transactionStatus === "SUBMITTED" || sale.transactionStatus === "REJECTED" || sale.transactionStatus === "REJECTED_MODIFIED") && (
                                    <button className='btn btn-success btn-sm me-2' onClick={() => updateStatus("APPROVED")}>
                                        Approve
                                    </button>
                                )}
                                {/* {(sale.transactionStatus === "SUBMITTED") && <button className='btn btn-danger btn-sm me-2' onClick={() => updateStatus("REJECTED")}>Reject</button>} */}
                                {(sale.transactionStatus === "SUBMITTED" || sale.transactionStatus === "REJECTED_MODIFIED") && (
                                    <button className='btn btn-danger btn-sm me-2' onClick={handleRejectClick}>
                                        Reject
                                    </button>
                                )}
                                {(sale.transactionStatus === "APPROVED" || sale.transactionStatus === "REJECTED" || sale.transactionStatus === "REJECTED_MODIFIED") && <button onClick={() => updateStatus("CLOSED")} className='btn btn-warning btn-sm me-2'>Close</button>}
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

export default ViewSaleDetails
