define([
	'text!modules/isa/sapolicy/oaSaPolicyPlan/templates/oaSaPolicyPlan.html',
	'i18n!modules/isa/sapolicy/oaSaPolicyPlan/i18n/oaSaPolicyPlan.i18n',
	'modules/common/cloud-utils',
	'css!modules/isa/sapolicy/oaSaPolicyPlan/styles/oaSaPolicyPlan.css'
], function(manageViewTpl, i18nManage,utils,css) {

	return fish.View.extend({
		template: fish.compile(manageViewTpl),
		i18nData: fish.extend({}, i18nManage),
		rowMap:new Object(),
		events: {
			"click #isa_sap_oas_sendplanName_tabs_link": "sendplanNameTabsLink",//派单
			"click #isa_sap_oas_tachetimeplanName_tabs_link": "tachetimeplanNameTabsLink",//环节时限
			"click #isa_sap_oas_proctimeplanName_tabs_link": "proctimeplanNameTabsLink",//流程时限
			"click #isa_sap_oas_sendplanName_panel_addbtn": "isa_sap_oas_sendplanName_panel_addbtn",//派单策略-策略方案管理-添加
			"click #isa_sap_oas_sendplanName_panel_modbtn": "isa_sap_oas_sendplanName_panel_modbtn",//派单策略-策略方案管理-编辑
			"click #isa_sap_oas_sendplanName_panel_delbtn": "isa_sap_oas_sendplanName_panel_delbtn",//派单策略-策略方案管理-删除
				
			"click #isa_sap_oas_sendplanName_panel_map_addbtn": "isa_sap_oas_sendplanName_panel_map_addbtn",//派单策略-策略方案映射管理-添加
			"click #isa_sap_oas_sendplanName_panel_map_modbtn": "isa_sap_oas_sendplanName_panel_map_modbtn",//派单策略-策略方案映射管理-编辑
			"click #isa_sap_oas_sendplanName_panel_map_delbtn": "isa_sap_oas_sendplanName_panel_map_delbtn"//派单策略-策略方案映射管理-删除
		},

		initialize : function() {
			
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.css({"height":"100%"});
			this.$el.html(this.template(this.i18nData));
		
			return this;
		},
		
		

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			var iniObj = this.options;
			rowMap = iniObj.rowMap;
			
			//策略切换 
			$('#isa_sap_oas_carousel').slick({
		            dots: false,
		            infinite: true,
		            centerMode: false,
		            speed: 50,
		            slidesToShow: 2,
		            slidesToScroll: 1
		        });
			//this.sendplanNameTabsLink();
			this.loadSendplanNameTreeData();
			/*this.loadTachetimeplanNameTreeData();
			this.loadProctimeplanNameTreeData();*/
			this.loadSendplanNameRender();
			this.loadSendplanNamePanelMapRender();
			this.resize();
		},
		
		//派单
		sendplanNameTabsLink:function(){
			document.getElementById('isa_sap_oas_sendplanName_leftTree').style.display="block";
			document.getElementById('isa_sap_oas_tachetimeplanName_leftTree').style.display="none";
			document.getElementById('isa_sap_oas_proctimeplanName_leftTree').style.display="none";
			this.$('#isa_sap_oas_sendplanName_tabs_li').addClass('ui-tabs-active');
			this.$('#isa_sap_oas_tachetimeplanName_tabs_li').removeClass('ui-tabs-active');
			this.$('#isa_sap_oas_proctimeplanName_tabs_li').removeClass('ui-tabs-active');
			
		},
		
		//环节时限
		tachetimeplanNameTabsLink:function(){
			this.loadTachetimeplanNameTreeData();
			document.getElementById('isa_sap_oas_sendplanName_leftTree').style.display="none";
			document.getElementById('isa_sap_oas_tachetimeplanName_leftTree').style.display="block";
			document.getElementById('isa_sap_oas_proctimeplanName_leftTree').style.display="none";
			this.$('#isa_sap_oas_sendplanName_tabs_li').removeClass('ui-tabs-active');
			this.$('#isa_sap_oas_tachetimeplanName_tabs_li').addClass('ui-tabs-active');
			this.$('#isa_sap_oas_proctimeplanName_tabs_li').removeClass('ui-tabs-active');
		},
		
		//流程时限
		proctimeplanNameTabsLink:function(){
			this.loadProctimeplanNameTreeData();
			document.getElementById('isa_sap_oas_sendplanName_leftTree').style.display="none";
			document.getElementById('isa_sap_oas_tachetimeplanName_leftTree').style.display="none";
			document.getElementById('isa_sap_oas_proctimeplanName_leftTree').style.display="block";
			this.$('#isa_sap_oas_sendplanName_tabs_li').removeClass('ui-tabs-active');
			this.$('#isa_sap_oas_tachetimeplanName_tabs_li').removeClass('ui-tabs-active');
			this.$('#isa_sap_oas_proctimeplanName_tabs_li').addClass('ui-tabs-active');
		},
		
		
		/* 加载派单 策略*/
		loadSendplanNameTreeData : function(){
			var options = {
					data : {
						key : {key : "areaId",name : 'areaName',iconFontEnable: true},
						simpleData : {enable : true,pIdKey : 'parentId'},
						keep : {parent : true,leaf : true}
					},
					callback : {
						onCollapse : $.proxy(this.onCollapse, this),
						onExpand : $.proxy(this.onExpandSendplanName, this),
						onDblClick : $.proxy(this.onDblClickSendplanNameTree, this)
					},
					fNodes : []
				};
			var $tree = $(this.$el).find(".isa_sap_oas_sendplanName_tree").tree(options);
			//this.$tree = this.$(".isa_sap_oas_sendplanName_tree").tree(options);
			var orgId = currentJob.orgPathCode.split('.')[0];
			
			var me =this;
			utils.ajax('areaService', 'findTopArea').done(
					function(area){
						area.isParent = true;
						$tree.tree('reloadData', area);
					}
			);
		},
		onDblClickSendplanNameTree:function(e,treeNode){
	        this.loadSendplanNamePanelData2(treeNode);
	     },
	     onCollapse : function(event, treeNode) {

			},
		onExpandSendplanName : function(event, treeNode) {
			var objStory = $.proxy(this.ObjStory,this);
			var me = this;
			if (!treeNode.isLoad) {
				treeNode.isLoad = true;
				utils.ajax('areaService', 'findSubArea',treeNode.areaId).done(
				function(ret) {
					var treeInstance = me.$el.find(".isa_sap_oas_sendplanName_tree").tree("instance");
					ret.shift();
					if (ret)
						$.each(ret, function(i, n) {
							n.isParent = true;
						});
					treeInstance.addNodes(treeNode, ret);
				});
			}
		},
			
		
		/* 加载环节 策略*/
		loadTachetimeplanNameTreeData : function(){
			var options = {
					data : {
						key : {key : "areaId",name : 'areaName',iconFontEnable: true},
						simpleData : {enable : true,pIdKey : 'parentId'},
						keep : {parent : true,leaf : true}
					},
					callback : {
						onCollapse : $.proxy(this.onCollapse, this),
						onExpand : $.proxy(this.onExpandTachetimeplanNameTree, this),
						onDblClick : $.proxy(this.onDblClickTachetimeplanNameTree, this)
					},
					fNodes : []
			};
			var $tree = $(this.$el).find(".isa_sap_oas_tachetimeplanName_tree").tree(options);
			var orgId = currentJob.orgPathCode.split('.')[0];
			
			var me =this;
			utils.ajax('areaService', 'findTopArea').done(
					function(area){
						area.isParent = true;
						$tree.tree('reloadData', area);
					}
			);
		},
		onExpandTachetimeplanNameTree : function(event, treeNode) {
			var objStory = $.proxy(this.ObjStory,this);
			var me = this;
			if (!treeNode.isLoad) {
				treeNode.isLoad = true;
				utils.ajax('areaService', 'findSubArea',treeNode.areaId).done(
				function(ret) {
					var treeInstance = me.$el.find(".isa_sap_oas_tachetimeplanName_tree").tree("instance");
					ret.shift();
					if (ret)
						$.each(ret, function(i, n) {
							n.isParent = true;
						});
					treeInstance.addNodes(treeNode, ret);
				});
			}
		},
		onDblClickTachetimeplanNameTree:function(e,treeNode){
	    	 this.loadTachetimeplanNameData2(treeNode);
	     },
		
		/* 加载流程时限 策略*/
		loadProctimeplanNameTreeData : function(){
			var options = {
					data : {
						key : {key : "areaId",name : 'areaName',iconFontEnable: true},
						simpleData : {enable : true,pIdKey : 'parentId'},
						keep : {parent : true,leaf : true}
					},
					callback : {
						onCollapse : $.proxy(this.onCollapse, this),
						onExpand : $.proxy(this.onExpandProctimeplanNameTree, this),
						onDblClick : $.proxy(this.onDblClickProctimeplanNameTree, this)
					},
					fNodes : []
			};
			var $tree = $(this.$el).find(".isa_sap_oas_proctimeplanName_tree").tree(options);
			var orgId = currentJob.orgPathCode.split('.')[0];
			
			var me =this;
			utils.ajax('areaService', 'findTopArea').done(
					function(area){
						area.isParent = true;
						$tree.tree('reloadData', area);
					}
			);
		},
		onExpandProctimeplanNameTree : function(event, treeNode) {
			var objStory = $.proxy(this.ObjStory,this);
			var me = this;
			if (!treeNode.isLoad) {
				treeNode.isLoad = true;
				utils.ajax('areaService', 'findSubArea',treeNode.areaId).done(
				function(ret) {
					var treeInstance = me.$el.find(".isa_sap_oas_proctimeplanName_tree").tree("instance");
					ret.shift();
					if (ret)
						$.each(ret, function(i, n) {
							n.isParent = true;
						});
					treeInstance.addNodes(treeNode, ret);
				});
			}
		},
		
		onDblClickProctimeplanNameTree:function(e,treeNode){
	    	 this.loadProctimeplanNameData2(treeNode);
	     },
		
		
		
		
		//策略方案管理 
		loadSendplanNameRender: function() {
			this.$("#isa_sap_oas_sendplanName_grid").grid({
				datatype: "json",
				height: 200,
				colModel: [{name: 'priority',label: '优先级',width: 70},
				           {name: 'tacheName',label: '适用环节',width: 200},
				           {name: 'planName',label: '策略方案名称',width: 200},
				           {name: 'stateName',label: '状态',width: 80},
				           {name: 'state',label: '状态',width: 200,hidden:true},
				           {name: 'createDate',label: '创建时间',width: 150},
				           {name: 'memo',label: '备注'},
				           {name: 'planId',label: '主键',key:true,width: 100,hidden:true}
				           ],
				onSelectRow:$.proxy(function(rowid,id,state){
					var getRowDataTemp = this.$("#isa_sap_oas_sendplanName_grid").grid("getSelection");//返回所有被选中的行
					var loadSendplanNamePanelMapData2=$.proxy(this.loadSendplanNamePanelMapData2,this);
					loadSendplanNamePanelMapData2(getRowDataTemp);

				},this),
				rowNum: 10,
		        gridview:false,
		        pager: true,
				server: true,
				pageData: this.loadSendplanNamePanelData
			});
		},
		
		//策略方案映射功能列表
		loadSendplanNamePanelMapRender: function() {
			this.$("#isa_sap_oas_sendplanName_panel_map_grid").grid({
				datatype: "json",
				height: 300,
				colModel: [{name: 'partyName',label: '执行人名称',width: 130},
				           {name: 'partyId',label: '执行人标识',width: 200,hidden:true},
				           {name: 'alertValue',label: '告警时限值',width: 200},
				           {name: 'limitValue',label: '完成时限值',width: 200},
				           {name: 'stateName',label: '状态',width: 80},
				           {name: 'state',label: '状态',width: 200,hidden:true},
				           {name: 'createDate',label: '创建时间',width: 150},
				           {name: 'memo',label: '备注'},
				           {name: 'mapId',label: '主键',key:true,width: 100,hidden:true}
				           ],
				           rowNum: 10,
				           gridview:false,
				           server: true,
				           pager: true,
				           pageData: this.loadSendplanNamePanelMapData
			});
		},
		
		
		//策略方案管理 数据
		loadSendplanNamePanelData : function(page, rowNum, sortname, sortorder){
			rowNum = rowNum || this.$("#isa_sap_oas_sendplanName_grid").grid("getGridParam", "rowNum");
			var map = new Object();
			map.actionStr = "selStoppageWorkorderList";
			if(null == page || (typeof page)=="object" ){
				page = 0;
			}
			map.areaId=rowMap.planId;
			map.planType=document.getElementById("isa_sap_oas_plan_plan_type").value;
			//map.planType="100";
			var me =this;
			utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanByAreaId',map).done(function(ret){
				$("#isa_sap_oas_sendplanName_grid").grid("reloadData", ret);
			});
		},
		//环节执行人
		loadSendplanNamePanelData2 : function(treeNode){
			var map = new Object();
			map.actionStr = "selStoppageWorkorderList";
			map.areaId=treeNode.areaId;
			map.planType="100";
			var me =this;
			document.getElementById("isa_sap_oas_plan_plan_type").value="100";
			document.getElementById("isa_sap_oas_area_id").value=treeNode.areaId;
			document.getElementById("isa_sap_oas_area_name").value=treeNode.areaName;
			utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanByAreaId',map).done(function(ret){
				$("#isa_sap_oas_sendplanName_grid").grid("reloadData", ret);
			});
		},
		//环节时限
		loadTachetimeplanNameData2 : function(treeNode){
			var map = new Object();
			map.actionStr = "selStoppageWorkorderList";
			map.areaId=treeNode.areaId;
			map.planType="101";
			var me =this;
			document.getElementById("isa_sap_oas_plan_plan_type").value="101";
			document.getElementById("isa_sap_oas_area_id").value=treeNode.areaId;
			document.getElementById("isa_sap_oas_area_name").value=treeNode.areaName;
			utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanByAreaId',map).done(function(ret){
				$("#isa_sap_oas_sendplanName_grid").grid("reloadData", ret);
			});
		},
		//流程时限
		loadProctimeplanNameData2 : function(treeNode){
			var map = new Object();
			map.actionStr = "selStoppageWorkorderList";
			map.areaId=treeNode.areaId;
			map.planType="102";
			var me =this;
			document.getElementById("isa_sap_oas_plan_plan_type").value="102";
			document.getElementById("isa_sap_oas_area_id").value=treeNode.areaId;
			document.getElementById("isa_sap_oas_area_name").value=treeNode.areaName;
			utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanByAreaId',map).done(function(ret){
				$("#isa_sap_oas_sendplanName_grid").grid("reloadData", ret);
			});
		},
		
		
		
		
		
		//策略方案映射功能-加载数据
		loadSendplanNamePanelMapData : function(page, rowNum, sortname, sortorder){ //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#isa_sap_oas_sendplanName_panel_map_grid").grid("getGridParam", "rowNum");
			var map = new Object();
			map.actionStr = "selStoppageWorkorderList";
			if(null == page || (typeof page)=="object" ){
				page = 0;
			}
			map.pageIndex = page;
			map.pageSize = rowNum;
			map.planId=document.getElementById("isa_sap_oas_plan_id").value
			var me =this;
			utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanMapByPlanId',map).done(function(ret){
				$("#isa_sap_oas_sendplanName_panel_map_grid").grid("reloadData", ret);
			});
		},
		//策略方案映射功能-加载数据
		loadSendplanNamePanelMapData2 :function(treeNode){
			if(treeNode&&treeNode.planId){
				var map = new Object();
				map.actionStr = "selStoppageWorkorderList";
				var planId = treeNode.planId;
				document.getElementById("isa_sap_oas_plan_id").value=planId;
				map.planId=planId;
				var me =this;
				var loadSendplanNamePanelMapRenderTemp = $.proxy(this.loadSendplanNamePanelMapRenderTemp,this);
				utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanByPlanIdInfo',map).done(function(ret){
					
					var colMadel=new Array();
					var eleNumber = 0;
					var ele="";
					for(var i=1;i<=10;i++){
						var s =  'ele=ret.ele'+i+'Name';
						var eleName = 'eleValeName'+i;
						eval(s);
						if (typeof(ele) != "undefined") {
							var colMadelTemp = new Object();
							colMadelTemp.name = eleName;
							colMadelTemp.label = ele;
							colMadelTemp.width = "200";
							
							colMadel[i-1] = colMadelTemp;
							eleNumber++;
						}
				    }
					var planType=document.getElementById("isa_sap_oas_plan_plan_type").value;
					if(planType==100){
						var colMadelTemp = new Object();
						colMadelTemp.name = 'partyName';
						colMadelTemp.label = '执行人名称';
						colMadelTemp.width = "150";
						colMadel[eleNumber] = colMadelTemp;
						
						var colMadelTemp = new Object();
						colMadelTemp.name = 'partyId';
						colMadelTemp.label = '执行人标识';
						colMadelTemp.width = "200";
						colMadelTemp.hidden = "true";
						colMadel[eleNumber+1] = colMadelTemp;
					}else {
						var colMadelTemp = new Object();
						colMadelTemp.name = 'alertValue';
						colMadelTemp.label = '告警时限值';
						colMadelTemp.width = "150";
						colMadel[eleNumber] = colMadelTemp;
						
						var colMadelTemp = new Object();
						colMadelTemp.name = 'limitValue';
						colMadelTemp.label = '完成时限值';
						colMadelTemp.width = "150";
						colMadel[eleNumber+1] = colMadelTemp;
					}
					
					
					var colMadelTemp = new Object();
					colMadelTemp.name = 'createDate';
					colMadelTemp.label = '创建时间';
					colMadelTemp.width = "200";
					colMadel[eleNumber+2] = colMadelTemp;

					var colMadelTemp = new Object();
					colMadelTemp.name = 'memo';
					colMadelTemp.label = '备注';
					colMadelTemp.width = "200";
					colMadel[eleNumber+3] = colMadelTemp;

					var colMadelTemp = new Object();
					colMadelTemp.name = 'state';
					colMadelTemp.label = '状态';
					colMadelTemp.width = "200";
					colMadelTemp.hidden = "true";
					colMadel[eleNumber+4] = colMadelTemp;

					var colMadelTemp = new Object();
					colMadelTemp.name = 'mapId';
					colMadelTemp.label = '主键';
					colMadelTemp.width = "200";
					colMadelTemp.hidden = "true";
					colMadelTemp.key = "true";
					colMadel[eleNumber+5] = colMadelTemp;
					
					map.eleNumber = eleNumber;
					map.colMadel = colMadel;
					loadSendplanNamePanelMapRenderTemp(map);
					
				});
				utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanMapByPlanId',map).done(function(ret){
					$("#isa_sap_oas_sendplanName_panel_map_grid").grid("reloadData", ret);
				});
			}
			
		},
		
		//策略方案映射功能列表动态列表
		loadSendplanNamePanelMapRenderTemp: function(map) {
			var colMadelTemp = map.colMadel;
			this.$("#isa_sap_oas_sendplanName_panel_map_grid").grid({
				datatype: "json",
				height: 200,
				colModel: colMadelTemp,
	           gridview:false,
	           server: true,
	           pager: true,
	           pageData: this.loadSendplanNamePanelMapData
			});
		},
		
		//派单策略-策略方案管理-添加
		isa_sap_oas_sendplanName_panel_addbtn : function(){
			var rowMap = new Object();
			var planType=document.getElementById("isa_sap_oas_plan_plan_type").value;
			rowMap.planType = planType;
			var loadCallbackData = null
			if(planType==100){
				//环节执行人
				loadCallbackData = $.proxy(this.loadSendplanNamePanelData2,this);
			}else if(planType==101){
				//环节时限
				loadCallbackData = $.proxy(this.loadTachetimeplanNameData2,this);
			}else if(planType==102){
				//流程时限
				loadCallbackData = $.proxy(this.loadProctimeplanNameData2,this);
			}
			//rowMap.planType="100";
			rowMap.actionType = "add";
			rowMap.planType=document.getElementById("isa_sap_oas_plan_plan_type").value;
			rowMap.areaId=document.getElementById("isa_sap_oas_area_id").value;
			rowMap.areaName=document.getElementById("isa_sap_oas_area_name").value;
			var pop =fish.popupView({url: 'modules/isa/sapolicy/oaSaPolicyPlan/planInfo/views/planInfoView',
				viewOption:{rowMap:rowMap},
				width: "65%",
				callback:function(popup,view){
					popup.result.then(function (e) {
						loadCallbackData(rowMap);
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		
		//派单策略-策略方案管理-编辑
		isa_sap_oas_sendplanName_panel_modbtn : function(){
			var rowMap = new Object();
			var planType=document.getElementById("isa_sap_oas_plan_plan_type").value;
			rowMap.planType = planType;
			var loadCallbackData = null
			if(planType==100){
				//环节执行人
				loadCallbackData = $.proxy(this.loadSendplanNamePanelData2,this);
			}else if(planType==101){
				//环节时限
				loadCallbackData = $.proxy(this.loadTachetimeplanNameData2,this);
			}else if(planType==102){
				//流程时限
				loadCallbackData = $.proxy(this.loadProctimeplanNameData2,this);
			}
			
			var getRowDataTemp = this.$("#isa_sap_oas_sendplanName_grid").grid("getSelection");//返回所有被选中的行
			if (typeof(getRowDataTemp.planId) == "undefined") {
				fish.info('请选择行！')
				return;
			}
			rowMap.planId = getRowDataTemp.planId;
			rowMap.actionType = "update";
			rowMap.areaId=document.getElementById("isa_sap_oas_area_id").value;
			rowMap.areaName=document.getElementById("isa_sap_oas_area_name").value;
			var pop =fish.popupView({url: 'modules/isa/sapolicy/oaSaPolicyPlan/planInfo/views/planInfoView',
				viewOption:{rowMap:rowMap},
				width: "65%",
				callback:function(popup,view){
					popup.result.then(function (e) {
						loadCallbackData(rowMap);
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		
		//派单策略-策略方案管理-删除
		isa_sap_oas_sendplanName_panel_delbtn : function(){
			var loadSendplanNamePanelData2 = $.proxy(this.loadSendplanNamePanelData2,this);
			var getRowDataTemp = this.$("#isa_sap_oas_sendplanName_grid").grid("getSelection");//返回所有被选中的行
			if (typeof(getRowDataTemp.planId) == "undefined") {
				fish.info('请选择行！')
				return;
			}
			var rowMap = new Object();
			rowMap.planId = getRowDataTemp.planId;
			rowMap.areaId=document.getElementById("isa_sap_oas_area_id").value;
			rowMap.areaName=document.getElementById("isa_sap_oas_area_name").value;
			 utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanMapByPlanId',rowMap).done(function(re){
				 if(re.total > 0){
					 fish.info('请先删除策略方案映射！');
				 }else{
					 fish.confirm("确认删除",function(y) {
    					 if (y) {
        					 utils.ajax('isaOaSapolicySercice','delOaSaPolicyPlanByPlanId',rowMap).done(function(re){
        						 if(re.flag > 0){
        							 loadSendplanNamePanelData2(rowMap);
        							 fish.info('删除成功！');
        						 }else{
        							 console.log('删除失败！');
        							 fish.error('删除失败！');
        						 };
        					 });
    					 };
       				});
				 }
			 });
		},
		
		
		
		//派单策略-策略方案映射管理-添加
		isa_sap_oas_sendplanName_panel_map_addbtn : function(){
			var loadSendplanNamePanelMapData2 = $.proxy(this.loadSendplanNamePanelMapData2,this);
			var rowMap = new Object();
			rowMap.planType="100";
			rowMap.actionType = "add";
			var planType=document.getElementById("isa_sap_oas_plan_plan_type").value;
			rowMap.planType = planType;
			
			rowMap.typeCode="sendplanName";
			rowMap.areaId=document.getElementById("isa_sap_oas_area_id").value;
			rowMap.areaName=document.getElementById("isa_sap_oas_area_name").value;
			rowMap.planId=document.getElementById("isa_sap_oas_plan_id").value;
			var pop =fish.popupView({url: 'modules/isa/sapolicy/oaSaPolicyPlan/planMapInfo/views/planMapInfoView',
				viewOption:{rowMap:rowMap},
				width: "65%",
				callback:function(popup,view){
					popup.result.then(function (e) {
						loadSendplanNamePanelMapData2(rowMap);
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		
		//派单策略-策略方案映射管理-编辑
		isa_sap_oas_sendplanName_panel_map_modbtn : function(){
			
			var loadSendplanNamePanelMapData2 = $.proxy(this.loadSendplanNamePanelMapData2,this);
			var getRowDataTemp = this.$("#isa_sap_oas_sendplanName_panel_map_grid").grid("getSelection");//返回所有被选中的行
			if (typeof(getRowDataTemp.planId) == "undefined") {
				fish.info('请选择行！')
				return;
			}
			var rowMap = new Object();
			var planType=document.getElementById("isa_sap_oas_plan_plan_type").value;
			rowMap.planType = planType;
			rowMap.planId = getRowDataTemp.planId;
			rowMap.mapId = getRowDataTemp.mapId;
			rowMap.actionType = "update";
			rowMap.typeCode="sendplanName";
			rowMap.areaId=document.getElementById("isa_sap_oas_area_id").value;
			rowMap.areaName=document.getElementById("isa_sap_oas_area_name").value;
			var pop =fish.popupView({url: 'modules/isa/sapolicy/oaSaPolicyPlan/modPlanMapInfo/views/modPlanMapInfoView',
				viewOption:{rowMap:rowMap},
				width: "65%",
				callback:function(popup,view){
					popup.result.then(function (e) {
						loadSendplanNamePanelMapData2(rowMap);
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		
		//派单策略-策略方案映射管理-删除	
		isa_sap_oas_sendplanName_panel_map_delbtn : function(){
			var loadSendplanNamePanelMapData2 = $.proxy(this.loadSendplanNamePanelMapData2,this);
			var getRowDataTemp = this.$("#isa_sap_oas_sendplanName_panel_map_grid").grid("getSelection");//返回所有被选中的行
			if (typeof(getRowDataTemp.planId) == "undefined") {
				fish.info('请选择行！')
				return;
			}
			var rowMap = new Object();
			rowMap.mapId = getRowDataTemp.mapId;
			rowMap.planId = getRowDataTemp.planId;
			rowMap.areaId=document.getElementById("isa_sap_oas_area_id").value;
			rowMap.areaName=document.getElementById("isa_sap_oas_area_name").value;
			fish.confirm("确认删除",function(y) {
				if (y) {
					utils.ajax('isaOaSapolicySercice','delOaSaPolicyPlanMapByPlanId',rowMap).done(function(re){
						if(re.flag > 0){
							loadSendplanNamePanelMapData2(rowMap);
							fish.info('删除成功！');
						}else{
							console.log('删除失败！');
							fish.error('删除失败！');
						};
					});
				};
			});
		},
		
		
		resize:function(){
			
			//this.$('#com-staffmgr-org-grid').grid("setGridHeight",((this.$('#com-staffmgr-org-container').height()-40-35-this.$('.org-grid-search-bar').outerHeight(true))+"px"));
			this.$('#isa_sap_oas_sendplanName_leftTree').css("height",this.$el.height()+"px");
			this.$('#isa_sap_oas_tachetimeplanName_leftTree').css("height",this.$el.height()+"px");
			this.$('#isa_sap_oas_proctimeplanName_leftTree').css("height",this.$el.height()+"px");
			
		}
		
	});	
});