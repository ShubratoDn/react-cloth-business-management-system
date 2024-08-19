import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getAllRoles } from 'services/userRoleService';
import { getUserById } from 'services/userServices';

const AssignRoleComponent = ({ user, onBackButtonClick }) => {
    const [userRoles, setUserRoles] = useState([]);
    const [allRoles, setAllRoles] = useState([]);
    const [rolesByCategory, setRolesByCategory] = useState({});
    const [selectedCategories, setSelectedCategories] = useState({});
    const [selectedRoles, setSelectedRoles] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allRolesResponse, userResponse] = await Promise.all([
                    getAllRoles(),
                    getUserById(user.id)
                ]);

                setUserRoles(userResponse.roles);

                const rolesByCategoryTemp = allRolesResponse.reduce((acc, role) => {
                    if (!acc[role.category]) {
                        acc[role.category] = [];
                    }
                    acc[role.category].push(role);
                    return acc;
                }, {});

                const selectedCategoriesTemp = Object.keys(rolesByCategoryTemp).reduce((acc, category) => {
                    acc[category] = false;
                    return acc;
                }, {});

                const selectedRolesTemp = allRolesResponse.reduce((acc, role) => {
                    acc[role.id] = userResponse.roles.some(userRole => userRole.role === role.role);
                    return acc;
                }, {});

                setAllRoles(allRolesResponse);
                setRolesByCategory(rolesByCategoryTemp);
                setSelectedCategories(selectedCategoriesTemp);
                setSelectedRoles(selectedRolesTemp);
                
            } catch (err) {
                const errMessages = err.response?.data?.message || 'Failed to fetch data';
                toast.error(`${errMessages}`, {
                    position: "bottom-center",
                    theme: "dark",
                });
            }
        };

        fetchData();
    }, [user]);

    const handleCategoryCheckboxChange = (category) => {
        const isChecked = !selectedCategories[category];
        setSelectedCategories(prev => ({
            ...prev,
            [category]: isChecked
        }));
        if (isChecked) {
            setSelectedRoles(prev => {
                const updatedRoles = { ...prev };
                rolesByCategory[category].forEach(role => {
                    updatedRoles[role.id] = true;
                });
                return updatedRoles;
            });
        } else {
            setSelectedRoles(prev => {
                const updatedRoles = { ...prev };
                rolesByCategory[category].forEach(role => {
                    updatedRoles[role.id] = false;
                });
                return updatedRoles;
            });
        }
    };

    const handleRoleCheckboxChange = (roleId) => {
        setSelectedRoles(prev => ({
            ...prev,
            [roleId]: !prev[roleId]
        }));
    };

    const roleCheckbox = (role) => {
        const isChecked = selectedRoles[role.id];

        return (
            <div className="form-check" key={role.id}>
                <input
                    className="form-check-input"
                    type="checkbox"
                    value={role.id}
                    id={role.role}
                    checked={isChecked}
                    onChange={() => handleRoleCheckboxChange(role.id)}
                />
                <label className="form-check-label" htmlFor={role.role}>
                    {role.title}
                </label>
            </div>
        );
    };

    const resetSelections = () => {
        const resetRoles = {};
        userRoles.forEach(role => {
            resetRoles[role.id] = true;
        });
        setSelectedRoles(resetRoles);
        
        const resetCategories = {};
        Object.keys(rolesByCategory).forEach(category => {
            resetCategories[category] = rolesByCategory[category].every(role => resetRoles[role.id]);
        });
        setSelectedCategories(resetCategories);
    };

    const logSelectedItems = () => {
        console.log("Selected Roles:");
        Object.keys(selectedRoles).forEach(roleId => {            
            if (selectedRoles[roleId]) {
                const role = allRoles.find(role => role.id === roleId);
                if (role) {
                    console.log(`- ${role.title} (ID: ${roleId})`);
                }
            }
        });
    };


    return (
        <div>
            <div className='d-flex justify-content-between mb-4'>
                <h4>Assigning Role for User: {user.name}</h4>
                <button className='btn btn-info' onClick={() => onBackButtonClick(true)}>Back</button>
            </div>

            <div className='row'>
                {Object.keys(rolesByCategory).map(category => (
                    <div className='col-md-3 mb-2' key={category}>
                        <div className='card p-2'>
                            <div className='d-flex align-items-center'>
                                <input
                                    type='checkbox'
                                    id={`category-${category}`}
                                    className='me-2'
                                    checked={selectedCategories[category]}
                                    onChange={() => handleCategoryCheckboxChange(category)}
                                />
                                <label htmlFor={`category-${category}`} className='mb-0' style={{fontSize:"25px", fontWeight:"bolder"}}>{category}</label>
                            </div>
                            <div>
                                {rolesByCategory[category].map(role => role.isActive && roleCheckbox(role))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className='btn btn-primary' onClick={resetSelections}>RESET</button>
            <button className='btn btn-secondary ms-2' onClick={logSelectedItems}>LOG SELECTED</button>
        </div>
    );
}

export default AssignRoleComponent;
