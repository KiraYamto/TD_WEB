define([
    'text!modules/idcrm/resourcemanager/equrm/templates/FrameView.html',
    'i18n!modules/idcrm/resourcemanager/equrm/i18n/equip.i18n',
    'modules/common/cloud-utils',
    'css!modules/idcrm/resourcemanager/equrm/styles/equiprm.css'
], function(frameViewTpl, i18nEquip,utils, css) {
    return fish.View.extend({
        template: fish.compile(frameViewTpl),
        i18nData: fish.extend({}, i18nEquip),
        events: {
            "click #frameView-unitmgr-btn": "equipUnitmgrBtnClick", // 机位管理
            "click #frameView-keep-btn": "equipKeepBtnClick", // 机柜预留
            "click #frameView-rel-btn": "equipRelBtnClick", // 机柜释放
            "click #frameView-add-btn": "equipAddBtnClick", // 机柜新增
            "click #frameView-bathadd-btn": "equipBathaddBtnClick", // 机柜批量新增
            "click #frameView-mod-btn": "equipModBtnClick",  // 机柜编辑
            "click #frameView-del-btn": "equipDelBtnClick",  // 机柜删除
            "click #frameView-query-btn": "equipQueryBtnClick",  // 查询按钮
            "click #frameView-morequery-btn": "equipMoreQueryBtnClick",  // 更多查询按钮
            "click #frameView-clear-btn": "equipClearBtnClick",
            "click #frameView-export-btn": "equipExportBtnClick",
            "click #frameView-show2d-btn": "equipShow2dBtnClick",
            "click #frameView-3dedit-btn": "equip3dEditBtnClick",
            "click #frameView-treeQry-btn": "searchNavTree",
            "click #frameView-rMenu-add-btn": "equipAddBtnClick",
            "click #frameView-rMenu-mod-btn": "rMenuModBtnClick",
            "click #frameView-rMenu-del-btn": "rMenuDelBtnClick",
            "keypress #frameView-nodeName":"inputkeyDown"
        },
        
        //这里用来进行dom操作
        _render: function() {
            var html=$(this.template(this.i18nData));
            html.find("#frameView-qryContentDiv").hide();
            html.find("#frameView-navTree").height($(window).height-200);

            //机房选择
            var pop = html.find("#frameView-dcRoomSel").popedit({
                dataTextField :'roomName',
                dataValueField :'roomId',
                dialogOption: {
                    height: 400,
                    width: 500
                },
                url:'js!modules/idcrm/common/popeditviews/dataCenterRoom/views/SelectDCOrRoomView'
            });

            pop.popedit('option','change',function(e, data){
                $("#frameView-dcOrRoomSel-form").form('value', data);
            });

            this.$el.html(html);
            return this;
        },

        //这里用来初始化页面上要用到的fish组件
        _afterRender: function() {

            $('#frameView-navTreeDiv').bind('contextmenu',function(){
                return false;
            });

            $("#rMenu").hover(function(){//设置进入右键菜单事件

            },function(){//设置离开右键菜单事件
                $("#rMenu").css({//设置右键菜单的位置
                    "display":"none"
                });
            });

            // 加载导航树
            this.initTreeOptions();
//            this.loadTreeRender();

            // 加载静态数据
            this._initBasicData();

            // 加载机柜里列表
            this.loadEquipRender();
            this.getEquipData(1);

            // 初始化查询
//            this.initQrySelection();
        },

        getFrameId: function() {
            return this.options.frameId;
        },

        setFrameId: function(frameId) {
            this.options.frameId = frameId;
        },

        // 加载静态数据
        _initBasicData: function() {
            var me = this;
            var typeCodes = ["FRAME_RS_VENDOR", "FRAME_POWER", "FRAME_USE_STATE", "FRAME_TYPE"];
            utils.ajax('commonService', 'getDictMapsByTypeCodes', typeCodes).done(function(ret){
                me.options.frameVendorEmun= ret.FRAME_RS_VENDOR; // 型号
                me.options.framePowerEnun= ret.FRAME_POWER; // 功率
                me.options.frameUseStateEnun= ret.FRAME_USE_STATE; // 分配状态
                me.options.frameTypeEnum= ret.FRAME_TYPE; // 使用类型
            });
        },

        // 初始化查询条件
        initQrySelection: function() {
            var dcRoomSel = $('#frameView-dcRoomSel').popedit({
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
                        if(!(treeNode.tag=="dataCenter" || treeNode.tag=="dcRoom")) {
                            fish.info("请选择数据中心或机房");
                            return;
                        }
                    }
                }
            };

            $("#frameView-dcRoomTree").tree(options);

            utils.ajax('equiprmService', 'findFrameTree', false, false).done(function(ret){
                $("#frameView-dcRoomTree").tree("reloadData", ret);
            });


            var popup=this.popup;
            var me=this;
            this.$el.on('click','#frame-dcRoomSelConfirm', function(e){
                var treeInstance = me.$("#frameView-dcRoomTree").tree("instance");
                var nodes = treeInstance.getSelectedNodes();
                var treeNode =null;
                if(nodes&&nodes.length == 0){
                    fish.info("请选择一个数据中心或机房");
                }
                if(nodes&&nodes.length > 1){
                    fish.info("只能选择一个数据中心或机房");
                }
                treeNode= nodes[0];

                $("#frame_dataCenterId").val();
                $("#frame_dcRoomId").val();

                if(treeNode.tag == "dataCenter") {
                    me.$("#frame_dataCenterId").val(treeNode.kId);
                } else if(treeNode.tag == "dcRoom") {
                    me.$("#frame_dcRoomId").val(treeNode.kId);
                }

                $("#frameView-dcRoomSel").val(treeNode.name);
                me.$("#dcRoom-dialog").dialog("close");

            });

            this.$el.on('click','#frame-dcRoomSelClose', function(e){
                me.$("#dcRoom-dialog").dialog("close");
            });

        },
        // 初始化导航树
        initTreeOptions: function() {

            var me =this;
            //滚动条		    
            $('#frameView-navTreeDiv').niceScroll('#frameView-navTree',{
                cursorcolor: '#CE0015',
                cursorwidth: '7px'});


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
            me.$('#frameView-navTree').tree(settings);
            //获取区域和数据中心
            this.loadNavTreeInitData(false);
        },
        // 加载导航树
        /*loadTreeRender: function() {
            // 查询的时候 锁定页面
            if ($('#frameView-navTreeDiv').data('blockui-content')) {
                $('#frameView-navTreeDiv').unblockUI().data('blockui-content', false);
            } else {
                $('#frameView-navTreeDiv').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }

            var nodeName = $("#frameView-nodeName").val();
            utils.ajax('equiprmService', 'findFrameTreeByCond', nodeName, true, false).done(function(ret){
                $("#frameView-navTree").tree("reloadData", ret);

                // 解锁页面
                $('#frameView-navTreeDiv').unblockUI().data('blockui-content', false);
            });

        },*/
        loadNavTreeInitData: function(isExpand){
            var me = this;
            this.$('#frameView-navTree').blockUI({message:''});
            utils.ajax('commonService','getAllAreasAndDcsTree')
                .always(function(){
                    me.$('#frameView-navTree').unblockUI();
                })
                .done(function(treeDatas){

                    if(treeDatas){
                        //设置图标
                        fish.each(treeDatas,function(element, index){
                            element.icon = me.getNavtreeIcon(element.tag,element.grade);
                        });
                        var navTreeInst = me.$('#frameView-navTree').tree('instance');
                        navTreeInst.reloadData(treeDatas);
                        navTreeInst.expandAll(isExpand == true);
                    }
                }).fail(function(){
                    console.log('加载空间树失败');
                });
        },
		loadNavTreeChild: function(treeNode){
		   var me = this;
		   if(treeNode.loadedChild){
		      return;
		   }
		   treeNode.loadedChild = true; //标识是否展开过
		   
		   if(treeNode.tag=='dataCenter'){
		   this.$("#frameView-navTree").blockUI({message:''});
               utils.ajax('commonService','getRoomsTreeByDcId',treeNode.kId)
	                     .always(function(){
                                me.$("#frameView-navTree").unblockUI();
                             })
		   	     .done(function(nodeDatas){  
		   	          if(!nodeDatas){
		   	             nodeDatas = [];
			   	      }
	                  fish.each(nodeDatas,function(element, index){
			   	          element.icon = me.getNavtreeIcon(element.tag,element.grade);
			   	      });
			   	      var navTree = me.$("#frameView-navTree").tree("instance");
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
            if(treeNode.tag=='dataCenter'){
            	this.$("#frame_dataCenterId").val(treeNode.kId);
                this.$("#frameView-dcRoomSel").val(treeNode.name);
                this.getEquipData(1);
            } else if(treeNode.tag=='dcRoom'){
                //var conds = [{"op":"EQUALS","name":"dcId","value":treeNode.kId}];
                //this.$("#spacerm-room-grid").grid("option", 'qryConds',conds);
                
                this.$("#frame_dcRoomId").val(treeNode.kId);
                this.$("#frameView-dcRoomSel").val(treeNode.name);
		        this.getEquipData(1);
            } else {
            	this.$("#frame_dcRoomId").val("");
            	this.$("#frame_dataCenterId").val("");
                this.$("#frameView-dcRoomSel").val("");
            }
		},
		searchNavTree:function(){
		     var me = this;
		     this.$("#frameView-navTree").blockUI({message:''});
		     var cond = this.$("#frameView-nodeName").val();
		     utils.ajax('commonService','getRoomNavTreeByName',cond)
		         .always(function(){
                     me.$("#frameView-navTree").unblockUI();
                 })
		   	     .done(function(nodeDatas){
		   	         if(!nodeDatas){
		   	             nodeDatas = [];
			   	      }
	                  fish.each(nodeDatas,function(element, index){
			   	         element.icon = me.getNavtreeIcon(element.tag,element.grade);
			   	      });
			       var navTreeInst = me.$("#frameView-navTree").tree("instance");
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
            var me = this;
            me.$("#frameView-grid").grid({
                datatype: "json",
                colModel: [{
                    name: 'id',
                    label: 'ID',
                    key:true,
                    hidden:true
                }, {
                    name: 'code',
                    width: 100,
                    label: '机柜编码'
                }, {
                    name: 'roomName',
                    label: '所属机房',
                    width: 180
                }, {
                    name: 'areaName',
                    width: 100,
                    label: '所属地区'
                }, {
                    name: 'vendor',
                    width: 100,
                    label: '厂商',
                    formatter : function(cellval, opts, rwdat, _act) {
                        if(fish.isEmpty(cellval)){
                            return "";
                        }
                        var value = fish.propertyOf(me.options.frameVendorEmun)(cellval);
                        if(fish.isEmpty(value)){
                            value = "";
                        }
                        return value;
                    }
                }, /*{
                    name: 'modelName',
                    width: 100,
                    label: '机柜型号',
                    formatter: function(cellval) {
                        return fish.propertyOf(me.options.modelEmun)(cellval);
                    }
                }, */{
                    name: 'allocationStateId',
                    width: 100,
                    label: '分配状态',
                    formatter: function(cellval, opts, rwdat, _act) {
                        if(fish.isEmpty(cellval)){
                            return "";
                        }
                        var value = fish.propertyOf(me.options.frameUseStateEnun)(cellval);
                        if(fish.isEmpty(value)){
                            value = "";
                        }
                        return value;
                    }
		        }, {
                    name: 'custName',
                    width: 100,
                    label: '整租客户'
                }, {
                    name: 'unitPower',
                    width: 60,
                    label: '功率',
                    formatter: function(cellval, opts, rwdat, _act) {
                        if(fish.isEmpty(cellval)){
                            return "";
                        }
                        var value = fish.propertyOf(me.options.framePowerEnun)(cellval);
                        if(fish.isEmpty(value)){
                            value = "";
                        }
                        return value;
                    }
                }, {
                    name: 'chassisTypeId',
                    width: 100,
                    label: '使用类型',
                    formatter: function(cellval, opts, rwdat, _act) {
                        if(fish.isEmpty(cellval)){
                            return "";
                        }
                        var value = fish.propertyOf(me.options.frameTypeEnum)(cellval);
                        if(fish.isEmpty(value)){
                            value = "";
                        }
                        return value;
                    }
                }, {
                    name: 'unitNum',
                    width: 80,
                    label: '机位数'
                }, {
                    name: 'idleUnitRate',
                    width: 80,
                    label: '机位空闲率'
                }, {
                    name: 'notes',
                    width: 180,
                    label: '详情'
                }],
                rowNum: 15,
                displayNum : 5,
                rowList:[15,30,50],
                multiselect: true,
                rownumbers:true,
                pager: true,
                server: true,
                recordtext: "当前 {0}-{1} 条记录 共{2}条记录",
                pgtext: "第 {0} 页 / 共 {1} 页",
                emptyrecords: "没有记录",
                pageData: this.getEquipData
            });

            $("#frameView-grid").grid("setGridHeight", $(window).height()-190);
        },
        getEquipData:  function(page, sortname, sortorder) { //请求服务器获取数据的方法
            var rowNum = $("#frameView-grid").grid("getGridParam", "rowNum");

            $("#frameView-query-btn").attr("disable");

            // 查询的时候 锁定页面
            if ($('#frameView-grid').data('blockui-content')) {
                $('#frameView-grid').unblockUI().data('blockui-content', false);
            } else {
                $('#frameView-grid').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }

            // 查询条件-字段
            var qryObj = $("#frame-qryform").form('value');
            qryObj.code = $("#equip_code").val();

            qryObj.name_cond = $("#equip_name_cond").val();
            qryObj.code_cond = "="; // $("#equip_code_cond").val();
            qryObj.model_cond = $("#equip_model_cond").val();

            var dcRoomId = $("#frame_dcRoomId").val();
            var dataCenterId = $("#frame_dataCenterId").val();

            if("" != dcRoomId) {
                qryObj.roomId = dcRoomId + '';
            }

            if("" != dataCenterId) {
                qryObj.dcId = dataCenterId + '';
            }

            var nodes = $("#frameView-navTree").tree("getSelectedNodes");
            if(nodes && nodes.length>0){
                var selectedNode = nodes[0];
                if(selectedNode.tag == "dcRoom"){
                    qryObj.roomId = selectedNode.kId + '';
                }
            }

            utils.ajax('equiprmService', 'findFrameListByCond', qryObj, page, rowNum).done(function(ret){

                $("#frameView-grid").grid("reloadData", ret);

                // 解锁页面
                $('#frameView-grid').unblockUI().data('blockui-content', false);

                $("#frameView-query-btn").attr("disable");

            });

        },
        // 机位管理按钮
        equipUnitmgrBtnClick: function() {

            var selectedFrameIds = $("#frameView-grid").grid('getGridParam', 'selarrrow');
            if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                fish.info("请选择一项数据！");
                return;
            }

            if(selectedFrameIds.length > 1) {
                fish.info("一次只能查看一个机柜的机位管理！");
                return;
            }

            var frameId = selectedFrameIds[0];
            this.equipUnitMgr(frameId);

        },
        // 机位管理
        equipUnitMgr: function(frameId) {

            var pop =fish.popupView({url: 'modules/idcrm/resourcemanager/equrm/views/FrameUnitView',
                width: "80%",
                viewOption: {
                    frameId: frameId
                },
                callback:function(popup,view){
//                    var selectedFrame = $("#frameView-grid").grid("getRowData", selectedFrameIds[0]);
//                    view.$el.find("#frameUnit-form").form("value", selectedFrame);

                    popup.result.then(function (e) {
                        alert("e=" + e);
                    },function (e) {
                        console.log('关闭了',e);
                    });
                }
            });
        },

        // 新增机柜
        equipAddBtnClick: function() {
            // 隐藏树形右键菜单
            this.hideFrameTreeRMenu();

            var reloadEquipData = $.proxy(this.getEquipData,this);
            var pop =fish.popupView({
                url: 'modules/idcrm/resourcemanager/framerm/views/FrameFormMainView',
                width: "100%",
                height: "100%",
                viewOption: {
                    actionType: 'insert'
                },
                callback:function(popup,view){
                    popup.result.then(function (e) {
                        reloadEquipData(1);
                    },function (e) {
                        console.log('关闭了',e);
                    });
                }
            });

        },
        // 批量新增机柜
        equipBathaddBtnClick: function() {
            fish.info("尚未实现")
        },
        // 机柜修改按钮
        equipModBtnClick: function() {
            var selectedFrameIds = $("#frameView-grid").grid('getGridParam', 'selarrrow');
            if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                fish.info("请选择一项数据！");
                return;
            }

            if(selectedFrameIds.length > 1) {
                fish.info("一次只能修改一条数据！");
                return;
            }

            var selectedFrame = $("#frameView-grid").grid("getRowData", selectedFrameIds[0]);
            this.frameMod(selectedFrame);
        },
        // 修改机柜
        frameMod: function(selectedFrame) {
            var reloadEquipData = $.proxy(this.getEquipData,this);

            var pop = fish.popupView({
                url: 'modules/idcrm/resourcemanager/framerm/views/FrameFormMainView',
                width: "100%",
                height: "100%",
                viewOption: {
                    actionType: 'modify',
                    frameId : selectedFrame.id
                },
                callback:function(popup,view){

                    popup.result.then(function (e) {
                        reloadEquipData(1);
                    },function (e) {
                        console.log('关闭了',e);
                    });
                }
            });

        },
        // 删除按钮
        equipDelBtnClick: function() {

            var selectedFrameIds = $("#frameView-grid").grid('getGridParam', 'selarrrow');
            if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                fish.info("请至少选择一条记录！");
                return;
            }

            this.frameDel(selectedFrameIds);
        },
        equipKeepBtnClick: function(){
  			 var self = this; 
  			 var selectedFrameIds = $("#frameView-grid").grid('getGridParam', 'selarrrow');
             if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                 fish.info("请至少选择一条记录！");
                 return;
             }
             for (var i=0;i<selectedFrameIds.length;i++){
         		var selectedFrame = $("#frameView-grid").grid("getRowData",selectedFrameIds[i]);
         		if(selectedFrame.useState != '102001'){
         			fish.info("请选择空闲的记录进行预留！");
         			return;
         		}
 	          }
  			 var selectedFrame = [];
             for(var i in selectedFrameIds){
            	 selectedFrame.push({"id":selectedFrameIds[i]});
             }
         	var reloadIpSegmentData = $.proxy(this.getIpSegmentData,this);
             var pop =fish.popupView({url: 'modules/idcrm/resourcemanager/equrm/views/FrameKeepView',
                 width: "80%",
                 callback:function(popup,view){
                     popup.result.then(function (e) {
                     	self.getEquipData(1);
                     },function (e) {
                         console.log('关闭了',e);
                     });
                 },
             viewOption:{selectedFrame:selectedFrame}
             });
  		},
  		equipRelBtnClick: function() {
  			var self = this; 
 			 var selectedFrameIds = $("#frameView-grid").grid('getGridParam', 'selarrrow');
            if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                fish.info("请至少选择一条记录！");
                return;
            }
            for (var i=0;i<selectedFrameIds.length;i++){
        		var selectedFrame = $("#frameView-grid").grid("getRowData",selectedFrameIds[i]);
        		if(selectedFrame.useState == '102001'){
        			fish.info("所选记录不需要释放！");
        			return;
        		}
        		if(selectedFrame.useState != '102006'){
        			fish.info("只有预留状态的记录才能释放！");
        			return;
        		}
	          }
            var selectedFrame = [];
            for(var i in selectedFrameIds){
            	selectedFrame.push({"id":selectedFrameIds[i]});
            }
            fish.confirm('是否释放所选资源？').result.then(function() {
            	utils.ajax('equiprmService','relFrameCusRelation',selectedFrame).done(function(){
                    fish.info('释放成功');
                    self.getEquipData(1);
                    popup.close(ret);
            	}).fail(function(e){
                    fish.error(e);
                });
            });
  		},
        // 机柜删除，逻辑删除，将状态改为退网101005
        frameDel: function(selectedFrameIds) {

            var reloadEquipDataProxy = $.proxy(this.getEquipData,this);
            fish.confirm('是否删除所选机柜？').result.then(function() {

                utils.ajax('equiprmService', 'batchUpdateFrameState', selectedFrameIds, "101005", currentUser.staffId).done(function(ret){
                    if(ret>0) {
                        fish.info("操作成功！");
                        reloadEquipDataProxy(1);
                    } else {
                        fish.info("操作失败，请稍后再试！");
                    }

                });
            });

        },
        // 查询
        equipQueryBtnClick: function() {
            this.getEquipData(1);
        },
        // 更多查询
        equipMoreQueryBtnClick: function() {
            if("更多↓" == $("#frameView-morequery-btn").html()) {
                $("#frameView-qryContentDiv").show();
                $("#frameView-morequery-btn").html("收起↑");
                $("#frameView-grid").grid("setGridHeight", $(window).height()-288);
            } else {
                $("#frameView-qryContentDiv").hide();
                $("#frameView-morequery-btn").html("更多↓");
                $("#frameView-grid").grid("setGridHeight", $(window).height()-190);
            }
        },
        // 重置查询框
        equipClearBtnClick: function() {
            $("#frame-qryform").form('clear');;
        },
        // 导出
        equipExportBtnClick: function() {
            fish.info("尚未实现")
        },
        // 2D展示
        equipShow2dBtnClick: function() {
            var selectedFrameIds = $("#frameView-grid").grid('getGridParam', 'selarrrow');
            if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                fish.info("请选择一项数据！");
                return;
            }

            if(selectedFrameIds.length > 1) {
                fish.info("一次只能修改一条数据！");
                return;
            }

            var frameId = selectedFrameIds[0];
            var pop =fish.popupView({url: 'modules/idcrm/graph/views/FrameGraphView',
                width: "70%",
                viewOption: {
                    frameId: frameId
                },
                callback:function(popup,view){

                    popup.result.then(function (e) {
                        fish.info("e="+e)
                    },function (e) {
                        console.log('关闭了',e);
                    });
                }
            });
        },
        // 3D模型编辑
        equip3dEditBtnClick: function() {
            window.open(basePath+"../3deditor/modelEditor.html");
        },
        hideFrameTreeRMenu: function() {
            $("#rMenu").css({
                "display":"none"
            });
        },
        rMenuModBtnClick: function() {
            // 隐藏树形右键菜单
            this.hideFrameTreeRMenu();

            var selectedFrame = {id: this.getFrameId()};
            this.frameMod(selectedFrame);

        },
        rMenuDelBtnClick: function() {
            // 隐藏树形右键菜单
            this.hideFrameTreeRMenu();

            var ids = new Array();
            ids.push(this.getFrameId());
            this.frameDel(ids);
        },
        resize:function(){
  		   var containerParentheight = $(".frame_mana_view_container").parent().parent().outerHeight();
  		   this.$("#frameView-grid").grid("setGridHeight",containerParentheight-50);
  		   this.$("#frameView-grid").grid("resize",true);
             
            this.$('#frameView-navTreeDiv').height(containerParentheight-30);
  		}
    });
});


