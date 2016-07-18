define([
	'text!modules/idcrm/spacerm/datacenterrm/templates/DataCenterMngView.html'+codeVerP,
	'i18n!modules/idcrm/spacerm/datacenterrm/i18n/DataCenterMng.i18n.zh.js'+codeVerP,
	'css!modules/idcrm/spacerm/datacenterrm/styles/DataCenterMng.css'+codeVerP,
	'modules/common/cloud-utils.js'+codeVerP
], function(DataCenterMngViewTpl, i18nSpacermDc,css,utils) {

	return fish.View.extend({
		template: fish.compile(DataCenterMngViewTpl),
		i18nData: fish.extend({}, i18nSpacermDc),
		events: {
		   "click #spacerm-room-srnt-search-btn":"searchNavTree",
		   "keypress #spacerm-dc-nav-dcname":"inputkeyDown",
		   "click #spacerm-dc-search-btn":"searchDc",
		   "click #spacerm-dc-create-btn":"createDc",
		   "click #spacerm-dc-update-btn":"updateDc",
		   "click #spacerm-dc-del-btn":"delDc",
		   "click #spacerm-dc-detail-btn":"showDc",
		   "click #spacerm-dc-export-btn":"exportDc"
		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
		    //区域选择
		   $('#spacerm-dcqry-areaId').popedit({
		        dataTextField :'name',
	            dataValueField :'id',
                dialogOption:{
                    width: 500,
                    height: 500
                },
                url:"js!modules/idcrm/common/popeditviews/area/views/SelectAreaView"
            });

			this._initDcGrid();
			this._initSpaceTree();
			
		},
		_initDcGrid:function(){
		    
		    var dcGridPerData = $.proxy(this.getDcPerData,this); //函数作用域改变
			this.$("#spacerm-dc-grid").grid({
				datatype: "json",
				width:'100%',
				colModel: [{
					name: 'dcName',
					label: '数据中心名称',
					width: '25%'
				}, {
					name: 'dcCode',
					width: '25%',
					label: '数据中心编码'
				}, {
					name: 'areaName',
					label: '所属地区',
					width: '20%'
				}, {
					name: 'roomCount',
					width: '12%',
					label: '机房数量'
				},{
					name: 'createDate',
					width: '18%',
					label: '创建日期'

				},{
					name: 'dcId',
					label: '数据中心ID',
					key:true,
					hidden:true

				}],
				rowNum: 15,
				rowList: [15,30,50],
				pager: true,
				multiselect:true,
				recordtext: "当前显示 {0} - {1} 条记录 共 {2} 条记录",
                                pgtext: "第 {0} 页 / 共 {1} 页",
                                emptyrecords: "没有记录",
				displayNum:3,
				pageData: dcGridPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		getDcPerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
		    var me =this;
		    //获取查询条件
            var conds = me.$("#spacerm-dc-grid").grid("option", 'qryConds');
			rowNum = rowNum || this.$("#spacerm-dc-grid").grid("getGridParam", "rowNum");
			var me =this;
			var params = {};
			params.conditions=conds;
			params.pageIdx=page;
			params.pageSize=rowNum;

			this.$("#spacerm-dc-grid").blockUI({message:'加载中...'});
			utils.ajax('spaceResourceService','qryDcByCond',params)
			     .always(function(){
                     me.$("#spacerm-dc-grid").unblockUI();   
                 })
			     .done(function(datas)	{				 	
						$("#spacerm-dc-grid").grid("reloadData", datas);
				 });

			return false;
			
		},
		_initSpaceTree: function(){
		    var me =this;
		   //滚动条
		    me.$('#spacerm-dc-spaceres-navtree').niceScroll({
			        cursorcolor: '#CE0015',
			        cursorwidth: "7px"
			});
             
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
             me.$("#spacerm-dc-spaceres-navtree").tree(settings);
             //获取区域和数据中心
            this.$("#spacerm-dc-spaceres-navtree").blockUI({message:''});
            this.loadAreaDcData(false);
            
		},
		loadAreaDcData:function(isExpand){
		   var me = this;
		   utils.ajax('commonService','getAllAreasAndDcsTree')
		   	     .always(function(){
                     me.$("#spacerm-dc-spaceres-navtree").unblockUI();   
                 })
		   	     .done(function(nodeDatas){   
		   	          if(!nodeDatas){
		   	             nodeDatas = [];
			   	      }
	                  fish.each(nodeDatas,function(element, index){
			   	          element.icon = me.getNavtreeIcon(element.tag,element.grade);
			   	      }); 
			   	      var navTreeInst = me.$("#spacerm-dc-spaceres-navtree").tree("instance");
				       navTreeInst.reloadData(nodeDatas);
				       navTreeInst.expandAll(isExpand == true);            
                 }).fail(function(){
                        console.log("加载空间树失败");
                 }); 
		},
		loadNavTreeNodeData:function(treeNode){
           var me = this;
		   if(treeNode.loadedChild){
		      return;
		   }
		   treeNode.loadedChild = true; //标识是否展开过 
		   
           this.$("#spacerm-dc-spaceres-navtree").blockUI({message:''});
           utils.ajax('commonService', 'getResourceTree',treeNode.kId,treeNode.tag,false)
                   .always(function(){
                          me.$("#spacerm-dc-spaceres-navtree").unblockUI();   
                   }).done(function(nodeDatas){  
		   	            if(!nodeDatas){
		   	               nodeDatas = [];
			            }
		                fish.each(nodeDatas,function(element, index){
			                element.icon = me.getNavtreeIcon(element.tag,element.grade);
			            });
			            var navTree = me.$("#spacerm-dc-spaceres-navtree").tree("instance");
		                navTree.removeChildNodes(treeNode);
		                navTree.addNodes(treeNode,nodeDatas);
			            navTree.expandNode(treeNode,true);
		           }).fail(function(){
		                  console.log("加载空间树失败");
		           }); 
           
		},
		searchNavTree:function(){
		     var me = this;
		     this.$("#spacerm-dc-spaceres-navtree").blockUI({message:''});
		     var cond = this.$("#spacerm-dc-nav-dcname").val();
		     utils.ajax('commonService','getDcNavTreeByName',cond)
		         .always(function(){
                    me.$("#spacerm-dc-spaceres-navtree").unblockUI(); 
                 })
		   	     .done(function(nodeDatas){ 
		   	           if(!nodeDatas){
		   	             nodeDatas = [];
			   	      }
	                  fish.each(nodeDatas,function(element, index){
			   	          element.icon = me.getNavtreeIcon(element.tag,element.grade);
			   	      });
				       var navTreeInst = me.$("#spacerm-dc-spaceres-navtree").tree("instance");
				       navTreeInst.reloadData(nodeDatas);
				       navTreeInst.expandAll(true);
                 });
		},
		onNavTreeClick: function(e, treeNode){
		    var me = this;
            //右侧显示当前区域的数据中心列表信息
            if(treeNode.tag==me.treeNodeTags.area){
                var conds = [{"op":"EQUALS","name":"areaId","value":treeNode.kId}];
                me.$("#spacerm-dc-grid").grid("option", 'qryConds',conds);
		        me.getDcPerData(1);
            }
		},
		inputkeyDown: function(e){
		    if(e.keyCode == 13){ //回车键
		       this.searchNavTree();
		    }
		},
		_getSelDc:function(){
		    var selRows = this.$("#spacerm-dc-grid").grid('getCheckRows');
		    if (selRows==null||selRows.length==0|| selRows.length > 1){
		        fish.info('请选择一个数据中心');
		        return;
		    }
		    return selRows[0];
		},
		_getSelDcs:function(){
		    var selRows = this.$("#spacerm-dc-grid").grid('getCheckRows');
		    if (selRows==null||selRows.length==0){
		        fish.info('请至少选择一个数据中心');
		        return;
		    }
		    return selRows;
		},
		
		searchDc:function(){//查询
		   var conds = utils.getConditions('spacerm-dc-Qryform');
		   this.$("#spacerm-dc-grid").grid("option", 'qryConds',conds);
		   this.getDcPerData(1);
		},
		createDc:function(){//新增
		  var me = this;
		  fish.popupView({ 
		       url: 'modules/idcrm/spacerm/datacenterrm/views/DataCenterFormView',
			   width: "70%",	viewOption:{action:"create.spacerm-dc"},	
			   callback:function(popup,view){
			   	   popup.result.then(function (ret) {			   	       
	                   if(ret && ret.isSuccess){
	                       me.getDcPerData(1);
	                       if(ret.data && ret.data.dataCenter && ret.data.dataCenter.areaId){
	                           var navTreeInst = me.$("#spacerm-dc-spaceres-navtree").tree("instance");
                               var treeNode = navTreeInst.getNodeByParam('id',me.treeNodeTags.area+'_'+ret.data.dataCenter.areaId);
                               if(treeNode){
                                  treeNode.loadedChild = false;
                                  me.loadNavTreeNodeData(treeNode);
                                  navTreeInst.expandNode(treeNode,true);
                               }
	                       }
	                    } 
			   	   },function (e) {
			   	   	console.log('关闭了',e);
			   	   });
			   }
		  });
		 
		},
		updateDc:function(){//修改
		 
          var selDc = this._getSelDc();
          if(!selDc){
             return;
          }
          var me = this;
   		  fish.popupView({
   		        url: 'modules/idcrm/spacerm/datacenterrm/views/DataCenterFormView',
	            width: "70%",	
	            viewOption:{action:"update.spacerm-dc",dcId:selDc.dcId},	
	            callback:function(popup,view){
	            	popup.result.then(function (ret){
	            	 
	            	   if(ret && ret.isSuccess){
	                       me.getDcPerData(1);
	                       if(ret.data && ret.data.dataCenter && ret.data.dataCenter.areaId){
	                           var navTreeInst = me.$("#spacerm-dc-spaceres-navtree").tree("instance");
                               var treeNode = navTreeInst.getNodeByParam('id',me.treeNodeTags.area+'_'+ret.data.dataCenter.areaId);
                               if(treeNode){
                                  treeNode.loadedChild = false;
                                  me.loadNavTreeNodeData(treeNode);
                                  navTreeInst.expandNode(treeNode,true);
                               }
	                       }
	                    } 
	            	},function (e) {
	            		console.log('关闭了',e);
	            	});
	            }
          });
		},
		delDc:function(){//删除
		    var me = this;
			fish.confirm('是否删除数据中心？').result.then(function() {			    
			     var delDcs = me._getSelDcs(); 
			     var delIds = [],areaIds=[];
			    for (var i = delDcs.length - 1; i >= 0; i--) {
			    	delIds.push(delDcs[i].dcId);
			    	areaIds.push(delDcs[i].areaId);
			    }
			    if(delIds){
			       me.$el.blockUI({message:'提交中...'});

			       utils.ajax('spaceResourceService','batchDelDc',delIds)
			            .always(function(){
	                        me.$el.unblockUI();
	                    })
		                .done(function(ret){
		                    if(ret && ret.code === 'SUCCESS'){
			                    fish.info(ret.msg,function(){
	                              me.getDcPerData(1);
	                              var navTreeInst = me.$("#spacerm-dc-spaceres-navtree").tree("instance");
	                              var treeNodes = navTreeInst.getNodesByFilter(function(node){
	                                                                              return fish.contains(areaIds,node.kId);
	                                                                           },false);
	                              if(treeNodes){
	                                 for(var i = 0 ; i < treeNodes.length; i++){
	                                    var treeNode = treeNodes[i];
	                                    treeNode.loadedChild = false;
	                                    me.loadNavTreeNodeData(treeNode);
	                                    navTreeInst.expandNode(treeNode,true);
	                                 }
	                              }                           
	                           });
					        }else{
					           fish.error(ret?ret.msg:'删除失败');
					        }
		               })
		               .fail(function(e){
		               	   console.log(e);
		               	   fish.error(e);
		               });
			    }
			 });
		},
		showDc:function(){//展示
		  var me = this;
          var selDc = this._getSelDc();
          if(selDc){
               var pop = fish.popupView({url: 'modules/idcrm/spacerm/datacenterrm/views/DataCenterFormView',
	               width: "70%",	
	               viewOption:{action:"detail.spacerm-dc",dcId:selDc.dcId}
               });
          }
		},
		exportDc:function(){//导出
                   fish.info('尚未实现');
		},
		resize:function(){
		   var containerParentheight = $(".spacerm-dc-container").parent().parent().outerHeight();
		   this.$("#spacerm-dc-grid").grid("setGridHeight",containerParentheight-50);
		   this.$("#spacerm-dc-grid").grid("resize",true);
           
           this.$('#spacerm-dc-spaceres-navtree').height(containerParentheight-40);		  
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