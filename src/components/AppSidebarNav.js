import React from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

import { CBadge, CNavLink, CSidebarNav } from '@coreui/react'
import { userHasRole } from '../services/auth'

export const AppSidebarNav = ({ items }) => {
    const navLink = (name, icon, badge, indent = false) => {
        return (
            <>
                {icon
                    ? icon
                    : indent && (
                        <span className="nav-icon">
                            <span className="nav-icon-bullet"></span>
                        </span>
                    )}
                {name && name}
                {badge && (
                    <CBadge color={badge.color} className="ms-auto">
                        {badge.text}
                    </CBadge>
                )}
            </>
        )
    }

    const navItem = (item, index, indent = false) => {
        const { component, name, badge, icon, roleRequired, ...rest } = item
        const Component = component

        // Check if the user has the required role
        if (roleRequired && !userHasRole(roleRequired)) {   
            return null
        }

        return (
            <Component as="div" key={index}>
                {rest.to || rest.href ? (
                    <CNavLink {...(rest.to && { as: NavLink })} {...rest}>
                        {navLink(name, icon, badge, indent)}
                    </CNavLink>
                ) : (
                    navLink(name, icon, badge, indent)
                )}
            </Component>
        )
    }

    const navGroup = (item, index) => {
        const { component, name, icon, items, to, roleRequired, ...rest } = item
        const Component = component

        // Check if the user has the required role for the group
        if (roleRequired && !roleRequired.some(role => userHasRole(role))) {
            return null
        }

        return (
            <Component compact as="div" key={index} toggler={navLink(name, icon)} {...rest}>
                {item.items?.map((item, index) =>
                    item.items ? navGroup(item, index) : navItem(item, index, true),
                )}
            </Component>
        )
    }

    return (
        <CSidebarNav as={SimpleBar}>
            {items &&
                items.map((item, index) => (item.items ? navGroup(item, index) : navItem(item, index)))}
        </CSidebarNav>
    )
}

AppSidebarNav.propTypes = {
    items: PropTypes.arrayOf(PropTypes.any).isRequired,
}