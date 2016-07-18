define([
        'text!modules/iom/cloudiom/task/templates/OrderDetailsView.html'+codeVerP,
        'i18n!modules/iom/cloudiom/task/i18n/task.i18n',
        'modules/common/cloud-utils',
        'css!modules/iom/cloudiom/task/styles/orderdetails.css'+codeVerP
        ], function(OrderDetailsViewTpl, i18nTask,utils,css) {
	return fish.View.extend({
		template: fish.compile(OrderDetailsViewTpl),
		i18nData: fish.extend({}, i18nTask),
		events: {
			'click #orderdetails-finishWorkOrder': 'finishWorkOrder'
		},
		
		isFinishWorkOrder: false,
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {

			//初始化scrollspy
			$('#orderdetails-scrollspy').scrollspy({
				target:".navbar-collapse"
			});
			
			//TODO scrollspy bug临时处理方式
			$('#orderdetails-tabs-b-link').click();
			$('#orderdetails-tabs-a-link').click();
			
			//初始化滚动条
			$('#orderdetails-scrollspy').niceScroll({
				cursorcolor: '#1d5987',
				cursorwidth: "10px",
		        cursoropacitymax:"0.2"
			});
			
			//判断是否显示回单按钮
			if (! this.options.displayFinishWorkOrderBtnInDetail) {
				$('#orderdetails-floatBtns').hide();
			}
			
			//初始化grid
			this.initMajorProdLeft();
			this.initMajorProdRight();
			this.initAttachProdLeft();
			this.initAttachProdRight();
			this.initWorkOrderList();

			//加载数据
			this.loadCustInfo();
			this.loadProdInfo();
			this.getWorkOrderListPerData();
		},
		
		initMajorProdLeft: function() {
			$("#orderdetails-majorprod-left-grid").grid({
				colModel: [
				    {name: 'name', label: '主体产品事件'},
				    {name: 'id', label: 'id', key:true, hidden:true}
				],
				datatype: "json",
				height: 185,
				autowidth:true,
				shrinkToFit: true,
				autoResizable: true,
				cmTemplate:{sortable: false}
			});
		},
		
		initMajorProdRight: function() {
			$("#orderdetails-majorprod-right-grid").grid({
				colModel: [
				    {name: 'characterName', label: '特征取值描述'}, 
				    {name: 'characterValue', label: '特征取值'}, 
				    {name: 'oldCharacterName', label: '原特征取值描述'},
				    {name: 'oldCharacterValue', label: '原特征取值'},
				    {name: 'actType', label: '动作'},
				    {name: 'characterId', label: 'characterId', key:true, hidden:true}
				],
				datatype: "json",
				height: 185,
				autowidth:true,
				shrinkToFit: true,
				autoResizable: true,
				cmTemplate:{sortable: false}
			});
		},
		
		initAttachProdLeft: function() {
			var attachprodGridClick = $.proxy(this.attachprodGridClick,this);
			$("#orderdetails-attachprod-left-grid").grid({
				colModel: [
				    {name: 'name', label: '附属产品'},
				    {name: 'actType', label: '动作'},
				    {name: 'id', label: 'id', key:true,hidden:true},
				    {name: 'dependProdId', label: 'dependProdId', hidden:true}
				],
				datatype: "json",
				height: 185,
				autowidth:true,
				shrinkToFit: true,
				autoResizable: true,
				cmTemplate:{sortable: false},
				onSelectRow: attachprodGridClick
			});
		},
		
		initAttachProdRight: function() {
			$("#orderdetails-attachprod-right-grid").grid({
				colModel: [
				    {name: 'characteName', label: '特征取值描述'}, 
				    {name: 'characterValue', label: '特征取值'}, 
				    {name: 'oldCharacteName', label: '原特征取值描述'},
				    {name: 'oldCharacterValue', label: '原特征取值'},
				    {name: 'actType', label: '动作'},
				    {name: 'characterId', label: 'characterId', key:true, hidden:true}
				],
				datatype: "json",
				height: 185,
				autowidth:true,
				shrinkToFit: true,
				autoResizable: true,
				cmTemplate:{sortable: false}
			});
		},
		
		initWorkOrderList: function() {
			$("#orderdetails-workorder-grid").grid({
				colModel: [
				    {name: 'partyName', label: '执行单位'},
				    {name: 'finishDate', label: '处理时间'},
				    {name: 'operType', label: '操作类型'},
				    {name: 'workResult', label: '详情'},
				    {name: 'id', label: 'Id', key:true, hidden:true}
				],
				datatype: "json",
				height: 360,
				autowidth:true,
				shrinkToFit: true,
				cmTemplate:{sortable: false}
			});
		},
		
		loadCustInfo:function(){
			var baseOrderId = this.options.baseOrderId;
			utils.ajax('cloudIomServiceForWeb','qryCustInfoByBaseOrderId',baseOrderId).done(function(custInfo)	{
				$('#orderdetails-custName').val(custInfo.custName);
				$('#orderdetails-phone').val(custInfo.mobilephone);
				$('#orderdetails-email').val(custInfo.email);
				$('#orderdetails-custGradeId').val(custInfo.gradeName);
			});
		},
		
		loadProdInfo:function() {
			var me = this;
			var baseOrderId = this.options.baseOrderId;
			utils.ajax('cloudIomServiceForWeb','qryProductInfoByBaseOrderId',baseOrderId).done(function(prodInfo)	{
				$('#orderdetails-prodName').val(prodInfo.indepProdName);
				$('#orderdetails-prodCount').val(prodInfo.serviceOrderCount);
				$("#orderdetails-majorprod-left-grid").grid("reloadData",{rows: prodInfo.indepProdEvent});
				$("#orderdetails-majorprod-right-grid").grid("reloadData",{rows: prodInfo.indepProdAttr});
				$("#orderdetails-attachprod-left-grid").grid("reloadData",{rows: prodInfo.dependProd});
				
				$("#orderdetails-attachprod-left-grid").grid("setSelection", prodInfo.dependProd[0].id, true);
			});
		},
		
		attachprodGridClick:function(){
			var selected = $("#orderdetails-attachprod-left-grid").grid("getSelection");//返回所有被选中的行
			utils.ajax('iomService','queryOrderDependProdAttrById',selected.id).done(function(dependProdAttrInfo)	{
				var nameArr = new Array();
				var tmpObj = dependProdAttrInfo;
				for(var i=0;i<tmpObj.length;i++){
					tmpObj[i].name = tmpObj[i].productCharacterDto.name;
					if(tmpObj[i].productCharacterDto.inputTypeId == 'A06'){
						if(tmpObj[i].characterValue != null)
							tmpObj[i].characterValue = "******";
						if(tmpObj[i].oldCharacterValue != null)
							tmpObj[i].oldCharacterValue = "******";
						if(tmpObj[i].characteName != null)
							tmpObj[i].characteName = "******";
						if(tmpObj[i].oldCharacteName != null)
							tmpObj[i].oldCharacteName = "******";
					}
				}
				var result = {
						"rows": tmpObj,
						"page": 1,
						"total": tmpObj.length,
						"id": "id"
				};
				$("#orderdetails-attachprod-right-grid").grid("reloadData", result);
			});
		},
		
		getWorkOrderListPerData: function() { //请求服务器获取数据的方法
			var workOrderId = this.options.workOrderId;
			utils.ajax('cloudIomServiceForWeb','qryWorkOrderDetails', workOrderId).done(function(ret){
				$("#orderdetails-workorder-grid").grid("reloadData", {rows: ret});
			});
		},
		
		finishWorkOrder: function() {
			var me = this;
			fish.popupView({url: 'modules/iom/cloudiom/task/views/FinishWorkOrderView',
				width: "60%",
				viewOption:{
					orders : [{id:this.options.workOrderId, orderId:this.options.baseOrderId, workOrderCode:this.options.workOrderCode}]
				},
				callback:function(popup,view) {
					popup.result.then(function (e) {
						me.isFinishWorkOrder = true;
					}, function(e) {
						me.isFinishWorkOrder = false;
					});
				}
			});
		},
		
		resize: function() {
			//浮动按钮计算
			if (this.options.displayFinishWorkOrderBtnInDetail) {
				var element = $('.modal-body');
				var offsetTop = element.offset()['top'];
				var offsetLeft = element.offset()['left'];
				while(element == element.offsetParent()) {
					offsetTop += element.offset()['top'];
					offsetLeft += element.offset()['left'];
				}
				$('#orderdetails-floatBtns').css({top: offsetTop+3, right: offsetLeft, 'z-index':1000});
			}
			
			$("#orderdetails-majorprod-left-grid").grid("resize",true);
			$("#orderdetails-majorprod-right-grid").grid("resize",true);
			$("#orderdetails-attachprod-left-grid").grid("resize",true);
			$("#orderdetails-attachprod-right-grid").grid("resize",true);
			$("#orderdetails-workorder-grid").grid("resize",true);
		}
	});
});