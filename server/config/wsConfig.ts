import { WebSocketServer } from "ws";
import WebSocket from "ws";
import { subscribeMail } from "../controllers/mail/subscribe.js";

export interface AuthentiCatedWebSocket extends WebSocket{
    userId?: string;
    token?: string;
}


export const userConnections= new Map<string , AuthentiCatedWebSocket>()



export const stratWebSocketConnections=async(server:any)=>{

  console.log("Starting WebSocket server...");

const wss = new WebSocketServer({server})

wss.on("connection", (ws:AuthentiCatedWebSocket)=>{
    console.log("connected")
    ws.on("message",async (msg:string)=>{
  
  try {
    const data = JSON.parse(msg)
    console.log(data)
    if( data.userId !=null)
    {
        ws.userId = data.userId
        ws.token = data.token
        userConnections.set(
        data.userId, ws)

        
        console.log(`User ${data.userId} authenticated & connected`);
if (ws.token && ws.userId)
     subscribeMail(ws.userId, ws.token)
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


