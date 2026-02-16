const Notification = require('../models/Notification');

/**
 * @desc    Get all notifications for the user's company
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
    try {
        const companyId = req.user.companyId;

        // If user is Ceo_Centralizat, they might see all? 
        // Instructions: "notificaciones les llega a todos los usuarios dependeindo de su empresa espesifica, no ver notificaciones de otras empresas"
        // So even CEO should probably only see what's relevant or everything. 
        // For now, let's stick to company isolation.

        let query = { isActive: true };
        if (req.user.role !== 'Ceo_Centralizat') {
            query.companyId = companyId;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('applicantId', 'fullName rut')
            .populate('projectId', 'name');

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Mark a notification as read by the current user
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }

        // Add user to readBy if not already there
        if (!notification.readBy.includes(req.user._id)) {
            notification.readBy.push(req.user._id);
            await notification.save();
        }

        res.json({ message: 'Notificación marcada como leída' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Internal Utility Function (not a route handler)
 * Creates a notification programmatically
 */
const createInternalNotification = async ({ companyId, title, message, type, applicantId, projectId }) => {
    try {
        await Notification.create({
            companyId,
            title,
            message,
            type,
            applicantId,
            projectId
        });
        return true;
    } catch (error) {
        console.error('Error creating internal notification:', error.message);
        return false;
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    createInternalNotification
};
