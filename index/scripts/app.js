// fork getUserMedia for multiple browser versions, for the future
// when more browsers support MediaRecorder

var recognizeFile = require('watson-speech/speech-to-text/recognize-file');
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
      	 	
      	 	
      	}

      	stop.onclick = function() {
			this.disabled = true;
			record.disabled = false;
      	 	mediaRecorder.stop();
			$.ajax({
				url : "/api/fetch-token",
				type : "GET",
				success : function(token){
					
					//createUserMessage("token", token);
					var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
					chunks = [];
					//var audioURL = window.URL.createObjectURL(blob);
					//audio.src = audioURL;
					recognizeFile({
								token : token,
								file : 'https://watson-speech.mybluemix.net/Us_English_Broadband_Sample_1.wav',
								outputElement: document.querySelector('#output'),
								play: true
					});
				}
			});
			createUserMessage("state", mediaRecorder.state);
      	 	
      	}
		var chunks = [];

		mediaRecorder.ondataavailable = function(e) {
			chunks.push(e.data);
		}
		 
		mediaRecorder.onstop = function(e) {
			
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

