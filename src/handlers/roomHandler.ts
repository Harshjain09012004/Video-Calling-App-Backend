import { Socket } from "socket.io";
import { v4 as UUIDv4 } from "uuid";

// It contains roomId corresponding to the participants list
const rooms : Record<string, string[]> = {};

const roomHandler = (socket: Socket) => {

    const createRoom = () => {
        // this will be our unique room id in which multiple
        // connection will exchange data
        const roomId = UUIDv4();
        rooms[roomId] = []; // Create the key for current room

        // we will make the socket connection enter a new room
        // socket.join(roomId);

        // we will emit an event from server side that
        // socket connection has been added to a room
        socket.emit("room-created", { roomId });
        console.log("Room created with id", roomId);
    };

    /**
     * The below function will be called each time when a
     * creator or participant joins the room
     */
    const joinRoom = ({roomId, peerId}: {roomId: string, peerId: string})=>{
        if(rooms[roomId]){
            rooms[roomId].push(peerId);
            socket.join(roomId); // Make the user join the socket room

            // This event will be triggered by the frontend
            // Once the user joins the room with roomId
            socket.on("ready", ()=>{
                // All the participants of the room will receive this event
                socket.to(roomId).emit("user-joined", {peerId});
            });

            console.log("New user joined room :", roomId);
            console.log("PeerId: ", peerId);
            socket.emit("get-users", {roomId, participants: rooms[roomId]});
        }
    };

    // We will call the above two function when the client will
    // emit events top create room and join room
    socket.on("create-room", createRoom);
    socket.on("join-room", joinRoom);
};

export default roomHandler;