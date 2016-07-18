define(['text!modules/idcrm/common/popeditviews/dataCenterRoom/templates/SelectDCOrRoomView.html',
		'i18n!modules/idcrm/common/popeditviews/dataCenterRoom/i18n/SelectDCOrRoomView.i18n',
		'modules/common/cloud-utils' ], function(SelectDCOrRoomViewTpl, i18n,utils) {
	/*.popedit({
	dataTextField :'text',
	dataValueField :'pkId',
	dialogOption: {
		height: 400,
		width: 500,
		viewOptions:{
			areaId:50597
		}
	},
	url:'js!modules/idcrm/common/popeditviews/dataCenterRoom/views/SelectDCOrRoomView'
	});*/
	return fish.View.extend({
		template : fish.compile(SelectDCOrRoomViewTpl),
		i18nData : fish.extend({}, i18n),
		events : {
			'click .idcrm-dcOrRoom-select-ok' : 'selectDcOrRoomOk',
			'click .idcrm-dcOrRoom-select-close' :'selectDcOrRoomClose'
		},
		initialize : function() {
			var html = $(this.template(this.i18nData));
			this.setElement(html);
		},
		_render : function() {//这里用来初始化页面上要用到的fish组件
            var me = this;
			var areaId = null;
			if (me.options) {
			   if(me.options.areaId){
                  areaId = me.options.areaId;
			   }
			  
			   if(me.options.selType){
			        me.selType = fish.find(me.cloudSelectTags,function(item){ return item == me.options.selType});
			   }
			}
			if(me.selType == null){
			    me.selType = me.treeNodeTags.dcRoom;//为空则默认为选机房
			}
			var options = {
				data : {
					simpleData : {
						enable : true,
						rootPId:'area_0'
					}
				},
				callback: {
                   onClick: $.proxy(me.onClick, me)
                }
			};
			me.$(".idcrm-dcOrRoom-select-tree").tree(options);

            me.$(".idcrm-dcOrRoom-select-tree").blockUI({message:'加载中......'});
			utils.ajax('commonService', 'getResourceTree', areaId,'area',true)
			     .always(function(){
                     me.$('.idcrm-dcOrRoom-select-tree').unblockUI(); 
			     }).done(function(nodeDatas) {
					      if(!nodeDatas){
		   	                 nodeDatas = [];
			   	          }
	                      fish.each(nodeDatas,function(element, index){
			   	              element.icon = me.getNavtreeIcon(element.tag,element.grade);
			   	          });
				          me.$(".idcrm-dcOrRoom-select-tree").tree('reloadData',nodeDatas);
					});
		    return this;
		},
		onClick : function(event, treeNode) {
			var me = this;
			if (!treeNode.isLoad) {
				treeNode.isLoad = true;               
				utils.ajax('commonService', 'getResourceTree',treeNode.kId,treeNode.tag,false).done(
					function(nodeDatas) {
			           if(!nodeDatas){
		   	              nodeDatas = [];
			   	       }
	                   fish.each(nodeDatas,function(element, index){
			   	           element.icon = me.getNavtreeIcon(element.tag,element.grade);
			   	       });
				       var navTree = me.$(".idcrm-dcOrRoom-select-tree").tree("instance");
	                  navTree.removeChildNodes(treeNode);
	                  navTree.addNodes(treeNode,nodeDatas);
				});
			}
		},
		selectDcOrRoomOk : function(e) {
			var treeInstance = this.$(".idcrm-dcOrRoom-select-tree").tree("instance");
			var nodes = treeInstance.getSelectedNodes();
			var treeNode = null;
			if (nodes && nodes.length > 0) {
				treeNode = nodes[0];
			}
			var isSelRightType = false;
			if(treeNode){
			   if(treeNode.tag == this.selType || 
			      (this.selType == "dataCenterOrRoom" && 
			          (treeNode.tag == this.treeNodeTags.dataCenter || treeNode.tag == this.treeNodeTags.dcRoom))){
			      isSelRightType = true;
			   }
			}
			if (isSelRightType == true) {
			    var returnValue = {};
			    if(treeNode.tag == this.treeNodeTags.dataCenter){
			        returnValue.dataCenterId = treeNode.kId;
			        returnValue.dataCenterName = treeNode.name;
			        returnValue.dataCenterCode = treeNode.code;
			    }else if(treeNode.tag == this.treeNodeTags.dcRoom){
			        //机房
			        returnValue.roomId = treeNode.kId;
			        returnValue.roomName = treeNode.name;
			        returnValue.roomCode = treeNode.code;
			        //数据中心
			        var dcNode = treeInstance.getNodeByParam('id',this.treeNodeTags.dataCenter+'_'+treeNode.parentKId);			     
			        returnValue.dataCenterId = dcNode.kId;
			        returnValue.dataCenterName = dcNode.name;
			        returnValue.dataCenterCode = dcNode.code;
			        //区域
			        var areaNode = treeInstance.getNodeByParam('id',this.treeNodeTags.area+'_'+dcNode.parentKId);			     
			        returnValue.areaId = areaNode.kId;
			        returnValue.areaName = areaNode.name;
			        returnValue.areaCode = areaNode.code;
			    }

				this.$el.dialog("setReturnValue", returnValue);
				this.$el.dialog("close");
				if(this.popup){
				  this.popup.close(returnValue);
				}

			}else{
				fish.info("请选择一个"+this.cloudSelectTagsMsg[this.selType]);
				return ;
			}
		},
		selectDcOrRoomClose : function(e) {
			this.$el.dialog("close");
			if(this.popup){
			    this.popup.close();
			}
		},
		cloudSelectTags:["dataCenter","dcRoom","dataCenterOrRoom"],
		cloudSelectTagsMsg:{"dataCenter":"数据中心","dcRoom":"机房","dataCenterOrRoom":"数据中心/机房"},
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