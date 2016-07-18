define([
        'text!modules/isa/duty/templates/EditDutyModule.html',
        'i18n!modules/isa/duty/i18n/dutyModuleMana.i18n',
        'modules/common/cloud-utils',
        'css!modules/isa/duty/style/dutyModuleMana.css'
        ], function(EditDutyModuleTpl, i18nDuty,utils,css) {
	return fish.View.extend({
		rMap:{},
		template: fish.compile(EditDutyModuleTpl),
		i18nData: fish.extend({}, i18nDuty),
		events: {
			'click #save-button':'save'
		},


		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},



		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			var me = this;
			me.rMap.dutyModuleId = me.options.dutyModuleId;
			me.rMap.dutyModuleName = me.options.dutyModuleName;
			me.rMap.result = me.options.result;
			//排班模板
			document.getElementById("dutyModuleName").value=me.rMap.dutyModuleName;
			me.loadMyDutyConfRender();
			$("#dutyGrid").grid("reloadData", me.rMap.result);
		},


		//班次列表
		loadMyDutyConfRender: function() {
			this.$("#dutyGrid").grid({
				data: this.rMap.result,
				height:$(window).height()*0.35,
				colModel: [{
					name: 'moduleSeqId',
					label: '序号',
					key: true
				},
				{
					name: 'dutyPeriodModuleName',
					label: '班次名称'
				},
				{
					name: 'beginTime',
					label: '开始时刻'
				},
				{
					name: 'endTime',
					label: '结束时刻'
				}],
				server: true
			});
		},

		save:function(){
			var me = this;
			var getRowDataTemp = this.$("#dutyGrid").grid("getRowData");//返回所有的行
			var $form1 = $('#demand-form').form('value');
			var map = new Object();
			var obj = new Object();
			obj.dutyModuleId = me.rMap.dutyModuleId
			obj.dutyModuleName = $form1.dutyModuleName;
			map.dutyModuleObj = obj;//排班模板
			utils.ajax('isaDutyService', 'updateDutyModule', map).done(function(ret){
				if(ret){
					if(ret == "SUCCESS"){
						fish.success('修改成功').result.always(function(){me.popup.close()});
					}else{
						fish.error('修改失败');
					}
				}else{
					fish.info('消息未返回');
				}
			});
		}
	});	
});