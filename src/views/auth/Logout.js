import React, { useEffect } from 'react'
import { doLogout } from '../../services/auth'
import { Navigate } from 'react-router-dom';

function Logout() {
    useEffect(()=>{
        doLogout();
    },[])

    return (
        <Navigate to={'/login'}></Navigate>
    )
}

export default Logout