define([ 'text!modules/iom/idciom/order/templates/SelectTacheView.html',
		'i18n!modules/iom/idciom/order/i18n/order.i18n',
		'modules/common/cloud-utils' ], function(SelecttacheViewTpl, i18n,
		utils) {
	return fish.View.extend({
		template : fish.compile(SelecttacheViewTpl),
		i18nData : fish.extend({}, i18n),
		events : {
			'click .order-tache-select-ok' : 'selecttacheOk',
			'click .order-tache-select-close' :'selecttacheClose'
		},
		initialize : function() {
			var html = $(this.template(this.i18nData));
			this.setElement(html);
		},
		multiple:false,
		// 这里用来进行dom操作
		_render : function() {
            var me = this;
			var tacheId = null,grade=null;
			if (this.options && this.options.tacheId) {
				tacheId = this.options.tacheId;
			}
			if (this.options && this.options.multiple) {
				this.multiple =this.options.multiple;
			}

			var options = {
				data : {
					simpleData : {
						enable : true,
						rootPId:'tache_0'
					}
				},
				callback: {
                   onClick: $.proxy(me.onClick, me)
                }
			};
			this.$(".order-tache-select-tree").tree(options);
			utils.ajax('orderTaskManage','qryAllTacheList').done(function(nodeDatas){
				  if(!nodeDatas){
					 nodeDatas = [];
				  }else{
					  for(var i = 0;i < nodeDatas.length;i++){
						  nodeDatas[i].id = 'tache_' + nodeDatas[i].tacheId;
						  nodeDatas[i].name = nodeDatas[i].tacheName;
					  }
				  }
				  fish.each(nodeDatas,function(element, index){
					  element.icon = me.getNavtreeIcon(element.tag,element.grade);
				  });
				  me.$(".order-tache-select-tree").tree('reloadData',nodeDatas);
			});
			return this;
		},
		onClick : function(event, treeNode) {
			var me = this;
			if (!treeNode.isLoad) {
				treeNode.isLoad = true;               
				utils.ajax('commonService', 'gettachesByPID',treeNode.pkId,false).done(
					function(nodeDatas) {
			           if(!nodeDatas){
		   	              nodeDatas = [];
			   	       }
	                   fish.each(nodeDatas,function(element, index){
			   	           element.icon = me.getNavtreeIcon(element.tag,element.grade);
			   	       });
				       var navTree = me.$(".order-tache-select-tree").tree("instance");
	                  navTree.removeChildNodes(treeNode);
	                  navTree.addNodes(treeNode,nodeDatas);
				});
			}
		},
		selecttacheOk : function(e) {
			var treeInstance = this.$(".order-tache-select-tree").tree("instance");
			var nodes = treeInstance.getSelectedNodes();
			var treeNode = null;
			if (this.multiple == true) {
				var pkId = '';
				var name = '';
				for(var i =0;i < nodes.length;i++){
					pkId = pkId + nodes[i].tacheId;
					name = name + nodes[i].name;
					if(i != (nodes.length - 1)){
						pkId = pkId + ',';
						name = name + ',';
					}
				}
				treeNode = {
					tacheId:pkId,
					tacheName:name
				};
			}else{
				if (nodes && nodes.length > 0) {
					treeNode = nodes[0];
					treeNode.tacheId =treeNode.tacheId;
					treeNode.tacheName =treeNode.name;
				}
			}

			if (!treeNode) {
				fish.info("请选择一个区域");
			} else {
				this.$el.dialog("setReturnValue", treeNode);
				this.$el.dialog("close");
			}
		},
		selecttacheClose : function(e) {
			this.$el.dialog("close");
		},
		getNavtreeIcon: function(tag,grade){//空间资源导航树图标
		   if(tag == "tache" && grade == "C2"){
               return "resources/images/idc/treeNode/province.png";
		   }else if(tag == "tache" && grade == "C3"){
               return "resources/images/idc/treeNode/city.png";
		   }else if(tag == "tache" && grade == "C4"){
               return "resources/images/idc/treeNode/county.png";
		   }
		}
	});
});