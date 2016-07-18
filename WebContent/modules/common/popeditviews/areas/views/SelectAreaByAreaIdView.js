define([ 'text!modules/common/popeditviews/areas/templates/SelectAreaByAreaIdView.html',
		'i18n!modules/common/popeditviews/areas/i18n/area.i18n',
		'modules/common/cloud-utils' ], 
	function(viewTpl, i18n,utils) {
	
	return fish.View.extend({
		template : fish.compile(viewTpl),
		i18nData : fish.extend({}, i18n),
		events : {
			'click .com-choose-area' : $.proxy(this.choose, this),
			'click .com-close-area' : $.proxy(this.close, this)
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
						key : "areaId",
						name : 'areaName',
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
			this.$tree = $(this.$el).find(".com-area-tree").tree(options);

			this.loadArea();
			
			this.$('.com-choose-area').on('click',
					$.proxy(this.choose, this));
			this.$('.com-close-area').on('click',
					$.proxy(this.close, this));
			if (this.options && this.options.title) {
				this.$el.find('.modal-title').text(this.options.title);
			}
			return this;
		},
		loadArea:function(areaId){
			var me =this;
			if(areaId==0){
				utils.ajax('areaService', 'findTopArea').done(
						function(area){
							area.isParent = true;
							me.$tree.tree('reloadData', [area]);
						}
				);
					
					
			} else if(areaId==-1){
				
				utils.ajax('areaService', 'findByKey', areaId).done(
						function(area){
							area.isParent = true;
							me.$tree.tree('reloadData', [area]);
						}
				);
				
			}
			else{
				utils.ajax('areaService', 'findSubArea',areaId).done(
						function(areas){
							if (areas)
								$.each(areas, function(i, n) {
									n.isParent = true;

								});
							me.$tree.tree('reloadData', areas);
						}
				);
				
				
			}
		},
		onCollapse : function(event, treeNode) {

		},
		onExpand : function(event, treeNode) {
			var me = this;
			if (!treeNode.isLoad) {
				treeNode.isLoad = true;

				utils.ajax('areaService', 'findSubArea',
						treeNode.areaId).done(
						function(ret) {
							var treeInstance = me.$tree.tree("instance");

							if (ret)
								$.each(ret, function(i, n) {
									n.isParent = true;

								});
							treeInstance.addNodes(treeNode, ret);
						});
			}
		},
		choose : function(e) {
			var treeInstance = this.$tree.tree(
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
		close : function(e) {
			this.$el.dialog("setReturnValue", null);
			this.$el.dialog("close");
		}
	});
});