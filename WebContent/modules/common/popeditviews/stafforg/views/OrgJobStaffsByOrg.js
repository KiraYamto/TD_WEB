define([ 'text!modules/common/popeditviews/stafforg/templates/OrgJobStaffsByOrgView.html',
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
			'click .com-close-staff' : $.proxy(this.closeStaff, this),
			'click  .isa_select_qryBtn' : "qryBtn",
		},
		initialize : function() {
		
			
			var html = $(this.template(this.i18nData));
			this.setElement(html);
			this.$el.dialog({
				width: 500,
				height: 400,
				beforeClose: function(event, ui) {
					$(this).find(".isa_select_type").combobox('value', 'ORG');
					$(this).find(".isa_select_type").combobox('text', '组织名称');
					$(this).find(".isa_select_content").val('');
					
					var $tree = $(this).find(".com-staffbyOrg-tree").tree();
					utils.ajax('orgService', 'findByKey', currentJob.orgPathCode.split('.')[0]).done(
						function(ret) {
							var root = [];
							ret.iconSkin="glyphicon glyphicon-home";
							ret.isParent = true;
							ret.type = 0;
							ret.text = ret.orgName;
							$tree.tree('reloadData', ret);
					});
				}
			});
			
		},
		// 这里用来进行dom操作
		_render : function() {
			
			//查找方式
    		var $combobox = $(this.$el).find(".isa_select_type").combobox();
    		//输入框
    		var $content = $(this.$el).find(".isa_select_content");
    		
    		$(this.$el).find(".isa_select_type").on('combobox:change', function(e) {
    			$content.val('');
    		});
		
			var orgId = currentJob.orgPathCode.split('.')[0];
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
			var nodes = treeInstance.getSelectedNodes();
			var treeNode = null;
			if (nodes && nodes.length > 0) {
				treeNode = nodes[0];
			}
			if ((!treeNode)) {
				fish.info("请选择人员或组织");
			} else {
				console.log(treeNode);
				if(popup){
					
					popup.close(treeNode);
				}else{
					this.$el.dialog("setReturnValue", treeNode);
					this.$el.dialog("close");
				}
				
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
		},
		
		qryBtn:function(){

			var type = $(this.$el).find(".isa_select_type").val();
			var content = $(this.$el).find(".isa_select_content").val();
			var $tree = $(this.$el).find(".com-staffbyOrg-tree").tree();
			
			//查询组织
			if("ORG" == type){
				
				if(content == ""){
					content = currentJob.orgPathName.split('/')[0];
				}
				utils.ajax('orgService', 'findOrgsByOrgName', content).done(
						function(ret) {
							if (ret){
								$.each(ret, function(i, n) {
									n.iconSkin="glyphicon glyphicon-home";
									n.isParent = true;
									n.text = n.orgName;
									n.type = 0;
								});
							}
									
							$tree.tree('reloadData', ret);
							
				});
			}else if("STA" == type){ //查询人员
				utils.ajax('staffService', 'findByStaffName', content).done(
						function(ret) {
							if (ret){
								$.each(ret, function(i, n) {
									n.iconSkin="glyphicon glyphicon-user";
									n.isParent = false;
									n.text = n.staffName;
									n.id = n.staffId;
									n.type = 2;
								});
							}
									
							$tree.tree('reloadData', ret);						
				});
			}
			
			
		},
		
	});
});