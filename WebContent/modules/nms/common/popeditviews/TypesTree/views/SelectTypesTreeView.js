define([ 'text!modules/nms/common/popeditviews/TypesTree/templates/SelectTypesTreeView.html',
		'i18n!modules/nms/common/popeditviews/TypesTree/i18n/TypesTree.i18n',
		'modules/common/cloud-utils' ], 
	function(viewTpl, i18n,utils) {
	
	return fish.View.extend({
		template : fish.compile(viewTpl),
		i18nData : fish.extend({}, i18n),
		events : {
			'click #nms_TypesTree_select' : $.proxy(this.choose, this)
		},
		initialize : function() {
			var html = $(this.template(this.i18nData));
			this.setElement(html);
		},
		multiple:false,
		// 这里用来进行dom操作
		_render : function() {
			var options = {
				data : {					
					simpleData : {
						enable : true,
						pIdKey : 'pId'
					}
			        ,key: {
			         iconFontEnable: true//显示字体图标
		            }
				},
				callback : {
					onCollapse : $.proxy(this.onCollapse, this),
					onExpand : $.proxy(this.onExpand, this)
				},
				fNodes : []
			};
			this.$tree = $(this.$el).find("#nms_TypesTree").tree(options);
            this.$("#nms_TypesTree_treeDiv").blockUI({message:'加载中......'});
			this.loadjobType();
			
			this.$('#nms_TypesTree_select').on('click',
					$.proxy(this.choose, this));
//			this.$('#nms_jobTypeTree_close').on('click',
//					$.proxy(this.close, this));
			if (this.options && this.options.title) {
				this.$el.find('.modal-title').text(this.options.title);
			};
			console.log("_render加载树");
			return this;
		},
		loadjobType:function(){
			var me =this;
			utils.ajax('typesService', 'loadKpiTypeTree').done(
					function(jobTypes){
					    $('#nms_TypesTree_treeDiv').unblockUI(); 
						if (jobTypes)
								$.each(jobTypes, function(i, n) {
									n.isParent = true;

						});
						me.$tree.tree('reloadData', jobTypes);
					}
			);

		},
		onCollapse : function(event, treeNode) {

		},
		onExpand : function(event, treeNode) {
	
		},
		choose : function(e) {
			var treeInstance = this.$tree.tree(
					"instance");
			var nodes = treeInstance.getSelectedNodes();
			var treeNode = null;
			if (this.multiple == true) {
				var id = '';
				var name = '';
				for(var i =0;i < nodes.length;i++){
					id = id + nodes[i].id;
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
				fish.info("请选择一个任务类型");
				return;
			} else {
				this.$el.dialog("setReturnValue", {id:treeNode.id,name:treeNode.name});
				this.$el.dialog("close");
			}
		},
		close : function(e) {			
			this.$el.dialog("close");
		}
	});
});