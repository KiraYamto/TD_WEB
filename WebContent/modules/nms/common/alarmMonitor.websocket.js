/**
 * 通过 Websocket 协议，接受告警推送过来的数据, 改文件返回的对象名称：monitorWS
 */
define(function () {
    return (function () {
    	var currentObj;
    	//var host = "192.168.14.156:9008";
    	var host = "127.0.0.1:8080";
    	var wsUrl = "/cws/nmspush";
    	window.WEB_SOCKET_SWF_LOCATION = basePath+ "modules/common/websocket/WebSocketMain.swf";
    	window.WEB_SOCKET_DEBUG = true;
    	var socket;
      
    	var addAlarmCall; //新增告警回调
    	var staticsAlarmCall; //统计告警回调函数
    	
    	return {
    		initConnect : function(options) {
    			currentObj = this;
    			var url;
    			if (window.location.protocol == 'http:') {
    				url = 'ws://' + host + wsUrl;
    			} else {
    				url = 'wss://' + host + wsUrl;
    			}

    			if ('WebSocket' in window) {
    				socket = new WebSocket(url);
    			} else if ('MozWebSocket' in window) {
    				socket = new MozWebSocket(url);
    			} else {
    				console.log('Error: WebSocket is not supported by this browser.');
    				return;
    			}

    			if(options && options.onOpen){
    				socket.onopen = function(event) {
    					//alert("Websocket 已经连接")
    					console.log('WebSocket Connection established');
    					options.onOpen.call(this);
    				};
    			}
    
    			socket.onclose = function(event) {
    				//alert("Websocket 断开连接")
    				console.log('WebSocket Connection closed');
    			};

    			socket.onmessage = function(event) {
    				currentObj.handleMessage(event.data);
    			}
    		},
    		
    		handleMessage:function (message) {
    			try {
    				message = $.parseJSON(message);
    			} catch (e) {
    				return;
    			}
    			if(message && message.type && message.type == 'alarmInfos' && message.data && message.data.length > 0){
    				//alarmMonitor.produceAlarmService(message.data);
    				if(addAlarmCall){
    					addAlarmCall(message.data);
    				}
    			}else if(message && message.type && message.type == 'alarmStatis' && message.data ){
    				//alarmMonitor.refleshAlarmStatistics(message.data);
    				if(staticsAlarmCall){
    					staticsAlarmCall(message.data);
    				}
    			}
    		},
    		
    		//发送消息
    		sendMessage:function(message){
    			socket.send(message);
    		},
    		
    		/**
    		 * 注册回调函数
    		 */
    		register:function(pAddAlarmCall, pStaticsAlarmCall){
    			addAlarmCall = pAddAlarmCall;
    			staticsAlarmCall = pStaticsAlarmCall;
    		},
    		
    		/**
    		 * 返回socket对象，用于主页页面关闭Tab时引用
    		 */
    		getSocket:function(){
    			return socket;
    		}
    	}
    })();
});