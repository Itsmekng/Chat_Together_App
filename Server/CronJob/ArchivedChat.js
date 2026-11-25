const { CronJob } = require('cron');
const { ChatMessage } = require('../Model');
const ArchivedChat = require('../Model/archivedChat.model');
const sequelize = require('../DB/connection.js');

const CronJobByCall = async () => {
    try {
        return await sequelize.transaction(async (transaction) => {

            const todayChat = await ChatMessage.findAll({
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (todayChat.length === 0) {
                console.log("No chats found");
                return false;
            }

            const archivedData = todayChat.map(chat => ({
                message: chat.message,
                message_type: chat.message_type,
                file_url: chat.file_url,
                status: chat.status,
                chatDate_time: chat.createdAt,
                ChatTypeId: chat.ChatTypeId,
                UserId: chat.UserId
            }));

            await ArchivedChat.bulkCreate(archivedData, {
                transaction
            });

            // Delete only the messages that were archived
            const messageIds = todayChat.map(chat => chat.id);

            await ChatMessage.destroy({
                where: {
                    id: messageIds
                },
                transaction
            });

            console.log("All chats archived successfully");

            return true;
        });

    } catch (err) {
        console.log(err);
        return false;
    }
};

const job = new CronJob(
    '0 0 * * *',
    async function () {
        await CronJobByCall();
    },
    null,
    true,
    'America/Los_Angeles'
);

module.exports = { job, CronJobByCall };