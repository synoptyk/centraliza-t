import { useState, useEffect } from 'react';

const usePermissions = (moduleId) => {
    const [permissions, setPermissions] = useState({
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false
    });

    useEffect(() => {
        const userStr = localStorage.getItem('centralizat_user') || sessionStorage.getItem('centralizat_user');
        if (userStr) {
            const user = JSON.parse(userStr);

            // Super Admins and Admin_Centralizat have full access
            if (user.role === 'Ceo_Centralizat' || user.role === 'Admin_Centralizat') {
                setPermissions({
                    canCreate: true,
                    canRead: true,
                    canUpdate: true,
                    canDelete: true
                });
                return;
            }

            // Check specific module permissions
            const modulePerm = user.permissions?.find(p => p.module === moduleId);

            if (modulePerm && modulePerm.actions) {
                setPermissions({
                    canCreate: !!modulePerm.actions.create,
                    canRead: !!modulePerm.actions.read,
                    canUpdate: !!modulePerm.actions.update,
                    canDelete: !!modulePerm.actions.delete
                });
            } else {
                // Fallback for legacy permissions or no permissions
                // If no specific permission found, assume NO access
                setPermissions({
                    canCreate: false,
                    canRead: false,
                    canUpdate: false,
                    canDelete: false
                });
            }
        }
    }, [moduleId]);

    return permissions;
};

export default usePermissions;
