define([
	'text!modules/idcrm/spacerm/roomrm/templates/RoomMngView.html'+codeVerP,
	'i18n!modules/idcrm/spacerm/roomrm/i18n/RoomMng.i18n.zh.js'+codeVerP,
	'css!modules/idcrm/spacerm/roomrm/styles/RoomMng.css'+codeVerP,
	'modules/common/cloud-utils.js'+codeVerP
], function(roomMngViewTpl, i18nRoomrm,css,utils) {
    
	return fish.View.extend({
		template: fish.compile(roomMngViewTpl),
		i18nData: fish.extend({}, i18nRoomrm),
		events: {
		   "click #spacerm-room-srnt-search-btn":"searchNavTree",
		   "keypress #spacerm-room-nav-name":"inputkeyDown",
		   "click #spacerm-room-search-btn":"searchRooms",
		   "click #spacerm-room-create-btn":"createRoom",
		   "click #spacerm-room-update-btn":"updateRoom",
		   "click #spacerm-room-del-btn":"delRoom",
		   "click #spacerm-room-detail-btn":"showRoom",
		   "click #spacerm-room-3Deditor-btn":"show3Deditor",
		   "click #spacerm-room-export-btn":"exportRoom",
		   "click #spacerm-room-morequery-btn":"roomMoreQueryBtnClick"
		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
		    var me = this;
		    this._initQryForm();
		   utils.ajax('commonService','getDLCVByTypeCode',"ROOM_LEVEL").done(function(datas){                
               //机房等级
               me.roomLevels = {};
               if(datas){
                    fish.each(datas,function(item){
                       me.roomLevels[item.code] =item.value;
                   }); 
               }
           });
               
           utils.ajax('commonService','getDLCVByTypeCode',"ROOM_OWNER").done(function(datas){                
               //租用性质
               me.roomOwners = {};
               if(datas){
                  fish.each(datas,function(item){
                      me.roomOwners[item.code] =item.value;
                  }); 
               }
           });

           me._initRoomGrid();

		   this._initSpaceTree();
			
		},
		 // 更多查询
        roomMoreQueryBtnClick: function() {
            var height = $("#spacerm-room-grid").grid('getSize').height;
            if($('#spacerm-room-morequery-div').data("show") == false) {
                $("#spacerm-room-morequery-div").show();
                $("#spacerm-room-morequery-btn").html("收起↑");
		        $('#spacerm-room-morequery-div').data("show",true);
                $("#spacerm-room-grid").grid("setGridHeight",height-50);

            } else {
                $("#spacerm-room-morequery-div").hide();
                $("#spacerm-room-morequery-btn").html("更多↓");
		        $('#spacerm-room-morequery-div').data("show",false);
                $("#spacerm-room-grid").grid("setGridHeight", height+50);               
            }
        },
		_initQryForm: function(){

		   $("#spacerm-room-morequery-div").hide();
		     //区域选择
		   $('#spacerm-roomqry-areaId').popedit({
		        dataTextField :'name',
	            dataValueField :'id',
                dialogOption:{
                    width: 500,
                    height: 500
                },
                url:"js!modules/idcrm/common/popeditviews/area/views/SelectAreaView"
            });

		     utils.ajax('commonService','getDLCVByTypeCode',"ROOM_OWNER").done(function(datas){                
                 //机房性质
                  $('#spacerm-roomqry-ownership').combobox({
                      placeholder: '请选择',
                      dataTextField: 'value',
                      dataValueField: 'code',
                      dataSource: datas
                  });
             });
             utils.ajax('commonService','getDLCVByTypeCode',"ROOM_LEVEL").done(function(datas){                
                 //机房等级
                  $('#spacerm-roomqry-roomLevel').combobox({
                      placeholder: '请选择',
                      dataTextField: 'value',
                      dataValueField: 'code',
                      dataSource: datas
                  });
             });

		},
		_initRoomGrid:function(){
		    var roomGridPerData = $.proxy(this.getPerRoomData,this); //函数作用域改变
		    var showGraph =  $.proxy(this.showGraph,this); 
		    var me = this;
			var $srGrid = this.$("#spacerm-room-grid").grid({
				datatype: "json",
				width:'100%',
				colModel: [{
					name: 'roomName',
					label: '机房名称',
					width: 200
				}, {
					name: 'roomCode',
					width: 120,
					label: '机房编码'
				}, {
					name: 'dcName',
					label: '所属数据中心',
					width: 150
				}, {
					name: 'areaName',
					width: 120,
					label: '所属地区'
				},{
					name: 'roomLevel',
					width: 100,
					label: '机房等级',
					formatter:function(cellval,opts,rwdat,_act){
					    var newVal = me.roomLevels ? me.roomLevels[cellval]:null;
					    return (newVal ||cellval);
					}

				},{
					name: 'ownership',
					width: 100,
					label: '租用性质',
					formatter:function(cellval,opts,rwdat,_act){
					   var newVal = me.roomOwners ? me.roomOwners[cellval]:null;
					    return (newVal ||cellval);
					}

				}, {
					name: 'frameCount',
					width: 100,
					label: '机柜数量'
				},{
					name: 'adminName',
					width: 100,
					label: '联系人'

				},{
					name: 'adminTel',
					width: 100,
					label: '联系电话'

				},{
					name: 'useFrameCount',
					width: 100,
					label: '机柜使用数'

				},{
					name: 'useRate',
					width: 100,
					label: '机柜使用率'

				},{
					name: 'rsPlaneGraphId',
					width: 100,
					label: '平面图',
					formatter:function(cellval,opts,rwdat,_act){
					   var newVal = '<button type="button" class="btn btn-default gridgraphbtn" >查看</button>';			   
					   return newVal;
					}

				},{
					name: 'roomId',
					label: '机房ID',
					key:true,
					hidden:true

				}],
				rowNum: 15,
				rowList: [15,30,50],
				pager: true,
				showMask:false,
				shrinkToFit:false,
				multiselect:true,
				recordtext: "当前显示 {0} - {1} 条记录 共 {2} 条记录",
                                pgtext: "第 {0} 页 / 共 {1} 页",
                                emptyrecords: "没有记录",
				displayNum:3,
				pageData: roomGridPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});

            $srGrid.on("grid:oncellselect",function(e,rowid,iCol,cellcontent){
               if(iCol == 12){//平面图
                  var rowData = $("#spacerm-room-grid").grid("getRowData",rowid);
                  me.showGraph(rowData["roomId"]);
               }
            });
		},
		showGraph: function(roomId){
		    fish.popupView({
   		        url: 'modules/idcrm/graph/views/RoomGraphView',
   		        height: $(window).height()-10,
	            width: $(window).width()-10,	
	            viewOption:{roomId:roomId}
            });
	    },
		getPerRoomData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法

		    var me = this;
            var conds = me.$("#spacerm-room-grid").grid("option", 'qryConds');
			rowNum = rowNum || this.$("#spacerm-room-grid").grid("getGridParam", "rowNum");
			
			var params = {};
			params.conditions=conds;
			params.pageIdx=page;
			params.pageSize=rowNum;
			
			me.$("#spacerm-room-grid").blockUI({message:'查询中...'});
			utils.ajax('spaceResourceService','qryRoomByCond',params)
			     .always(function(){
                        me.$("#spacerm-room-grid").unblockUI();
                  })
				 .done(function(datas)	{	
				 	me.$("#spacerm-room-grid").grid("reloadData", datas);
				 });

			return false;
			
		},
		_initSpaceTree: function(){
		    var me =this;
           //滚动条		    
		    $("#spacerm-room-spaceres-navtreeDiv").niceScroll("#spacerm-room-spaceres-navtree",{
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
             me.$("#spacerm-room-spaceres-navtree").tree(settings);
           //获取顶级区域
            me.loadResNavTree(null);

             
		},

		onNavTreeClick: function(e, treeNode){
		    var me = this;
		    me.loadGridByTreeNode(treeNode);

            if(treeNode.loadedChild){
		       return;
		    }
		    treeNode.loadedChild = true; //标识是否展开过
		    if(treeNode.tag=='area' || treeNode.tag=='dataCenter'){
		       me.loadResNavTree(treeNode);
		    }           
		},

		//右侧显示当前数据中心的机房列表信息
		loadGridByTreeNode: function(treeNode){
            var me = this;
            if(treeNode.tag== me.treeNodeTags.dataCenter){
                var conds = [{"op":"EQUALS","name":"dcId","value":treeNode.kId}];
                me.$("#spacerm-room-grid").grid("option", 'qryConds',conds);
		        me.getPerRoomData(1);
            }else if(treeNode.tag== me.treeNodeTags.area){
                var conds = [{"op":"EQUALS","name":"areaId","value":treeNode.kId}];
                me.$("#spacerm-room-grid").grid("option", 'qryConds',conds);
		        me.getPerRoomData(1);
            }
		},
		loadResNavTree: function(treeNode){
		   var me = this;
		   var treeNodeKId,tag,isIncludeSelf=false;
		   if(treeNode == null){
              treeNodeKId = null;
		      tag = 'area';
		   }else{
		      treeNodeKId = treeNode.kId;
		      tag = treeNode.tag;
		   }
		   me.$("#spacerm-room-spaceres-navtree").blockUI({message:''});
		   utils.ajax('commonService', 'getResourceTree',treeNodeKId,tag,isIncludeSelf)
			     .always(function(){
                     me.$("#spacerm-room-spaceres-navtree").unblockUI();   
                 }).done(
					function(nodeDatas) {
			           if(!nodeDatas){
		   	              nodeDatas = [];
			   	       }
	                   fish.each(nodeDatas,function(element, index){
			   	           element.icon = me.getNavtreeIcon(element.tag,element.grade);
			   	       });
				      var navTree = me.$("#spacerm-room-spaceres-navtree").tree("instance");
				      if(null != treeNode){
				         navTree.removeChildNodes(treeNode);
				      }
	                  
	                  navTree.addNodes(treeNode,nodeDatas);
	            //      navTree.expandNode(treeNode,true);

	                  if(null == treeNode){//根节点，再加载
	                     var nodes = navTree.getNodes();
	                     if(nodes && nodes.length > 0){
	                         me.loadResNavTree(nodes[0]);
	                     }
	                  }

			    }).fail(function(){
                     console.log("加载空间树的失败,treeNode:"+JSON.stringify(treeNode));
                });
		},
		searchNavTree:function(){
		     var me = this;
		     this.$("#spacerm-room-spaceres-navtree").blockUI({message:''});     
		     var cond = this.$("#spacerm-room-nav-name").val();
		     utils.ajax('commonService','getRoomNavTreeByName',cond)
		         .always(function(){
                     me.$("#spacerm-room-spaceres-navtree").unblockUI(); 
                 })
		   	     .done(function(nodeDatas){
		   	         if(!nodeDatas){
		   	             nodeDatas = [];
			   	      }
	                  fish.each(nodeDatas,function(element, index){
			   	         element.icon = me.getNavtreeIcon(element.tag,element.grade);
			   	      });
			       var navTreeInst = me.$("#spacerm-room-spaceres-navtree").tree("instance");
		           navTreeInst.reloadData(nodeDatas);
		           navTreeInst.expandAll(true);
                 });
		},
		
		refreshNavTreeByDcId: function(dcId){
		   var me = this;
           var navTreeInst = me.$("#spacerm-room-spaceres-navtree").tree("instance");	
           var treeNode = navTreeInst.getNodeByParam('id',me.treeNodeTags.dataCenter+'_'+dcId); 
           if(treeNode){
               treeNode.loadedChild = false;
               me.onNavTreeClick(null,treeNode);//调用click方法,刷新所属数据中心下的机房

           }else{
              me.addAllAncesSiblings(dcId);
           }
		},

		//获取机房的所有上级和同级节点，添加到导航树中
		addAllAncesSiblings:function(dcId){
		   var me = this;
           utils.ajax('commonService','getResNavRoomsByDcId',dcId)
	   	     .done(function(newNodeDatas){
	   	         if(!(newNodeDatas && newNodeDatas.length > 0)){
	   	             return;
		   	      }
                  fish.each(newNodeDatas,function(element, index){
		   	         element.icon = me.getNavtreeIcon(element.tag,element.grade);
		   	      });

		   	    //过滤掉树中已存在的节点,再加载数据
		       var navTreeInst = me.$("#spacerm-room-spaceres-navtree").tree("instance");
		       var allNodes = navTreeInst.getNodes();
		       var allNodeDatas = [];
		       fish.each(navTreeInst.transformToArray(allNodes),function(item){
		            allNodeDatas.push(fish.pick(item,'id','pId','kId','parentKId','tag','name','code','grade','icon',"open"));
		       });

		       var fiterNodeDatas = fish.filter(newNodeDatas,function(newNodeData){
		           var findNode = fish.find(allNodeDatas,function(nodedata){ 
		                                        return (newNodeData.kId == nodedata.kId && newNodeData.tag == nodedata.tag);
		                                    });
		           return findNode == null;
		       });
		       var newAllTreeNodeDatas = fish.union(allNodeDatas,fiterNodeDatas);
	           navTreeInst.reloadData(newAllTreeNodeDatas);	         
	          
	           //展开所属数据中心并加载右侧表格
	           var dcTreeNode =  navTreeInst.getNodeByParam('id',me.treeNodeTags.dataCenter+'_'+dcId); 
	           navTreeInst.expandNode(dcTreeNode);
	           me.loadGridByTreeNode(dcTreeNode);	           
	           
            });
		},

		inputkeyDown: function(e){
		    if(e.keyCode == 13){ //回车键
		       this.searchNavTree();
		    }
		},
		_getSelRoom:function(){
		    var selRows = this.$("#spacerm-room-grid").grid('getCheckRows');
		    if (selRows==null||selRows.length==0|| selRows.length > 1){
		        fish.info('请选择一个机房');
		        return;
		    }
		    return selRows[0];
		},
		_getSelRooms:function(){
		    var selRows = this.$("#spacerm-room-grid").grid('getCheckRows');
		    if (selRows==null||selRows.length==0){
		        fish.info('请至少选择一个机房');
		        return;
		    }
		    return selRows;
		},
		
		searchRooms:function(){//查询
		  //获取查询条件
		   var conds = utils.getConditions('spacerm-room-Qryform');
		   if($('#spacerm-room-morequery-div').data("show") == true) {
		      var moreCond = utils.getConditions('spacerm-room-QryformMore');
		      conds = fish.union(conds,moreCond);
		   }
		   this.$("#spacerm-room-grid").grid("option", 'qryConds',conds);
		   this.getPerRoomData(1);
		},
		createRoom:function(){//新增
		  var me = this;
		  fish.popupView({ 
		       url: 'modules/idcrm/spacerm/roomrm/views/RoomFormView',
			   width: "90%",	viewOption:{action:"create.spacerm-room"},	
			   callback:function(popup,view){
			   	   popup.result.then(function (ret) {
			   	       if(ret && ret.isSuccess){
	                       if(ret.data && ret.data.basicInfo && ret.data.basicInfo.dcId){
	                           me.refreshNavTreeByDcId(ret.data.basicInfo.dcId);	 
	                       }
	                                              	                       
	                   } 
			   	   },function (e) {
			   	   	console.log('关闭了',e);
			   	   });
			   }
		  });
		 
		},
		updateRoom:function(){//修改
		 
          var selRoom = this._getSelRoom();
          if(!selRoom){
             return;
          }
          var me = this;
   		  fish.popupView({
   		        url: 'modules/idcrm/spacerm/roomrm/views/RoomFormView',
	            width: "90%",	
	            viewOption:{action:"update.spacerm-room",roomId:selRoom.roomId},	
	            callback:function(popup,view){
	            	popup.result.then(function (ret){
	            	    if(ret && ret.isSuccess){
	                        if(ret.data && ret.data.basicInfo && ret.data.basicInfo.dcId){
	                           me.refreshNavTreeByDcId(ret.data.basicInfo.dcId);	 
	                       }
	            	    } 
	            	},function (e) {
	            		console.log('关闭了',e);
	            	});
	            }
          });
		},
		delRoom:function(){//删除
		    var me = this;
			fish.confirm('是否删除机房？').result.then(function() {	   		    
			    var delRooms = me._getSelRooms(); 
			    var roomIds = [],dcIds = [];
			    for (var i = delRooms.length - 1; i >= 0; i--) {
			    	roomIds.push(delRooms[i].roomId);
			    	dcIds.push(delRooms[i].dcId);
			    }
			    if(roomIds){
			       me.$el.blockUI({message:'提交中...'});
			       utils.ajax('spaceResourceService','batchDelRoom',roomIds)
			           .always(function(){
	                        me.$el.unblockUI();
	                    })
		               .done(function(ret){
	                       if(ret && ret.code === 'SUCCESS'){
			                    fish.info(ret.msg,function(){
	                              for(var i = 0 ; i < dcIds.length; i++){
	                                    me.refreshNavTreeByDcId(dcIds[i]);	
	                               }                                                           
	                           });
					       }else{
					           fish.error(ret?ret.msg:'删除失败');
					       }
		               })
		               .fail(function(e){
		               	   console.log(e);
		               	   fish.error('删除失败,'+e.message);
		               });
			    }         
	        });
		},
		showRoom:function(){//展示
		  var me = this;
          var selRoom = this._getSelRoom();
          if(selRoom){
               var pop = fish.popupView({url: 'modules/idcrm/spacerm/roomrm/views/RoomFormView',
	               width: "90%",	
	               viewOption:{action:"detail.spacerm-room",roomId:selRoom.roomId}
               });
          }
		},
		exportRoom:function(){//导出
           fish.info('尚未实现');
		},
		show3Deditor:function(){
		  window.open("http://10.45.47.225:8880/3deditor/sceneEditor.html");
		},
		resize:function(){
		   var containerParentheight = $(".spacerm-room-mng-container").parent().parent().outerHeight();
		   this.$("#spacerm-room-grid").grid("setGridHeight",containerParentheight-50);
		   this.$("#spacerm-room-grid").grid("resize",true);
           
           this.$('#spacerm-room-spaceres-navtreeDiv').height(containerParentheight-30);		  
		},
		treeNodeTags:{
		   area:"area",
		   dataCenter:"dataCenter",
		   dcRoom:"dcRoom"
		},
		getNavtreeIcon: function(tag,grade){//空间资源导航树图标
		   if(tag == this.treeNodeTags.area && grade == "C2"){
               return "resources/images/idc/treeNode/province.png";
		   }else if(tag == this.treeNodeTags.area && grade == "C3"){
               return "resources/images/idc/treeNode/city.png";
		   }else if(tag == this.treeNodeTags.area && grade == "C4"){
               return "resources/images/idc/treeNode/county.png";
		   }else if(tag == this.treeNodeTags.dataCenter){
		      return "resources/images/idc/treeNode/datacenter.png";
		   }else if(tag == this.treeNodeTags.dcRoom){
		      return "resources/images/idc/treeNode/room.png";
		   }
		}
	});
});