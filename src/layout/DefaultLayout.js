import React, { useState } from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { getLoggedInUsersRole, isUserLoggedIn, userHasRole } from '../services/auth'
import { Navigate } from 'react-router-dom'


const DefaultLayout = () => {

    return (!isUserLoggedIn() ? <Navigate to={"/login"}></Navigate> :
        <div>
            <AppSidebar />
            <div className="wrapper d-flex flex-column min-vh-100">
                <AppHeader />
                <div className="body flex-grow-1">
                    <AppContent />
                </div>
                <AppFooter />
            </div>
        </div>
    )
}

export default DefaultLayout
