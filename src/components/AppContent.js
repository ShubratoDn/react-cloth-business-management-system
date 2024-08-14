import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'

// routes config
import routes from '../routes'
import Colors from '../views/theme/colors/Colors'
import { userHasRole } from '../services/auth'
import Page404 from '../views/pages/page404/Page404'

const AppContent = () => {
    return (
        <CContainer className="px-4" lg>
            <Suspense fallback={<CSpinner color="primary" />}>
                <Routes>

                    {userHasRole("ROLE_USER_CREATE") && <Route path={"/users"} element={<Colors></Colors>} ></Route>}

                    {routes.map((route, idx) => {
                        return (
                            userHasRole(route.roleRequired) && route.element && (
                                <Route
                                    key={idx}
                                    path={route.path}
                                    exact={route.exact}
                                    name={route.name}
                                    element={<route.element />}
                                />
                            )
                        )
                    })}
                    <Route path="/" element={<Navigate to="dashboard" replace />} />
                    <Route path="*" element={<Page404></Page404>} />
                </Routes>
            </Suspense>
        </CContainer>
    )
}

export default React.memo(AppContent)
