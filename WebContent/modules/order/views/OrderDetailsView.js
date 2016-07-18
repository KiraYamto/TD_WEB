define([
	'text!modules/order/templates/OrderDetailsView.html'+codeVerP,
	'i18n!modules/order/i18n/order.i18n',
	'modules/common/cloud-utils',
	'css!modules/order/styles/ordermanagement.css'+codeVerP
], function(orderDetailsMenegementViewTpl, i18norderDetails,utils,css) {
	return fish.View.extend({
		template: fish.compile(orderDetailsMenegementViewTpl),
		i18nData: fish.extend({}, i18norderDetails),
		events: {
			"click #orderDetails-tabs-a-link": "orderDetailsTabsAClick",
			"click #orderDetails-tabs-b-link": "orderDetailsTabsBClick",
			"click #orderDetails-tabs-c-link": "orderDetailsTabsCClick",
			"click #orderDetails-tabs-d-link": "orderDetailsTabsDClick",
			"click #orderDetails-tabs-e-link": "orderDetailsTabsEClick",
			"click #baseinfo-tabs-a-link": "orderDetailsTabsBaseAClick",
			"click #baseinfo-tabs-b-link": "orderDetailsTabsBaseBClick"
		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			
			
			/*$("#agents-tabs").tabs();*/
			
			this.loadOrderRecordRender();
			this.loadFlowFeedbackRender();
			this.loadCurrentPersonRender();
			this.loadOldPersonRender();
			this.loadMarjarProdLeftRender();
			this.loadMarjarProdRightRender();
			this.loadAttachProdLeftRender();
			this.loadAttachProdRightRender();
			this.loadAccessInfoRender();
			this.loadWorkOrderListRender();
			this.$('#orderDetails-tabs-a').show();
			this.$('#baseinfo-tabs-a').show();
			this.$('#orderDetails-tabs-b').hide();
			this.$('#orderDetails-tabs-c').hide();
			this.$('#orderDetails-tabs-d').hide();
			this.$('#orderDetails-tabs-e').hide();
			this.$('#baseinfo-tabs-b').hide();
			this.getOrderRecordPerData();
			this.getFlowFeedbackPerData();
			this.getCurrentPersonPerData();
			this.getOldPersonPerData();
			this.getMarjarProdLeftPerData();
			this.getMarjarProdRightPerData();
			this.getAttachProdLeftPerData();
			this.getAttachProdRightPerData();
			this.getAccessInfoPerData();
			this.getWorkOrderListPerData();
			//加载基本信息
			this.loadBaseinfo();
		},
		orderDetailsTabsAClick:function(){
			this.$('#orderDetails-tabs-a').show();
			this.$('#orderDetails-tabs-b').hide();
			this.$('#orderDetails-tabs-c').hide();
			this.$('#orderDetails-tabs-d').hide();
			this.$('#orderDetails-tabs-e').hide();
			this.$('#orderDetails-tabs-a-li').addClass('ui-tabs-active');
			this.$('#orderDetails-tabs-b-li').removeClass('ui-tabs-active');
			this.$('#orderDetails-tabs-c-li').removeClass('ui-tabs-active');
			this.$('#orderDetails-tabs-d-li').removeClass('ui-tabs-active');
			this.$('#orderDetails-tabs-e-li').removeClass('ui-tabs-active');
			/*this.$('#orderDetails-tabs').tabs('option', 'active',0);*/
			$(window).resize();
			//加载基本信息
			this.loadBaseinfo();
		},
		orderDetailsTabsBClick:function(){
			this.$('#orderDetails-tabs-b').show();
			this.$('#orderDetails-tabs-a').hide();
			this.$('#orderDetails-tabs-c').hide();
			this.$('#orderDetails-tabs-d').hide();
			this.$('#orderDetails-tabs-e').hide();
			this.$('#orderDetails-tabs-a-li').removeClass('ui-tabs-active');
			this.$('#orderDetails-tabs-b-li').addClass('ui-tabs-active');
			this.$('#orderDetails-tabs-c-li').removeClass('ui-tabs-active');
			this.$('#orderDetails-tabs-d-li').removeClass('ui-tabs-active');
			this.$('#orderDetails-tabs-e-li').removeClass('ui-tabs-active');
			/*this.$('#orderDetails-tabs').tabs('option', 'active',1);*/
			$(window).resize();
			//加载客户信息
			this.loadCustInfo();
		},
		orderDetailsTabsCClick:function(){
			this.$('#orderDetails-tabs-c').show();
			this.$('#orderDetails-tabs-a').hide();
			this.$('#orderDetails-tabs-b').hide();
			this.$('#orderDetails-tabs-d').hide();
			this.$('#orderDetails-tabs-e').hide();
			this.$('#orderDetails-tabs-a-li').removeClass('ui-tabs-active');
			this.$('#orderDetails-tabs-b-li').removeClass('ui-tabs-active');
			this.$('#orderDetails-tabs-c-li').addClass('ui-tabs-active');
			this.$('#orderDetails-tabs-d-li').removeClass('ui-tabs-active');
			this.$('#orderDetails-tabs-e-li').removeClass('ui-tabs-active');
			/*this.$('#orderDetails-tabs').tabs('option', 'active',1);*/
			//加载产品信息
			this.loadProdInfo();
			$(window).resize();
		},
		orderDetailsTabsDClick:function(){
			this.$('#orderDetails-tabs-d').show();
			this.$('#orderDetails-tabs-c').hide();
			this.$('#orderDetails-tabs-a').hide();
			this.$('#orderDetails-tabs-b').hide();
			this.$('#orderDetails-tabs-e').hide();
			this.$('#orderDetails-tabs-a-li').removeClass('ui-tabs-active');
			this.$('#orderDetails-tabs-b-li').removeClass('ui-tabs-active');
			this.$('#orderDetails-tabs-c-li').removeClass('ui-tabs-active');
			this.$('#orderDetails-tabs-d-li').addClass('ui-tabs-active');
			this.$('#orderDetails-tabs-e-li').removeClass('ui-tabs-active');
			/*this.$('#orderDetails-tabs').tabs('option', 'active',1);*/
			//加载接入信息
			//this.loadProdInfo();
			$(window).resize();
		},
		orderDetailsTabsEClick:function(){
			this.$('#orderDetails-tabs-e').show();
			this.$('#orderDetails-tabs-c').hide();
			this.$('#orderDetails-tabs-a').hide();
			this.$('#orderDetails-tabs-b').hide();
			this.$('#orderDetails-tabs-d').hide();
			this.$('#orderDetails-tabs-a-li').removeClass('ui-tabs-active');
			this.$('#orderDetails-tabs-b-li').removeClass('ui-tabs-active');
			this.$('#orderDetails-tabs-c-li').removeClass('ui-tabs-active');
			this.$('#orderDetails-tabs-e-li').addClass('ui-tabs-active');
			this.$('#orderDetails-tabs-d-li').removeClass('ui-tabs-active');
			/*this.$('#orderDetails-tabs').tabs('option', 'active',1);*/
			//加载工单列表
			//this.loadWorkOrderList();
			$(window).resize();
		},
		orderDetailsTabsBaseAClick:function(){
			this.$('#baseinfo-tabs-a').show();
			this.$('#baseinfo-tabs-b').hide();
			this.$('#baseinfo-tabs-a-li').addClass('ui-tabs-active');
			this.$('#baseinfo-tabs-b-li').removeClass('ui-tabs-active');
			/*this.$('#orderDetails-tabs').tabs('option', 'active',0);*/
			$(window).resize();
		},orderDetailsTabsBaseBClick:function(){
			this.$('#baseinfo-tabs-b').show();
			this.$('#baseinfo-tabs-a').hide();
			this.$('#baseinfo-tabs-a-li').removeClass('ui-tabs-active');
			this.$('#baseinfo-tabs-b-li').addClass('ui-tabs-active');
			/*this.$('#orderDetails-tabs').tabs('option', 'active',1);*/
			$(window).resize();
		},
		loadOrderRecordRender: function() {
			this.$("#baseinfo-grid-orderRecord").grid({
				datatype: "json",
				height: 100,
				colModel: [{
					name: 'trackStaffName',
					label: '跟踪人名称',
					width: 100
				}, {
					name: 'trackDate',
					width: 120,
					label: '跟踪日期'
				}, {
					name: 'trackComments',
					label: '跟踪情况描述',
					width: 200
				}],
				rowNum: 10,
				pager: false,
				server: true,
				pageData: this.getOrderRecordPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		getOrderRecordPerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#baseinfo-grid-orderRecord").grid("getGridParam", "rowNum");
			var me =this;
			utils.ajax('isaService','qryMyorderDetails',currentUser.staffId).done(function(ret){
				var result = {
						"rows": ret,
						"page": page,
						"total": 1,
						"id": "id"
					};
				me.$("#baseinfo-grid-orderRecord").grid("reloadData", result);
			});

			
		},
		loadFlowFeedbackRender: function() {
			this.$("#baseinfo-grid-flowFeedback").grid({
				datatype: "json",
				height: 100,
				colModel: [{
					name: 'seq',
					label: '执行序列',
					width: 100
				}, {
					name: 'executeStaffName',
					width: 100,
					label: '执行人'
				}, {
					name: 'executeStateName',
					label: '执行状态',
					width: 100
				}, {
					name: 'currentTacheName',
					width: 100,
					label: '当前环节名称'
				}, {
					name: 'createDate',
					width: 120,
					label: '派单日期',
					key:true

				}],
				rowNum: 10,
				pager: false,
				server: true,
				pageData: this.getFlowFeedbackPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		getFlowFeedbackPerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
		rowNum = rowNum || this.$("#baseinfo-grid-flowFeedback").grid("getGridParam", "rowNum");
		//首先根据sortname,sortorder对整个数据就行排序,正常情况下把查询条件带入到服务器查询就行
		
		var me =this;
		utils.ajax('isaService','qryMyAgened',currentUser.staffId).done(function(ret){
			var result = {
					"rows": ret,
					"page": page,
					"total": 1,
					"id": "id"
				};
			me.$("#baseinfo-grid-flowFeedback").grid("reloadData", result);
		});
	},loadCurrentPersonRender: function() {
			this.$("#order-custinfo-current-grid").grid({
				datatype: "json",
				height: 150,
				colModel: [{
					name: 'linkmanName',
					label: '名称',
					width: 100
				}, {
					name: 'officePhone',
					width: 100,
					label: '办公电话'
				}, {
					name: 'homePhone',
					label: '住宅电话',
					width: 100
				}, {
					name: 'mobilePhone',
					width: 100,
					label: '移动电话'
				}, {
					name: 'fax',
					width: 100,
					label: '传真号码',
					key:true
				}, {
					name: 'zipcode',
					width: 100,
					label: '邮政编码',
					key:true
				}, {
					name: 'mailAddr',
					width: 100,
					label: '通讯地址',
					key:true
				}, {
					name: 'email',
					width: 100,
					label: 'EMAIL',
					key:true
				}, {
					name: 'mainComm',
					width: 120,
					label: '首选联系方式',
					key:true
				}, {
					name: '说明',
					width: 150,
					label: 'comments',
					key:true
				}],
				rowNum: 10,
				pager: false,
				server: true,
				pageData: this.getCurrentPersonPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		getCurrentPersonPerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#order-custinfo-current-grid").grid("getGridParam", "rowNum");
			//首先根据sortname,sortorder对整个数据就行排序,正常情况下把查询条件带入到服务器查询就行

			var me =this;
			utils.ajax('isaService','qryMyAgened',currentUser.staffId).done(function(ret){
				var result = {
					"rows": ret,
					"page": page,
					"total": 1,
					"id": "id"
				};
				me.$("#order-custinfo-current-grid").grid("reloadData", result);
			});
		},loadOldPersonRender: function() {
			this.$("#order-custinfo-old-grid").grid({
				datatype: "json",
				height: 150,
				colModel: [{
					name: 'linkmanName',
					label: '名称',
					width: 100
				}, {
					name: 'officePhone',
					width: 100,
					label: '办公电话'
				}, {
					name: 'homePhone',
					label: '住宅电话',
					width: 100
				}, {
					name: 'mobilePhone',
					width: 100,
					label: '移动电话'
				}, {
					name: 'fax',
					width: 100,
					label: '传真号码',
					key:true
				}, {
					name: 'zipcode',
					width: 100,
					label: '邮政编码',
					key:true
				}, {
					name: 'mailAddr',
					width: 100,
					label: '通讯地址',
					key:true
				}, {
					name: 'email',
					width: 100,
					label: 'EMAIL',
					key:true
				}, {
					name: 'mainComm',
					width: 120,
					label: '首选联系方式',
					key:true
				}, {
					name: '说明',
					width: 150,
					label: 'comments',
					key:true
				}],
				rowNum: 10,
				pager: false,
				server: true,
				pageData: this.getOldPersonPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		getOldPersonPerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#order-custinfo-old-grid").grid("getGridParam", "rowNum");
			//首先根据sortname,sortorder对整个数据就行排序,正常情况下把查询条件带入到服务器查询就行

			var me =this;
			utils.ajax('isaService','qryMyAgened',currentUser.staffId).done(function(ret){
				var result = {
					"rows": ret,
					"page": page,
					"total": 1,
					"id": "id"
				};
				me.$("#order-custinfo-old-grid").grid("reloadData", result);
			});
		},loadMarjarProdLeftRender: function() {
			this.$("#order-productinfo-majarprod-left-grid").grid({
				datatype: "json",
				height: 150,
				colModel: [{
					name: 'name',
					label: '主体产品事件',
					width: 150
				},{
					name: 'id',
					width: 150,
					label: 'id',
					key:true,
					hidden:true
				}, {
					name: 'serviceOrderId',
					width: 150,
					label: 'serviceOrderId',
					key:true,
					hidden:true
				}],
				rowNum: 10,
				pager: false,
				server: true,
				pageData: this.getMarjarProdLeftPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		getMarjarProdLeftPerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#order-productinfo-majarprod-left-grid").grid("getGridParam", "rowNum");
			//首先根据sortname,sortorder对整个数据就行排序,正常情况下把查询条件带入到服务器查询就行

			var me =this;
			utils.ajax('isaService','qryMyAgened',currentUser.staffId).done(function(ret){
				var result = {
					"rows": ret,
					"page": page,
					"total": 1,
					"id": "id"
				};
				me.$("#order-productinfo-majarprod-left-grid").grid("reloadData", result);
			});
		},loadMarjarProdRightRender: function() {
			this.$("#order-productinfo-majarprod-right-grid").grid({
				datatype: "json",
				height: 150,
				colModel: [{
					name: 'name',
					label: '特征名称',
					width: 100
				}, {
					name: 'characterValue',
					width: 100,
					label: '特征取值'
				}, {
					name: 'characteName',
					label: '特征取值描述',
					width: 100
				}, {
					name: 'oldCharacterValue',
					width: 100,
					label: '原特征取值'
				}, {
					name: 'oldCharacteName',
					width: 100,
					label: '原特征取值描述',
					key:true
				}, {
					name: 'actType',
					width: 100,
					label: '动作',
					key:true
				}, {
					name: 'id',
					width: 100,
					label: 'id',
					key:true,
					hidden:true
				}, {
					name: 'indepProdId',
					width: 100,
					label: 'indepProdId',
					key:true,
					hidden:true
				}],
				rowNum: 10,
				pager: false,
				server: true,
				pageData: this.getMarjarProdRightPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		getMarjarProdRightPerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#order-productinfo-majarprod-right-grid").grid("getGridParam", "rowNum");
			//首先根据sortname,sortorder对整个数据就行排序,正常情况下把查询条件带入到服务器查询就行

			var me =this;
			utils.ajax('isaService','qryMyAgened',currentUser.staffId).done(function(ret){
				if(ret != null && ret != undefined){
					for(var i = 0;i < ret.length;i++){
						var temoObj = ret[i];
						if(temoObj.productCharacterDto != null && temoObj.productCharacterDto != undefined){
							temoObj.name = temoObj.productCharacterDto.name;
						}
					}
				}
				var result = {
					"rows": ret,
					"page": page,
					"total": 1,
					"id": "id"
				};
				me.$("#order-productinfo-majarprod-right-grid").grid("reloadData", result);
			});
		},loadAttachProdLeftRender: function() {
			var me =this;
			this.$("#order-productinfo-attachprod-left-grid").grid({
				datatype: "json",
				height: 150,
				colModel: [{
					name: 'dependProdName',
					label: '附属产品',
					width: 150
				},{
					name: 'evtWithProdName',
					label: '动作',
					width: 150
				},{
					name: 'id',
					width: 150,
					label: 'id',
					key:true,
					hidden:true
				}, {
					name: 'serviceOrderId',
					width: 150,
					label: 'serviceOrderId',
					key:true,
					hidden:true
				}, {
					name: 'dependProdId',
					width: 150,
					label: 'dependProdId',
					key:true,
					hidden:true
				}],
				rowNum: 10,
				pager: false,
				server: true,
				onSelectRow: function (e, rowid, state, checked) {//选中行事件
					me.attachprodGridClick();
				},
				pageData: this.getAttachProdLeftPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		getAttachProdLeftPerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#order-productinfo-attachprod-left-grid").grid("getGridParam", "rowNum");
			//首先根据sortname,sortorder对整个数据就行排序,正常情况下把查询条件带入到服务器查询就行

			var me =this;
			utils.ajax('isaService','qryMyAgened',currentUser.staffId).done(function(ret){
				var result = {
					"rows": ret,
					"page": page,
					"total": 1,
					"id": "id"
				};
				me.$("#order-productinfo-attachprod-left-grid").grid("reloadData", result);
			});
		},loadAttachProdRightRender: function() {
			this.$("#order-productinfo-attachprod-right-grid").grid({
				datatype: "json",
				height: 150,
				colModel: [{
					name: 'name',
					label: '特征名称',
					width: 100
				}, {
					name: 'characterValue',
					width: 100,
					label: '特征取值'
				}, {
					name: 'characteName',
					label: '特征取值描述',
					width: 100
				}, {
					name: 'oldCharacterValue',
					width: 100,
					label: '原特征取值'
				}, {
					name: 'oldCharacteName',
					width: 100,
					label: '原特征取值描述',
					key:true
				}, {
					name: 'id',
					width: 100,
					label: 'id',
					key:true,
					hidden:true
				}, {
					name: 'characterId',
					width: 100,
					label: 'characterId',
					key:true,
					hidden:true
				}],
				rowNum: 10,
				pager: false,
				server: true,
				pageData: this.getAttachProdRightPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		getAttachProdRightPerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#order-productinfo-attachprod-right-grid").grid("getGridParam", "rowNum");
			//首先根据sortname,sortorder对整个数据就行排序,正常情况下把查询条件带入到服务器查询就行

			var me =this;
			utils.ajax('isaService','qryMyAgened',currentUser.staffId).done(function(ret){
				var result = {
					"rows": ret,
					"page": page,
					"total": 1,
					"id": "id"
				};
				me.$("#order-productinfo-attachprod-right-grid").grid("reloadData", result);
			});
		},loadAccessInfoRender: function() {
			this.$("#order-accessinfo-grid").grid({
				datatype: "json",
				height: 350,
				colModel: [{
					name: 'flag',
					label: '新旧标识',
					width: 100
				}, {
					name: 'addrName',
					width: 100,
					label: '装机地址名称'
				}, {
					name: 'exchCode',
					label: '局向代码',
					width: 100
				}, {
					name: 'exchName',
					width: 100,
					label: '局向名称'
				}, {
					name: 'measureName',
					width: 100,
					label: '测量室',
					key:true
				}, {
					name: 'addrId',
					width: 100,
					label: 'addrId',
					key:true,
					hidden:true
				}, {
					name: 'serviceOrderId',
					width: 100,
					label: 'serviceOrderId',
					key:true,
					hidden:true
				}, {
					name: 'exchId',
					width: 100,
					label: 'exchId',
					key:true,
					hidden:true
				}, {
					name: 'measureId',
					width: 100,
					label: 'measureId',
					key:true,
					hidden:true
				}],
				rowNum: 10,
				pager: false,
				server: true,
				pageData: this.getAccessInfoPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		getAccessInfoPerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#order-accessinfo-grid").grid("getGridParam", "rowNum");
			//首先根据sortname,sortorder对整个数据就行排序,正常情况下把查询条件带入到服务器查询就行
			var baseOrderId = this.options.baseOrderId;
			var me =this;
			utils.ajax('iomService','qryAccessInfo',baseOrderId).done(function(ret){
				var result = {
					"rows": ret,
					"page": 1,
					"total": ret.length,
					"id": "id"
				};
				me.$("#order-accessinfo-grid").grid("reloadData", result);
			});
		},loadWorkOrderListRender: function() {
			this.$("#order-workorder-grid").grid({
				datatype: "json",
				height: 350,
				colModel: [{
					name: 'workOrderCode',
					label: '工单编码',
					width: 150
				}, {
					name: 'partyName',
					label: '执行单位',
					width: 150
				}, {
					name: 'tacheName',
					width: 150,
					label: '环节名称'
				}, {
					name: 'workOrderStateName',
					width: 150,
					label: '工单状态'
				}, {
					name: 'createDate',
					width: 150,
					label: '创建时间',
					key:true
				}, {
					name: 'finishDate',
					width: 150,
					label: '完成时间',
					key:true
				}, {
					name: 'remarks',
					width: 200,
					label: '备注',
					key:true
				}, {
					name: 'addrId',
					width: 100,
					label: 'addrId',
					key:true,
					hidden:true
				}, {
					name: 'serviceOrderId',
					width: 100,
					label: 'serviceOrderId',
					key:true,
					hidden:true
				}, {
					name: 'tacheDefineId',
					width: 100,
					label: 'TacheDefineId',
					key:true,
					hidden:true
				}, {
					name: 'baseOrderId',
					width: 100,
					label: 'BaseOrderId',
					key:true,
					hidden:true
				}, {
					name: 'id',
					width: 100,
					label: 'Id',
					key:true,
					hidden:true
				}],
				rowNum: 10,
				pager: false,
				server: true,
				pageData: this.getWorkOrderListPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		getWorkOrderListPerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#order-workorder-grid").grid("getGridParam", "rowNum");
			//首先根据sortname,sortorder对整个数据就行排序,正常情况下把查询条件带入到服务器查询就行
			var baseOrderId = this.options.baseOrderId;
			var me =this;
			utils.ajax('orderTaskManage','qryWorkOrderInfoByOrderId',baseOrderId).done(function(ret){
				var result = {
					"rows": ret,
					"page": 1,
					"total": ret.length,
					"id": "id"
				};
				me.$("#order-workorder-grid").grid("reloadData", result);
			});
		},loadBaseinfo:function(){//基本信息
			var me = this;
			var baseOrderId = this.options.baseOrderId;
			utils.ajax('iomService','queryOrderInfoByKey',baseOrderId).done(function(baseInfo)	{
				//order-baseinfo-custOrderCode
				var baseInfoValues = {};
				for(var key in baseInfo){
					baseInfoValues["order-baseinfo-"+key] = baseInfo[key];
				}
				me.$('#base-info-form').form("value",baseInfoValues);
			});
	},loadCustInfo:function(){
			var me = this;
			var baseOrderId = this.options.baseOrderId;
			utils.ajax('iomService','queryCust',baseOrderId).done(function(custInfo)	{
				var custInfoValues = {};
				var oldcustInfoValues = {};
				if(custInfo[0] != null){
					for(var key in custInfo[0]){
						custInfoValues["order-custinfo-"+key] = custInfo[0][key];
					}
					var result = {
						"rows": custInfo[0].linkmanDtos,
						"page": 1,
						"total": custInfo[0].linkmanDtos.length,
						"id": "id"
					};
					me.$("#order-custinfo-current-grid").grid("reloadData", result);
				}
				if(custInfo[1] != null){
					for(var key in custInfo[1]){
						oldcustInfoValues["order-oldcust-"+key] = custInfo[1][key];
					}
					var result = {
						"rows": custInfo[1].linkmanDtos,
						"page": 1,
						"total": custInfo[1].linkmanDtos.length,
						"id": "id"
					};
					me.$("#order-custinfo-old-grid").grid("reloadData",result);
				}
				me.$('#cust-info-form').form("value",custInfoValues);
				me.$('#oldcust-info-form').form("value",oldcustInfoValues);
			});
	},loadProdInfo:function() {
			var me = this;
			var baseOrderId = this.options.baseOrderId;
			/*utils.ajax('orderTaskManage','getJson',baseOrderId).done(function(indepProdInfo)	{

			});
			return;*/
			utils.ajax('iomService','queryServiceOrder',baseOrderId).done(function(indepProdInfo)	{

				var result = {
					"rows": indepProdInfo.indepProdOrderEvtDtos,
					"page": 1,
					"total": indepProdInfo.indepProdOrderEvtDtos.length,
					"id": "id"
				};
				me.$("#order-productinfo-majarprod-left-grid").grid("reloadData",result);
				if(indepProdInfo.indepProdOrderAttrDtos != null && indepProdInfo.indepProdOrderAttrDtos != undefined){
					for(var i = 0;i < indepProdInfo.indepProdOrderAttrDtos.length;i++){
						var temoObj = indepProdInfo.indepProdOrderAttrDtos[i];
						if(temoObj.productCharacterDto != null && temoObj.productCharacterDto != undefined){
							temoObj.name = temoObj.productCharacterDto.name;
						}
					}
				}
				result = {
					"rows": indepProdInfo.indepProdOrderAttrDtos,
					"page": 1,
					"total": indepProdInfo.indepProdOrderAttrDtos.length,
					"id": "id"
				};
				me.$("#order-productinfo-majarprod-right-grid").grid("reloadData",result);

				utils.ajax('iomService','queryProductByOrderId',baseOrderId).done(function(tmpObj2)	{
					var indepProdInfoValues = {};
					var tmpObj1 = indepProdInfo;
					if(tmpObj1!=null && tmpObj1.indepProdDto!=null && tmpObj1.indepProdDto.productDto!=null){
						indepProdInfoValues["order-productinfo-prodName"] = tmpObj1.indepProdDto.productDto.name||"";
					}
					if(tmpObj1!=null && tmpObj1.oldIndepProdDto!=null && tmpObj1.oldIndepProdDto.productDto!=null){
						indepProdInfoValues["order-productinfo-oldProdName"] = tmpObj1.oldIndepProdDto.productDto.name||"";
					}
					if(tmpObj2!=null && tmpObj2!=null ){
						indepProdInfoValues["order-productinfo-newAccType"] = tmpObj2.newAccType||"";
						indepProdInfoValues["order-productinfo-curAccType"] = tmpObj2.curAccType||"";
						indepProdInfoValues["order-productinfo-newDevice"] = tmpObj2.newDevice||"";
						indepProdInfoValues["order-productinfo-curDevice"] = tmpObj2.curDevice||"";
						indepProdInfoValues["order-productinfo-orderState"] = tmpObj2.state||"";
					}
					me.$('#product-info-form').form("value",indepProdInfoValues);
				});
			});

			utils.ajax('iomService','queryOrderDependProd',baseOrderId).done(function(dependProdInfo)	{
				//order-baseinfo-custOrderCode
				var nameArr = new Array();
				var tmpObj2 = dependProdInfo;
				for(var i=0;i<tmpObj2.length;i++){
					var tmpDto = {"dependProdName":tmpObj2[i].dependProdDto.productDto.name,"evtWithProdName":tmpObj2[i].actType,"id":tmpObj2[i].id,"serviceOrderId":tmpObj2[i].serviceOrderId,"dependProdId":tmpObj2[i].dependProdId};
					nameArr[i] = tmpDto;
				}
				var result = {
					"rows": nameArr,
					"page": 1,
					"total": nameArr.length,
					"id": "id"
				};
				me.$("#order-productinfo-attachprod-left-grid").grid("reloadData",result);
			});
	},attachprodGridClick:function(){
			var selected = this.$("#order-productinfo-attachprod-left-grid").grid("getSelection");//返回所有被选中的行
			var me = this;
			utils.ajax('iomService','queryOrderDependProdAttrById',selected.id).done(function(dependProdAttrInfo)	{
				//order-baseinfo-custOrderCode
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
				me.$("#order-productinfo-attachprod-right-grid").grid("reloadData",result);
			});
	}
	});
});