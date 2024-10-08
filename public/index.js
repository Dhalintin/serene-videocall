const socket = io('/');
const peer = new Peer();
let myVideoStream;
let myId;
let username;
let userId;
let type;
let pic;
var videoGrid = document.getElementById('videoDiv')
var myvideo = document.getElementById('myVideo');
let myName = document.getElementById('myname');
let usersname = document.getElementById('usersname');
myvideo.muted = true;
const peerConnections = {}
const timerElement = document.getElementById('timer');
let timeLeft = 30 * 60;

function startTimer() {
  const interval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(interval);
      timerElement.textContent = "00:00";
    }
  }, 1000);
}

//Handling other parts
async function getCallDetails(){
  console.log(roomID)
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

            addParticipant(calldata.professionalId._id, calldata.professionalId.name, calldata.professionalId.image);
            addParticipant(calldata.userId._id, calldata.userId.username, calldata.userId.avatar);

            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if(userInfo){
              username = userInfo.username;
              type = userInfo.type;
              userId = userInfo.userId
              pic = calldata.professionalId.image;
              userDetails = {
                username, userId, pic
              }
            }else{
              username = calldata.userId.username;
              userId = calldata.userId._id;
              pic = calldata.userId.avatar;
              userDetails = {
                username, userId, pic
              }
            }

            myName.textContent = username
            if(username !== calldata.professionalId.name){
              usersname.textContent = calldata.professionalId.name
            }else{
              usersname.textContent = calldata.userId.username
            }
        }

    } catch (error) {
        console.error('Error during fetch:', error);
    }
}

getCallDetails();

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
      startTimer();
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
  const vid = document.getElementById('userVideo');
  startTimer();
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


const participant = document.getElementById('participant')
function addParticipant(userId, username, image){
  participant.innerHTML += `<div class="flex items-center justify-left bg-[#191919] mt-3 mb-1 rounded-lg p-1 m-3 text-md" id=${userId}>
    <div class="ml-1 mr-2">
        <img src="${image}" alt="" class="rounded-full w-8 h-8 object-cover">
    </div>
    <div class="text-white mr-20 font-light w-36">${username}</div>
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

const chatForm = document.getElementById("msgForm");

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const msg = event.target.msg.value;

  if(msg !== ''){
    socket.emit('sendMessage', msg, userDetails);

    event.target.msg.value = ''
  }

  const chatSection = document.getElementById('chatSection')
  socket.on('receiveMessage', (chatMessage) => {
    const { message, time } = chatMessage;
    // const { username, pic } = userInfo
    // <img src="" alt="" class="rounded-full w-10 h-10 object-fit">
    const newmsg = `<div class="flex px-3 py-3 mt-1">
            <div class="ml-1 mr-2 w-10">
            </div>
            <div class="text-white w-2/3 bg-[#191919] p-1 rounded-lg mr-3 pl-3 pt-2">
                <div class="font-normal text-[#AFAFAF] text-xs leading-tight pb-1"></div>
                <div class="font-medium text-xs text-[#C4C8DA] leading-tight">${message}</div>
            </div>
            <div class="text-xs text-[#A8A8A8] font-medium leading-tight flex items-center">${time}</div>
        </div>`

    chatSection.innerHTML += newmsg
    chatSection.scrollTop = messagesDiv.scrollHeight;
  });

});

const endCallButton = document.getElementById('end-button')

endCallButton.addEventListener('click', ()=>{
  if (window.opener) {
    window.close();
  } else {
    window.location.href = "https://serene-ivory.vercel.app/";  // Replace with your desired URL
  }
})

