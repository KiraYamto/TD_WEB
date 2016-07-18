define([ 'text!modules/idcrm/common/popeditviews/area/templates/SelectAreaView.html',
		'i18n!modules/idcrm/common/popeditviews/area/i18n/SelectArea.i18n',
		'modules/common/cloud-utils' ], function(SelectAreaViewTpl, i18n,
		utils) {
	/*.popedit({
	dataTextField :'name',
	dataValueField :'id',
	dialogOption: {
		height: 400,
		width: 500,
		viewOptions:{
			areaId:50597
		}
	},
	url:'js!modules/idcrm/common/popeditviews/area/views/SelectAreaView'
	});*/
	return fish.View.extend({
		template : fish.compile(SelectAreaViewTpl),
		i18nData : fish.extend({}, i18n),
		events : {
			'click .idcrm-area-select-ok' : 'selectAreaOk',
			'click .idcrm-area-select-close' :'selectAreaClose'
		},
		initialize : function() {
			var html = $(this.template(this.i18nData));
			this.setElement(html);
		},
		multiple:false,
		// 这里用来进行dom操作
		_render : function() {
            var me = this;
			var areaId = null,grade=null;
			if (this.options && this.options.areaId) {
				areaId = this.options.areaId;
			}
			if (this.options && this.options.multiple) {
				this.multiple =this.options.multiple;
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
			this.$(".idcrm-area-select-tree").tree(options);

            this.$(".idcrm-area-select-tree").blockUI({message:'加载中......'});
			utils.ajax('commonService', 'getAreasByPID', areaId,true)
			     .always(function(){
                    me.$('.idcrm-area-select-tree').unblockUI(); 
			     }).done(
					function(nodeDatas) {
					      if(!nodeDatas){
		   	                 nodeDatas = [];
			   	          }
	                      fish.each(nodeDatas,function(element, index){
			   	              element.icon = me.getNavtreeIcon(element.tag,element.grade);
			   	          });
				          me.$(".idcrm-area-select-tree").tree('reloadData',nodeDatas);
					});
			return this;
		},
		onClick : function(event, treeNode) {
			var me = this;
			if (!treeNode.isLoad) {
				treeNode.isLoad = true;               
				utils.ajax('commonService', 'getAreasByPID',treeNode.kId,false).done(
					function(nodeDatas) {
			           if(!nodeDatas){
		   	              nodeDatas = [];
			   	       }
	                   fish.each(nodeDatas,function(element, index){
			   	           element.icon = me.getNavtreeIcon(element.tag,element.grade);
			   	       });
				       var navTree = me.$(".idcrm-area-select-tree").tree("instance");
	                  navTree.removeChildNodes(treeNode);
	                  navTree.addNodes(treeNode,nodeDatas);
				});
			}
		},
		selectAreaOk : function(e) {
			var treeInstance = this.$(".idcrm-area-select-tree").tree("instance");
			var nodes = treeInstance.getSelectedNodes();
			var treeNode = null;
			if (this.multiple == true) {
				var id = '';
				var name = '';
				for(var i =0;i < nodes.length;i++){
					id = id + nodes[i].kId;
					name = name + nodes[i].name;
					if(i != (nodes.length - 1)){
						id = id + ',';
						name = name + ',';
					}
				}
				treeNode = {
					id:id,
					name:name
				};
			}else{
				if (nodes && nodes.length > 0) {
					treeNode = nodes[0];
				}
			}

			if (!treeNode) {
				fish.info("请选择一个区域");
				return;
			} else {
				this.$el.dialog("setReturnValue", {id:treeNode.kId,name:treeNode.name});
				this.$el.dialog("close");
			}
		},
		selectAreaClose : function(e) {
			this.$el.dialog("close");
		},
		getNavtreeIcon: function(tag,grade){//空间资源导航树图标
		   if(tag == "area" && grade == "C2"){
               return "resources/images/idc/treeNode/province.png";
		   }else if(tag == "area" && grade == "C3"){
               return "resources/images/idc/treeNode/city.png";
		   }else if(tag == "area" && grade == "C4"){
               return "resources/images/idc/treeNode/county.png";
		   }
		}
	});
});