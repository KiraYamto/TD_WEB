define([
	'text!modules/idcrm/resourcemanager/equrm/templates/NetEquipmentView.html',
	'i18n!modules/idcrm/resourcemanager/equrm/i18n/equip.i18n',
	'modules/common/cloud-utils',
    'css!modules/idcrm/resourcemanager/equrm/styles/netEquipment.css'
], function(frameViewTpl, i18nEquip,utils, css) {
	return fish.View.extend({
		template: fish.compile(frameViewTpl),
		i18nData: fish.extend({}, i18nEquip),
		events: {
          /*  "click #equip-net-board-btn": "equipNetBoardMngBtnClick",
            "click #equip-net-port-btn": "equipNetPortMngBtnClick",*/
            "click #equip-net-add-btn": "equipNetAddBtnClick",
            "click #equip-net-mod-btn": "equipNetModBtnClick",
            "click #equip-net-del-btn": "equipNetDelBtnClick",
            "click #equip-net-query-btn": "equipNetQueryBtnClick",
            "click #equip-net-export-btn": "equipNetExportBtnClick",
            "click #equip-more-btn": "equipMoreBtnClick",
            "click #netEquip-treeQry-btn":"searchNavTree",
            "keypress #netEquip-nodeName":"inputkeyDown"
		},
		//"click #equip-net-room-btn":"equipNetRoomBtnClick", "click #equip_net_room_name":"equipNetRoomBtnClick",
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.loadStaticData();
			this._initNavTree();
			this.loadEquipRender();
			this.getEquipData(1);
			this.initDcRoomSelection();
		},
		loadStaticData:function(){
			var self = this;
			$("select[attrCode]").each(function(o){
				$this = $(this);
				var attrCode = $this.attr("attrCode");
				self.renderSelect($this,attrCode);				
			});
			$("input[attrCode]").each(function(o){
				$this = $(this);
				var attrCode = $this.attr("attrCode");
				self.renderSelect($this,attrCode);				
			});
			//厂家（品牌）与设备型号联动
			var $vendor = $("#equip_net_vendor");
			var $model = $("#equip_net_model");
			$vendor.on('combobox:change', function(e) {
				var modelDataTypeCode = $vendor.combobox('value'); 
				$model.combobox('clear');  
				self.renderSelect($model,modelDataTypeCode);               
			 });
			
			
			
		},
		
		renderSelect:function(o,attrCode){
			utils.ajax('basicDataService', 'getBasicDataListByBasicType',attrCode).done(function(ret){
				o.combobox({
					placeholder: '--请选择--',
					dataValueField:'code',
					dataTextField: 'value',
					dataSource: ret
				});
            });
		},
		//机房选择
		initDcRoomSelection: function() {
			
			var getEquipDataProxy = $.proxy(this.getEquipData,this);
            var pop = this.$('#equip_net_room_id').popedit({
				dataTextField :'roomName',
				dataValueField :'roomId',
				dialogOption: {
					height: 400,
					width: 500
				},
				url:'js!modules/idcrm/common/popeditviews/dataCenterRoom/views/SelectDCOrRoomView'
			});
          //机房变更刷新设备
    		pop.popedit('option','change',function(e){
    			getEquipDataProxy(1);
    		});
            /*var dcRoomSel = $('#equip_net_room_name').popedit({
                modal: true,
                dataTextField :'text',
                dataValueField :'id',
                dialogOption: {
                    height: 400,
                    width: 500
                },
                showClearIcon:false
            });

            var options = {
                view: {
                    dblClickExpand: false
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                fNodes: [],
                callback: {
                    onClick: function(e, treeNode) {
                        if(!(treeNode.tag=="dcRoom")) {
                            fish.info("请选择机房");
                            return;
                        }
                    }
                }
            };

            $("#equipment-selRoomTree").tree(options);

            utils.ajax('equiprmService', 'findFrameTree', false, false).done(function(ret){

                $("#equipment-selRoomTree").tree("reloadData", ret);
            });


            var popup=this.popup;
            var me=this;
            this.$el.on('click','#equipment-selRoomConfirm', function(e){
                var treeInstance = me.$("#equipment-selRoomTree").tree("instance");
                var nodes = treeInstance.getSelectedNodes();
                var treeNode =null;
                if(nodes&&nodes.length == 0){
                    fish.info("请选择一个机房");
                }
                if(nodes&&nodes.length > 1){
                    fish.info("只能选择一个机房");
                }
                treeNode= nodes[0];

                $("#equip_net_room").val();

                if(treeNode.tag == "dcRoom") {
                    me.$("#equip_net_room").val(treeNode.kId);
                    $("#equip_net_room_name").val(treeNode.name);
                }

                me.$("#equipment_SelRoom-dialog").dialog("close");
                me.getEquipData(1);
            });

            this.$el.on('click','#equipment-selRoomClose', function(e){
                me.$("#equipment_SelRoom-dialog").dialog("close");
            });*/

        },
		// 初始化导航树
        initTreeRender: function() {

            $("#equipNetDiv").height($(window).height()-170);
            $("#ipsegm-Tree").height($(window).height()-180);
            $("#equipNetDiv").niceScroll({
                cursorcolor: '#CE0015',
                cursorwidth: "6px"
            });

            var options = {
                view: {
                    showLine: false
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                fNodes: [],
                callback: {
                    onClick: function(e, treeNode) {
                        console.log(treeNode);
                        //如果未加载过，则加载网络设备名称
                        if(!treeNode.isLoad || !treeNode.isLoad){
                            utils.ajax('netEquipService', 'findNetEquipNodesByRoomId', treeNode.id).done(function(ret){
                                $("#equip_net_tree").tree('addNodes',treeNode, ret, false);
                                treeNode.isLoad = true;
                            });
                        }
                        if(treeNode.tag=='dcRoom') {//dataCenter 数据中心 dcRoom 机房
                            //设置查询条件，查询
                            $("#equip_net_room_name").val(treeNode.name);
                            $("#equip_net_name").val("");
                            self.getEquipData(1);
                        }
                        if(treeNode.tag=='netEquip') {//dataCenter 数据中心 dcRoom 机房 netEquip 网络设备
                            //设置查询条件，查询
                            $("#equip_net_name").val(treeNode.name);
                            $("#equip_net_room_name").val("");
                            self.getEquipData(1);
                        }
                    }
                }
            };

            $("#equip_net_tree").tree(options);
        },
        // 加载导航树
        loadTreeRender: function() {
        	// 查询的时候 锁定页面
            if ($('#equipNetDiv').data('blockui-content')) {
                $('#equipNetDiv').unblockUI().data('blockui-content', false);
            } else {
                $('#equipNetDiv').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }

        	var self= this;
            var nodeName = $("#netEquip-nodeName").val();
            utils.ajax('equiprmService', 'findFrameTreeByCond', nodeName, true, false).done(function(ret){
                $("#equip_net_tree").tree("reloadData", ret);

                // 解锁页面
                $('#equipNetDiv').unblockUI().data('blockui-content', false);
            });
        },
        
        _initNavTree: function(){
		    var me =this;
           //滚动条		    
		    $("#equipNetDiv").niceScroll("#equip_net_tree",{
		                        cursorcolor: '#CE0015',
			               cursorwidth: "7px"}); 
		    
		   
		     var onNavTreeClick = $.proxy(this.onNavTreeClick,this); //函数作用域改变
             var settings = {
                  view:{
                     dblClickExpand: false
                  },
                  data: {
                          simpleData: {
                              enable: true,
                              rootPId:'area_0'
                          }
                        },
                 callback: {
                             onClick: onNavTreeClick
                           }
             };
             me.$("#equip_net_tree").tree(settings);
             //获取区域和数据中心
            this.loadNavTreeInitData();
             
		},
		loadNavTreeInitData: function(){
		    var me = this;
		    this.$("#equip_net_tree").blockUI({message:''});
            utils.ajax('commonService','getAllAreasAndDcsTree')
		   	     .always(function(){
                     me.$("#equip_net_tree").unblockUI();   
                 })
		   	     .done(function(treeDatas){
		   	          
		   	          if(treeDatas){
		   	             //设置图标
		   	             fish.each(treeDatas,function(element, index){
		   	                element.icon = me.getNavtreeIcon(element.tag,element.grade);
		   	             });            
                         me.$("#equip_net_tree").tree('reloadData',treeDatas);
                      }
                 }).fail(function(){
                     console.log("加载空间树失败");
                 }); 
		},
		loadNavTreeChild: function(treeNode){
		   var me = this;
		   if(treeNode.loadedChild){
		      return;
		   }
		   treeNode.loadedChild = true; //标识是否展开过
		   
		   if(treeNode.tag=='dataCenter'){
		   this.$("#equip_net_tree").blockUI({message:''});
               utils.ajax('commonService','getRoomsTreeByDcId',treeNode.kId)
	                     .always(function(){
                                me.$("#equip_net_tree").unblockUI();   
                             })
		   	     .done(function(nodeDatas){  
		   	          if(!nodeDatas){
		   	             nodeDatas = [];
			   	      }
	                  fish.each(nodeDatas,function(element, index){
			   	          element.icon = me.getNavtreeIcon(element.tag,element.grade);
			   	      });
			   	      var navTree = me.$("#equip_net_tree").tree("instance");
	                  navTree.removeChildNodes(treeNode);
	                  navTree.addNodes(treeNode,nodeDatas);
			          navTree.expandNode(treeNode,true);

                 }).fail(function(){
                        console.log("加载空间树的机房失败");
                 }); 
           } 

		},
		onNavTreeClick: function(e, treeNode){
            this.loadNavTreeChild(treeNode);
            //右侧显示当前数据中心的机房列表信息
            if(treeNode.tag=='dcRoom'){
                //var conds = [{"op":"EQUALS","name":"dcId","value":treeNode.kId}];
                //this.$("#spacerm-room-grid").grid("option", 'qryConds',conds);
                
                this.$("#equip_net_room").val(treeNode.kId);
                this.$("#equip_net_room_name").val(treeNode.name);
		        this.getEquipData(1);
            } else {
            	this.$("#equip_net_room").val("");
                this.$("#equip_net_room_name").val("");
            }
		},
		searchNavTree:function(){
		     var me = this;
		     this.$("#equip_net_tree").blockUI({message:''});     
		     var cond = this.$("#netEquip-nodeName").val();
		     utils.ajax('commonService','getRoomNavTreeByName',cond)
		         .always(function(){
                     me.$("#equip_net_tree").unblockUI(); 
                 })
		   	     .done(function(nodeDatas){
		   	         if(!nodeDatas){
		   	             nodeDatas = [];
			   	      }
	                  fish.each(nodeDatas,function(element, index){
			   	         element.icon = me.getNavtreeIcon(element.tag,element.grade);
			   	      });
			       var navTreeInst = me.$("#equip_net_tree").tree("instance");
		           navTreeInst.reloadData(nodeDatas);
		           navTreeInst.expandAll(true);
                 });
		},
		inputkeyDown: function(e){
		    if(e.keyCode == 13){ //回车键
		       this.searchNavTree();
		    }
		},
		getNavtreeIcon: function(tag,grade){//空间资源导航树图标
		   if(tag == "area" && grade == "C2"){
	           return "resources/images/idc/treeNode/province.png";
		   }else if(tag == "area" && grade == "C3"){
	           return "resources/images/idc/treeNode/city.png";
		   }else if(tag == "area" && grade == "C4"){
	           return "resources/images/idc/treeNode/county.png";
		   }else if(tag == "dataCenter"){
		      return "resources/images/idc/treeNode/datacenter.png";
		   }else if(tag == "dcRoom"){
		      return "resources/images/idc/treeNode/room.png";
		   }
		},
		
		loadEquipRender: function() {
			var self =this;
			this.$("#equip-net-grid").grid({
				datatype: "json",
				width:'100%',
				height: 450,
				colModel: [{
                    name: 'id',
                    label: 'ID',
                    key:true,
                    width: 80,
                    hidden:true
                },{
                	name: 'serialNo',
                    label: 'serialNo',
                    width: 100,
                    hidden:true
                },{
                	name: 'eqIpAddress',
                    label: 'eqIpAddress',
                    width: 150,
                    hidden:true
                },{
                	name: 'comments',
                    label: 'comments',
                    width: 100,
                    hidden:true
                },{
                	name: 'serviceStateName',
                    label: 'serviceStateName',
                    width: 100,
                    hidden:true
                },{
					name: 'eqName',
					label: '设备名称',
					width: 100
				}, {
					name: 'eqCode',
					width: 100,
					label: '设备编码'
				}, {
					name: 'roomName',
					label: '所属机房',
					width: 200
				}, {
					name: 'areaName',
					width: 100,
					label: '所属地区'
				}, {
                    name: 'rsTypeName',
                    width: 100,
                    label: '设备类型'
                }, {
                    name: 'modelName',
                    width: 100,
                    label: '设备型号'
                }, {
                    name: 'vendorName',
                    width: 150,
                    label: '设备厂家'
                }, {
                    name: 'boardNum',
                    width: 100,
                    label: '槽位数'
                }, {
                    name: 'portNum',
                    width: 80,
                    label: '端口数'
                }, {
                    name: 'usedPortNum',
                    width: 80,
                    label: '占用数'
                }, {
                    name: 'idlePortNum',
                    width: 80,
                    label: '空闲数'
                }, {
                    name: 'usedPortPercent',
                    width: 80,
                    label: '占用率'
                }, {
                    name: 'notes',
                    width: 100,
                    label: '详情',
                    formatter: function(cellval, opts, rwdat, _act) {
                    	return '<a href="javascript:void(0)" eq_detail='+rwdat.id+' style="text-decoration:underline">查看</a>';
                    }
                }],
				rowNum: 15,
				displayNum : 5,
				rowList:[15,30,50],
                multiselect: true,
                shrinkToFit: false,
                rownumbers:true,
                pager: true,
				server: true,
                recordtext: "当前显示 {0} - {1} 条记录 共 {2} 条记录",
                pgtext: "第 {0} 页 / 共 {1} 页",
                emptyrecords: "没有记录",
				pageData: this.getEquipData, //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
				gridComplete:function(){
					self.$("#equip-net-grid").find("[eq_detail]").each(function(){
						$this = $(this);
						$this.bind("click",function(){							
							self.equipNetBoardDetailBtnClick($(this).attr("eq_detail"));
						});
					})
				}
			});
			
			
		},
		getEquipData:  function(page, sortname, sortorder) { //请求服务器获取数据的方法
			var rowNum = $("#equip-net-grid").grid("getGridParam", "rowNum");

            // 查询的时候 锁定页面
            if ($('#equip-net-grid').data('blockui-content')) {
                $('#equip-net-grid').unblockUI().data('blockui-content', false);
            } else {
                $('#equip-net-grid').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }           
           
            var cond = utils.getConditions("net-equip-query-cond");
            var queryParamsDto ={};
            queryParamsDto["pageIdx"]=page;
            queryParamsDto["pageSize"]=rowNum;
            queryParamsDto["conditions"]=cond;
			utils.ajax('netEquipService', 'findNetEquipListByCond', queryParamsDto).done(function(ret){

                $("#equip-net-grid").grid("reloadData", ret);

                // 解锁页面
                $('#equip-net-grid').unblockUI().data('blockui-content', false);

            });

		},
		getDefaultValue:function(sourceValue,defaultValue){
			if(sourceValue==null || sourceValue == 'null' || !sourceValue || sourceValue==''){
				return defaultValue;
			}else{
				return sourceValue;
			}
		},
        //板卡管理
		/*equipNetBoardMngBtnClick: function() {
			
			var selectedFrameIds = $("#equip-net-grid").grid('getGridParam', 'selarrrow');
            if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                fish.info("请选择一项数据！");
                return;
            }

            if(selectedFrameIds.length > 1) {
                fish.info("一次只能对一个网络设备进行板卡管理！");
                return;
            }
            var selectedFrame = $("#equip-net-grid").grid("getRowData", selectedFrameIds[0])
			
            var pop =fish.popupView({url: 'modules/idcrm/resourcemanager/equrm/views/NetEquipmentBoardView',
                width: "98%",height:600,
                callback:function(popup,view){
                	//view.$el.find("#boardtmgr-form").form("value", selectedFrame);
        			//view.$el.find("#boardtmgr-form").form("disable");
                    popup.result.then(function (e) {
                        alert("e=" + e);
                    },function (e) {
                        console.log('关闭了',e);
                    });
                },
            	viewOption:{action:"detail.equipNetMod",netEquip:selectedFrame}
            });
        },*/
     // 端口管理
        /*equipNetPortMngBtnClick: function() {
        	
        	var selectedFrameIds = $("#equip-net-grid").grid('getGridParam', 'selarrrow');
            if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                fish.info("请选择一项数据！");
                return;
            }

            if(selectedFrameIds.length > 1) {
                fish.info("一次只能对一个网络设备进行端口管理！");
                return;
            }
            
            var selectedFrame1 = $("#equip-net-grid").grid("getRowData", selectedFrameIds[0])
            
        	var pop =fish.popupView({url: 'modules/idcrm/resourcemanager/portrm/views/portView',
        		width: "98%",height:600,
        		callback:function(popup,view){
        			view.$el.find("#portmgr-form").form("value", selectedFrame1);
        			view.$el.find("#portmgr-form").form("disable");
        			popup.result.then(function (e) {
        				alert("e=" + e);
        			},function (e) {
        				console.log('关闭了',e);
        			});
        		},
        	viewOption:{action:"detail.equipNetPort",netEquipment:selectedFrame1}
        	});
        },*/
        // 新增设备
        equipNetAddBtnClick: function() {
         /*   var reloadEquipData = $.proxy(this.getEquipData,this);
            var pop =fish.popupView({url: 'modules/idcrm/resourcemanager/equrm/views/NetEquipmentFormView',
                width: "98%",
                callback:function(popup,view){
                    popup.result.then(function (e) {
                        reloadEquipData(1);
                    },function (e) {
                        console.log('关闭了',e);
                    });
                },
            	viewOption:{action:"detail.equipNetAdd"}
            });  */
  		  var me = this;
		  fish.popupView({ 
		       url: 'modules/idcrm/resourcemanager/equrm/views/NetEquipmentMainFormView',
			   width: '98%',height:600,	
			   callback:function(popup,view){
                   popup.result.then(function (e) {
                       reloadEquipData(1);
                   },function (e) {
                       console.log('关闭了',e);
                   });
               },
               viewOption:{action:"insert"}
		  });
		  
        },        
        //设备修改
        equipNetModBtnClick: function() {
            var reloadEquipData = $.proxy(this.getEquipData,this);

            var selectedFrameIds = $("#equip-net-grid").grid('getGridParam', 'selarrrow');
            if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                fish.info("请选择一项数据！");
                return;
            }

            if(selectedFrameIds.length > 1) {
                fish.info("一次只能修改一条数据！");
                return;
            }
            var selectedEquip = $("#equip-net-grid").grid("getRowData", selectedFrameIds[0]);
            
            var pop =fish.popupView({url: 'modules/idcrm/resourcemanager/equrm/views/NetEquipmentMainFormView',
                width: "98%",height:600,
                callback:function(popup,view){
                    // 查询机柜详情信息，加载                	
                    view.$el.find("#net-equip-form").form("value", selectedEquip);                   
;
                    popup.result.then(function (e) {
                        reloadEquipData(1);
                    },function (e) {
                        console.log('关闭了',e);
                    });
                },
            	viewOption:{action:"modify",netEquipId:selectedEquip.id,selectedEquip:selectedEquip}
            });

        },
        // 设备删除
        equipNetDelBtnClick: function() {
            var reloadEquipData = $.proxy(this.getEquipData,this);
            
            var selectedFrameIds = $("#equip-net-grid").grid('getGridParam', 'selarrrow');
            if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                fish.info("请至少选择一条记录！");
                return;
            }
            var delNetEquipArr = [];
            for(var i in selectedFrameIds){
            	delNetEquipArr.push({"id":selectedFrameIds[i]});
            }
            
            fish.confirm('是否删除所选设备？').result.then(function() {
	            utils.ajax('netEquipService', 'deleteRsNetEquip', delNetEquipArr).done(function(ret){
	            	if(ret){
	        			if(ret.code==0){
	        				fish.info('操作成功');
	        				reloadEquipData(1);
	        			}else{
	        				fish.info(ret.msg);
	        			}
	        		}else{
	        			fish.info('消息未返回');
	        		}
	            });
            });

        },
        // 查询
        equipNetQueryBtnClick: function() {
            this.getEquipData(1);
        },
        equipMoreBtnClick: function() {
        	$("#equip_more_div").toggle();
        	if($("#equip-more-btn").html()=='更多查询'){
        		$("#equip-more-btn").html("收起");
        	}else{
        		$("#equip-more-btn").html("更多查询");
        	}
        },
        // 导出
        equipNetExportBtnClick: function() {
            alert("尚未实现")
        },
        // 选择数据中心
        equipNetRoomBtnClick: function() {
        	var self = this;
            var pop =fish.popupView({url: 'modules/idcrm/resourcemanager/equrm/views/RootSelectView',
                width: "30%",
                callback:function(popup,view){
                	
                    popup.result.then(function (e) {
                    	console.log(e);
                        $("#equip_net_room").val(e.kId);
                        $("#equip_net_room_name").val(e.name);
                    },function (e) {
                        console.log('关闭了',e);
                    });
                }
            });
        },
        //网络设备详情
		equipNetBoardDetailBtnClick: function(id) {		
			
			var selectedFrame = $("#equip-net-grid").grid("getRowData", id);
            var pop =fish.popupView({url: 'modules/idcrm/resourcemanager/equrm/views/NetEquipmentDetailView',
                width: "98%",
                callback:function(popup,view){
                	view.$el.find("#net-equip-form-detail-1").form("value", selectedFrame); 
                    popup.result.then(function (e) {                        
                    },function (e) {
                        console.log('关闭了',e);
                    });
                },
            	viewOption:{netEquip:selectedFrame}
            });
        },
        // 树形搜索
        equipTreeQryBtnClick: function() {
            this.loadTreeRender();
        },
        resize:function(){
 		   var containerParentheight = $(".equipment-mana-view-container").parent().parent().outerHeight();
 		   this.$("#equip-net-grid").grid("setGridHeight",containerParentheight-50);
 		   this.$("#equip-net-grid").grid("resize",true);
            
           this.$('#equipNetDiv').height(containerParentheight-30);		  
 		}
	});
});