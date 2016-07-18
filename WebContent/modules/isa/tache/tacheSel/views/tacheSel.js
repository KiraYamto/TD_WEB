define([
	'text!modules/isa/tache/tacheSel/templates/tacheSel.html',
	'i18n!modules/isa/tache/tacheSel/i18n/tacheSel.i18n',
	'modules/common/cloud-utils',
	'css!modules/isa/tache/tacheSel/styles/tacheSel.css'
], function(manageViewTpl, i18nManage,utils,css) {

	return fish.View.extend({
		template: fish.compile(manageViewTpl),
		i18nData: fish.extend({}, i18nManage),
		rowMap:new Object(),
		events: {
			"click #isa_tac_tac_tacheSel_cancel_button": "isa_tac_tac_tacheSel_cancel_button",
			"click #isa_tac_tac_tacheSel_btn": "tacheSelBtn"
		},
		
		initialize : function() {
			//var html = $(this.template(this.i18nData));
			//this.setElement(html);
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
		
			return this;
		},
		
		

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			var iniObj = this.options;
			rowMap = iniObj.rowMap;
			
			this.loadTacheCatalogData();
		},
		
		
		
		/* 加载环节目录信息 */
		loadTacheCatalogData : function(){
			var map = new Object();
			map.actionStr = "queryTacheCatalog";
			var onDblClick =  $.proxy(this.onDblClick, this);
			var options = {
					fNodes : [],
					data : {key: {children: "children", name: "text"}},
					callback: {
						onExpand : $.proxy(this.onExpand, this),
						onDblClick: function(e,treeNode) {
							console.log("[onDblClick] " + treeNode.name);
							onDblClick(e,treeNode);
						}
					//onDblClick : $.proxy(this.onDblClick, this)
					},
					check: {enable: true,chkStyle: "checkbox",chkboxType:  { "Y" : "ps", "N" : "ps" }},
			};
			var $tree = $(this.$el).find(".isa_tac_tac_tacheSel_tree").tree(options);
			utils.ajax('isaOaTacheService','queryTacheCatalog',map).done(function(ret){
				ret=JSON.parse(ret);
				var obj=ret.QUERY_RESULT;
				/*var options = {
						fNodes : JSON.parse(obj),
						data : {key: {children: "children", name: "text"}},
						callback: {
							onExpand : $.proxy(this.onExpand, this),
							onDblClick: function(e,treeNode) {
					            console.log("[onDblClick] " + treeNode.name);
					            onDblClick(e,treeNode);
					        }
							//onDblClick : $.proxy(this.onDblClick, this)
						},
						check: {enable: true,chkStyle: "checkbox",chkboxType:  { "Y" : "ps", "N" : "ps" }},
				};*/
				
				options.isParent = true;
				$tree.tree('reloadData', JSON.parse(obj));
				//$('#isa_tac_tac_tacheSel_tree').tree(options);
			});
		},
		
		onExpand : function(event, treeNode) {
			/*var objStory = $.proxy(this.ObjStory,this);
			var me = this;
			if (!treeNode.isLoad) {
				treeNode.isLoad = true;
				var map = new Object();
				map.actionStr = "queryTacheCatalog";
				utils.ajax('isaOaTacheService','queryTacheCatalog',map).done(function(ret){
					var treeInstance = me.$el.find(".isa_tac_tac_tacheSel_tree").tree("instance");
					ret.shift();
					if (ret)
						$.each(ret, function(i, n) {
							n.isParent = true;
						});
					treeInstance.addNodes(treeNode, ret);
				});
			}*/
		},
		
		onDblClick : function(e,treeNode ) {
			var objStory = $.proxy(this.ObjStory,this);
			var me = this;
			if (treeNode.id && treeNode.type !='0' && treeNode.check_Child_State =='-1'  ) {
				treeNode.isLoad = true;
				var map = new Object();
				map.actionStr = "getTacheData";
				map.tacheCatalog=treeNode.id;
				map.tacheName= treeNode.tacheName;
				utils.ajax('isaOaTacheService','qryTathesByCatalog',map).done(function(ret){
					var treeInstance = me.$el.find(".isa_tac_tac_tacheSel_tree").tree("instance");
					ret=ret.rows;
					if (ret){
						var arrayRet=new Array();
						for(var i=0;i<ret.length;i++){
							var obj = new Object();
							obj.id=ret[i].id+"";
							obj.text=ret[i].tacheName+"";
							obj.type="0";
							arrayRet[i]=obj;
    				    }
						/*$.each(ret, function(i, n) {
							n.isParent = true;
						});*/
					}
					treeInstance.addNodes(treeNode, arrayRet);
				});
			};
        },
		
		tacheSelBtn : function(){
			var treeInstance = this.$el.find(".isa_tac_tac_tacheSel_tree").tree("instance");
			var nodes = $("#isa_tac_tac_tacheSel_tree").tree("getSelectedNodes");
			//var nodes = treeInstance.getSelectedNodes();
			var treeNode = null;
			if (nodes && nodes.length > 0) {
				treeNode = nodes[0].children;
			}
			if ((!treeNode) || treeNode.isParent) {
				fish.info("请选择一个环节");
			} else {
				var map=new Object();
				var ids=new Array();
				var tacheNames=new Array();
				var j = 0;
				for(var i=0;i<treeNode.length;i++){
					if(treeNode[i].check_Focus){
						ids[j]=treeNode[j].id+"";
						tacheNames[j]=treeNode[j].text+"";
						j++;
					}
				}
				map.ids=ids;
				map.tacheNames=tacheNames;
				console.log(map);
				this.$el.dialog("setReturnValue", map);
				this.$el.dialog("close");
		
			}
		},
		
		
		isa_tac_tac_tacheSel_cancel_button : function(){
			this.$el.dialog("setReturnValue", null);
			this.$el.dialog("close");
		},
		
		
	});	
});