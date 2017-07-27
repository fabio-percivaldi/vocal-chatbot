// fork getUserMedia for multiple browser versions, for the future
// when more browsers support MediaRecorder
var websocket;
//var recognizeFile = require('watson-speech/speech-to-text/recognize-file');
var sentence = "";
navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);

// set up basic variables for app

var record = document.querySelector('#start-recording');
var stop = document.querySelector('#stop-recording');
var output = document.querySelector('#output');

// visualiser setup - create web audio api context and canvas


//main block for doing the audio recording

if (navigator.getUserMedia) {
   createUserMessage("getUserMedia supported.","");
   navigator.getUserMedia (
      // constraints - only audio needed for this app
      {
         audio: true
      },

      // Success callback
    function(stream) {
      	var mediaRecorder = new MediaRecorder(stream);
		
      	record.onclick = function() {
			this.disabled = true;
			stop.disabled = false;
      	 	mediaRecorder.start();
			createUserMessage("state", mediaRecorder.state);
			
			$.ajax({
				url : "/api/fetch-token",
				type : "GET",
				success : function(token){
					var wsURIW = ('wss://stream.watsonplatform.net/speech-to-text/api/v1/recognize?watson-token=' + token + '&model=en-US_BroadbandModel');
					websocket = new WebSocket(wsURIW);
					websocket.onopen = function(evt) { onOpen(evt) };
					websocket.onclose = function(evt) { onClose(evt)};
					websocket.onmessage = function(evt) { onMessage(evt) };
					websocket.onerror = function(evt) { onError(evt)};
					
				}	
      	 	});
      	 	
      	}

      	stop.onclick = function() {
			this.disabled = true;
			record.disabled = false;
      	 	mediaRecorder.stop();
			//createUserMessage("token", token);
			
      	}
		
		var chunks = [];

		mediaRecorder.ondataavailable = function(e) {
			createUserMessage("dato", "");
			chunks.push(e.data);
		}
		
		mediaRecorder.onstop = function(e) {
			var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
			chunks = [];
			createUserMessage("size", blob.size);
			var url = URL.createObjectURL(blob);
			createUserMessage("url", url)
			websocket.send(blob);
			createUserMessage("state", mediaRecorder.state);
		}

	  },
      // Error callback
		function(err) {
			console.log('The following gUM error occured: ' + err);
		}
	  
   );
} else {
  createUserMessage("getUserMedia not supported on your browser!","");
}


function onOpen(evt) {
	var message = {
		'action': 'start',
		'content-type': 'audio/l16;rate=22050'
	};
	websocket.send(JSON.stringify(message));
}

function onMessage(evt) {
	createUserMessage("message", evt.data);
}

function onError(evt){
	createUserMessage("socket error", "");
}

function onClose(evt){
	createUserMessage("socket closed", "");
}
