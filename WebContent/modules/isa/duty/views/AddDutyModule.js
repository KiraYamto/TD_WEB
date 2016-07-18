define([
        'text!modules/isa/duty/templates/AddDutyModule.html',
        'i18n!modules/isa/duty/i18n/dutyModuleMana.i18n',
        'modules/common/cloud-utils',
        'css!modules/isa/duty/style/dutyModuleMana.css'
        ], function(AddDutyModuleTpl, i18nDuty,utils,css) {
	return fish.View.extend({
		rMap:{},
		template: fish.compile(AddDutyModuleTpl),
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
			me.rMap.orgId = me.options.orgId;
			me.rMap.orgName = me.options.orgName;
			me.rMap.dutyNum = '3';
			$('#dutyNum').combobox({
				dataTextField: 'name',
				dataValueField: 'value',
				dataSource:  [
				              {name: '1', value: '1'},
				              {name: '2', value: '2'},
				              {name: '3', value: '3'}			             
				              ],
				              value: "3",
				              change: function (event) {
				            	  me.rMap.dutyNum = $('#dutyNum').combobox("value");
				            	  me.addNewRow(me.rMap.dutyNum);
				            	  $("#dutyGrid").grid("reloadData",me.rMap.mydata);
				              }
			});
			me.loadMyDutyConfRender();
		},


		//班次列表
		loadMyDutyConfRender: function() {
			this.$("#dutyGrid").grid({
				data: this.rMap.mydata,
				height:$(window).height()*0.35,
				colModel: [{
					name: 'moduleSeqId',
					label: '序号',
					key: true,
					editable: false,
					edittype: "text"
				},
				{
					name: 'dutyPeriodModuleName',
					label: '班次名称',
					editable: true,
					edittype: "text"
				},
				{
					name: 'beginTime',
					label: '开始时刻',
					editable: true,
					formatter: "time",
					formatoptions: {
						newformat: 'hh:mm:ss' //格式化后的数据格式
					}
				},
				{
					name: 'endTime',
					label: '结束时刻',
					editable: true,
					formatter: "time",
					formatoptions: {
						newformat: 'hh:mm:ss' //格式化后的数据格式
					}
				},
				{
					name: 'targetSeqId',
					label: '交班班次',
					editable: false,
					edittype: "text"
				}],
				cellEdit: true,
				hiddengrid :false,
				afterEditCell: function (e,rowid,name,value,iRow,iCol){
		            console.log("after edit cell");
		            if(name=='beginTime') {
		                $(document.getElementById(rowid+"_beginTime"),"#dutyGrid").datetimepicker({
		                    buttonIcon: '',
		                    viewType:'time'
		                });
		            }
		            if(name=='endTime'){
		            	 $(document.getElementById(rowid+"_endTime"),"#dutyGrid").datetimepicker({
			                    buttonIcon: '',
			                    viewType:'time'
			                });
		            }
		        }
			});
		},

		addNewRow:function(num){
			if(num=='1'){
				this.rMap.mydata = [{moduleSeqId:"1",dutyPeriodModuleName:"",beginTime:"",endTime:"",targetSeqId:"1"}];
			}else if(num=='2'){
				this.rMap.mydata = [{moduleSeqId:"1",dutyPeriodModuleName:"",beginTime:"",endTime:"",targetSeqId:"2"},
				                    {moduleSeqId:"2",dutyPeriodModuleName:"",beginTime:"",endTime:"",targetSeqId:"1"}];
			}else if(num=='3'){
				this.rMap.mydata = [{moduleSeqId:"1",dutyPeriodModuleName:"",beginTime:"",endTime:"",targetSeqId:"2"},
				                    {moduleSeqId:"2",dutyPeriodModuleName:"",beginTime:"",endTime:"",targetSeqId:"3"},
				                    {moduleSeqId:"3",dutyPeriodModuleName:"",beginTime:"",endTime:"",targetSeqId:"1"}];
			}
		},

		save:function(){
			var me = this;
			var getRowDataTemp = this.$("#dutyGrid").grid("getRowData");//返回所有的行
			var $form1 = $('#demand-form').form('value');
			var map = new Object();
			var obj = new Object();
			obj.belongOrgId = me.rMap.orgId+"";
			obj.belongOrgName = me.rMap.orgName;
			obj.dutyModuleName = $form1.dutyModuleName;
			obj.dutyNum = $form1.dutyNum;
			obj.staffId = currentUser.staffId+"";
			obj.staffName = currentUser.staffName;
			map.dutyModuleObj = obj;//排班模板
			if(getRowDataTemp!=null&&getRowDataTemp.length>0){
				var array= new Array();　
				map.dutyPeriodModuleList = array;
				for(var i=0;i<getRowDataTemp.length;i++){
					var object = new Object();
					object.dutyPeriodModuleName = getRowDataTemp[i].dutyPeriodModuleName;
					object.beginTime = "1970-01-01 "+getRowDataTemp[i].beginTime;
					object.endTime = "1970-01-01 "+getRowDataTemp[i].endTime;
					object.personNum = 100+"";
					object.moduleSeqId = getRowDataTemp[i].moduleSeqId+"";
					object.targetSeqId = getRowDataTemp[i].targetSeqId+"";
					if(i==getRowDataTemp.length-1){
						object.turnBeginTime = "1970-01-01 "+getRowDataTemp[0].beginTime;
						object.turnEndTime = "1970-01-01 "+getRowDataTemp[0].endTime;
					}else{
						object.turnBeginTime = "1970-01-01 "+getRowDataTemp[i+1].beginTime;
						object.turnEndTime = "1970-01-01 "+getRowDataTemp[i+1].endTime;
					}
					array.push(object);
				}
			}
			utils.ajax('isaDutyService', 'addDutyModule', map).done(function(ret){
				if(ret){
					if(ret == "SUCCESS"){
						fish.success('新增成功').result.always(function(){me.popup.close()});
					}else{
						fish.error('新增失败');
					}
				}else{
					fish.info('消息未返回');
				}
			});
		}
	});	
});