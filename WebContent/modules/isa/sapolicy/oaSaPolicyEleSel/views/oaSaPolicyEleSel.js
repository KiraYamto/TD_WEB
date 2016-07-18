define([
    	'text!modules/isa/sapolicy/oaSaPolicyEleSel/templates/oaSaPolicyEleSel.html',
    	'i18n!modules/isa/sapolicy/oaSaPolicyEleSel/i18n/oaSaPolicyEleSel.i18n',
    	'modules/common/cloud-utils',
    	'css!modules/isa/sapolicy/oaSaPolicyEleSel/styles/oaSaPolicyEleSel.css'
], function(manageViewTpl, i18nManage,utils,css) {

	return fish.View.extend({
		template: fish.compile(manageViewTpl),
		i18nData: fish.extend({}, i18nManage),
		rowMap:new Object(),
		events: {
			"click #isa_sap_osa_osa_form_cancel_button": "cancel_button",
			"click #isa_sap_osa_osa_form_btn": "formButton"
		},
		
		initialize : function() {
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
			
			this.loadOaSaPolicyEleRender();
			this.getOaSaPolicyEleData();
		},
		
		
		
		//策略元素列表
		loadOaSaPolicyEleRender: function() {
			this.$("#isa_sap_osa_osa_form_grid").grid({
				datatype: "json",
				height: 370,
				colModel: [{name: 'eleId',label: '元素标识',key:true,width: 110},
				           {name: 'eleName',label: '元素名称',width: 150},
				           {name: 'memo',label: '备注',width: 280}],
				multiselect: true,
				rowNum: 10,
				recordtext: "当前显示 {0} - {1} 条记录 共 {2} 条记录",
		        pgtext: "第 {0} 页 / 共 {1} 页",
		        emptyrecords: "没有记录",
		        gridview:false,
				pager: true,
				server: true,
				pageData: this.getOaSaPolicyEleData
			});
		},
		
		
		
		//根据查询条件查询策略元素 分页
		getOaSaPolicyEleData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#isa_sap_osa_osa_form_grid").grid("getGridParam", "rowNum");
			if(null == page || (typeof page)=="object" ){
				page = 1;
			}
			var $form1 = $('#form-pending').form('value');
			var map = new Object();
			map.actionStr = "queryOaSaPolicyEle";	
			map.pageIndex = (page-1)*10+1+"";
			map.pageSize = 10+"";
			map.eleName= $form1.eleName;
			map.objSql= $form1.objSql;
			map.staticDataSql= $form1.staticDataSql;
			map.urlString= $form1.urlString;
			map.memo= $form1.memo;
			var me =this;
			utils.ajax('isaOaSapolicySercice','queryOaSaPolicyEle',map).done(function(ret){
				if(ret!=null){
					var records = ret.total;
					var total =Math.ceil(ret.rows.length/10);					
					var result = {
							"rows": ret.rows,
							"page": page,
							"total":total,
							"records":records,
							"eleId": "eleId"
						};
					$("#isa_sap_osa_osa_form_grid").grid("reloadData", result);
				}
			});
		},
		
		cancel_button : function(){
			this.$el.dialog("setReturnValue", null);
			this.$el.dialog("close");
		},
		
		formButton : function(){
			var popup = this.popup;
			var  getCheckRows= this.$("#isa_sap_osa_osa_form_grid").grid("getCheckRows");//返回所有被选中的行
			if (getCheckRows.length<1) {
				fish.info('请选择行');
				return;
			};
			var map=new Object();
			var eleIds=new Array();
			var eleNames=new Array();
			for(var i=0;i<getCheckRows.length;i++){
				eleIds[i]=getCheckRows[i].eleId+"";
				eleNames[i]=getCheckRows[i].eleName+"";
			}
			map.eleIds=eleIds;
			map.eleNames=eleNames;
			if ((!map)) {
				fish.info("请选择行");
			} else {
				console.log(map);
				this.$el.dialog("setReturnValue", map);
				this.$el.dialog("close");
			}
		},
		
		
	});	
});