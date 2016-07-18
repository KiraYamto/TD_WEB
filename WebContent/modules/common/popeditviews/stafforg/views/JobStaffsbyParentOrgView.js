define([ 'text!modules/common/popeditviews/stafforg/templates/JobStaffsbyParentOrgView.html',
		'i18n!modules/common/popeditviews/stafforg/i18n/stafforg.i18n',
		'modules/common/cloud-utils' ], function(StaffsbyOrgViewTpl, i18n,
		utils) {
	/*.popedit({
	dataTextField :'text',
	dataValueField :'id',
	dialogOption: {
		height: 400,
		width: 500,
		viewOptions:{
			orgId:116,
			orgPathName:'啦啦啦'
		}
	},
	url:'js!modules/common/popeditviews/stafforg/views/JobStaffsbyParentOrgView',
	showClearIcon:false
	});*/
	return fish.View.extend({
		template : fish.compile(StaffsbyOrgViewTpl),
		i18nData : fish.extend({}, i18n),
		events : {
			'click .com-choose-staff' : $.proxy(this.chooseStaff, this),
			'click .com-close-staff' : $.proxy(this.closeStaff, this)
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
			var $tree = $(this.$el).find(".com-staffbyOrg-tree").tree(options);

			utils.ajax('staffService', 'qryParentOrgJobStaffTreeByOrgId', orgId).done(
					function(ret) {
						var root = [];

						if (ret)
							$.each(ret, function(i, n) {
								if (n.type == 2) {
									n.iconSkin="glyphicon glyphicon-user";
									n.isParent = false;
								} else if(n.type==1){
									n.iconSkin="glyphicon glyphicon-briefcase";
									n.isParent = true;
								}
								else{
									n.iconSkin="glyphicon glyphicon-home";
									n.isParent = true;
								}
								root.push(n);
							});

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
			if(treeNode.parentId<=0||treeNode.parentId=='org_0'||treeNode.parentId=='org_'||treeNode.type == 1){
				treeNode.isLoad = true;
			}
			if (!treeNode.isLoad) {
				treeNode.isLoad = true;

				utils.ajax('staffService', 'qryJobStaffTreeByParentId',
						treeNode.orgId).done(
						function(ret) {
							var treeInstance = me.$el.find(".com-staffbyOrg-tree")
									.tree("instance");

							if (ret)
								$.each(ret, function(i, n) {
									if (n.type == 2) {
										n.iconSkin="glyphicon glyphicon-user";
										n.isParent = false;
									} else if(n.type==1){
										n.iconSkin="glyphicon glyphicon-briefcase";
										n.isParent = true;
									}
									else{
										n.iconSkin="glyphicon glyphicon-home";
										n.isParent = true;
									}

								});
							treeInstance.addNodes(treeNode, ret);
						});
			}
		},
		chooseStaff : function(e) {
			var treeInstance = this.$el.find(".com-staffbyOrg-tree").tree(
					"instance");
			var nodes = treeInstance.getSelectedNodes();
			var treeNode = null;
			if (nodes && nodes.length > 0) {
				treeNode = nodes[0];
			}
			if ((!treeNode) || treeNode.isParent) {
				fish.info("请选择一个人员");
			} else {
				console.log(treeNode);
				this.$el.dialog("setReturnValue", treeNode);
				this.$el.dialog("close");

			}
		},
		closeStaff : function(e) {
			this.$el.dialog("setReturnValue", null);
			this.$el.dialog("close");
		}
	});
});