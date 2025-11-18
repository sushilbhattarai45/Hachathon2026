import { WebSocketServer } from "ws";
import WebSocket from "ws";
import { subscribeMail } from "../controllers/mail/subscribe.js";

export interface AuthentiCatedWebSocket extends WebSocket{
    userId?: string;
    token ?: string;
}
export const userConnections = new Map<string, UserConnection>();


export interface UserConnection {
  ws: AuthentiCatedWebSocket;
  token: string;
  email: string; 
  userId?: string;
}

export const stratWebSocketConnections=async(server:any)=>{

  console.log("Starting WebSocket server...");

const wss = new WebSocketServer({server})

wss.on("connection", (ws:AuthentiCatedWebSocket)=>{
    console.log("connected")
    console.log(ws.userId)

    ws.on("message",async (msg:string)=>{

  
  try {
    const data = JSON.parse(msg)
    console.log(data)
    if( data.userId !=null)
    {
        ws.token = data.token
    if(!userConnections.has(ws.token!))
      {
let id = await  subscribeMail(ws.userId!,ws.token );
userConnections.set(id!, {
  ws,
  token: ws.token!,
  email: data.email,
  userId: id!
});
      console.log(`User ${id} connected via WebSocket`);

      ws.send(JSON.stringify({ message: "WebSocket connection established" , 
userId: id
      }));
      }
    }
  }
 catch (err) {
        console.log("Invalid WS message", err);
      }
  
    })
      ws.on("close", () => {
      if (ws.userId) {
        userConnections.delete(ws.userId);
        console.log(`User ${ws.userId} disconnected`);
      }
    });
})

}
