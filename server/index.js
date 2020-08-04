
const express=require('express');
const socketIo=require('socket.io');
const http=require('http');
const {addUser,removeUser,getUser}=require('./user');
const cors=require('cors')

app.use(cors());
const app=express();

const PORT=process.env.PORT || 8000 ;

const server=http.createServer(app);
const io=socketIo(server);

io.on('connect', socket => {
    socket.on('join',({name,room},callback)=>{
        console.log(`${name} is joined`)
        const {error,user}=addUser({id:socket.id,name,room})

        if(error){
            return callback(error);
        }
        socket.emit('message',{user:'admin',text:` ${user.name} you joined in the Room  ${user.room}`})
        socket.broadcast.to(user.room).emit('message',{user:'admin',text:`${user.name} is joined!`})
        socket.join(user.room);


        callback();
    })
    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id);
        io.to(user.room).emit('message',{user:user.name,text:message})

        callback();
    })

    socket.on('disconnect',()=>{
        console.log('user is left!!!')
        const user=removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',{user:'admin',text:`${user.name} is left !`})
        }

    })
  });



server.listen(PORT,()=>{
    console.log(`server is listen at ${PORT} `)
})