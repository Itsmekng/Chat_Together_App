module.exports = (io,socket,activeUser) => {
    socket.on("inactiveUser",(inactiveUser) => {
        try{
            const index = activeUser.indexOf(inactiveUser.ActiveUser);

            if (index !== -1) {
                activeUser.splice(index, 1);
            }

            io.emit("inactiveUser",activeUser);
        }catch(err){
            console.log(err);
        }
    });
}