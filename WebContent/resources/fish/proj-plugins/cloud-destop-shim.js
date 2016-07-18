/*
 * jQuery Web Sockets Plugin v0.0.1
 * http://code.google.com/p/jquery-websocket/
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright (c) 2010 by shootaroo (Shotaro Tsubouchi).
 * Modified by Ted guo.
 * Usage
 *
 * Connection
 * 
 * var ws = $.websocket("ws://127.0.0.1:8080/");
 * 
 * Sending Message
 * 
 * ws.send('hello'); // sending message is '{type:'hello'}'. ws.send('say', {name:'foo', text:'baa'}); // sending message is '{type:'say', data:{name:'foo', text:'baa'}}'
 * 
 * Event Handling
 * 
 * var ws = $.websocket("ws://127.0.0.1:8080/", { open: function() { ... }, close: function() { ... }, events: { say: function(e) { alert(e.data.name); // 'foo' alert(e.data.text); // 'baa' } } });
 */
(function($){

var WebSocket=window.MozWebSocket||window.WebSocket;
	
var WebSocketDelegate=(function(globel,undefined){
	
	var webSocketDelegate=function(url,protocols, options){
		this.init(url,protocols, options)
		return this;
	};
	webSocketDelegate.fn = webSocketDelegate.prototype = {
			init:function(url,protocols, options){
				this.close();
				var me =this;
				this.options = options;
				this.protocols = protocols;
				this.url = url;
				if(this.protocols){
					this.ws = WebSocket ? new WebSocket( this.url ,this.protocols) : {
						send: function(m){ return false },
						close: function(){}
					};
				}else{
					this.ws = WebSocket ? new WebSocket( this.url ) : {
						send: function(m){ return false },
						close: function(){}
					};
				}
				
				var onOpen = $.proxy(function(e){
					 $(me).trigger(e);
					},this);
				var onClose = $.proxy(function(e){
					$(me).trigger(e);	
				},this);
				var onMessage = $.proxy(function(e){
					$(me).trigger(e);
				},this);
				var onError = $.proxy(function(e){
					$(me).trigger(e);	
				},this);
				
				
				$(this.ws)
				.bind('open',onOpen)
				.bind('close', onClose)
				.bind('message', onMessage)
				.bind('error', onError);
				
			},
			_send:function(){
				if(this.ws){
					this.ws.send.apply(this.ws,arguments);
				}
			},
			send: function(type, data) {
				
				$(this).trigger("beforeSend");
				var m = {type: type};
				m = $.extend(true, m, $.extend(true, {}, this.options, m));
				if (data) m['data'] = data;
				//return this._send($.toJSON(m));
				try{
					return this._send(JSON.stringify(m));
				}
				catch(ex){
					$(this).trigger("error");
				}
				return null;
			},
			reconnect:function(){
				this.init();
			},
			_close:function(){
				if(this.ws){
					var me =this;
					$(this.ws).bind("close",function(){
						$(me.ws).unbind();
						me.ws = null;
						//delete me.ws;
					});
					this.ws.close.apply(this.ws,arguments);
				}
			},
			close:function(){
				this._close();
			}
	};
	
	//委托WebSocket类
	return webSocketDelegate;
	
})(window);

$.extend({
	websocketSettings: {
		open: $.noop,
		close: $.noop,
		message: $.noop,
		error:$.noop,
		options: {},
		events: {},
		protocols:null
	},
	websocket: function(url, protocols ,opt) {
		opt=$.extend(opt,{});

		if(typeof url === "string"){
			opt.url = url;
			
			if(typeof protocols === "string"){
				opt.protocols = protocols;
			}else{
				opt=$.extend(protocols,opt);
			}
			
		}else{
			opt=$.extend(url,opt);
			
		}
		
		var ws = new WebSocketDelegate(opt.url,opt.protocols,opt);
		
		
		ws._settings = $.extend($.websocketSettings, opt);
		
		var heartbeat =  $.proxy(function(){
			ws.send("heartbeat")
		},ws);
		
		var onOpen = $.proxy(function(){
			 ws.tid = setInterval(heartbeat,1000);
			 console.log("websoket heartbeat thread starting, pid:",ws.tid);
		},this);
		
		var onClose = $.proxy(function(){
			if(ws.tid!=null)
			clearInterval(ws.tid);
			console.log("websoket heartbeat thread stopped, pid:",ws.tid);
			
		},this);
		
		opt&&$.isFunction(opt.error)&&$(ws).bind('error',opt.error);
		$(ws)
			.bind('open', $.websocketSettings.open)
			.bind('open', onOpen)
			.bind('close', onClose)
			.bind('close', $.websocketSettings.close)
			.bind('error', onClose)
			.bind('message', $.websocketSettings.message)
			.bind('message', function(e){
				//var m = $.evalJSON(e.originalEvent.data);
				var m = eval("(" + (e.originalEvent.data) + ")");
				var h = ws._settings.events[m.type];
				if (h) h.call(this, m);
				return m.type&&m.type!=""&&m.type!="message"&&m.type!="close"&&m.type!="open"&&m.type!="error"&&(
						$(ws).trigger(m.type,m)		
				);
			});
		
		
		$(window).unload(function(){ 
			ws.close(); 
			ws = null; 
			});
		return ws;
	}
});
})(jQuery);

/**
 * 1.window.resize会触发fish的各个View里面的resize方法，不能在resize方法里面调用window.resize()
 * 会导致js嵌入堆栈死循环
 * 
 * 2.remove的时候清理线程和websocket
 * 
 * @deprecated
 * @method resize
 * @extends fish.View
 * 
 * <pre>
 * fish.View.extend({resize:function(){}});
 * </pre>
 */
$.extend(fish.View.prototype, {
	screenSizes: {
        xs: 480,
        sm: 768,
        md: 992,
        lg: 1200
    },
	resize : function() {
		
	},
	tabActived: function() {
		
	},
	tabHid: function() {
		
	},
	watchMainMessage:function(namespace,callback){
		if(MainView&&MainView.mainWebSocket){
			if(!this.__MainWebSocketEvents__){
				this.__MainWebSocketEvents__=[];
			}
			this.__MainWebSocketEvents__.push({
				namespace:namespace,
				callback:callback
			});
			
			$(MainView.mainWebSocket).bind(namespace,callback);
			
			return true;
		}
		return false;
	},
	unwatchMainMessage:function(namespace,callback){
		if(this.__MainWebSocketEvents__){
			var fis = _.filter(this.__MainWebSocketEvents__, function(ev){ return ev.namespace  == namespace && ev.callback==callback; });
			this.__MainWebSocketEvents__=_.difference(this.__MainWebSocketEvents__,fis);
		}
		$(MainView.mainWebSocket).unbind(namespace,callback);
	},
	websocket: function(url, s) {
		if(this.__websockets__==null){this.__websockets__=[];}//不能用原型链定义，会被subview继承
		var ws=$.websocket(url,s)
			,me=this;
		this.__websockets__.push(ws);
		$(ws).bind('close', function(){
			me.__websockets__ =_.reject(me.__websockets__, function(o){ return o == ws; });
		});
				
		return ws;
	},
	registerWebSocket:function(ws){
		if(this.__websockets__==null){this.__websockets__=[];}
		var me=this;
		$(ws).bind('close', function(){
			
			me.__websockets__ =_.reject(me.__websockets__, function(o){ return o == ws; });
		});
		this.__websockets__.push(ws);
	},
	registerThread:function(int){
		if(this.__threads__==null){this.__threads__=[];}
		this.__threads__.push(int);
	},
	unRegisterThread:function(int){
		if(this.__threads__==null){this.__threads__=[];}
		this.__threads__ =_.reject(this.__threads__, function(num){ return num == int; });
	},
	thread:function(code,millisec){
		if(this.__threads__==null){this.__threads__=[];}
		var i = setInterval(code,millisec);
		this.__threads__.push(i);
	}
});

(function(){
	var remove =fish.View.prototype.remove;
	
	$.extend(fish.View.prototype, {
		remove : function() {
			if(this.__threads__&&this.__threads__.length>0){
				$.each(this.__threads__,function(i,o){
					clearInterval(o);
				})
				this.__threads__=[];
			}
			if(this.__websockets__&&this.__websockets__.length>0){
				$.each(this.__websockets__,function(i,ws){
					ws.close();
				})
				this.__websockets__=[];
			}
			if(MainView&&MainView.mainWebSocket&&this.__MainWebSocketEvents__&&this.__MainWebSocketEvents__.length>0){
				$.each(this.__MainWebSocketEvents__,function(i,ev){
					$(MainView.mainWebSocket).unbind(ev.namespace,ev.callback);
				})
				this.__MainWebSocketEvents__=[];
			}
			
			fish.each(this.__manager__.views, function (view) {
				view.remove();
			});
			
			return remove.apply(this,arguments);
		}
	});
	
})();
(function() {
	var adviceFuncs = {
			initialize: function(func) { return function() {
				func.apply(this, arguments);
				
				this.on('afterRender', function(){
					if(this.resize) {
						this.resize(this.$el.parent().height() - this.$el.outerHeight(true));
					}
				}, this);
				
				};
			},
			resize: function(func) {return function(delta) {
					func.call(this, delta);
					// this.views; //{selector: new View()} or Selector:[ new View()]
					fish.each(this.__manager__.views, function (views) {
						fish.each($.makeArray(views), function (view) {
							if (view.$el.is(':visible')) {
								if (fish.isFunction(view.resize)) {
									var delta = view.$el.parent().height() - view.$el.outerHeight(true);
									view.resize(delta);
								}
							}
						}, this);
					}, this);
				}
			},
			tabActived: function(func) {
				return function() {
					func.apply(this, arguments);
					var params= arguments;
					
					fish.each(this.__manager__.views, function (views) {
						fish.each($.makeArray(views), function (view) {
							
								if (fish.isFunction(view.tabActived)) {
									
									view.tabActived.apply(view,params);
								}
							
						}, this);
					}, this);
				}
			},
			tabHid: function(func) {
				return function() {
					func.apply(this, arguments);
					var params= arguments;
					
					fish.each(this.__manager__.views, function (views) {
						fish.each($.makeArray(views), function (view) {
							
								if (fish.isFunction(view.tabHid)) {
									
									view.tabHid.apply(view,params);
								}
							
						}, this);
					}, this);
				}
			}
			
			
			
	};
	
	fish.View.extend=function (protoProps, staticProps) {
	    var parent = this;
	    var child;

	    fish.extend(staticProps, fish.pick.apply(fish, [protoProps].concat(fish.keys(adviceFuncs))));

		// here do advice for functions that framework interests
		$.each(adviceFuncs, function(funcName, adviceFunc) {
			var func = protoProps[funcName] || parent.prototype[funcName];
			protoProps[funcName] = adviceFunc(func);
		});
	    
	    // The constructor function for the new subclass is either defined by you
	    // (the "constructor" property in your `extend` definition), or defaulted
	    // by us to simply call the parent constructor.
	    if (protoProps && _.has(protoProps, 'constructor')) {
	      child = protoProps.constructor;
	    } else {
	      child = function(){ return parent.apply(this, arguments); };
	    }
	    
	   
	    

	    // Add static properties to the constructor function, if supplied.
	    _.extend(child, parent, staticProps);

	    // Set the prototype chain to inherit from `parent`, without calling
	    // `parent` constructor function.
	    var Surrogate = function(){ this.constructor = child; };
	    Surrogate.prototype = parent.prototype;
	    child.prototype = new Surrogate;

	    // Add prototype properties (instance properties) to the subclass,
	    // if supplied.
	    if (protoProps) _.extend(child.prototype, protoProps);

	    // Set a convenience property in case the parent's prototype is needed
	    // later.
	    child.__super__ = parent.prototype;

	    return child;
	  }
})();



/**
 * 文本弹出框控件,可以通过url指定js程序入口
 * 
 * @deprecated
 * @class fish.desktop.widget.PopEdit
 * @extends fish.desktop.widget
 * 
 * <pre>
 * $(element).popedit({url:"js!xxxxx/xxxx/views/xxx.js"});
 * </pre>
 */
!function() {
	'use strict';

	$.widget(
					"ui.popedit",
					$.ui.formfield,
					{
						options : {
							/**
							 * @cfg {String} url
							 *      popedit弹出层的内容,可以是远程页面内容;如果以#开头,则表示的是当前dom的id,会取这个元素的内容
							 */
							url : '',
							/**
							 * @cfg {String} buttonIcon='remove new-window'
							 *      默认图标;remove表示清除按钮,弹出层可以使用任意的glyphicon图标
							 */
							buttonIcon : 'new-window',
							/**
							 * @cfg {Object} dialogInstance popedit弹出层实例
							 */
							dialogInstance : null,
							/**
							 * @cfg {Object} dialogOption
							 *      popedit弹出层的参数,popedit采用了dialog控件展示弹出层,可配置dialog的所有参数
							 */
							dialogOption : null,
							// 内部用,
							value : null,
							/**
							 * @cfg {String} dataTextField='name'
							 *      dialog返回数据对象的属性,用于文本框显示
							 */
							dataTextField : "name",
							/**
							 * @cfg {String} dataValueField='value'
							 *      dialog返回数据对象的属性,用于提交到后台
							 */
							dataValueField : "value",
							/**
							 * @cfg {Object} initialData popedit初始化参数
							 */
							initialData : null,
							/**
							 * @cfg {Boolean} showClearIcon=true 聚焦时是否显示x图标,默认显示
							 */
							showClearIcon : true
						},
						// 根据图标属性的配置创建图标
						_createIcon : function() {
							var options = this.options, $element = $(this.element);

							if (options.showClearIcon) {
								var clearInput = $element.clearinput();
								var settings = {
									'direct' : 'right',
									'iconname' : options.buttonIcon
								};
								clearInput.clearinput('setIcon', settings);
							} else {
								var icons = options.buttonIcon.split(' '), html = '';
								for (var i = 0; i < icons.length; i++) {
									html += '<span class="input-group-addon"><span class="glyphicon glyphicon-'
											+ icons[i] + '"></span></span>';
								}
								$element.after(html);
							}

							this.component = $element.nextAll(
									'.input-group-addon').filter(
									function(index) {
										return !$(this).children('.glyphicon')
												.hasClass('glyphicon-remove');
									});
							this.componentReset = $element.nextAll(
									'.input-group-addon').filter(
									function(index) {
										return $(this).children('.glyphicon')
												.hasClass('glyphicon-remove');
									});
							this.component = this.component.length ? this.component
									: false;
							this.componentReset = this.componentReset.length ? this.componentReset
									: false;
						},
						// 初始化参数
						_getCreateOptions : function() {
							var $element = $(this.element);
							return {
								url : $element.data('url')
							};
						},
						_create : function() {
							var options = this.options;
							// add readonly attr
							this.element.attr('readonly', true);
							if (options.buttonIcon) {
								this._createIcon();
							}
							this._attachEvents();
							if (options.initialData) {
								this.setValue(options.initialData);
							}

							this.dialog = null;
							if (options.dialogInstance) {
								this.dialogInstance(options.dialogInstance);
							}

							// call formfield _create method
							this._super();
						},
						// popedit提交数据的时候,界面值不是实际值,需要重写getValue方法
						_onFormReset : function() {
							this.setValue(this.options.initialData);
						},
						_onFormClear : function() {
							this.value = null;
						},
						_formSetValue : function(value) {
							var options = this.options;
							if (typeof value === 'string') {
								var _temp = value;
								value = {};
								value[options.dataTextField] = $.trim(_temp);
								value[options.dataValueField] = $.trim(_temp);
							}
							this.value = value;
							this.element
									.val(value ? value[options.dataTextField]
											: "");
						},
						_formGetValue : function() {
							var value = this.getValue();
							return value ? value[this.options.dataValueField]
									: "";
						},
						_validateHandler : function() {
							var that = this;
							this._on({
								'popedit:change' : function() {
									if (that._getValidFlag()) {
										that.element.isValid();
									}
								}
							});
						},
						_attachEvents : function() {
							this._on({
								'change' : '_clear'
							});
							this._on(this.component, {
								click : '_openDialog'
							});

							if (this.componentReset) {
								this._on(this.componentReset, {
									click : '_clear'
								});
							}
						},

						_openDialog : function(e) {
							var dialog = this.dialog;
							if (dialog) { // 已经存在就直接打开;如果改变url,则重新生成~
								dialog.dialog("open");
								this._trigger('open');
							} else {
								var that = this, url = this.options.url;

								if (!url) {
									this._trigger('open');
								} else if (url.indexOf("#") === 0) {// 以#开头
									this._initDialog($(url));
								} else if (url.indexOf("js!") == 0) {
									var me = this;
									url = url.substr(3);
									window.require(
													[ url ],
													function(View) {
														var viewInstance = new View(
																me.options.dialogOption);
														viewInstance.options = me.options.dialogOption ? me.options.dialogOption.viewOptions
																: {};
																me.popupView=viewInstance;
														// 必须在模板渲染之后
														viewInstance.render();
														viewInstance
																.on(
																		'afterRender',
																		function() {
																			
																			if(!$(viewInstance.el).hasClass('ui-dialog')){
																				$(viewInstance.el).addClass('ui-dialog');
																				
																			}
																			me._initDialog($(viewInstance.el));
																			/*
																			 * fish.isFunction(options.callback) &&
																			 * options.callback.call(me,
																			 * viewInstance);
																			 */
																		});

														/*
														 * if (options.selector) {
														 * me.setView(options.selector,
														 * viewInstance, false); //
														 * false替换原先的view
														 * me.renderViews(options.selector); }
														 * else {
														 * me.setView(viewInstance);
														 * me.renderViews(); }
														 */
													});

								} else {
									$.ajax({
										url : url,
										type : 'get',
										dataType : 'html'
									}).done(
											function(responseText) {
												var $html = $(responseText);
												$("body").append($html);
												if (!$html.attr("id")) {
													$html.uniqueId();
												}
												that._initDialog($("#"
														+ $html.attr("id")));
											});
								}
							}
						},
						_initDialog : function($el) {
							var that = this;
							$el.dialog(this.options.dialogOption).on({
								"dialog:change" : function(e, value) {
									that.setValue(value);
								}
							});
							this._trigger('open');
							this.dialog = $el;
						},
						_setOption : function(key, value) {

							if (key === "url") {
								if (this.dialog && this.options.url !== value) {
									this.dialog.dialog("destroy");
									this.popupView&&$.isFunction(this.popupView.remove)&&this.popupView.remove();
									this.dialog = null;
								}
							}
							this._super(key, value);

							if (key === "dialogOption") {
								if (this.dialog) {
									this.dialog.dialog("option", value);
								}
							}
							if (key === 'disabled') {
								this.element.prop("disabled", value);
							}
						},
							
						_clear : function(e) {
							this.setValue("");
						},

						/**
						 * @method dialogInstance 弹出框实例
						 */
						dialogInstance : function(value) {
							var changeHandler;

							if (arguments.length === 0) {
								return this.dialog;
							} else {
								this.dialog = value;

								if (this.dialog) {
									changeHandler = _.bind(
											this._onDialogChange, this);
									this.dialog.on('dialogchange',
											changeHandler);
								}
							}
						},

						_onDialogChange : function(e, value) {
							this.setValue(value);
						},

						/**
						 * @method setValue 给popedit赋值
						 * @param {Object}
						 *            value
						 *            如果值是字符串,则显示与实际值都是字符串本身;如果是对象,界面会显示dataTextField的属性值
						 */
						setValue : function(value) {// 通过filed等属性进行操作//form使用时要进行值覆盖
							var options = this.options, _temp;
							if (typeof value === 'string') {
								_temp = value;
								value = {};
								value[options.dataTextField] = $.trim(_temp);
								value[options.dataValueField] = $.trim(_temp);
							}
							this.value = value;
							this.element
									.val(value ? value[options.dataTextField]
											: "");// 显示label值，form中覆盖value
							this._trigger('change', null, value);
						},
						/**
						 * @method getValue 取popedit值
						 * @return {Object}
						 *         返回设置进去的值,可以是dialog回调setReturnValue设置进去的值,也可以是popedit调用setValue设置进去的值
						 */
						getValue : function() {
							var options = this.options, _temp, value = this.value;
							if (typeof value === 'string') { // 这种场景应该不存在
								_temp = value;
								value = {};
								value[options.dataTextField] = $.trim(_temp);
								value[options.dataValueField] = $.trim(_temp);
							}
							return value;
						},
					/**
					 * 当值发生改变后触发
					 * 
					 * @event change
					 * @param {Event}
					 *            event event
					 * @param {Object}
					 *            value 改变后的值
					 */
						
						destroy: function() {  
							this.popupView&&$.isFunction(this.popupView.remove)&&this.popupView.remove();
					  
					        // call the base destroy function  
					        $.Widget.prototype.destroy.call(this);  
					    }  
					});
}();

/**
 * tab控件，改变了tab的panel放的container，之前不能指定，现在可以指定
 * 
 * @deprecated
 * @class fish.desktop.widget.tabs
 * @extends fish.desktop.widget
 * 
 * <pre>
 * $(element).tabs(option);
 * </pre>
 */
$.extend(
				$.ui.tabs.prototype,
				{
					/**
					 * 添加标签页。
					 * 
					 * @param {Object}
					 *            o 配置项对象，此对象可以包含id, label, index
					 *            ,content,active属性。
					 */
					add : function(o) { // id, label, index
										// ,content,active,container
						o = o || {};

						var index = o.index, id = o.id, label = o.label, container = o.container ? ($(o.container).length ? $(o.container)
								: this.element.find(o.container))
								: o.container;
						// tabContentHtml = o.content;

						if (index === undefined) {
							index = this.anchors.length;
						}
						id = id || $({}).uniqueId()[0].id;
						label = label || id;

						if (this.options.paging)
							this._pageReset();

						var doInsertAfter, panel, options = this.options, li = $((options.canClose ? options.tabCanCloseTemplate
								: options.tabTemplate).replace(/#\{href\}/g,
								"#" + id).replace(/#\{label\}/g, label));
						// id = !url.indexOf( "#" ) ?
						// url.replace( "#", "" ) :
						// this._tabId( li );

						// li.addClass( "ui-state-default ui-corner-top" ).data(
						// "ui-tabs-destroy", true );
						// li.attr( "aria-controls", id );

						doInsertAfter = index >= this.tabs.length;

						// try to find an existing element before creating a new
						// one
						panel = this.element.find("#" + id);
						if (!panel.length) {
							panel = this._createPanel(id);
							panel.append(o.content);
							if (doInsertAfter) {
								if (index > 0) {
									panel.insertAfter(this.panels.eq(-1));
								} else {
									if (container) {

										panel.appendTo(container);
									} else {
										panel.appendTo(this.element);
									}
								}
							} else {
								panel.insertBefore(this.panels[index]);
							}
						}
						// panel.addClass( "ui-tabs-panel ui-widget-content
						// ui-corner-bottom" ).hide();
						panel.hide();

						if (doInsertAfter) {
							li.appendTo(this.tablist);
						} else {
							li.insertBefore(this.tabs[index]);
						}

						options.disabled = $.map(options.disabled, function(n) {
							return n >= index ? ++n : n;
						});

						this.refresh();

						if (this.tabs.length === 1 && options.active === false) {
							this._activate(0, false);
						}

						if (o.active === true) {
							this._activate(index, false);
						}

						this._trigger("add", null, this._ui(
								this.anchors[index], this.panels[index]));
						return this;
					},
					_processTabs : function() {
						var that = this, prevTabs = this.tabs, prevAnchors = this.anchors, prevPanels = this.panels;

						this.tablist = this._getList().addClass("ui-tabs-nav")
								.attr("role", "tablist")

								// Prevent users from focusing disabled tabs via
								// click
								.delegate(
										"> li",
										"mousedown" + this.eventNamespace,
										function(event) {
											if ($(this)
													.is(".ui-state-disabled")) {
												event.preventDefault();
											}
										})

								// support: IE <9
								// Preventing the default action in mousedown
								// doesn't prevent IE
								// from focusing the element, so if the anchor
								// gets focused, blur.
								// We don't have to worry about focusing the
								// previously focused
								// element since clicking on a non-focusable
								// element should focus
								// the body anyway.
								.delegate(
										".ui-tabs-anchor",
										"focus" + this.eventNamespace,
										function() {
											if ($(this).closest("li").is(
													".ui-state-disabled")) {
												this.blur();
											}
										});

						this.lastTablistWidth = this.tablist.width();

						this.tabs = this.tablist.find("> li:has(a)").not(
								'.ui-tabs-paging-prev,.ui-tabs-paging-next') // :has(a[href])
						.addClass("ui-state-default").attr({
							role : "tab",
							tabIndex : -1
						});

						this.anchors = this.tabs.map(function() {
							return $("a", this)[0];
						}).addClass("ui-tabs-anchor").attr({
							role : "presentation",
							tabIndex : -1
						});

						this.panels = $();

						this.anchors
								.each(function(i, anchor) {
									var selector, panel, panelId, anchorId = $(
											anchor).uniqueId().attr("id"), tab = $(
											anchor).closest("li"), originalAriaControls = tab
											.attr("aria-controls");

									// inline tab
									if (that._isLocal(anchor)) {
										selector = anchor.hash;
										panelId = selector.substring(1);
										panel = that.element.find(that
												._sanitizeSelector(selector));
									} else { // 没有hash的时候,
										if (that.element
												.children('#main-tabs-panel').length > 0) {
											panel = that.element
													.children(
															'#main-tabs-panel')
													.childern(
															"div:eq(" + i + ")");
										} else {
											panel = that.element
													.children("div.ui-tabs-panel:eq("
															+ i + ")");
										}
										panelId = panel.attr("id");
										if (!panelId) {
											panelId = tab.attr("aria-controls")
													|| $({}).uniqueId()[0].id;
											panel.attr("id", panelId);
										}
										selector = "#" + panelId;
										$(anchor).attr("href", selector);
										panel.attr("aria-live", "polite");
									}

									if (panel.length) {
										that.panels = that.panels.add(panel);
									}
									if (originalAriaControls) {
										tab.data("ui-tabs-aria-controls",
												originalAriaControls);
									}
									tab.attr({
										"aria-controls" : panelId,
										"aria-labelledby" : anchorId
									});
									panel.attr("aria-labelledby", anchorId);
								});

						this.panels.addClass("ui-tabs-panel").attr("role",
								"tabpanel");

						// Avoid memory leaks (#10056)
						if (prevTabs) {
							this._off(prevTabs.not(this.tabs));
							this._off(prevAnchors.not(this.anchors));
							this._off(prevPanels.not(this.panels));
						}
						if (this.options.fixedHeight) {
							this.panels.addClass('ui-tabs-panel-absolute');
						}

					},
					
					 // handles show/hide for selecting tabs
			        _toggle: function (event, eventData, autoResize) {
			            var that = this,
			                toShow = eventData.newPanel,
			                toHide = eventData.oldPanel;

			            this.running = true;

			            function complete() {
			                that.running = false;
			                //activateOnce为true时,newPanel只加载一次
			                if (!that.options.activateOnce || toShow.data("loaded") !== true) {
			                    that._trigger("activate", event, eventData);
			                    toShow.data("loaded", true);
			                }

			                if (that.options.autoResizable && autoResize !== false) {
			                    $(window).trigger("debouncedresize");
			                }
			            }

			            function show() {
			                eventData.newTab.closest("li").addClass("ui-tabs-active");

			                if (toShow.length && that.options.show) {
			                    that._show(toShow, that.options.show, complete);
			                } else {
			                    toShow.show();
			                    complete();
			                }
			            }

			            var optionHide = this.options.hide;
			            var this_ui= $.proxy(this._ui,this);
			            // start out by hiding, then showing, then completing
			            if (toHide.length && this.options.hideOptions) {
			                this._hide(toHide, this.options.hideOptions, function () {
			                    eventData.oldTab.closest("li").removeClass("ui-tabs-active");
			                    show();
			                    if(optionHide){
			                    	optionHide(eventData,this_ui(eventData.oldTab,eventData.oldPanel));
			                    }
			                });
			            } else {
			                eventData.oldTab.closest("li").removeClass("ui-tabs-active");
			                toHide.hide();
			                if(optionHide){
		                    	optionHide(eventData,this_ui(eventData.oldTab,eventData.oldPanel));
		                    }
			                show();
			            }

			            toHide.attr("aria-hidden", "true");
			            eventData.oldTab.attr({
			                "aria-selected": "false",
			                "aria-expanded": "false"
			            });
			            // If we're switching tabs, remove the old tab from the tab order.
			            // If we're opening from collapsed state, remove the previous tab from the tab order.
			            // If we're collapsing, then keep the collapsing tab in the tab order.
			            if (toShow.length && toHide.length) {
			                eventData.oldTab.attr("tabIndex", -1);
			            } else if (toShow.length) {
			                this.tabs.filter(function () {
			                        return $(this).attr("tabIndex") === 0;
			                    })
			                    .attr("tabIndex", -1);
			            }

			            toShow.attr("aria-hidden", "false");
			            eventData.newTab.attr({
			                "aria-selected": "true",
			                "aria-expanded": "true",
			                tabIndex: 0
			            });
			        }
					
				});

/**
 * 改变ui.grid的默认option的值
 *      <pre></pre>
 */
$.extend($.ui.grid.prototype.options, {
	// pgtext: "Page {0} of {1}",
	pgtext : "共<span class='total-page'>{1}</span>页", // 修改属性默认值
	// recordtext: "View {0} - {1} of {2}",
	recordtext :"共{2}条记录",
	// emptyrecords: "No records to view",
	emptyrecords : "没有记录",
	//选择条数
	rowList: [10,20,50],
	//初始化页码可选数量，默认显示10个页码按钮
	displayNum:5
});

$.extend($.jgrid.defaults, {
	// pgtext: "Page {0} of {1}",
	pgtext : "共<span class='total-page'>{1}</span>页", // 修改属性默认值
	// recordtext: "View {0} - {1} of {2}",
	recordtext :"共{2}条记录",
	// emptyrecords: "No records to view",
	emptyrecords : "没有记录",
	//选择条数
	rowList: [10,20,50],
	//初始化页码可选数量，默认显示10个页码按钮
	displayNum:5
});


/**
 * @extends $.jgrid。_getCreateOptions
 * 用法:改变ui.grid的默认option的值
 * 
 * @extends $.jgrid。setSelection
 * 用法:注册onSelectChange，用于检测checkbox变化，全选checkbox不会触发这个事件
 * 
 *      <pre></pre>
 */
$.extend($.ui.grid.prototype, {
	_getCreateOptions : function() {
		// $.jgrid.defaults 为国际化文件的内容
		return $.extend($.jgrid.defaults, {
			// pgtext: "Page {0} of {1}",
			pgtext : "共<span class='total-page'>{1}</span>页", // 修改属性默认值
			// recordtext: "View {0} - {1} of {2}",
			recordtext :"共{2}条记录",
			// emptyrecords: "No records to view",
			emptyrecords : "没有记录",
			//选择条数
			rowList: [10,20,50],
			//初始化页码可选数量，默认显示10个页码按钮
			displayNum:5
		});
	},
	
	setSelection: function (selection, onsr, e) {
    var ts = this,
        stat, checked, pt, ner, ia, tpsr, fid;
    if (selection === undefined) {
        return;
    }
    if ($.type(selection) === 'object') {
        selection = selection[ts.p.keyName];
    }
    onsr = onsr === false ? false : true;
    pt = this.getGridRowById(selection); //$(ts.element).jqGrid('getGridRowById', selection);
    //if (!pt || !pt.className || pt.className.indexOf('ui-state-disabled') > -1) {
    if (!pt) {
        return;
    }

    function scrGrid(iR) {
        var ch = ts.grid.bDiv.clientHeight,
            rpos = $(ts.rows[iR]).position().top,
            rh = $(ts.rows[iR]).height(),
            $bDiv = ts.$slimScroll;

        if ($bDiv.getNiceScroll(0)) {  //表格空间够不需要出现滚动条时 返回false
            if (rpos < 0 || (rpos + rh) > ch) {
                $bDiv.getNiceScroll(0).doScrollTop($bDiv.getNiceScroll(0).getScrollTop() + rpos + rh - ch, 0);
            }
        }
    }

    if (ts.p.scrollrows === true) {
        ner = pt.rowIndex //$(ts.element).jqGrid('getGridRowById', selection).rowIndex;
        if (ner >= 0) {
            scrGrid(ner);
        }
    }
    if (ts.p.frozenColumns === true) {
        fid = ts.p.id + "_frozen";
    }

    if (ts.p.selrow !== pt.id) {
        if (ts.p.selrow && !ts.p.multiselect) {
            $(this.getGridRowById(ts.p.selrow)).removeClass("ui-state-highlight").attr({
                "aria-selected": "false",
                "tabindex": "-1"
            });
        }
        $(pt).addClass("ui-state-highlight").attr({
            "aria-selected": "true",
            "tabindex": "0"
        }); //.focus();
        if (ts.p.multiselect && !onsr) {
            $(pt).removeClass("ui-state-highlight").attr({
                "aria-selected": "false",
                "tabindex": "-1"
            });
        }
        if (fid) {
            $("#" + ts.p.selrow, "#" + fid).removeClass("ui-state-highlight");
            $("#" + selection, "#" + fid).addClass("ui-state-highlight");
        }
        stat = true;
    } else {
        if (ts.p.multiselect) {
            if (onsr) {
                $(pt).addClass("ui-state-highlight").attr({
                    "aria-selected": "true",
                    "tabindex": "0"
                });
            } else {
                $(pt).removeClass("ui-state-highlight").attr({
                    "aria-selected": "false",
                    "tabindex": "-1"
                });
            }
        }
        stat = false;
    }
    var oldrowid = ts.p.selrow;
    ts.p.selrow = pt.id;

    var scb = e != null && e.target != null && $(e.target).hasClass("cbox");
    if (ts.p.multiselect && scb) {
        //unselect selectall checkbox when deselecting a specific row
        ts.setHeadCheckBox(false);
        ia = $.inArray(ts.p.selrow, ts.p.selarrrow);
        if (ia === -1) {
            ts.p.selarrrow.push(ts.p.selrow);
            $(document.getElementById("jqg_" + ts.p.id + "_" + pt.id)).prop("checked", true);
        } else {
            ts.p.selarrrow.splice(ia, 1);
            $(document.getElementById("jqg_" + ts.p.id + "_" + pt.id)).prop("checked", false);
        }
    }

    ia = $.inArray(ts.p.selrow, ts.p.selarrrow);
    ia === -1 ? checked = false : checked = true;

    if (ts.p.treeGrid) { //自己如果没有显示,则显示出来
        ts._setVisibleNode(pt.id);
        if (ts.p.multiselect && scb) {
            ts._cascadeChecked(checked);
        }
    }
    ts._trigger("onSelectChange", e, [pt.id, stat, checked]);
    if (onsr) {
        ts._trigger("onSelectRow", e, [pt.id, stat, checked]);
        stat && ts._trigger("onChangeRow", e, [pt.id, oldrowid]);
    }

    if (this.element.closest('.ui-subgrid').length) {
        e.stopPropagation();
    }

},
/**
 * 取消行选中,还原编辑前的状态
 */
resetSelection: function () {
    var ts = this,
        sr, fid;
    if (ts.p.frozenColumns === true) {
        fid = ts.p.id + "_frozen";
    }

    if (ts.p.selrow) {
        $(this.getGridRowById(ts.p.selrow)).removeClass("ui-state-highlight").attr("aria-selected", "false");
        if (fid) {
            $("#" + ts.p.selrow, "#" + fid).removeClass("ui-state-highlight");
        }
        ts.p.selrow = null;
    }

    if (ts.p.cellEdit === true) {
        if (parseInt(ts.p.iCol, 10) >= 0 && parseInt(ts.p.iRow, 10) >= 0) {
            $("td:eq(" + ts.p.iCol + ")", ts.rows[ts.p.iRow]).removeClass("edit-cell ui-state-highlight");
            $(ts.rows[ts.p.iRow]).removeClass("selected-row ui-state-hover");
        }
    }
    ts._trigger("onSelectChange");
    ts.p.savedRow = [];
}
});

/**
 * @extends $.ui.pagination
 *
 * 用法:改变pagination模板
 *      <pre></pre>
 */
(function(){
	var template = '\n        {{#if pages}}\n            {{#if pgButton}}\n                <li class="first" data-page=1 data-page-type="first">\n                    <a href="javascript:;">{{{first}}}</a>\n                </li>\n                <li class="prev" data-page={{pages.prevPage}} data-page-type="prev">\n                    <a href="javascript:;">{{{prev}}}</a>\n                </li>\n                {{#if pgNumber}}\n                {{#each pages.numeric}}\n                    <li class="page hidden-xs hidden-sm" data-page={{this}} data-page-type="page">\n                        {{#ifCond this ">" 9999}} \n                            <a href="javascript:;"  class="ellipsis" title={{this}}>{{this}}</a>\n                        {{else}}\n                            <a href="javascript:;">{{this}}</a>\n                        {{/ifCond}}\n                    </li>\n                {{/each}}\n                {{/if}}\n                <li class="next" data-page={{pages.nextPage}} data-page-type="next">\n                    <a href="javascript:;">{{{next}}}</a>\n                </li>\n                <li class="last" data-page={{pages.totalPages}} data-page-type="last">\n                    <a href="javascript:;">{{{last}}}</a>\n                </li>\n            {{/if}}\n            {{#if pgTotal}}\n                {{#totalpage}}\n                {{/totalpage}}\n            {{/if}}\n            {{#if pgRecText}}\n                {{#recordtextpage}}\n                {{/recordtextpage}}\n            {{/if}}\n        {{/if}}';
    var templateNone = '\n        {{#if pages}}\n            {{#if pgTotal}}\n                {{#totalpage}}\n                {{/totalpage}}\n            {{/if}}\n            {{#if pgRecText}}\n                {{#recordtextpage}}\n                {{/recordtextpage}}\n            {{/if}}\n        {{/if}}';
    var templateAdd = '\n        {{#rowtextpage}}\n        {{/rowtextpage}}\n        {{#if pgInput}}\n            {{#gopage}}\n            {{/gopage}}\n        {{/if}}';
    $.extend($.ui.pagination.prototype, {
    	_render: function (pages) {
    	    var base = this;

    	    base.$listContainer.children().remove();

    	    var recordsStart = 1;
    	    recordsStart = (parseInt(pages.currentPage) - 1) * parseInt(base.options.rowNum) + 1;
    	    var recordsEnd = base.options.rowNum;
    	    if (pages.currentPage === pages.totalPages) {
    	        recordsEnd = parseInt(base.options.records);
    	    } else {
    	        recordsEnd = recordsStart + parseInt(base.options.rowNum) - 1;
    	    }

    	    Handlebars.registerHelper('totalpage', function () {
    	        var pgText = base._format(base.options.pgtext || fish.getResource('pagination.pgtext'), pages.currentPage, pages.totalPages);
    	        return '<li class="' + base.options.pgtextClass + '"><span>' + pgText + '</span></li>';
    	    });

    	    Handlebars.registerHelper('recordtextpage', function () {
    	        var recordText = base._format(base.options.recordtext || fish.getResource('pagination.recordtext'), recordsStart, recordsEnd, pages.records);
    	        return '<li class="' + base.options.pgrectextClass + '"><span>' + recordText + '</span></li>';
    	    });

    	    if (this.options.totalPages === 0) {
    	        this.$listContainer.append(fish.compile(templateNone)({
    	            pages: pages,
    	            pgTotal: this.options.pgTotal,
    	            pgRecText: this.options.pgRecText
    	        }));
    	    } else {
    	        this.$listContainer.append(fish.compile(template)({
    	            pages: pages,
    	            pgButton: this.options.pgButton,
    	            pgNumber: this.options.pgNumber,
    	            pgTotal: this.options.pgTotal,
    	            pgRecText: this.options.pgRecText,
    	            first: this.options.first,
    	            prev: this.options.prev,
    	            next: this.options.next,
    	            last: this.options.last
    	        }));
    	    }

    	    if (!fish.isNaN(parseInt(this.options.total)) && parseInt(this.options.total) > 0) {
    	        this.options.totalPages = parseInt(this.options.total);
    	    } else {
    	        this.options.totalPages = Math.ceil(parseInt(this.options.records) / parseInt(this.options.rowNum));
    	    }

    	    this.element.find('li').each(function () {
    	        var $this = $(this);
    	        $this.filter(function () {
    	            return $this.data('page') === pages.currentPage && $this.data('page-type') === 'page';
    	        }).addClass('active');

    	        $this.filter(function () {
    	            return $this.data('page-type') === 'first';
    	        }).toggleClass(base.options.disabledClass, pages.currentPage === 1);

    	        $this.filter(function () {
    	            return $this.data('page-type') === 'prev';
    	        }).toggleClass(base.options.disabledClass, pages.currentPage === 1);

    	        $this.filter(function () {
    	            return $this.data('page-type') === 'next';
    	        }).toggleClass(base.options.disabledClass, pages.currentPage === base.options.totalPages);

    	        $this.filter(function () {
    	            return $this.data('page-type') === 'last';
    	        }).toggleClass(base.options.disabledClass, pages.currentPage === base.options.totalPages);
    	    });
    	}
    });	
})();

/**
 * List<br>
 * @class fish.desktop.widget.Simplelist
 * @extends fish.desktop.widget
 *
 * 用法:<br/>
 *      <pre></pre>
 */
!function() {
    $.widget('ui.simplelist', {
        options: {
            data:[],
            key:"id",
            value:"value",
            chosen:"chosen",
            badge:"默认"
        },
        _create: function() {
            var $el = this.element;

            this.options = $.extend({}, this.options, {
            	data:[]
            });

            this._createUI();
            this._bindEvent();
        },
        _init: function() {},
        _destroy: function() {},
        _createUI: function () {
        	this._render();
        	
        },
        _render:function(){
        	var $el = this.element;
        	var template='<a class="list-group-item  {{#if '+this.options.chosen+'}} active {{/if}} <span class="badge isdefault">'+badge+'</span><span class="close">x</span>'
        	+'<h4 class="list-group-item-heading">{{'+this.options.key+'}}</h4><p class="list-group-item-text">'+this.options.value+'</p></a>';
        	var t = fish.compile(template);
        	$.each(data,function(i,o){
        		$el.append(t(o));
        	});
        	
        },
        _bindEvent: function () {
        }
    });
}();

/**
 * 改变ui.grid的默认option的值
 *      <pre></pre>
 */
$.extend($.ui.scrollspy.prototype, {
	_create: function() {
        this.$body = $('body');
        var element = this.element;
        this.$scrollElement = $(element).is('body') ? $(window) : $(element);
        this.selector = (this.options.target || '') + ' .nav li > a';
        this.offsets = [];
        this.targets = [];
        this.activeTarget = null;
        this.scrollHeight = 0;
        this.$scrollElement.on('scroll', $.proxy(this._process, this));
        this.refresh();
        this._bindSelectorEvent();
        this._process();
    },
    _bindSelectorEvent:function(){
    	var self = this;
        
        this.$body.find(this.selector)
            .each(function(i,a) {
                var $el = $(a)
                var href = $el.data('target') || $el.attr('href')
                var $href = /^#./.test(href) && $(href);
                $el.css("cursor","pointer");
                $el.on("click",function(e){
                	self.$scrollElement.animate({      
                		scrollTop: $href.offset().top- self.$scrollElement.offset().top + self.$scrollElement.scrollTop()
                		});
                	});
                
            })

    }
});


/**
 * 告警监控表格
 */
(function($) {
	
	function setSize(target) {
		var gridWrap = $(target).parent();
		if($(gridWrap).is(":hidden")){
			return;
		}		
		var opts = $.data(target, "monitorgrid").options;
		if(opts.fit == true){
			var p = gridWrap.parent();
			opts.width = p.width();
			opts.height = p.height();
		}
		gridWrap.width(opts.width);
		gridWrap.height(opts.height);
		$(target).width(opts.width);
		$(target).height(opts.height);
		$(target).find(".grid-body").height(opts.height - 28);
		gridWrap.parent().css("overflow", "hidden");
	}

	// 初始化表格
	function init(target) {
		var gridWrap = $(target).wrap('<div class="grid-wrap"></div>').parent();
		var opts = $.data(target, "monitorgrid").options;
		if(opts.fit == true){
			var p = gridWrap.parent();
			opts.width = p.width();
			opts.height = p.height();
		}
		gridWrap.width(opts.width);
		gridWrap.height(opts.height);
		$(target).width(opts.width);
		$(target).height(opts.height);		
		if(opts.border == true){
			//$(target).css("border", "1px solid #d4d4d4");
		}
		
		$(target).addClass("div-grid");
		
		var totalWidth = 0;
		var headRow = $("<div></div>").attr("class", "head-row").css("border-top", "0px solid #E6E6E6");
		
		$.each(opts.columns, function(index, element) {
			$("<div></div>").attr("class", "head-cell").text(element["title"]).width(element["width"]).appendTo(headRow);
			totalWidth += element["width"] + 5;
		})
		headRow.css("min-width", totalWidth).appendTo(target);
		$.data(target, "monitorgrid").runParams.rowWidth = totalWidth; //保存行的宽度
		$("<div></div>").attr("class", "grid-body").height(opts.height - 28).css("min-width", totalWidth).appendTo(target);
		
		(function(){
			var lock = false;
			$(window).resize(function(){
				if(!lock){
					lock = true;
					setTimeout(	function(){
						setSize(target); 
						lock = false;}, 300);
				}
			});
		})();
	}

	function insertRow(target, rows){
		if(!rows || rows.length <= 0) return;
		var opts = $.data(target, "monitorgrid").options;
		//var data = $.data(target, "monitorgrid").data;
		//data.push(rowData);
		
		var rowList = [];
		$.each(rows, function(index, rowData){
			var cellList = [];
			$.each(opts.columns, function(index, element) {
				var text = rowData[element["field"]];
				if(!text){ text = "";}
				var cellContent= text; //单元格内容
				if(element.formatter){
					cellContent = element.formatter(text, rowData);
				}
				var align = "left";
				if(element["align"]){
					align = element["align"];
				}
				var cellDiv = $("<div>" + cellContent + "</div>").attr("class", "grid-cell").width(element["width"]).attr("title",text).css("text-align", align);
				
				cellList.push(cellDiv);
				//cellDiv.appendTo(row);
			})
			var cellHTMLStr = "";
			$.each(cellList, function(index, cellElement){
				cellHTMLStr += cellElement[0].outerHTML;
			});
			var row = $("<div>"+ cellHTMLStr +"</div>").attr("class", "grid-row").css("min-width", $.data(target, "monitorgrid").runParams.rowWidth).attr("row-index", -1); //索引值暂时不实现
			if(opts.idField && rowData[opts.idField]){
				row.attr("id", "data_row_" + rowData[opts.idField]);
			}			
			rowList.push(row);
		});
		
		var rowHTMLStr = "";
		$.each(rowList, function(index, rowElement){
			rowHTMLStr += rowElement[0].outerHTML;
		});
		
		$(target).find(".grid-body").prepend(rowHTMLStr);
		$.data(target,"monitorgrid").runParams.total += rowList.length;  //TODO:
		
		//增加事件
		$.each(rows, function(index, rowData){
			var row  = $(target).find("#data_row_" + rowData[opts.idField]);
			if(row && row.length == 1){
				//row.click(rowClickEvent).dblclick(rowDblclickEvent);
				
				row[0].onclick = function(){
					rowClickEvent.call(this, target, rowData);
				};
				row[0].ondblclick = function(){
					rowDblclickEvent.call(this, target, rowData);
				};
				
			/*	row.bind('click', function(){
					rowClickEvent.call(this, target, rowData);
				}).bind('dblclick', function(){
					rowDblclickEvent.call(this, target, rowData);
				});*/
			}
		});
	}
	
	function rowClickEventWrap(){
		
	}
	
	function rowDblClickEventWrap(){
		
	}
	
	
	function rowClickEvent(target, rowData){
		var opts = $.data(target, "monitorgrid").options;
		$(target).find(".grid-body > .grid-row-click").removeClass("grid-row-click");
		$(this).addClass("grid-row-click")
		if(opts.onClickRow){
			var opts = $.data(target, "monitorgrid").options;
			//var rowIndex = $(this).attr("row-index");
			var rowIndex = -1;
			opts.onClickRow.call(this, rowIndex, rowData);
		}
	}
	
	function rowDblclickEvent(target, rowData){
		var opts = $.data(target, "monitorgrid").options;
		if(opts.onDblClickRow){
			var opts = $.data(target, "monitorgrid").options;
			//var rowIndex = $(this).attr("row-index");
			var rowIndex = -1;
			opts.onDblClickRow.call(this, rowIndex, rowData);
		}
	}
	
	function deleteRow(target, idFieldValue){
		var result;
		if(idFieldValue){
			result = $(target).find(".grid-body > #data_row_%id%".replace(/%id%/, idFieldValue));
		}else{
			result = $(target).find(".grid-body > .grid-row:last");
			//var data = $.data(target, "monitorgrid").data;
			//data.shift();
		}
		//删除Dom元素
		if(result && result.length && result.length == 1){
			$.data(target,"monitorgrid").runParams.total -= 1;
			
			//result.unbind();
			result[0].onclick = null;
			result[0].ondblclick = null;
			
			result.remove();
			result.html(null);
			result.removeAttr("class").removeAttr("row-index").removeAttr("id").removeAttr("style");
			try{
				delete result[0];
				delete result.context;
				delete result.prevObject;
				delete result.length;
				delete result.selector
				delete result.__proto__;
				delete result;
				result=null;
			}catch(e){}
		
		}
	
	}
	
	function getTotal(target){
		var total = $.data(target,"monitorgrid").runParams.total;
		return total;
	}
	
	function exist(target, id){
		if(!id) return false;
			
		var exp = ".grid-body > #data_row_%id%".replace(/%id%/, id);
		var rowDiv = $(target).find(exp);
		if(rowDiv.length == 1){
			return true;
		}else{
			return	false;
		}
	}
	
	function alarmLevelFormater(value, row) {
		var bgColor = "";
		if (row.alarmLevelId == 5) {
			bgColor = 'background-color:#FF0000;';
		} else if (row.alarmLevelId == 4) {
			bgColor = 'background-color:#FFA500;';
		} else if (row.alarmLevelId == 3) {
			bgColor = 'background-color:#FFFF00;';
		} else if (row.alarmLevelId == 2) {
			bgColor = 'background-color:#00FFFF;';
		} else if (row.alarmLevelId == 1) {
			bgColor = 'background-color:#800080;';
		} else if (row.alarmLevelId == 6) {
			bgColor = 'background-color:#00FF00;';
		}
		return '<div style="width:100%;height:23px; color:#000000; text-align:center;'
				+ bgColor
				+ '" title='
				+ value
				+ '>'
				+ value
				+ '</div>';
	}
	
	$.fn.monitorgrid = function(options, param) {
		if (typeof options == 'string') {
			switch(options){
				case 'insertRow':
					return this.each(function(){
						insertRow(this, param);
					});
				case 'deleteRow':
					return this.each(function(){
						deleteRow(this, param);
					});
				case 'setSize':
					return this.each(function(){
						setSize(this);
					});	
				case 'getTotal':
					return getTotal(this[0], param);
				case 'exist':
					return exist(this[0], param);
			}
		}
		options = options || {};
		return this.each(function() {
			var state = $.data(this, 'monitorgrid');
			if (state) {
				$.extend(state.options, options);
			} else {
				state = $.data(this, 'monitorgrid', {
					options : $.extend({}, $.fn.monitorgrid.defaults, options),
					data:[],
					runParams:{total:0} //运行时参数
				});
			}
			init(this);
		});
	};

	$.fn.monitorgrid.defaults = {
		width: 'auto',
		height: 'auto',
		fit: false,
		idField:null,
		onClickRow: function(rowIndex, rowData){},
		onDblClickRow: function(rowIndex, rowData){},
		columns : [{
			title : '告警流水号',
			field : 'meAlarmNo',
			width : 160
		}, {
			title : '区域',
			field : 'areaName',
			width : 50
		}, {
			title : '告警ID',
			field : 'meAlarmId',
			width : 100
		}, {
			title : '告警标题',
			field : 'title',
			width : 250
		}, {
			title : '告警大类',
			field : 'alarmBigTypeValue',
			width : 80
		}, {
			title : '告警级别',
			field : 'alarmLevelName',
			formatter:alarmLevelFormater,
			width : 80
		},{
			title : '状态',
			field : 'dealWithStatusValue',
			width : 60,
			align:'center'
		}, {
			title : '告警对象',
			field : 'objectName',
			width : 150
		}, {
			title : '所属EMS',
			field : 'emsName',
			width : 130
		}, {
			title : '告警时间',
			field : 'firstAlarmTimeStr',
			width : 140
		},{
			title : '描述',
			field : 'description',
			width : 250
		} ]
	}

})(jQuery);

//fullCalendar
(function(){
	
	
	if($.fullCalendar){
		$.extend($.fullCalendar.Scroller.prototype,{
			
			applyOverflow: function() {
				this.scrollEl.css({
					'overflow': 'hidden !important'
				});
				this.scrollEl.css({
					'overflow-x': 'hidden !important',
					'overflow-y': 'hidden !important'
				});
				
				var style=this.scrollEl.attr('style');
				
				if(style!=null&&style!=''){
					style = style.replace("overflow-y: scroll","overflow-y: hidden");
					style = style.replace("overflow-x: scroll","overflow-x: hidden");
				}
				this.scrollEl.attr('style',style);
				
				
				$(this.scrollEl).niceScroll({
			        cursorcolor: '#1d5987',
			        cursorwidth: "10px",
			        cursoropacitymax:"0.4"//,autohidemode:false
			    });
			},// Positions the popover optimally, using the top/left/right options
			// Causes any 'auto' overflow values to resolves to 'scroll' or 'hidden'.
			// Useful for preserving scrollbar widths regardless of future resizes.
			// Can pass in scrollbarWidths for optimization.
			lockOverflow: function(scrollbarWidths) {
				var overflowX = this.overflowX;
				var overflowY = this.overflowY;

				scrollbarWidths = scrollbarWidths || this.getScrollbarWidths();

				if (overflowX === 'auto') {
					overflowX = (
							scrollbarWidths.top || scrollbarWidths.bottom || // horizontal scrollbars?
							// OR scrolling pane with massless scrollbars?
							this.scrollEl[0].scrollWidth - 1 > this.scrollEl[0].clientWidth
								// subtract 1 because of IE off-by-one issue
						) ? 'scroll' : 'hidden';
				}

				if (overflowY === 'auto') {
					overflowY = (
							scrollbarWidths.left || scrollbarWidths.right || // vertical scrollbars?
							// OR scrolling pane with massless scrollbars?
							this.scrollEl[0].scrollHeight - 1 > this.scrollEl[0].clientHeight
								// subtract 1 because of IE off-by-one issue
						) ? 'scroll' : 'hidden';
				}

				this.scrollEl.css({ 'overflow-x': 'hidden', 'overflow-y': 'hidden' });
			}
			
		});
	}
		
		
})()

