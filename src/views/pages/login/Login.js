import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    CButton,
    CCard,
    CCardBody,
    CCardGroup,
    CCol,
    CContainer,
    CForm,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { userLogin } from '../../../services/userServices'
import { toast } from 'react-toastify'
import { doLogin } from '../../../services/auth'

const Login = () => {

    const [loginDetails, setLoginDetails] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("")

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginDetails(prevState => ({ ...prevState, [name]: value }));
    };



    const loginFunctionality = (e) => {
        setIsLoading(true);
        setErrorMessage("");

        e.preventDefault();
        userLogin(loginDetails)
            .then((respData) => {
                //login success messages
                doLogin(respData, ()=>{
                    navigate("/")
                });
            })
            .catch((err) => {
                console.log(err.response)
                if (err.code === 'ERR_NETWORK') {
                    setErrorMessage("Failed to create connection with backend. Please contact with Shubrato")
                }

                setErrorMessage(err.response.data.message);
            })
            .finally(() => {
                setIsLoading(false);
            })
    }



    return (
        <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
            <CContainer>
                <CRow className="justify-content-center">
                    <CCol md={8}>
                        <CCardGroup>
                            <CCard className="p-4">
                                <CCardBody>
                                    <CForm onSubmit={loginFunctionality}>
                                        <h1>Login</h1>
                                        <p className="text-body-secondary">Sign In to your account</p>
                                        {isLoading && "Loading..."}

                                        {errorMessage && <div className='alert alert-danger text-sm'> {errorMessage}</div>}

                                        <CInputGroup className="mb-3">
                                            <CInputGroupText>
                                                <CIcon icon={cilUser} />
                                            </CInputGroupText>
                                            <CFormInput
                                                placeholder="Username"
                                                autoComplete="username"
                                                name='username'
                                                value={loginDetails.username}
                                                onChange={handleChange}
                                            />
                                        </CInputGroup>
                                        <CInputGroup className="mb-4">
                                            <CInputGroupText>
                                                <CIcon icon={cilLockLocked} />
                                            </CInputGroupText>
                                            <CFormInput
                                                type="password"
                                                placeholder="Password"
                                                autoComplete="current-password"
                                                name='password'
                                                value={loginDetails.password}
                                                onChange={handleChange}
                                            />
                                        </CInputGroup>
                                        <CRow>
                                            <CCol xs={6}>
                                                <CButton color="primary" className="px-4" type='submit'>
                                                    Login
                                                </CButton>
                                            </CCol>
                                            <CCol xs={6} className="text-right">
                                                <CButton color="link" className="px-0">
                                                    Forgot password?
                                                </CButton>
                                            </CCol>
                                        </CRow>
                                    </CForm>
                                </CCardBody>
                            </CCard>
                            <CCard className="text-white bg-primary py-5">
                                <CCardBody className="text-center">
                                    <div>
                                        <h2>Sign up</h2>
                                        <p>
                                            Cloth Business Management System <br></br>
                                            - A software to efficiently manage your business.
                                        </p>
                                        <p>Want to be a user of us? Contact with admin.</p>
                                        Phone: 01759458961 <br></br>
                                        Email: shubratodn44985@gmail.com

                                    </div>
                                </CCardBody>
                            </CCard>
                        </CCardGroup>
                    </CCol>
                </CRow>
            </CContainer>
        </div>
    )
}

export default Login
