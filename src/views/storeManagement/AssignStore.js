import AssignRoleComponent from 'components/role/AssignRoleComponent';
import AssignStoreComponent from 'components/store/AssignStoreComponent';
import FindUserComponent from 'components/user/FindUserComponent';
import React, { useState } from 'react'
import { userHasRole } from 'services/auth';

const AssignStore = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAssigningStore, setIsAssigningStore] = useState(false);

    const handleAssignButtonClick = (user) => {
        setSelectedUser(user);
        setIsAssigningStore(true);
    };

    const handleBackButton =()=>{
        setIsAssigningStore(false);
    }

    return (
        <div>
            {!isAssigningStore ? (
                <FindUserComponent
                    hasAssignStorePermission={userHasRole("ROLE_STORE_ASSIGN")}
                    title={"Select User for Assigning Stores"}
                    onAssignRoleClick={handleAssignButtonClick}
                />
            ) : (
                <AssignStoreComponent user={selectedUser} onBackButtonClick={handleBackButton} />
            )}
        </div>
    )
}

export default AssignStore
