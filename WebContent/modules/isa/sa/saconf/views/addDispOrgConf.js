define([
	'text!modules/isa/sa/saconf/templates/addDispOrgConf.html',
	'i18n!modules/isa/sa/saconf/i18n/faultDispOrgConf.i18n',
	'modules/common/cloud-utils',
	'css!modules/isa/sa/saconf/styles/saconfmanagement.css'
], function(addDispOrgConfTpl, i18nSa,utils,css) {
	return fish.View.extend({
		rMap:{},
		template: fish.compile(addDispOrgConfTpl),
		i18nData: fish.extend({}, i18nSa),
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
			me.rMap.orgId = me.options.org;
			var map = new Object();
			map.orgId = currentJob.orgId+"";//选择本组织及下属组织
			utils.ajax('isaDutyService','queryOrganizationById',map).done(function(ret){
				me.rMap.mydata = JSON.parse(ret);
				me.$("#allOrgGrid").grid("reloadData",me.rMap.mydata);
			});
			me.loadMyDispOrgConfRender();
		},
		
		
		//可转派的部门列表
		loadMyDispOrgConfRender: function() {
			this.$("#allOrgGrid").grid({
				data: this.rMap.mydata,
			    height: $(window).height()*0.4,
			    colModel:[
			        {name:'orgId',hidden:true},
			        {name:'orgName',label: '组织名称',width:600,key:true},
			        {name:'parentId',hidden:true},
			        {name:'orgPathCode',hidden:true},
			        {name:'orgPathName',hidden:true}
			    ],
			    multiselect:true,//可支持多选
			    expandColumn:"orgName",
			    treeGrid:true,
			    onRowExpand:function(e, rowData){//展开父节点rowData
			       // console.log(rowData);
			        var children = $("#allOrgGrid").grid("getNodeChildren", rowData);
			    }
			});
		},
		
		save:function(){
			var me = this;
			var getRowDataTemp = this.$("#allOrgGrid").grid("getCheckRows");//返回所有被选中的行
			if(null == getRowDataTemp){
				console.log('请选择行！');
			}
			
			var map = new Object();
			if(getRowDataTemp!=null&&getRowDataTemp.length>1){
				map.flag = 1+"";
				var array= new Array();　
				map.paramList = array;
				for(var i=0;i<getRowDataTemp.length;i++){
					var object = new Object();
					object.orgId = me.rMap.orgId+"";
					object.partyId = getRowDataTemp[i].orgId+"";
					object.partyName = getRowDataTemp[i].orgName;
					object.operId = currentUser.staffId+"";
					object.operName = currentUser.staffName;
					object.partyOrgPathName = getRowDataTemp[i].orgPathName;
					array.push(object);
				}
			}else if(getRowDataTemp!=null&&getRowDataTemp.length==1){
				map.orgId = me.rMap.orgId+"";
				map.partyId = getRowDataTemp[0].orgId+"";
				map.partyName = getRowDataTemp[0].orgName;
				map.operId = currentUser.staffId+"";
				map.operName = currentUser.staffName;
				map.partyOrgPathName = getRowDataTemp[0].orgPathName;
			}
			utils.ajax('isaDispPartyConfigService', 'addDispPartyConfig', map).done(function(ret){
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