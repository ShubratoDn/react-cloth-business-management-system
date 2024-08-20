import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CContainer, CSpinner } from '@coreui/react';
import routes from '../routes';
import Page404 from '../views/pages/page404/Page404';
import { userHasRole } from '../services/auth';

const AppContent = () => {
    return (
        <CContainer className="px-4" lg>
            <Suspense fallback={<CSpinner color="primary" />}>
                <Routes>
                    {routes.map((route, idx) => {
                        const Component = route.element;
                        
                        if (!Component) {
                            console.error(`Route component is undefined for path: ${route.path}`);
                            return null;
                        }

                        // Determine whether to render the component based on role requirement
                        const shouldRender = !route.roleRequired || userHasRole(route.roleRequired);

                        return (
                            <Route
                                key={idx}
                                path={route.path}
                                element={shouldRender ? <Component /> : <Navigate to="/401" />}
                            />
                        );
                    })}
                    <Route path="/" element={<Navigate to="dashboard" replace />} />
                    <Route path="*" element={<Page404 />} />
                </Routes>
            </Suspense>
        </CContainer>
    );
};

export default React.memo(AppContent);
