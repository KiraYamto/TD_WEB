define([
	'text!modules/idcrm/resourcemanager/equrm/templates/NetEquipmentBoardView.html',
	'i18n!modules/idcrm/resourcemanager/equrm/i18n/equip.i18n',
	'modules/common/cloud-utils',
    'css!modules/idcrm/resourcemanager/equrm/styles/netEquipment.css'
], function(frameViewTpl, i18nEquip,utils, css) {
	return fish.View.extend({
		template: fish.compile(frameViewTpl),
		i18nData: fish.extend({}, i18nEquip),
		events: {
            "click #equip-net-board-add-btn": "equipNetBoardAddBtnClick",
            "click #equip-net-board-mod-btn": "equipNetBoardModBtnClick",
            "click #equip-net-board-del-btn": "equipNetBoardDelBtnClick",
            "click #equip-net-board-refresh-btn" :"equipNetBoardRefreshBtnClick"
		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			//初始化设备的值
			/*$("#equip_net_restypeid",this.$el).html(this.options.netEquip.rsTypeName);
			$("#net_equip_name",this.$el).html(this.options.netEquip.eqName);
			$("#net_equip_detail_room_name",this.$el).html(this.options.netEquip.roomName);
			$("#net_equip_eqCode",this.$el).html(this.options.netEquip.eqCode);
			$("#net_equip_model",this.$el).html(this.options.netEquip.modelName);
			$("#net_equip_serial_no",this.$el).html(this.options.netEquip.serialNo);
			$("#equip_net_service_type",this.$el).html(this.options.netEquip.serviceStateName);
			$("#equip_net_vendor",this.$el).html(this.options.netEquip.vendorName);
			$("#equip_net_ip_address",this.$el).html(this.options.netEquip.eqIpAddress);*/
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.loadEquipBoardRender();
			this.getEquipBoardData(1);
		},
		loadEquipBoardRender: function() {
			this.$("#equip-net-board-grid").grid({
				datatype: "json",
				height: 400,
				colModel: [{
                    name: 'id',
                    label: 'ID',
                    key:true,
                    width: 80,
                    hidden:true
                },{
					name: 'positionNum',
					label: '槽位序号',
					width: 100
				}, {
					name: 'seriesNo',
					width: 100,
					label: '序列号',
					hidden: true
				}, {
					name: 'stateName',
					width: 100,
					label: '资源状态'
				},  {
					name: 'useStateName',
					width: 100,
					label: '使用状态'
				},{
					name: 'parentName',
					label: '母槽位序号',
					width: 100
				},{
					name: 'createDate',
					label: '创建时间',
					width: 100,
					hidden: true
				}, {
					name: 'portNum',
					width: 100,
					label: '端口总数'
				}, {
                    name: 'usedPortNum',
                    width: 150,
                    label: '已分配端口数'
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
				pageData: this.getEquipBoardData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		getEquipBoardData:  function(page, sortname, sortorder) { //请求服务器获取数据的方法
			var rowNum = this.$("#equip-net-board-grid").grid("getGridParam", "rowNum");

            // 查询的时候 锁定页面
            if ($('#equip-net-board-grid').data('blockui-content')) {
                $('#equip-net-board-grid').unblockUI().data('blockui-content', false);
            } else {
                $('#equip-net-board-grid').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }           
            
            var cond = [{op:"EQUALS",name:"eqId",value:this.options.netEquip.id}];
            var queryParamsDto ={};
            queryParamsDto["pageIdx"]=page;
            queryParamsDto["pageSize"]=rowNum;
            queryParamsDto["conditions"]=cond;
			utils.ajax('netEquipBoardService', 'findNetEquipBoardListByCond', queryParamsDto).done(function(ret){

                $("#equip-net-board-grid").grid("reloadData", ret);

                // 解锁页面
                $('#equip-net-board-grid').unblockUI().data('blockui-content', false);

            });

		},
        // 新增设备
        equipNetBoardAddBtnClick: function() {
            var reloadEquipData = $.proxy(this.getEquipBoardData,this);
            var pop =fish.popupView({url: 'modules/idcrm/resourcemanager/equrm/views/NetEquipmentBoardFormView',
                width: "90%",
                callback:function(popup,view){
                    popup.result.then(function (e) {
                        reloadEquipData(1);
                    },function (e) {
                        console.log('关闭了',e);
                    });
                },
            	viewOption:{action:"detail.equipNetBoardAdd",netEquip:this.options.netEquip}
            });

        },        
        //设备修改
        equipNetBoardModBtnClick: function() {
            var reloadEquipData = $.proxy(this.getEquipBoardData,this);

            var selectedFrameIds = $("#equip-net-board-grid").grid('getGridParam', 'selarrrow');
            if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                fish.info("请选择一项数据！");
                return;
            }

            if(selectedFrameIds.length > 1) {
                fish.info("一次只能修改一条数据！");
                return;
            }
            var selectedBoard = $("#equip-net-board-grid").grid("getRowData", selectedFrameIds[0]);
            
            var pop =fish.popupView({url: 'modules/idcrm/resourcemanager/equrm/views/NetEquipmentBoardFormView',
                width: "90%",
                callback:function(popup,view){
                    // 查询机柜详情信息，加载
                	console.log(selectedBoard);
                    //view.$el.find("#net-equip-board-form").form("value", selectedFrame);                   
                    popup.result.then(function (e) {
                        reloadEquipData(1);
                    },function (e) {
                        console.log('关闭了',e);
                    });
                },
            	viewOption:{action:"detail.equipNetBoardMod",netEquip:this.options.netEquip,selectedBoard:selectedBoard}
            });

        },
        // 设备删除
        equipNetBoardDelBtnClick: function() {
            var reloadEquipData = $.proxy(this.getEquipBoardData,this);
           
            var selectedFrameIds = $("#equip-net-board-grid").grid('getGridParam', 'selarrrow');
            if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                fish.info("请至少选择一条记录！");
                return;
            }
            var delNetEquipArr = [];
            for(var i in selectedFrameIds){
            	delNetEquipArr.push({"id":selectedFrameIds[i]});
            }
            
            fish.confirm('是否删除所选槽位？').result.then(function() {
                utils.ajax('netEquipBoardService', 'deleteRsNetEquipBoard', delNetEquipArr).done(function(ret){
                	if(ret){
            			if(ret.code==0){
            				fish.info('操作成功');
            				reloadEquipData(1);
            			}else{
            				fish.info(ret.msg);
            			}
            		}else{
            			fish.info('消息未返回');
            		}
                });
            });

        },
        equipNetBoardRefreshBtnClick:function(){
        	this.getEquipBoardData(1);
        }
	});
});