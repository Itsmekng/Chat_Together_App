const { Sequelize } = require('sequelize');

const connection = new Sequelize('chat_together','root','admin',{
    host: 'localhost',
    dialect: 'mysql'
});

(async () => {
    {
        try{
            await connection.authenticate();
            console.log("DB connect !!!");
        }catch(err){
            console.log(err);
            process.exit(1);
        }
    }
})()

module.exports = connection;