define([ 'text!modules/common/templates/MainView.html' + codeVerP,
		'modules/common/views/HeaderView.js' + codeVerP,
		'modules/common/views/NavView.js' + codeVerP,
		'modules/common/cloud-utils.js' + codeVerP ], function(MainViewTpl,
		HeaderView, NavView, cUtil) {
	
	return fish.View.extend({
		template : fish.compile(MainViewTpl),
		TABITEM_TAG : '-tabItem',
		screenSizes: {
            xs: 480,
            sm: 768,
            md: 992,
            lg: 1200
        },
		events : {
			"click .content-wrapper" : "doClickWrapper",
			"click .sidebar .sidebar-menu>li>a" : "doMenuLV1RealClick",
			"click .sidebar li.treeview>ul>li>a" : "doMenuLV2Click",
			"click .main-sidebar-collapse-inner" : "_collapseSidebar",	
			"click .main-sidebar-expand-inner" : "_expandSidebar",
			"click .first-sidebar-treemenu-archor":	"firstSidebarClick"
		},
		serialize : function() {
			return fish.extend({}, this.i18nData);
		},

		initialize : function() {
			var me =this;
			fish.on('replaceTabView', $.proxy(this.replaceTabView, this));
			this.mainWebSocket =this.websocket("ws://192.168.14.156:9008/cws/main",{
				open: function() { 
					console.log('open:  ',arguments) 
				}, 
				close: function() { 
					console.log('close:  ',arguments) 
				},error:function(){
					me.mainWebSocket=null;
				}
				
			});
		},
		_render:function(){
			this.$el.html(this.template(this.serialize()));
			//this.$el.find('#main-header').append((new HeaderView()).render().$el);
			return this;
		},
		// 这里用来初始化页面上要用到的fish组件
		afterRender : function() {
			// tab初始化
			this._initTabs();
			//画一级菜单
			this._drawTopMenus();
			//加载header
			this.requireView({
				selector : '#main-header',
				url : 'modules/common/views/HeaderView'
			});
			//加载二三级菜单侧边栏
			this.requireView({
				selector : '.sidebar-menu',
				url : 'modules/common/views/NavView',
				viewOption : {
					menus : this._qryMenus(),
					mainMenu : _.findWhere(userMenus, {
						parentMenuId : 0
					})
				}
			});
			/*var expand = $.proxy(this._expandSidebar, this),qryMenus=$.proxy(this._qryMenus, this);
			this.$el.on('click','.first-sidebar-treemenu-archor',function(e){
				
				var mid = $(e.currentTarget).parent('li').attr("id");
				if(mid==null)return;
				var mMenu = _.find(userMenus, function(m){
					return m.moduleName.toLowerCase()==mid.toLowerCase();
				});
				
				if(mMenu==null)return;
				var chi = qryMenus(mMenu);
				if(chi==null||chi.length<1)return;
				
				expand();
				
			});*/
			//注册resize事件
			this._windowResize();
			// 初始化路由事件
			this._haschange();
			//执行一次路由处理
			this._initRouter();
			// 初始化打开信息接报
			// this.doOpenModuleView("union-info-receive");
		},
		firstSidebarClick:function(e){
			
			var mid = $(e.currentTarget).parent('li').attr("id");
			if(mid==null)return;
			var mMenu = _.find(userMenus, function(m){
				return m.moduleName.toLowerCase()==mid.toLowerCase();
			});
			
			if(mMenu==null)return;
			var chi = this._qryMenus(mMenu);
			if(chi==null||chi.length<1)return;
			
			this._expandSidebar();
		},
		
		
		_initTabs : function() {
			$('.main-content-tabs').tabs({
				paging : true,
				autoResizable : true,
				canClose : true,
				activate:$.proxy(this._tabActivate,this),
				beforeActivate:$.proxy(this._tabBeforeActivate,this),
				beforeRemove:$.proxy(this._tabBeforeRemove,this),
				hide:this._tabHide//$.proxy(this._tabHide,this)
			});
		},
		_tabActivate:function(event, tabui){
			var view = this.__manager__.views['#'+tabui.newPanel.attr('id')];
			if(view&&fish.isFunction(view.tabActived)){
				view.resize();
				view.tabActived(event,tabui);
			}
		},
		_tabHide:function(event, tabui){
			
			var view = MainView.__manager__.views['#'+tabui.panel.attr('id')];
			if(view&&fish.isFunction(view.tabHid)){
				
				view.tabHid(event,tabui);
			}
		},
		_tabBeforeActivate:function(event, tabui){
			
			
			$(window).resize();
			setTimeout(function(){
				$(window).resize();
                
            },304);
		},
		_tabBeforeRemove:function(n,tabui){
			var view = this.__manager__.views['#'+tabui.panel.attr('id')];
			if(view){
				view.remove();
			}
			$(window).resize();
			setTimeout(function(){
				$(window).resize();
                
            },304);
			
		},
		
		_initRouter : function() {
			var requireView = $.proxy(this.requireView, this);
			var doMenuLV1Click = $.proxy(this.doMenuLV1Click, this);
			var doMenuLV2Click = $.proxy(this.doMenuLV2Click, this);
			var qryMenus = $.proxy(this._qryMenus, this);
			var doOpenPortal=$.proxy(this.doOpenPortal, this);
			var me =this;
			$(window).on('hashchange', function(e) {
				var h = cUtil.getHash();
				var oldh = cUtil.getHash(e.originalEvent.oldURL?e.originalEvent.oldURL:"");
				// var urlview= _.findWhere(h.params,{pages:'sss'});
				var rootMenus = _.where(userMenus, {
					parentMenuId : 0
				});
				
				if (h.pageRoute) {
					var mainMenu = _.find(userMenus, function(m){return m.parentMenuId == 0&&(m.archor.toLowerCase()==h.pageRoute[0].toLowerCase()||(h.pageRoute[0]!=""&&m.archor.toLowerCase().indexOf(h.pageRoute[0].toLowerCase()+"/")>=0)) ;});
					//如果是首页
					if(h.pageRoute[0]=='portal'){
						doOpenPortal();
					}
					
					if(!oldh.pageRoute||oldh.pageRoute.length<1||oldh.pageRoute[0].toLowerCase()!=h.pageRoute[0].toLowerCase()){
					if(me.$el.find('#'+h.pageRoute[0].toLowerCase()).length>0){
						me.$el.find('.first-sidebar-treemenu>li').removeClass('active');
						me.$el.find('#'+h.pageRoute[0].toLowerCase()).addClass('active');
					}
					requireView({
						selector : '.sidebar-menu',
						url : 'modules/common/views/NavView',
						viewOption : {
							menus : qryMenus(mainMenu),
							mainMenu : mainMenu
						}
					}).done(function(){
						if(h.pageRoute.length>1){
							
							var mid ="#com-menu-"+h.pageRoute[1].toLowerCase();
							if(me.$el.find(mid).length>0){
								var e ={};
								e.currentTarget=me.$el.find(mid);
								e.preventDefault=function(){};
								e.stopPropagation=function(){};
								doMenuLV1Click(e);
							}
							
							
						}
						
						if(h.pageRoute.length>2){
							
							var mid ='#com-menu-'+h.pageRoute[2].toLowerCase();
							if(me.$el.find(mid).length>0){
								
								var e ={};
								e.currentTarget=me.$el.find(mid);
								e.preventDefault=function(){};
								e.stopPropagation=function(){};
								doMenuLV2Click(e);
							}
							
						}
					});
					}
					else{
						
						
						
						if(h.pageRoute.length>1&&(!oldh.pageRoute||oldh.pageRoute.length<2||oldh.pageRoute[1].toLowerCase()!=h.pageRoute[1].toLowerCase())){
								
							var mid ="#com-menu-"+h.pageRoute[1].toLowerCase();
							if(me.$el.find(mid).length>0){
								var e ={};
								e.currentTarget=me.$el.find(mid);
								e.preventDefault=function(){};
								e.stopPropagation=function(){};
								doMenuLV1Click(e);
							}
						}
						
						if(h.pageRoute.length>2){//&&(!oldh.pageRoute||oldh.pageRoute.length<3||oldh.pageRoute[2].toLowerCase()!=h.pageRoute[2].toLowerCase())){
							
							var mid ='#com-menu-'+h.pageRoute[2].toLowerCase();
							if(me.$el.find(mid).length>0){
								
								var e ={};
								e.currentTarget=me.$el.find(mid);
								e.preventDefault=function(){};
								e.stopPropagation=function(){};
								doMenuLV2Click(e);
							}
							
						}
					}
				} else {
					
					doOpenPortal();
				}
			});
		},
		_haschange : function(e) {
			var requireView = $.proxy(this.requireView, this);
			var doMenuLV1Click = $.proxy(this.doMenuLV1Click, this);
			var doMenuLV2Click = $.proxy(this.doMenuLV2Click, this);
			var qryMenus = $.proxy(this._qryMenus, this);
			var doOpenPortal=$.proxy(this.doOpenPortal, this);
			var h = cUtil.getHash();
			//var oldh = cUtil.getHash(e.originalEvent.oldURL);
			var me = this;
			// var urlview= _.findWhere(h.params,{pages:'sss'});
			var rootMenus = _.where(userMenus, {
				parentMenuId : 0
			});
			if (h.pageRoute) {
				var mainMenu = _.find(userMenus, function(m){return m.parentMenuId == 0&&(m.archor.toLowerCase()==h.pageRoute[0].toLowerCase()||(h.pageRoute[0]!=""&&m.archor.toLowerCase().indexOf(h.pageRoute[0].toLowerCase()+"/")>=0));});
				//如果是首页
				if(h.pageRoute[0]=='portal'){
					doOpenPortal();
				}
				if(this.$el.find('#'+h.pageRoute[0].toLowerCase()).length>0){
					this.$el.find('.first-sidebar-treemenu>li').removeClass('active');
					this.$el.find('#'+h.pageRoute[0].toLowerCase()).addClass('active');
				}
				requireView({
					selector : '.sidebar-menu',
					url : 'modules/common/views/NavView',
					viewOption : {
						menus : qryMenus(mainMenu),
						mainMenu : mainMenu
					}
				}).done(function(){
					if(h.pageRoute.length>1){
						var mid ="#com-menu-"+h.pageRoute[1].toLowerCase();
						
						
						if(me.$el.find(mid).length>0){
							var e ={};
							e.currentTarget=me.$el.find(mid);
							e.preventDefault=function(){};
							e.stopPropagation=function(){};
							doMenuLV1Click(e);
						}
					}
					
					if(h.pageRoute.length>2){
						
						var mid ='#com-menu-'+h.pageRoute[2].toLowerCase();
						if(me.$el.find(mid).length>0){
							
							var e ={};
							e.currentTarget=me.$el.find(mid);
							e.preventDefault=function(){};
							e.stopPropagation=function(){};
							doMenuLV2Click(e);
						}
						
					}
				});
				
				
			} else {
				
				doOpenPortal();
			}

		},
		_qryMenus : function(mainMenu) {
			if (mainMenu == null) {
				mainMenu = _.findWhere(userMenus, {
					parentMenuId : 0
				});
			}
			if (mainMenu) {
				var data = _.where(userMenus, {
					parentMenuId : mainMenu.menuId
				}) || [];// 二级菜单
				$.each(data, function(i, m) {// 三级菜单
					m.children = _.where(userMenus, {
						parentMenuId : m.menuId
					});
				})

				return data;
			}
			return null;
		},
		doClickWrapper : function() {
			var screenSizes = {
				xs : 480,
				sm : 768,
				md : 992,
				lg : 1200
			};
			if ($(window).width() <= (screenSizes.sm - 1)
					&& $("body").hasClass("sidebar-open")) {
				$("body").removeClass('sidebar-open');
			}
		},

		/**
		 * 替换TabView
		 * 
		 * @param options
		 */
		replaceTabView : function(options) {
			this.requireView(options);
		},
		doMenuLV1RealClick : function(event) {

			var h = cUtil.getHash();
			var moduleName = $(event.currentTarget).attr("id").replace("com-menu-","");
			if(h.pageRoute&&moduleName!=null&&h.pageRoute.length>1&&h.pageRoute[1].toLowerCase()==moduleName.toLowerCase()){
				this.doMenuLV1Click(event);
			}
			
		},
		
		// 一级菜单导航点击事件处理
		doMenuLV1Click : function(event) {
			
			// 首先处理导航菜单的响应
			this.doExpandSidebar(event);
			// 打开相应的模块视图
			var moduleId = $(event.currentTarget).attr("id");
			var moduleName = $(event.currentTarget).data("modulename");
			var moduleURL = $(event.currentTarget).data("module");
			var isIframe = $(event.currentTarget).data("isiframe");
			var frameUrl = $(event.currentTarget).data("frameurl");
			if(isIframe=='Y'||isIframe=='y'){
				this.doOpenModuleFrame(moduleId, moduleName, frameUrl);
				return;
			}
			
			if (moduleURL != null && moduleURL != '')
				this.doOpenModuleView(moduleId, moduleName, moduleURL);
		},

		// 二级菜单导航点击事件处理
		doMenuLV2Click : function(event) {
			event.stopPropagation();
			$(event.currentTarget).parent('li').parent('ul').find(">li.active").removeClass('active');
			$(event.currentTarget).parent('li').addClass('active');
			var moduleId = $(event.currentTarget).attr("id");
			var moduleName = $(event.currentTarget).data("modulename");
			var moduleURL = $(event.currentTarget).data("module");

			var isIframe = $(event.currentTarget).data("isiframe");
			var frameUrl = $(event.currentTarget).data("frameurl");
			if(isIframe=='Y'||isIframe=='y'){
				this.doOpenModuleFrame(moduleId, moduleName, frameUrl);
				return;
			}
			// 打开相应的模块视图
			this.doOpenModuleView(moduleId, moduleName, moduleURL);

		},
		doOpenModuleFrame:function(moduleId, moduleName, frameUrl){
			this._collapseSidebar();
			var allTabs = $(".main-content-tabs").tabs("getAllTabs", true,
					false);
			if (allTabs.length > 0) {
				var id_liItem;
				for ( var index = 0; index < allTabs.length; index++) {
					id_liItem = allTabs[index].children().attr("href");
					// 去除#符号
					id_liItem = id_liItem.substring(1, id_liItem.length);
					if (id_liItem == (moduleId + this.TABITEM_TAG)) {
						// 激活tabItem
						this.doActiveTabItem(id_liItem);
						return;
					}
				}
			}
			this.doAddTabFrameItem(moduleId, moduleName, frameUrl);
		},

		// 打开新的标签页
		doAddTabFrameItem : function(moduleId, moduleName, frameUrl) {
			if (frameUrl) {
				var viewId = moduleId + this.TABITEM_TAG + "";
				this.$('.main-content-tabs').tabs('add', {
					id : viewId,
					label : moduleName,
					active : true,
					container:'#main-tabs-panel'
				});
				this.$el.find('#' + viewId).css('height','100%');
				this.$el.find('#' + viewId).append('<iframe src="'+frameUrl+'"  frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="auto" style="width:100%;height:99%;" allowtransparency="yes"></iframe>');
				
			}
		},
		doOpenPortal:function(){
			this.requireView({
				selector : '.sidebar-menu',
				url : 'modules/common/views/NavView',
				viewOption : {
					menus : [],
					mainMenu :null
				}
			});
			this.doOpenModuleView('portal','首页','modules/common/portal/views/PortalView');
			
		},
		
		doOpenModuleView : function(moduleId, moduleName, moduleURL) {
			this._collapseSidebar();
			var allTabs = $(".main-content-tabs").tabs("getAllTabs", true,
					false);
			if (allTabs.length > 0) {
				var id_liItem;
				for ( var index = 0; index < allTabs.length; index++) {
					id_liItem = allTabs[index].children().attr("href");
					// 去除#符号
					id_liItem = id_liItem.substring(1, id_liItem.length);
					if (id_liItem == (moduleId + this.TABITEM_TAG)) {
						// 激活tabItem
						this.doActiveTabItem(id_liItem);
						return;
					}
				}
			}
			this.doAddTabItem(moduleId, moduleName, moduleURL);
		},

		// 打开新的标签页
		doAddTabItem : function(moduleId, moduleName, moduleURL) {
			if (moduleURL) {
				var viewId = moduleId + this.TABITEM_TAG + "";
				this.$('.main-content-tabs').tabs('add', {
					id : viewId,
					label : moduleName,
					active : true,
					container:'#main-tabs-panel'
				});
				var viewContainer=this.$el.find('#' + viewId);
				viewContainer.css({
					'height':'100%',
					'overflow-y':'auto',
					'overflow-x':'hidden'
				});
				
				viewContainer.blockUI({message: '加载中'}).data('blockui-content', true);
				
				
					this.requireView({
						selector : '#' + viewId,
						url : moduleURL
					}).always(function(){
						viewContainer.unblockUI().data('blockui-content', false);
					});
			}
		},
		// 定位到指定的标签页
		doActiveTabItem : function(moduleId) {
			$(".main-content-tabs").tabs("showTab", moduleId, true);
		},
		doExpandSidebar : function(e) {
			var thisView = this;
			var $this = $(e.currentTarget);
			var checkElement = $this.next();
			var animationSpeed = 500;
			// 无子菜单导航处理
			if (checkElement.length == 0) {
				var parent = $this.parents('ul').first();
				var ul = parent.find('ul:visible').slideUp(animationSpeed);
				// Remove the menu-open class from the parent
				ul.removeClass('menu-open');
				var parent_li = $this.parent("li");
				parent.find('>li.active').removeClass('active');
				parent_li.addClass('active');
				// Fix the layout in case the sidebar stretches over the height
				// of the window
				//thisView.fix();
			}
			// Check if the next element is a menu and is visible
			else if ((checkElement.is('.treeview-menu'))
					&& (checkElement.is(':visible'))) {
				// Close the menu
				checkElement.slideUp(animationSpeed, function() {
					checkElement.removeClass('menu-open');
				});
				checkElement.parent("li").removeClass("active");
			}
			// If the menu is not visible
			else if ((checkElement.is('.treeview-menu'))
					&& (!checkElement.is(':visible'))) {
				// Get the parent menu
				var parent = $this.parents('ul').first();
				// Close all open menus within the parent
				var ul = parent.find('ul:visible').slideUp(animationSpeed);
				// Remove the menu-open class from the parent
				ul.removeClass('menu-open');
				// Get the parent li
				var parent_li = $this.parent("li");
				parent.find('>li.active').removeClass('active');
				parent_li.addClass('active');
				// Open the target menu and add the menu-open class
				checkElement.slideDown(animationSpeed, function() {
					// Add the class active to the parent li
					checkElement.addClass('menu-open');
					
					// Fix the layout in case the sidebar stretches over the
					// height of the window
					//thisView.fix();
				});
			}
			// if this isn't a link, prevent the page from being redirected
			if (checkElement.is('.treeview-menu')) {
				e.preventDefault();
			}
		},
		_drawTopMenus:function(conf){
        	var rootMenus = _.where(userMenus, {parentMenuId: 0});
            var menus =rootMenus||[];
            this.$el.find('.first-sidebar-treemenu').each(function(index,nav){
                $.each(menus,function(i,obj){
                	var cls =obj.iconCls;
                	if(!obj.iconCls||obj.iconCls==''){
                		cls='glyphicon glyphicon-cloud';
                	}
                	if(obj.state=='0')return;
                	/*
                	if(obj.moduleName=="portal"){
                		$(nav).append('<li id="portal"><a class="first-sidebar-treemenu-archor" id="portal_archor" style="cursor:pointer">'+ '<span class="gly fa '+cls+'"></span><span class="bottom-title">'+ obj.menuName +'</span><span class="bottom-slider"></span>' +'</a></li>');
                		return;
                	}
                	*/
                	
                	var v0Id=obj.moduleName?obj.moduleName.toLowerCase():obj.moduleName;
                    $(nav).append('<li id="'+v0Id+'"><a class="first-sidebar-treemenu-archor" href="#/'+obj.archor+'">'+ '<span class="gly fa '+cls+'"></span><span class="bottom-title">'+ obj.menuName +'</span><span class="bottom-slider"></span>' +'</a></li>');

                })
            })

        },
		fix : function() {
			// Get window height and the wrapper height
			var neg = $('.main-header').outerHeight()
					+ $('.main-footer').outerHeight();
			var window_height = $(window).height();
			var sidebar_height = $(".sidebar").height();
			// Set the min-height of the content and sidebar based on the
			// the height of the document.
			if ($("body").hasClass("fixed")) {
				$(".content-wrapper, .right-side").css('min-height',
						window_height - $('.main-footer').outerHeight());
			} else {
				var postSetWidth;
				if (window_height >= sidebar_height) {
					$(".content-wrapper, .right-side").css('min-height',
							window_height - neg);
					postSetWidth = window_height - neg;
				} else {
					$(".content-wrapper, .right-side").css('min-height',
							sidebar_height);
					postSetWidth = sidebar_height;
				}

				// Fix for the control sidebar height
				var controlSidebar = $('.control-sidebar');
				if (typeof controlSidebar !== "undefined") {
					if (controlSidebar.height() > postSetWidth)
						$(".content-wrapper, .right-side").css('min-height',
								controlSidebar.height());
				}

			}
		},
		_windowResize:function(){
			var me = this,occupyResize=false,resizeDrawing=$.proxy(this._resizeDrawing,this);
			$(window).resize(
                    function(){
                           if(!occupyResize){
                        	   resizeDrawing();
                           }
                            if(!occupyResize){
                            	occupyResize=true;
	                            setTimeout(function(){
	                            	resizeDrawing();
	                            	occupyResize=false;
	                                
	                            },301);//window.resize性能优化,1秒执行3次检测
                            }
                            
                    }

                );
		},
		_resizeDrawing:function(){
			if(this.__manager__.views[".sidebar-menu"]){
				this.__manager__.views[".sidebar-menu"].resize();
			}
			this.resize();//递归调用子视图的resize方法
			
		},
		_collapseSidebar:function(){
			var screenWidth = this.screenSizes.sm-1;
			if($(window).width() > screenWidth){
				if ($('body').hasClass('hide-main-sidebar')) {
	                
	            }
				else{
					$('body').addClass('hide-main-sidebar');
				}
			}else{
				if ($('body').hasClass('show-main-sidebar-mini')) {
					$('body').removeClass('show-main-sidebar-mini');
	            }
				else{
					
				}
			}
			$(window).resize();
			setTimeout(function(){
				$(window).resize();
			},301);
			
		},
		_expandSidebar:function(){
			var screenWidth = this.screenSizes.sm-1;
			if($(window).width() > screenWidth){
				if ($('body').hasClass('hide-main-sidebar')) {
					$('body').removeClass('hide-main-sidebar');
	            }
				else{
					
				}
			}else{
				if ($('body').hasClass('show-main-sidebar-mini')) {
	            }
				else{
					$('body').addClass('show-main-sidebar-mini');
				}
			}
			$(window).resize();
			setTimeout(function(){
				$(window).resize();
			},301);
			
		},
		switchFirstMenu : function(event) {
			var moduleId = $(event.target).attr("id");
			var moduleURL = $(event.target).data("module");
			this._switchFirstMenu(moduleURL);
		},

		_switchFirstMenu : function(moduleURL) {
			var me = this;
			require([ moduleURL ], function(View) {
				var view = new View();
				me.replaceView(".main-view-main", view);
			});
		},maximization:function(){
			$('body').addClass("fullscreen");
			$(window).resize();
			setTimeout(function(){$(window).resize();},305);
			setTimeout(function(){$(window).resize();},500);
			setTimeout(function(){$(window).resize();},1000);
			$("#com-main-control-screen>span").removeClass("fa-arrows-alt");
			$("#com-main-control-screen>span").addClass("fa-crosshairs");
		},minimize:function(){
			
			$('body').removeClass("fullscreen");
			$(window).resize();
			setTimeout(function(){$(window).resize();},305);
			setTimeout(function(){$(window).resize();},500);
			setTimeout(function(){$(window).resize();},1000);

			$("#com-main-control-screen>span").addClass("fa-arrows-alt");
			$("#com-main-control-screen>span").removeClass("fa-crosshairs");
		}
		,lightoff:function(){
			$('body').addClass("lightoff");
			//$('body').addClass("fullscreen");
			$('.com-navigation a.logo').attr('href','#/SysManagement/SysMonitor');
			//$(window).resize();
			MainView.maximization();
			//setTimeout(function(){$(window).resize();},305);
			//setTimeout(function(){$(window).resize();},500);
			//setTimeout(function(){$(window).resize();},1000);
			
		},lighton:function(){
			
			$('body').removeClass("lightoff");
			//$('body').removeClass("fullscreen");
			$('.com-navigation a.logo').attr('href','#/');
			$(window).resize();
			
			MainView.minimize();
			//setTimeout(function(){$(window).resize();},305);
			//setTimeout(function(){$(window).resize();},500);
			//setTimeout(function(){$(window).resize();},1000);
		}
		
	});
});
