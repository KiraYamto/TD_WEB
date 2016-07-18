define([ 'text!modules/common/popeditviews/stafforg/templates/StaffMultiView.html',
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
	url:'js!modules/common/popeditviews/stafforg/views/StaffsbyOrgView',
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
			
			var options = {
				check: {
	                enable: true,
	                chkStyle: "checkbox",
	                chkboxType:  { "Y" : "s", "N" : "s" } // Y 属性定义 checkbox 被勾选后的情况； N 属性定义 checkbox 取消勾选后的情况； "p" 表示操作会影响父级节点； "s" 表示操作会影响子级节点。
	            },
			
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

			utils.ajax('orgService', 'findByKey', orgId).done(
					function(ret) {
						var root = [];
						ret.iconSkin="glyphicon glyphicon-home";
						ret.isParent = true;
						ret.type = 0;
						ret.text = ret.orgName;
						$tree.tree('reloadData', ret);
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
			if (!treeNode.isLoad) {
				treeNode.isLoad = true;
				if(treeNode.type == 0){
					utils.ajax('staffService', 'qryOrgJobStaffTreeByParentId',
							treeNode.orgId).done(
							function(ret) {
								var treeInstance = me.$el.find(".com-staffbyOrg-tree")
										.tree("instance");
	
								if (ret)
									$.each(ret, function(i, n) {
										if (n.type == 2 ) {
											n.iconSkin="glyphicon glyphicon-user";
											n.isParent = false;
										} else if(n.type == 1){
											n.iconSkin="glyphicon glyphicon-hand-right";
											n.isParent = false;
										} else {
											n.iconSkin="glyphicon glyphicon-home";
											n.isParent = true;
										}
	
									});
								treeInstance.addNodes(treeNode, ret);
							});
				}
			}
		},
		chooseStaff : function(e) {
		
			var popup = this.popup;
			var treeInstance = this.$el.find(".com-staffbyOrg-tree").tree(
					"instance");
			var nodes = treeInstance.getCheckedNodes();
			
			if(nodes.length == 0){
				fish.info("请选择人员");
				return;
			}
			var staffId = [];
			var staffName = [];
			//遍历选人员
			$.each(nodes, function(i, n) {
				if (n.type == 2) {
					staffName.push(n.text);
					staffId.push(n.id);
				} 
			});
			var result = {id:staffId, text:staffName};
					
			if(popup){
				popup.close();
			}else{
				this.$el.dialog("setReturnValue", result);
				this.$el.dialog("close");
			}
		},
		closeStaff : function(e) {
			var popup = this.popup;
			if(popup){
				var ret=new Object();
				ret.cancel="cancel";
				popup.close();
			}else{
				this.$el.dialog("setReturnValue", null);
				this.$el.dialog("close");
			}
		}
	});
});