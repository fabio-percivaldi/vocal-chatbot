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
      	}
		
		var chunks = [];

		mediaRecorder.ondataavailable = function(e) {
			chunks.push(e.data);
		}
		
		mediaRecorder.onstop = function(e) {
			var blob = new Blob(chunks, { 'type' : 'audio/ogg;codecs=opus' });
			chunks = [];
			websocket.send(blob);
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
		'content-type': 'audio/ogg;codecs=opus',
		'interim_results' : true 
	};
	createUserMessage("socket opened", "")
	websocket.send(JSON.stringify(message));
}

function onMessage(evt) {
		if(JSON.parse(evt.data).results[0].final)
			createUserMessage("JSON", JSON.parse(evt.data).results[0].alternatives[0].transcript);
}

function onError(evt){
	createUserMessage("socket error", "");
}

function onClose(evt){
	createUserMessage("socket closed", "");
}
