define([
	'text!modules/iom/product/templates/productSelectView.html'+codeVerP,
	'i18n!modules/iom/product/i18n/productManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/product/styles/productManage.css'+codeVerP
], function(productSelectViewTpl, i18nproductManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(productSelectViewTpl),
		i18nData: fish.extend({}, i18nproductManage),
		events: {
			'click #iom-productSelect-productCatalog-close' :  $.proxy(this.chooseSelectPro, this),
			'click #iom-productSelect-productCatalog-select' : $.proxy(this.chooseSelectPro, this) 
		},
		initialize : function() {
			var html = $(this.template(this.i18nData));
			this.setElement(html);
		},
		//这里用来进行dom操作
		_render: function() {
			var me = this;
			utils.ajax('cloudIomServiceForWeb', 'getProductCatalogWithProduct').done(
					function(ret) {
						var root = [];
						ret = JSON.parse(ret);
						if (ret){
							$.each(ret, function(i, n) {
								var falg = n.FLAG;
								if (falg == 'C') {
									n.isParent = true;
								} else if(falg == 'P'){
									n.isParent = false;
								}
								else{
									n.isParent = true;
								}
								root.push(n);
							});
						}
						var options = {
								data : {
									key : {
										icon: 'icon'
									},
									simpleData :{
											enable : true,
									},
									keep : {
										parent : true,
										leaf : true
									}
								},
								view: {
									dblClickExpand: false,
									showLine : true,
									showIcon :　false
								},
								callback : {
									onCollapse : $.proxy(me.onCollapse, this),
									onExpand : $.proxy(me.onExpand, this)
								},
								fNodes : root
							};
						me.$("#iom-productSelect-productCatalog").tree(options); 
					});

			this.$el.find('#iom-productSelect-productCatalog-select').on('click', $.proxy(this.chooseSelectPro, this));
			this.$el.find('#iom-productSelect-productCatalog-close').on('click', $.proxy(this.closeSelectProduct, this));
			if (this.options && this.options.title) {
				this.$el.find('.modal-title').text(this.options.title);
			}
			return this;
		},
		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
		}, 
		closeSelectProduct : function(e) {
			this.$el.dialog("setReturnValue", null);
			this.$el.dialog("close");
		},
		chooseSelectPro : function(e) {
			var treeInstance = this.$el.find("#iom-productSelect-productCatalog").tree("instance");
			var nodes = treeInstance.getSelectedNodes();
			var treeNode = null;
			if (nodes && nodes.length > 0) {
				treeNode = nodes[0];
			}
			if ((!treeNode) || treeNode.isParent) {
				fish.info("请选择一个产品");
			} else {
				console.log(treeNode);
				this.$el.dialog("setReturnValue", treeNode);
				this.$el.dialog("destroy");
				this.$el.dialog("close");
			}
		},
		onCollapse : function(event, treeNode) {
			var treeInstance = $("#iom-productSelect-productCatalog").tree("instance");
			treeInstance.removeChildNodes(treeNode);
		},
		onExpand : function(event, treeNode) {
			var me = this;
			var map = new Object();
			map.PATH_CODE=treeNode.PATH_CODE+"";
			var treeInstance = $("#iom-productSelect-productCatalog").tree("instance");
			if (!treeNode.isLoad) {
				//treeNode.isLoad = true;
				utils.ajax('cloudIomServiceForWeb', 'getProductCatalogWithProduct2',map).done(
						function(ret) { 
							var treeInstance = $("#iom-productSelect-productCatalog").tree("instance");
							var root = [];
							ret = JSON.parse(ret);
							if (ret){
								$.each(ret, function(i, n) {
									var falg = n.FLAG;
									if (falg == 'P') {
										n.isParent = false;
									} else {
										n.isParent = true;
									}
									root.push(n);
								});
							}
							treeInstance.removeChildNodes(treeNode);	
							treeInstance.addNodes(treeNode, root);
						});
			}
		}
	});
});