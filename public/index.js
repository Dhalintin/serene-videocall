const socket = io('http://localhost:4000');
const peer = new Peer();
let myVideoStream;
let myId;
var videoGrid = document.getElementById('videoDiv')
var myvideo = document.getElementById('myVideo');
myvideo.muted = true;
const peerConnections = {}
navigator.mediaDevices.getUserMedia({
  video:true,
  audio:true
}).then((stream)=>{
  myVideoStream = stream;
  addVideo(myvideo , stream);
  peer.on('call' , call=>{
    call.answer(stream);
      const vid = document.getElementById('userVideo');
    call.on('stream' , userStream=>{
      addVideo(vid , userStream);
    })
    call.on('error' , (err)=>{
      alert(err)
    })
    call.on("close", () => {
        console.log(vid);
        vid.remove();
    })
    peerConnections[call.peer] = call;
  })
}).catch(err=>{
    alert(err.message)
})
peer.on('open' , (id)=>{
  myId = id;
  socket.emit("newUser", id, roomID);
})
peer.on('error' , (err)=>{
  alert(err.type);
});
socket.on('userJoined' , id=>{
  console.log("new user joined")
  const call  = peer.call(id , myVideoStream);
  const vid = document.createElement('video');
  call.on('error' , (err)=>{
    alert(err);
  })
  call.on('stream' , userStream=>{
    addVideo(vid , userStream);
  })
  call.on('close' , ()=>{
    vid.remove();
    console.log("user disconect")
  })
  peerConnections[id] = call;
})
socket.on('userDisconnect' , id=>{
  if(peerConnections[id]){
    peerConnections[id].close();
  }
})
function addVideo(video , stream){
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
}



//Handling other parts
async function getCallDetails(){
  try{
    const response = await fetch(`https://serene-lbyk.onrender.com/api/v1/session/${roomID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if(response.ok){
            const data = await response.json({});
            const calldata = data.data

            addParticipant(calldata.professionalId._id, calldata.professionalId.name, calldata.professionalId.image,)
            addParticipant(calldata.userId._id, calldata.userId.username, calldata.userId.avatar)
            // getChat(calldata.professionalId._id, calldata.userId._id)
        }

    } catch (error) {
        console.error('Error during fetch:', error);
    }
}

getCallDetails();

const participant = document.getElementById('participant')
function addParticipant(userId, username, image){
  participant.innerHTML += `<div class="flex items-center justify-left bg-[#191919] mt-3 mb-1 rounded-lg p-1 m-3 text-md" id=${userId}>
    <div class="ml-1 mr-2">
        <img src="${image}" alt="" class="rounded-full w-8 h-8 object-cover">
    </div>
    <div class="text-white mr-20 font-light w-64">${username}</div>
    <div class="flex justify-evenly p-1">
        <div class="mr-2">
            <img src="../images/svgs/2.svg" alt="">
        </div> 
        <div>
            <img src="../images/svgs/3.svg" alt="">
        </div>  
    </div>
</div>`
}


const chatForm = document.getElementById('msgForm');
// const userData = JSON.parse(localStorage.getItem('userData'));
// const username = userData.username
// console.log(username)

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const msg = e.target.msg.value;
  if(msg !== ''){
    // socket.emit('sendMessage', msg, username);
    addMessage(message, messageId, time);
    e.target.elements.msg.value = '';
  }
})
// 

// async function getChat(userId1, userId2){
//   try{
//     const response = await fetch(`https://serene-lbyk.onrender.com/api/v1/chat/getChat`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ userId1, userId2 })
//         });
//         if(response.ok){
//             const data = await response.json({});
//             const chatMessages = data.data
//             console.log(chatMessages)

//             // addParticipant(calldata.professionalId._id, calldata.professionalId.name, calldata.professionalId.image,)
//             // addParticipant(calldata.userId._id, calldata.userId.username, calldata.userId.avatar)
//             // getChat(calldata.professionalId._id, calldata.userId._id)
//         }
//   }catch(error) {
//     console.error('Error during fetch:', error);
// }
// }

socket.on('receiveMessage', (chatMessage) => {
  console.log(chatMessage)
  console.log(`[${chatMessage.time}] ${chatMessage.username}: ${chatMessage.message}`);
});

function addMessage (){

}
