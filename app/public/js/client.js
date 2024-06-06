// var connection;

// // Check if the environment is browser or Node.js


// // Check if the environment is browser or Node.js
// if (typeof window !== 'undefined') {
//     // Browser environment
//     var hostname = window.location.hostname;
//     var protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
//     connection = new WebSocket(protocol + hostname + ':' + port1);
// } else {
//     // Node.js environment (e.g., for server-side rendering)
//     var hostname = 'localhost'; // Default to localhost
//     if (process.env.HOSTNAME) {
//         hostname = process.env.HOSTNAME; // Use environment variable if available
//     }
//     connection = new WebSocket("ws://" + hostname + ':' + port1);
// }
const socket = io();

socket.on('connect', function() {
    console.log('Connected to Socket.IO server');
});

// connection.onerror = function (error) {
//     console.error('WebSocket connection error:', error);
// };

socket.on('error',function(error){
    console.log('socket.io connect error',error);
})

socket.on('message',function(msg){
    console.log(msg);
    var data = JSON.parse(msg);

    switch(data.type){
        case "online":
            onlineProcess(data.success);
            console.log(data);
        break;
        case "offer":
            call_btn.setAttribute("disabled","disabled");
            call_status.innerHTML = '<div class="calling-status-wrap card black white-text"> <div class="user-image"> <img src="images/user.png" class="caller-image circle" alt=""> </div> <div class="user-name">'+data.name+'</div> <div class="user-calling-status">Calling...</div> <div class="calling-action"> <div class="call-accept"><i class="material-icons green darken-2 white-text audio-icon">call</i></div> <div class="call-reject"><i class="material-icons red darken-3 white-text close-icon">close</i></div> </div> </div>'

            setUserProfile(data.name);
            var call_accept = document.querySelector('.call-accept');
            var call_reject = document.querySelector('.call-reject');

            call_accept.addEventListener("click",function(){
                offerProcess(data.offer,data.name);
                call_status.innerHTML = '<div class="call-status-wrap white-text"><div class="calling-wrap"><div class="calling-hang-action"><div class="videocam-on"><i class="material-icons teal darken-2 white-text video-toggle">videocam</i></div><div class="audio-on"><i class="material-icons teal darken-2 white-text audio-toggle">mic</i></div><div class="screen-share"><i class="material-icons teal darken-2 white-text screen-share">screen_share</i></div><div class="call-cancel"><i class="call-cancel-icon material-icons red darken-3 white-text">call</i></div></div></div></div>';
                console.log(data);
                acceptCall(data.name);
                var video_toggle = document.querySelector(".videocam-on");
                var audio_toggle = document.querySelector(".audio-on");

                video_toggle.onclick = function(){
                    stream.getVideoTracks()[0].enabled = !(stream.getVideoTracks()[0].enabled);
                    
                    var video_toggle_class = document.querySelector('.video-toggle');
                    if(video_toggle_class.innerText == 'videocam'){
                        video_toggle_class.innerText ='videocam_off';
                    }
                    else{
                        video_toggle_class.innerText = 'videocam';
                    }

                }
                audio_toggle.onclick = function(){
                    stream.getAudioTracks()[0].enabled = !(stream.getAudioTracks()[0].enabled);
                    
                    var audio_toggle_class = document.querySelector('.audio-toggle');
                    if(audio_toggle_class.innerText == 'mic'){
                        audio_toggle_class.innerText ='mic_off';
                    }
                    else{
                        audio_toggle_class.innerText = 'mic';
                    }

                }
                                

            });

            call_reject.addEventListener("click",function(){
                call_status.innerHTML = '';
                console.log(data);
                call_btn.removeAttribute("disabled");
                rejectedCall(data.name);
            });

        break;
        case "answer":
            answerProcess(data.answer);
            console.log(data);
        break;
        case "candidate":
            candidateProcess(data.candidate);
            console.log(data);
        break;
        case "not_available":
            call_status.innerHTML = '';
            call_btn.removeAttribute("disabled");
            console.log(data.name+" user not avaiable");
        break;
        case "reject":
            rejectProcess();
        break;
        case "accept":
            acceptProcess();
        break;
        case "leave":
            leaveProcess();
        break;
    }
});

// connection.onerror = function(error){
//     console.log(error);
// }

var name;
var connectedUser;
var myConn;
var local_video = document.querySelector('#local-video');
var remote_video = document.querySelector('#remote-video');
var call_to_username_input = document.querySelector('#username-input');
var call_btn = document.querySelector('#call-btn');
var call_status = document.querySelector('.call-hang-status');

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUSerMedia;

call_btn.addEventListener("click",function(){
    var call_to_username = call_to_username_input.value;
    if(call_to_username.length>0){
        connectedUser = call_to_username.toLowerCase();
        if(username ==connectedUser){
            console.log("you cant call urself");
        }
        else{
            
            call_status.innerHTML = '<div class="calling-status-wrap card black white-text"> <div class="user-image"> <img src="images/user.png" class="caller-image circle" alt=""> </div> <div class="user-name">unknown</div> <div class="user-calling-status">Calling...</div> <div class="calling-action"> <div class="call-reject"><i class="material-icons red darken-3 white-text close-icon">close</i></div> </div> </div>'
            
            setUserProfile(connectedUser);
            var call_reject = document.querySelector('.call-reject');
            call_reject.addEventListener("click",function(){
                call_status.innerHTML = '';
                call_btn.removeAttribute("disabled");
                rejectedCall(connectedUser);
            });
            
            
            call_btn.setAttribute("disabled","disabled");
            myConn.createOffer(function(offer){
                send({
                    type:"offer",
                    offer: offer,
                    image : userImage
                });
                myConn.setLocalDescription(offer);
            },function(error){
                console.log('offer not created',error);
            });
        }
        
    }
    else{
        console.log("enter Username!");
    }
});



setTimeout(function(){
    if(socket.connected==1){
        if(username!=null){
            name = username;
            console.log('username is ' + name);
            send({
                type:"online",
                name: name
            });
        }
    }
    else{
        console.log("something wrong");
    }
},3000);

function send(message){
    if(connectedUser){
        message.name = connectedUser;
    }
    socket.emit('message', JSON.stringify(message));

}

function successProcess(stream){
        local_video.srcObject = stream;
        var configuration = {
            "iceServers":[
                {"url":"stun:stun2.l.google.com:19302"}
            ]
        }





    myConn = new webkitRTCPeerConnection(configuration,{
        optional:[{
            RtpDataChannels: true
        }]
    });

        myConn.addStream(stream);
        myConn.onaddstream = function(e){
            remote_video.srcObject = e.stream;

            
            call_status.innerHTML = '<div class="call-status-wrap white-text"><div class="calling-wrap"><div class="calling-hang-action"><div class="videocam-on"><i class="material-icons teal darken-2 white-text video-toggle">videocam</i></div><div class="audio-on"><i class="material-icons teal darken-2 white-text audio-toggle">mic</i></div><div class="screen-share"><i class="material-icons teal darken-2 white-text screen-share">screen_share</i></div><div class="call-cancel"><i class="call-cancel-icon material-icons red darken-3 white-text">call</i></div></div></div></div>';
            var video_toggle = document.querySelector(".videocam-on");
            var audio_toggle = document.querySelector(".audio-on");
            var screen_share = document.querySelector(".screen-share");
            const senders = myConn.getSenders();
            screen_share.onclick = function (){
                (async () => {
                    try {
                        await navigator.mediaDevices.getDisplayMedia(
                            {
                                cursor: true
                            }).then(stream => {
                                // localStream = stream;
                                let videoTrack = stream.getVideoTracks()[0];
                                
                                var sender = senders.find(function(s) {
                                    return s.track.kind == videoTrack.kind;
                                });
                                sender.replaceTrack(videoTrack);
                                videoTrack.onended = function(){
                                    sender.replaceTrack(localStream.getTracks()[1]);
                                }
                                local_video.srcObject = stream;
                            });
                    } catch (err) {
                        console.log('(async () =>: ' + err);
                    }
                })();
            }
            
            
            

            video_toggle.onclick = function(){
                stream.getVideoTracks()[0].enabled = !(stream.getVideoTracks()[0].enabled);
                
                var video_toggle_class = document.querySelector('.video-toggle');
                if(video_toggle_class.innerText == 'videocam'){
                    video_toggle_class.innerText ='videocam_off';
                }
                else{
                    video_toggle_class.innerText = 'videocam';
                }

            }
            audio_toggle.onclick = function(){
                stream.getAudioTracks()[0].enabled = !(stream.getAudioTracks()[0].enabled);
                
                var audio_toggle_class = document.querySelector('.audio-toggle');
                if(audio_toggle_class.innerText == 'mic'){
                    audio_toggle_class.innerText ='mic_off';
                }
                else{
                    audio_toggle_class.innerText = 'mic';
                }

            }

            hangUp();

        }

        myConn.onicecandidate = function(event){
            if(event.candidate){
                send({
                    type: "candidate",
                    candidate: event.candidate
                });
            }
        }
    }

    function errorProcess(error){
        console.log("stream error",error);
    }


function onlineProcess(success){
    if(success){
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video:true,
        }).then(successProcess,errorProcess)
    }
    else{
        console.log("success falied");
    }
}

function onlineProcess2(success){
    if(success){
        navigator.mediaDevices.getDisplayMedia({
            audio: true,
            video:true,
        }).then(successProcess,errorProcess)
    }
    else{
        console.log("success falied");
    }
}

function offerProcess(offer,name){
    connectedUser = name;
    console.log(connectedUser);
    myConn.setRemoteDescription(new RTCSessionDescription(offer));
    //create answer to an offer or first user

    myConn.createAnswer(function(answer){
        myConn.setLocalDescription(answer);
        send({
            type:"answer",
            answer: answer
        });
    },function(error){
        console.log("error in answer",error);
    })
}
function screenProcess() {
    // Call the screen sharing function when the button is clicked
    navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
    }).then(function(screenStream) {
        // Display the screen sharing stream on the remote video element
        remote_video.srcObject = screenStream;

        // Add the screen sharing stream to the peer connection
        screenStream.getTracks().forEach(track => myConn.addTrack(track, screenStream));
    }).catch(function(error) {
        console.error('Error accessing screen:', error);
    });
};



function answerProcess(answer){
    myConn.setRemoteDescription(new RTCSessionDescription(answer));
}

function candidateProcess(candidate){
    myConn.addIceCandidate(new RTCIceCandidate(candidate));
}

function setUserProfile(name){
    var xhtr = new XMLHttpRequest();
    xhtr.open("GET","/get-user-profile?name="+name,true);
    xhtr.send();

    xhtr.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            var obj = JSON.parse(this.responseText);
            if(obj.success){
                var data = obj.data;
                var caller_image = document.querySelector('.caller-image');
                var user_name = document.querySelector('.user-name');

                // Assuming `data.image` contains the base64 buffer of the image
                var imageBase64 = data.image; // buffer in base64 format
                var imageSrc = 'data:image/jpeg;base64,' + imageBase64; // or image/png depending on the format
                console.log(imageSrc);
                caller_image.setAttribute('src', imageSrc);
                user_name.innerHTML = data.name;
            }
        }
    };
}


function rejectedCall(rejected_user){
    send({
        type: "reject",
        name: rejected_user
    });
}

function rejectProcess(){
    call_status.innerHTML = '';
    call_btn.removeAttribute("disabled");
}

function acceptCall(caller_name){
    send({
        type: "accept",
        name: caller_name
    });
}

function acceptProcess(){
    call_status.innerHTML = '';
}


function hangUp(){
    var call_cancel = document.querySelector('.call-cancel');
    call_cancel.addEventListener("click",function(){

        send({
            type: "leave",

        });
        leaveProcess();

    });
}

function leaveProcess()
{
    call_btn.removeAttribute("disabled");
    call_status.innerHTML = '';
    remote_video.src = null;
    myConn.close();
    connectedUser = null;

}

function takeScreenshotAndSend() {
    // Change body background color for screenshot

    // Create an image element

      // Create a canvas element
      var canvas = document.createElement("canvas");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      var ctx = canvas.getContext("2d");

      // Draw the image onto the canvas
      ctx.drawImage(remote_video, 0, 0, 500, 500);

      // Convert the canvas to a data URL
      var dataURL = canvas.toDataURL();

      // Convert data URL to Blob
      var blob = dataURLToBlob(dataURL);

      // Start time
      var startTime = performance.now();

      // Send image data to the API
      var formData = new FormData();
      formData.append('image', blob, 'screenshot.jpg');

      fetch('/api/detect', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        // End time
        var endTime = performance.now();
        
        console.log("Response from server:", data);
        
        if(data.final_detection){
            displayProtocolViolationMessage();
            
        }
        console.log("Time taken:", endTime - startTime, "ms");
        // Handle the response here
      })
      .catch(error => {
        console.error('Error:', error);
      });

    

    // Set the image source to the document body as a data URL
    
  }

  function displayProtocolViolationMessage() {
    var messageDiv = document.getElementById("protocol-violation-message");
    messageDiv.style.display = "block";
    messageDiv.innerHTML = "Sender is violating protocol.";
}

  function dataURLToBlob(dataURL) {
    var byteString = atob(dataURL.split(',')[1]);
    var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  // Call the function every 10 seconds
  setInterval(takeScreenshotAndSend, 10000);





