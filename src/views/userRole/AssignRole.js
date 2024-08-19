import AssignRoleComponent from 'components/role/AssignRoleComponent'
import FindUserComponent from 'components/user/FindUserComponent'
import React, { useState } from 'react'
import { userHasRole } from 'services/auth'

const AssignRole = () => {

    const [selectedUser, setSelectedUser] = useState(null);
    const [isAssigningRole, setIsAssigningRole] = useState(false);

    const handleAssignRoleClick = (user) => {
        setSelectedUser(user);
        setIsAssigningRole(true);
    };

    const handleBackButton =()=>{
        setIsAssigningRole(false);
    }

    return (
        <div>
            {!isAssigningRole ? (
                <FindUserComponent
                    hasAssignRolePermission={userHasRole("ROLE_ROLE_ASSIGN")}
                    title={"Search Results for Assigning Roles"}
                    onAssignRoleClick={handleAssignRoleClick}
                />
            ) : (
                <AssignRoleComponent user={selectedUser} onBackButtonClick={handleBackButton} />
            )}
        </div>
    )
}

export default AssignRole
