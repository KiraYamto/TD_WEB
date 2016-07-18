define([
	'text!modules/isa/tache/templates/tacheAddButton.html',
	'i18n!modules/isa/tache/i18n/tacheAddButton.i18n',
	'modules/common/cloud-utils',
	'css!modules/isa/tache/styles/tacheAddButton.css'
], function(tacheManageViewTpl, i18nTache,utils,css) {
	var init=new Object();
	init.buttonName="";
	init.pathName="";
	var inf=9999999;//初始化标识
	init.moduleId=inf;
	return fish.View.extend({
		template: fish.compile(tacheManageViewTpl),
		i18nData: fish.extend({}, i18nTache),
		events: {
			/*"click #tache-tabs-function-link": "operationTabsPendingClick1",
			"click #isa-tacheMainHande": "tacheMainHandleFunc",*/
			"click #isa_tache_cancelBtn": "cancelBtn",
			"click #isa_sto_addtache_submitBtn": "submitBtn",
			"click #tacheQrybtn": "tacheQrybtn",
			"click #tacheAddbtnList": "tacheAddbtnList",
			
		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},
		


		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			/*this.loadTacheCatalogData();
			this.ccAreaLoadData();*/
			this.loadButtonCatalogData();
			this.loadButtonByData();
			this.loadButtonByDataFunc();
			this.loadButtonByDataFunc1();
		},
		/* 加载按钮目录信息 */
		loadButtonCatalogData : function(){
			var map = new Object();
			map.actionStr = "queryButtonCatalog";
			var loadButtonByData=$.proxy(this.loadButtonByData,this);
			utils.ajax('isaOaTacheService','qryButtonByCatalog',map).done(function(ret){
				var obj=ret.rows;
				var options = {
						fNodes : obj,
						data : {key: { name: "name",id:"id"},
								simpleData: {
									enable: true
								},
							},
						callback: {
							onClick: function(e,treeNode, clickFlag) {
								init.moduleId=treeNode.id;
								init.pathName=treeNode.pathName;
								loadButtonByData();
							}
						},
							height:"200px"
				};
				$('#buttonCatalog').tree(options);
			});
		},
		loadButtonByDataFunc:function(){
			this.$("#isa-buttonGrid").grid({
				datatype: "json",
				height:210,
				colModel: [{
					name: 'name',
					label: '按钮名称',
					width: 200
				},{
					name: 'jscriptName',
					label: '动作函数',
					width: 200
				},{
					name: 'iconFileName',
					label: '图标文件',
					width: 200
				},{
					name: 'url',
					label: '链接页面',
					width: 200
				},{
					name: 'height',
					label: '高度',
					width: 200
				},{
					name: 'width',
					label: '宽度',
					width: 200
				},{
					name: 'comments',
					label: 'comments',
					hidden:true
				},{
				name: 'id',
				label: 'id',
				key:true,
				hidden:true
			}],
				onSelectRow:$.proxy(function(rowid,id,state){
					var getRowDataTemp = this.$("#isa-buttonGrid").grid("getSelection");//返回所有被选中的行
					$("#showName").val(getRowDataTemp.name);
					$("#remarts").val(getRowDataTemp.comments);
				},this),
		        gridview:false,
				server: true
			});
		},
		loadButtonByDataFunc1:function(){
			this.$("#tacheGridList").grid({
				datatype: "json",
				height:200,
				colModel: [{
					name: 'displayName',
					label: '显示名称',
					width: 200
				},{
					name: 'pathName',
					label: '路径',
					width: 200
				},{
					name: 'name',
					label: '功能名称',
					width: 200
				},{
					name: 'displayIndex',
					label: '显示顺序',
					width: 200
				},{
					name: 'objSql',
					label: 'SQL组件',
					width: 200
				},{
					name: 'actFunction',
					label: '动作函数',
					width: 200
				},{
					name: 'orderExcuRole',
					label: '工单执行人角色',
					hidden:200
				},{
					name: 'tacheId',
					label: 'tacheId',
					hidden:true	
				},{
					name: 'workOrderState',
					label: 'workOrderState',
					hidden:true	
				},{
					name: 'partyRole',
					label: 'partyRole',
					hidden:true	
				},{
				name: 'buttonId',
				label: 'buttonId',
				hidden:true
			}],
				onSelectRow:$.proxy(function(rowid,id,state){
					/*var getRowDataTemp = this.$("#isa-buttonGrid").grid("getSelection");//返回所有被选中的行
					$("#showName").val(getRowDataTemp.name);
					$("#remarts").val(getRowDataTemp.comments);*/
				},this),
		        gridview:false,
				server: true
			});
		},
		loadButtonByData:function(){
			var map = new Object();
			map.actionStr = "qryButtonActionSign";
			map.moduleId=init.moduleId ;
			map.buttonName= document.getElementById("buttonName").value;
			utils.ajax('isaOaTacheService','qryButtonActionSign',map).done(function(ret){
				var result = {
						"rows": ret.rows
				};
				$("#isa-buttonGrid").grid("reloadData", result);
			});
		},
		tacheQrybtn:function(){
			this.loadButtonByData();
		},
		tacheAddbtnList:function(){
			//新增数据
			var getRowDataTemp = this.$("#isa-buttonGrid").grid("getSelection");
			if(getRowDataTemp.id==undefined){
				fish.info("请选中按钮动作标识");
				return ;
			}
			var re = /^[0-9]+.?[0-9]*$/;
			if(document.getElementById('showSequence').value==""){
				fish.info("显示顺序不能为空");
				return;
			}
			if(!re.test(document.getElementById('showSequence').value)){
				fish.info("显示顺序格式错误，请选择0-999的数字");
				return;
			}
			var dataGird = $("#tacheGridList").grid("getRowData");
			for(var i=0;i<dataGird.length;i++){
				if(dataGird[i].displayIndex==document.getElementById('showSequence').value){
					fish.info("显示顺序重复，请重新选择");
					return;
				}
			}
			if(document.getElementById('showSequence').value>999||document.getElementById('showSequence').value<1){
				fish.info("显示顺序格式错误，请选择0-999的数字");
				return;
			}
			var iniObj = this.options;//获取父界面的值
		    var newData = {
		    	displayName: document.getElementById('showName').value,
		    	pathName: init.pathName,
		    	name: getRowDataTemp.name,
		    	displayIndex: document.getElementById('showSequence').value,
		    	objSql: document.getElementById('SQLAss').value,
		    	actFunction: getRowDataTemp.jscriptName,
		    	orderExcuRole: document.getElementById("workOrderState").value,
		    	tacheId:iniObj.tacheId,
		    	workOrderState:0,//默认为0，后续需求 再改
		    	partyRole:document.getElementById("workOrderExeJob").value,
		    	buttonId:getRowDataTemp.id
		    };
		    $("#tacheGridList").grid("addRowData", newData);
		},
		cancelBtn:function(){
			var popup=this.popup;
			popup.close();
		},
		submitBtn:function(){
			var dataGird = $("#tacheGridList").grid("getRowData");
			var map=new Object();
			map.dataGird=dataGird;
			utils.ajax('isaOaTacheService','submitButton',map).done(function(ret){
				var result = {
						"rows": ret.rows
				};
				$("#isa-buttonGrid").grid("reloadData", result);
			});
			var popup=this.popup;
			popup.close();
		},
	});	
});