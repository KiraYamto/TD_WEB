define([
	'text!modules/idcrm/resourcemanager/equrm/templates/NetEquipBoardSelectView.html',
	'i18n!modules/idcrm/resourcemanager/equrm/i18n/equip.i18n',
	'modules/common/cloud-utils',
    'css!modules/idcrm/resourcemanager/equrm/styles/netEquipment.css'
], function(frameViewTpl, i18nEquip,utils, css) {
	return fish.View.extend({
		template: fish.compile(frameViewTpl),
		i18nData: fish.extend({}, i18nEquip),
		events: {            
		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},
		loadEquipRender: function() {
			$("#equip-net-board-select-grid",this.$el).grid({
				datatype: "json",
				height: 400,
				colModel: [{
                    name: 'id',
                    label: 'ID',
                    key:true,
                    hidden:true
                },{
					name: 'positionNum',
					label: '槽位序号',
					width: 100
				}, {
					name: 'seriesNo',
					width: 100,
					label: '序列号'
				}, {
					name: 'stateName',
					width: 100,
					label: '资源状态'
				},  {
					name: 'useStateName',
					width: 100,
					label: '使用状态'
				}],
				rowNum: 10,
                multiselect: true,
                shrinkToFit: true,
                rownumbers:true,
                pager: true,
				server: true,
                recordtext: "当前显示 {0} - {1} 条记录 共 {2} 条记录",
                pgtext: "第 {0} 页 / 共 {1} 页",
                emptyrecords: "没有记录",
				pageData: this.getEquipData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		getEquipData:  function(page, sortname, sortorder) { //请求服务器获取数据的方法
			var rowNum = $("#equip-net-board-select-grid",this.$el).grid("getGridParam", "rowNum");

            // 查询的时候 锁定页面
            if ($('#equip-net-board-select-grid',this.$el).data('blockui-content')) {
                $('#equip-net-board-select-grid',this.$el).unblockUI().data('blockui-content', false);
            } else {
                $('#equip-net-board-select-grid',this.$el).blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }           
            
            var cond = [{op:"EQUALS",name:"eqId",value:this.options.netEquip.id}];
            if(this.options.action=="mod"){
            	cond.push({op:"NOT_EQUALS",name:"id",value:this.options.netEquipBoardId});
            }
            var queryParamsDto ={};
            queryParamsDto["pageIdx"]=page;
            queryParamsDto["pageSize"]=rowNum;
            queryParamsDto["conditions"]=cond;
            var self =this;
			utils.ajax('netEquipBoardService', 'findNetEquipBoardListByCond', queryParamsDto).done(function(ret){

                $("#equip-net-board-select-grid",self.$el).grid("reloadData", ret);

                // 解锁页面
                $('#equip-net-board-select-grid',self.$el).unblockUI().data('blockui-content', false);

            });

		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
            this.loadEquipRender();
            this.getEquipData(1);
            var popup = this.popup;
            var self = this;
            this.$el.on('click', '#save-button', function(e) {				
            	var selectedFrameIds = $("#equip-net-board-select-grid",self.$el).grid('getGridParam', 'selarrrow');
            	if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                    fish.info("请选择一项数据！");
                    return;
                }

                if(selectedFrameIds.length > 1) {
                    fish.info("一次只能选择一条数据！");
                    return;
                }
                var selectedFrame = $("#equip-net-board-select-grid",self.$el).grid("getRowData", selectedFrameIds[0]);                
				popup.close(selectedFrame);
			});
		}
	});
});