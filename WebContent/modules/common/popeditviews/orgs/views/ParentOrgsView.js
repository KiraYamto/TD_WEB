define([ 'text!modules/common/popeditviews/orgs/templates/ParentOrgsView.html',
		'i18n!modules/common/popeditviews/orgs/i18n/org.i18n',
		'modules/common/cloud-utils' ], function(ParentOrgsViewTpl, i18n,
		utils) {
	/*.popedit({
		dataTextField :'orgName',
		dataValueField :'orgId',
		dialogOption: {
			height: 400,
			width: 500,
			viewOptions:{
				orgId:116
			}
		},
		url:'js!modules/common/popeditviews/org/views/ParentOrgsView',
		showClearIcon:false
	});*/
	return fish.View.extend({
		template : fish.compile(ParentOrgsViewTpl),
		i18nData : fish.extend({}, i18n),
		
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
						name : 'orgName',
						iconFontEnable: true
					},
					simpleData : {
						enable : true,
						pIdKey : 'parentId',
						idKey : 'orgId'
					},
					keep : {
						parent : true,
						leaf : true
					}
				},
				fNodes : []
			};
			var $tree = $(this.$el).find(".com-parentorgs-tree").tree(options);

			utils.ajax('orgService', 'findParentOrgs', orgId).done(
					function(ret) {
						var root = [];
						var morgId = currentJob.orgId;
						

						
						if (ret)
							$.each(ret, function(i, n) {
								
								n.iconSkin="glyphicon glyphicon-home";
									n.isParent = true;
								
								root.push(n);
							});

						$tree.tree('reloadData', root);
					});

			this.$el.find('.com-choose-org').on('click',
					$.proxy(this.chooseOrg, this));
			this.$el.find('.com-close-org').on('click',
					$.proxy(this.closeOrg, this));
			if (this.options && this.options.title) {
				this.$el.find('.modal-title').text(this.options.title);
			}
			return this;
		},
		
		chooseOrg : function(e) {
			var treeInstance = this.$el.find(".com-parentorgs-tree").tree(
					"instance");
			var nodes = treeInstance.getSelectedNodes();
			var treeNode = null;
			if (nodes && nodes.length > 0) {
				treeNode = nodes[0];
			}
			if (!treeNode) {
				fish.info("请选择一个组织");
			} else {
				console.log(treeNode);
				this.$el.dialog("setReturnValue", treeNode);
				this.$el.dialog("close");

			}
		},
		closeOrg : function(e) {
			this.$el.dialog("setReturnValue", null);
			this.$el.dialog("close");
		}
	});
});