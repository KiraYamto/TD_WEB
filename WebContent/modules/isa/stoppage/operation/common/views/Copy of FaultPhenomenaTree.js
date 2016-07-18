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
		_render : function() {

			var orgId = currentJob.orgId;
			if (this.options && this.options.orgId) {
				orgId = this.options.orgId;
			}
			var sorgPathName = this.options ? this.options.orgPathName : null;
			var options = {
				data : {
					key : {
						name : 'FAULT_PHENOMENA_NAME',
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
			var $tree = $(this.$el).find(".com-staffbyOrg-tree").tree(options);

			utils.ajax('isaFaultService', 'getFaultPhenomena', 1).done(
					function(ret) {
						debugger;
						var root = [];
						//var morgId = currentJob.orgId;
						//var morgPathName = currentJob.orgPathName;

						//if (morgId != orgId) {
						//	morgId = orgId;
						//	var tempOrgRoot = _.findWhere(ret, {
						//		"orgId" : orgId
						//	});
						//	if (tempOrgRoot) {
						//		morgPathName = tempOrgRoot.text;
						//	} else {
						//		morgPathName = sorgPathName ? sorgPathName
						//				: 'root';
						//	}
						//}

						//root.push({
						//	FAULT_PHENOMENA_ID : "50000",
						//	text : 'test',
						//	leaf : 0,
						//	//orgId:morgId,
						//	parentId : 1,
						//	isParent : true,
						//	isLoad : true,
						//	iconSkin:"glyphicon glyphicon-home"
						//});
						if (ret)
							$.each(ret, function(i, n) {
								if (n.leaf == 1) {
									n.iconSkin="glyphicon glyphicon-user";
									n.isParent = false;
								} else {
									n.iconSkin="glyphicon glyphicon-home";
									n.isParent = true;
								}
								root.push(n);
							});
						debugger;
						$tree.tree('reloadData', root);
					});

			this.$el.find('.com-choose-staff').on('click',
					$.proxy(this.chooseStaff, this));
			this.$el.find('.com-close-staff').on('click',
					$.proxy(this.closeStaff, this));
			if (this.options && this.options.title) {
				this.$el.find('.modal-title').text(this.options.title);
			}
			return this;
		},
		onCollapse : function(event, treeNode) {

		},
		onExpand : function(event, treeNode) {
			var me = this;
			debugger;
			if (!treeNode.isLoad) {
				treeNode.isLoad = true;
				//if(treeNode.type == 0){
				
				
					utils.ajax('isaFaultService', 'getFaultPhenomena',
							treeNode.FAULT_PHENOMENA_ID).done(
							function(ret) {
								var treeInstance = me.$el.find(".com-staffbyOrg-tree")
										.tree("instance");
	
								if (ret)
									$.each(ret, function(i, n) {
										if (n.leaf == 1) {
											n.iconSkin="glyphicon glyphicon-user";
											n.isParent = false;
										} else {
											n.iconSkin="glyphicon glyphicon-home";
											n.isParent = true;
										}
	
									});
								treeInstance.addNodes(treeNode, ret);
							});
				//}
			}
		},
		chooseBtn : function(e) {
			alert('chooseBtn');
//			debugger;
//			var treeInstance = this.$el.find(".com-staffbyOrg-tree").tree(
//					"instance");
//			var nodes = treeInstance.getSelectedNodes();
//			var treeNode = null;
//			if (nodes && nodes.length > 0) {
//				treeNode = nodes[0];
//			}
//			if ((!treeNode) || treeNode.type == 0) {
//				fish.info("请选择一个人员或组织");
//			} else {
//				console.log(treeNode);
//				this.$el.dialog("setReturnValue", treeNode);
//				this.$el.dialog("close");
//
//			}
		},
		closeBtn : function(e) {
			alert('closeBtn');
//			this.$el.dialog("setReturnValue", null);
//			this.$el.dialog("close");
		}
	});
});