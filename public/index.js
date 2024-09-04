const socket = io('/');
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
            const calldata = data.data;

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

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const msg = e.target.msg.value;
  if(msg !== ''){
    socket.emit('sendMessage', msg);
    e.target.elements.msg.value = '';
  }
})

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
//             chatRoomId = chatMessages[0].roomId;
//         }
//   }catch(error) {
//     console.error('Error during fetch:', error);
// }
// }

socket.on('receiveMessage', (chatMessage) => {
  // <img src="./images/therapist.jfif" alt="" class="rounded-full w-10 h-10 object-fit"></img>
  const message = `<div class="flex px-3 py-3 mt-1">
  <div class="ml-1 mr-2 w-10"></div>
  <div class="text-white w-2/3 bg-[#191919] p-1 rounded-lg mr-3 pl-3 pt-2">
      <div class="font-normal text-[#AFAFAF] text-xs leading-tight pb-1"></div>
      <div class="font-medium text-xs text-[#C4C8DA] leading-tight">${chatMessage.message}</div>
  </div>
  <div class="text-xs text-[#A8A8A8] font-medium leading-tight flex items-center">${chatMessage.time}</div>
</div>`
  chatSection.innerHTML += message
});

function addMessage (){

}



function countdown(minutes) {
  let seconds = minutes * 60;
  // const interval = setInterval(() => {
  //   const minutes = Math.floor(seconds / 60);
  //   const seconds = seconds % 60;
  //   document.getElementById('min').textContent = minutes.toString().padStart(2, '0');
  //   document.getElementById('sec').textContent = seconds.toString().padStart(2, '0');

  //   if (seconds <= 0) {
  //     clearInterval(interval);
  //     document.getElementById('countdown').textContent = "Time's up!";
  //   }
  //   seconds--;
  // }, 1000);
}

// Start the 30-minute countdown
countdown(30);

const endButton = document.getElementById('end-button')

endButton.addEventListener('click', ()=> {
  alert('Call has ended, closing the window');
  window.close();
})
