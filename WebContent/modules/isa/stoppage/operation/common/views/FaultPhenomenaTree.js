define([ 'text!modules/isa/stoppage/operation/common/templates/FaultPhenomenaTreeView.html',
		'i18n!modules/isa/stoppage/operation/common/i8n/FaultPhenomenaTree.i18n',
		'modules/common/cloud-utils' ], function(StaffsbyOrgViewTpl, i18n,
		utils) {
	return fish.View.extend({
		template : fish.compile(StaffsbyOrgViewTpl),
		i18nData : fish.extend({}, i18n),
		events : {
			"click #isa_fault_phenomena_chooseBtn": "chooseBtn",
			"click #isa_fault_phenomena_closeBtn": "closeBtn"
		},
		initialize : function() {
			var html = $(this.template(this.i18nData));
			this.setElement(html);
		},
		// 这里用来进行dom操作
		reload:function(faultKindId){
			var $tree = this.$el.find(".com-faultPhenomena-tree").tree();
			utils.ajax('isaFaultService', 'getFaultPhenomena', 0, faultKindId).done(
					function(ret) {
						var root = [];
						
						if (ret)
							$.each(ret, function(i, n) {
								if (n.leaf == 1) {
									n.iconSkin="glyphicon glyphicon-info-sign";
									n.isParent = false;
								} else {
									n.iconSkin="glyphicon glyphicon-plus-sign";
									n.isParent = true;
								}
								root.push(n);
							});
						$tree.tree('reloadData', root);
					});
		},
		
		_render : function() {
			var options = {
				data : {
					key : {
						name : 'text',
						iconFontEnable: true
					},
					simpleData : {
						enable : true,
						pIdKey : 'parentId'
					},
					keep : {
						parent : true,
						leaf : true
					}
				},
				callback : {
					onCollapse : $.proxy(this.onCollapse, this),
					onExpand : $.proxy(this.onExpand, this)
				},
				fNodes : []
			};
			var $tree = this.$el.find(".com-faultPhenomena-tree").tree(options);
			utils.ajax('isaFaultService', 'getFaultPhenomena', 0, 0).done( //第一个0故障根节点，第二个0产品分类的根节点
					function(ret) {
						var root = [];
						
						if (ret)
							$.each(ret, function(i, n) {
								if (n.leaf == 1) {
									n.iconSkin="glyphicon glyphicon-info-sign";
									n.isParent = false;
								} else {
									n.iconSkin="glyphicon glyphicon-plus-sign";
									n.isParent = true;
								}
								root.push(n);
							});
						$tree.tree('reloadData', root);
					});
			

		},
		onCollapse : function(event, treeNode) {

		},
		onExpand : function(event, treeNode) {
			var me = this;
			if (!treeNode.isLoad) {
				treeNode.isLoad = true;
					var faultKindId = $('#isa_sto_ope_productClass').val() || 0;
					utils.ajax('isaFaultService', 'getFaultPhenomena',
							treeNode.faultPhenomenaId, faultKindId).done(
							function(ret) {
								var treeInstance = me.$el.find(".com-faultPhenomena-tree").tree("instance");
								if (ret)
									$.each(ret, function(i, n) {
										if (n.leaf == 1) {
											n.iconSkin="glyphicon glyphicon-info-sign";
											n.isParent = false;
										} else {
											n.iconSkin="glyphicon glyphicon-plus-sign";
											n.isParent = true;
										}
	
									});
								treeInstance.addNodes(treeNode, ret);
							});
			}
		},
		chooseBtn : function(e) {
			var treeInstance = this.$el.find(".com-faultPhenomena-tree").tree("instance");
			var nodes = treeInstance.getSelectedNodes();
			var treeNode = null;
			if (nodes && nodes.length > 0) {
				treeNode = nodes[0];
			}
			if ((!treeNode)) {
				fish.info("请选择具体故障内容");
			} else {
				treeNode.text = treeNode.pathName; //展示全路径
				this.$el.dialog("setReturnValue", treeNode);
				this.$el.dialog("close");
			}
		},
		closeBtn : function(e) {
			this.$el.dialog("setReturnValue", null);
			this.$el.dialog("close");
		}
	});
});