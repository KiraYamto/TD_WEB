define([
	'text!modules/iom/timelimit/templates/selectServiceView.html',
	'i18n!modules/iom/timelimit/i18n/selectService.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/timelimit/styles/selectService.css'
], function(selectServiceViewTpl, i18nSelectService, utils, css) {
	return fish.View.extend({
		template: fish.compile(selectServiceViewTpl),
		i18nData: fish.extend({}, i18nSelectService),
		selectedTache: undefined,
		events: {
			'input #iom-selectService-searchInput': 'search',
			'click #iom-selectService-submit': 'submitSelectedService'
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.loadTacheCatalogData();
			
			$('#iom-selectService-tree').niceScroll({
				cursorcolor: '#1d5987',
				cursorwidth: "10px",
		        cursoropacitymax:"0.2"
			});
			
			this.resize();
		},
		
		/* 加载目录信息 */
		loadTacheCatalogData : function(){	
			var me=this;
			utils.ajax('cloudIomServiceForWeb','qryServiceCatalogTree').done(function(ret){
				var options = {
						fNodes : ret,
						check: {
							enable:true,
							chkboxType:{"Y":"s","N":"ps"}
						},
						view: {
							dblClickExpand: true,
							showLine : true,
							showIcon : true,
							fontCss: function(treeNode){
								return treeNode.highlight ? {color: "#096eca", "font-weight": "bold"} : {color: "#333", "font-weight": "normal"};
							}
						}
				};
				$('#iom-selectService-tree').tree(options);
				
				//选中入参中的服务
				for (i in me.options.selectedService) {
					var node = $("#iom-selectService-tree").tree("getNodeByParam", "id", me.options.selectedService[i].id);
					me.recursiveExpandNode(node);
					$("#iom-selectService-tree").tree("checkNode", node, true);
				}
			}).fail(function(ret){
    			fish.error({title:'错误',message:'服务目录查询异常'});
    		});
		},
		
		search: function() {
			//清空状态
			var nodeList = $("#iom-selectService-tree").tree("getNodesByParamFuzzy", "name", '');
			for (var i = 0; i < nodeList.length; i++) {
				nodeList[i].highlight = false;
				$("#iom-selectService-tree").tree("updateNode", nodeList[i]);
			}

			//有输入
			if ('' != $('#iom-selectService-searchInput').val()) {
				nodeList = $("#iom-selectService-tree").tree("getNodesByParamFuzzy", "name", $('#iom-selectService-searchInput').val());
				for (var i = 0; i < nodeList.length; i++) {
					nodeList[i].highlight = true;
					this.recursiveExpandNode(nodeList[i]);
					$("#iom-selectService-tree").tree("updateNode", nodeList[i]);
				}
				$('#iom-selectService-searchInput').focus();
			}
		},
		
		recursiveExpandNode: function(node) {
			if (node != null) {
				$("#iom-selectService-tree").tree("expandNode", node.getParentNode(), true, false, true, false);
				this.recursiveExpandNode(node.getParentNode());
			}	
		},
		
		submitSelectedService : function(){	
			var checkedNodes = $("#iom-selectService-tree").tree("getCheckedNodes");
			checkedNodes = _.filter(checkedNodes, function(node){return node.type=='service'});
			this.popup.close(checkedNodes);
		},
		
		resize: function() {

		}
	});
});