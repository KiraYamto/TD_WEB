define([
	'text!modules/agency/templates/AgencyMenegementView.html',
	'i18n!modules/agency/i18n/agency.i18n',
	'modules/common/cloud-utils',
	'css!modules/agency/styles/agencymanagement.css'
], function(AgencyMenegementViewTpl, i18nAgency,utils,css) {
	return fish.View.extend({
		template: fish.compile(AgencyMenegementViewTpl),
		i18nData: fish.extend({}, i18nAgency),
		events: {
			"click #agency-tabs-a-link": "agencyTabsAClick",
			"click #agency-tabs-b-link": "agencyTabsBClick",
			'click #agency-myagency-add-btn':'popAddAgent'
		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			
			
			/*$("#agents-tabs").tabs();*/
			
			this.loadMyAgencyRender();
			this.loadAgencyofMyRender();
			this.$('#agency-tabs-a').show();
			this.$('#agency-tabs-b').hide();
			this.getMyAgencyPerData();
			this.getAgencyofMyPerData();
		},
		agencyTabsAClick:function(){
			this.$('#agency-tabs-a').show();
			this.$('#agency-tabs-b').hide();
			this.$('#agency-tabs-a-li').addClass('ui-tabs-active');
			this.$('#agency-tabs-b-li').removeClass('ui-tabs-active');
			/*this.$('#agency-tabs').tabs('option', 'active',0);*/
			$(window).resize();
		},
		agencyTabsBClick:function(){
			this.$('#agency-tabs-b').show();
			this.$('#agency-tabs-a').hide();
			this.$('#agency-tabs-a-li').removeClass('ui-tabs-active');
			this.$('#agency-tabs-b-li').addClass('ui-tabs-active');
			/*this.$('#agency-tabs').tabs('option', 'active',1);*/
			$(window).resize();
		},
		loadMyAgencyRender: function() {
			this.$("#agency-myagency-grid").grid({
				datatype: "json",
				height: 400,
				colModel: [{
					name: 'agenedName',
					label: '我的代理人',
					width: 160
				}, {
					name: 'startTime',
					width: 60,
					label: '开始时间'
				}, {
					name: 'endTime',
					label: '结束时间',
					width: 80
				}, {
					name: 'taskAgencyId',
					width: 100,
					label: '代理人表Id',

					hidden:true

				}, {
					name: 'agencyId',
					width: 100,
					label: '我的代理人Id',
					key:true,
					hidden:true

				}],
				rowNum: 10,
				pager: true,
				server: true,
				pageData: this.getMyAgencyPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		getMyAgencyPerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#agency-myagency-grid").grid("getGridParam", "rowNum");
			var me =this;
			utils.ajax('isaService','qryMyAgency',currentUser.staffId).done(function(ret){
				var result = {
						"rows": ret,
						"page": page,
						"total": 1,
						"id": "id"
					};
				me.$("#agency-myagency-grid").grid("reloadData", result);
			});

			
		},

		loadAgencyofMyRender: function() {
			this.$("#agency-agencyofmine-grid").grid({
				datatype: "json",
				height: 400,
				colModel: [{
					name: 'agencyName',
					label: '我代理的人',
					width: 160
				}, {
					name: 'startTime',
					width: 60,
					label: '开始时间'
				}, {
					name: 'endTime',
					label: '结束时间',
					width: 80
				}, {
					name: 'taskAgencyId',
					width: 100,
					label: '代理人表Id',

					hidden:true

				}, {
					name: 'agencyId',
					width: 100,
					label: '我代理的人Id',
					key:true,
					hidden:true

				}],
				rowNum: 10,
				pager: true,
				server: true,
				pageData: this.getAgencyofMyPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		getAgencyofMyPerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
		rowNum = rowNum || this.$("#agency-agencyofmine-grid").grid("getGridParam", "rowNum");
		//首先根据sortname,sortorder对整个数据就行排序,正常情况下把查询条件带入到服务器查询就行
		
		var me =this;
		utils.ajax('isaService','qryMyAgened',currentUser.staffId).done(function(ret){
			var result = {
					"rows": ret,
					"page": page,
					"total": 1,
					"id": "id"
				};
			me.$("#agency-agencyofmine-grid").grid("reloadData", result);
		});
		
		/*var perData = [{
			agencyId: '1',
			'taskAgencyId': '1',
			'agencyName': '中兴工号',
			'startTime': '2015-08-20 10:52:43',
			'endTime': '2015-08-20 10:52:43'
		}, {
			agencyId: '2',
			'taskAgencyId': '2',
			'agencyName': '中兴工号',
			'startTime': '2015-08-20 10:52:43',
			'endTime': '2015-08-20 10:52:43'
		}, {
			agencyId: '3',
			'taskAgencyId': '3',
			'agencyName': '中兴工号',
			'startTime': '2015-08-20 10:52:43',
			'endTime': '2015-08-20 10:52:43'
		}];
		var result = {
			"rows": perData,
			"page": page,
			"total": 1,
			"id": "id"
		};
		this.$("#agency-agencyofmine-grid").grid("reloadData", result);*/
	},popAddAgent:function(){
		var getMyAgencyPerData=$.proxy(this.getMyAgencyPerData,this);
		var pop =fish.popupView({url: 'modules/agency/views/AgentFormView',
			width: "60%",
			
			callback:function(popup,view){
				popup.result.then(function (e) {
					utils.ajax('isaService','addAgency',currentUser.staffId,e.agent.id,e.agent.text,e['agent-starttime'],e['agent-endtime'])
					.done(function(){
						fish.info('保存成功');
						getMyAgencyPerData();
						
					}).fail(function(e){
						console.log(e);
						fish.error(e);
					});
					console.log(e);
				},function (e) {
					console.log('关闭了',e);
				});
			}
		});
	}
	});
});