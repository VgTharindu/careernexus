const prisma = require('./db');

const createNotification = async (userId, message, type = 'info') => {
  try {
    await prisma.notification.create({
      data: { userId, message, type }
    });
  } catch (error) {
    console.error('Notification error:', error.message);
  }
};

module.exports = { createNotification };