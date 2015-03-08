
var WebDatagramSocket = (function() {
	//
	// Constructor
	//

	function WebDatagramSocket(host, port) {
		this.host = host;
		this.port = port;

		// callback that gets the message as a UInt8Array
		this.onmessage = null;

		// setup websocket connection to proxy
		this.ws = new WebSocket("wss://webdatagram.herokuapp.com/"+host+"/"+port+"/", ["wdp"]);
		this.ws.binaryType = "arraybuffer";
		this.ws.connection_time = Date.now();

		function handleIncomingMessage(event){
			var buf = new Uint8Array(event.data);

			if(typeof(this.onmessage) === "function"){
				this.onmessage(buf)
			}
		}

		this.ws.onmessage = handleIncomingMessage.bind(this);

		function handleClose(event){
			console.log("Websocket Closed with", event.reason, event.code)

			if (event.code === 1006){
				console.log("Seconds since open: ", (Date.now() - this.ws.connection_time)/1000);
				if(this.ws.connection_time < (Date.now() - 5000)){
					console.log("Abnormal Close, Re-creating Websocket")
					new_ws = new WebSocket("wss://webdatagram.herokuapp.com/"+this.host+"/"+this.port+"/", ["wdp"]);
					new_ws.binaryType = "arraybuffer";
					new_ws.onmessage = handleIncomingMessage.bind(this);
					new_ws.onclose = handleClose.bind(this);
					//new_ws.onerror = this.ws.onerror;
					new_ws.connection_time = Date.now();

					this.ws = new_ws;
				} else {
					console.error("Abnormal Close within 5 sec, not Re-creating");
					//console.debug(this.ws.connection_time, Date.now(), (Date.now() - 5000));
				}
			}
		}

		this.ws.onclose = handleClose.bind(this);

		function handleError(event){
			console.log("Websocket Error:", event.reason, event.code)
		}

		//this.ws.onerror = handleError.bind(this);

	}

	//
	// Public Functions
	//

	WebDatagramSocket.prototype.send = function(buf) {
			return this.ws.send(buf);
	}

	return WebDatagramSocket;
})()