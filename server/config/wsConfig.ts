import { WebSocketServer } from "ws";
import WebSocket from "ws";

export interface AuthentiCatedWebSocket extends WebSocket{
    userId?: string;
}


export const userConnections= new Map<string , AuthentiCatedWebSocket>()



export const stratWebSocketConnections=async(server:any)=>{

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
        ws.userId = data.userId
        userConnections.set(
        data.userId,ws
        )
          console.log(`User ${data.userId} authenticated & connected`);
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
