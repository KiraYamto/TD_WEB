define([
	'text!modules/idcrm/cust/templates/CustResDetail.html',
	'i18n!modules/idcrm/cust/i18n/cust.i18n',
	'modules/common/cloud-utils',
    'css!modules/idcrm/cust/styles/CustResDetail.css'
], function(frameViewTpl, i18nEquip,utils, css) {
	return fish.View.extend({
		template: fish.compile(frameViewTpl),
		i18nData: fish.extend({}, i18nEquip),
		events: {
            "click #equip-net-board-btn": "equipNetBoardMngBtnClick",
            "click #equip-net-port-btn": "equipNetPortMngBtnClick",
            "click #equip-net-add-btn": "equipNetAddBtnClick",
            "click #equip-net-mod-btn": "equipNetModBtnClick",
            "click #equip-net-del-btn": "equipNetDelBtnClick",
            "click #equip-net-query-btn": "equipNetQueryBtnClick",
            "click #equip-net-export-btn": "equipNetExportBtnClick",
            "click #equip-net-room-btn":"equipNetRoomBtnClick"
		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.loadStaticData();
			this.loadFrameRender();
			this.loadBroadbandPortRender();
			this.loadIpAddrRender();
			//this.getEquipData(1);
			
			this.loadCustInfo(this.options);
			this.getResTypes();
			this.getCustResData(1);
		},
		loadCustInfo:function(paramObj) {
			console.log(paramObj);
			if (paramObj&&paramObj.custDto) {
				this.$el.find("#cust_detail_info_form").form("value", paramObj.custDto);
			}
		},
		loadStaticData:function(){
			var self = this;
			$("select[attrCode]").each(function(o){
				$this = $(this);
				var attrCode = $this.attr("attrCode");
				self.renderSelect($this,attrCode);				
			})
		},
		renderSelect:function(o,attrCode){
			$.ajaxSetup({   
	            async : false  
	        }); 
			utils.ajax('basicDataService', 'getBasicDataListByBasicType',attrCode).done(function(ret){
				var html="<option value=''>--请选择--</option>";
				if(ret){
                	for(var key in ret ){
                		var basicDataDto = ret[key];
                		html+="<option value='"+basicDataDto.code+"'>"+basicDataDto.value+"</option>";
                	}
                }	
				o.append($(html));
            });
			$.ajaxSetup({   
	            async : true  
	        }); 
		},
		loadFrameRender: function() {
			var self =this;
			this.$("#cust_res_frame_grid").grid({
				datatype: "json",
				width:'100%',
				height: 200,
				colModel: [{
                    name: 'ID',
                    label: 'ID',
                    key:true,
                    width: 80,
                    hidden:false
                },{
					name: 'SERIAL_NO',
					label: '序号',
					width: 100
				}, {
					name: 'ROOM_NAME',
					width: 100,
					label: '机房'
				}, {
					name: 'CODE',
					label: '机柜编码',
					width: 200
				}, {
					name: 'UNIT_SERIAL',
					width: 100,
					label: '机位序号'
				}, {
                    name: 'RENTING_MODE',
                    width: 100,
                    label: '租用方式'
                }, {
                    name: 'CIR_STATE',
                    width: 100,
                    label: '业务状态'
                }, {
                    name: 'COMPLETE_TIME',
                    width: 150,
                    label: '起租时间'
                }, {
                    name: 'ORDER_CODE',
                    width: 100,
                    label: '业务单号'
                }],
				rowNum: 10,
                multiselect: true,
                shrinkToFit: false,
                rownumbers:true,
                pager: true,
				server: true,
                recordtext: "当前显示 {0} - {1} 条记录 共 {2} 条记录",
                pgtext: "第 {0} 页 / 共 {1} 页",
                emptyrecords: "没有记录",
				pageData: this.getCustResData, 
				gridComplete:function(){
					self.$("#equip-net-grid").find("[eq_detail]").each(function(){
						
					})
				}
			});
			
			
		},
		loadBroadbandPortRender: function() {
			var self =this;
			this.$("#cust_res_eqBroadPort_grid").grid({
				datatype: "json",
				width:'100%',
				height: 200,
				colModel: [{
                    name: 'ID',
                    label: 'ID',
                    key:true,
                    width: 80,
                    hidden:false
                },{
					name: 'SERIES_NO',
					label: '序号',
					width: 100
				}, {
					name: 'NAME',
					width: 100,
					label: '端口名称'
				}, {
					name: 'EQ_NAME',
					label: '所属网络设备',
					width: 200
				}, {
					name: 'CODE',
					width: 100,
					label: '模块编号'
				}, {
                    name: 'RATE_ID',
                    width: 100,
                    label: '速率'
                }, {
                    name: 'ALLOCATION_TYPE',
                    width: 100,
                    label: '使用方式'
                }, {
                    name: 'CIR_STATE',
                    width: 150,
                    label: '业务状态'
                }, {
                    name: 'COMPLETE_TIME',
                    width: 100,
                    label: '起租时间'
                }, {
                    name: 'ORDER_CODE',
                    width: 80,
                    label: '业务单号'
                }],
				rowNum: 10,
                multiselect: true,
                shrinkToFit: false,
                rownumbers:true,
                pager: true,
				server: true,
                recordtext: "当前显示 {0} - {1} 条记录 共 {2} 条记录",
                pgtext: "第 {0} 页 / 共 {1} 页",
                emptyrecords: "没有记录",
				pageData: this.getCustResData, 
				gridComplete:function(){
					
				}
			});
		},
		loadIpAddrRender: function() {
			var self =this;
			this.$("#cust_res_ipAddr_grid").grid({
				datatype: "json",
				width:'100%',
				height: 200,
				colModel: [{
                    name: 'ID',
                    label: 'ID',
                    key:true,
                    width: 80,
                    hidden:false
                }, {
					name: 'IP_CODE',
					width: 200,
					label: 'IP地址'
				}, {
					name: 'IP_SEGMENT',
					label: 'IP地址段',
					width: 300
				}, {
					name: 'CIR_STATE',
					width: 100,
					label: '业务状态'
				}, {
                    name: 'COMPLETE_TIME',
                    width: 200,
                    label: '起租时间'
                }, {
                    name: 'ORDER_CODE',
                    width: 120,
                    label: '业务单号'
                }],
				rowNum: 10,
                multiselect: true,
                shrinkToFit: false,
                rownumbers:true,
                pager: true,
				server: true,
                recordtext: "当前显示 {0} - {1} 条记录 共 {2} 条记录",
                pgtext: "第 {0} 页 / 共 {1} 页",
                emptyrecords: "没有记录",
				pageData: this.getCustResData, 
				gridComplete:function(){
					
				}
			});
		},
		getCustResData: function(page) {
			if (!this.resTypes || this.resTypes.length <= 0) {
				return;
			}
			for (var k = 0; k < this.resTypes.length; k++) {
            	var resType = this.resTypes[k];
            	if (resType.RS_TYPE_ID == "110001") { // 机柜资源
            		var cond = [{name:'FRAME_IDS', value:resType.RS_IDS}];
            		this.getFrameData(page, cond);
            	} else if (resType.RS_TYPE_ID == "110006") { // 机位资源
            		var cond = [{name:'UNIT_IDS', value:resType.RS_IDS}];
            		this.getFrameData(page, cond);
            	} else if (resType.RS_TYPE_ID == "130001") { // 端口资源
            		var cond = [{name:'PORT_IDS', value:resType.RS_IDS}];
            		this.getBroadPortData(page, cond);
            	} else if (resType.RS_TYPE_ID == "210002") { // IP资源
            		var cond = [{name:'IPADDR_IDS', value:resType.RS_IDS}];
            		this.getIpAddrData(page, cond);
            	}
            }
		},
		getResTypes: function(){
			$.ajaxSetup({   
	            async : false  
	        }); 
			var self = this;
			utils.ajax('custService', 'qryCustResType', this.options.custDto).done(function(ret){
				self.resTypes = ret;
				self.getFrameData(1);
                
            });
			$.ajaxSetup({   
	            async : true  
	        }); 
		},
		getFrameData:  function(page, cond) { //请求服务器获取数据的方法
			var rowNum = this.$("#cust_res_frame_grid").grid("getGridParam", "rowNum");

            // 查询的时候 锁定页面
            if ($('#cust_res_frame_grid').data('blockui-content')) {
                $('#cust_res_frame_grid').unblockUI().data('blockui-content', false);
            } else {
                $('#cust_res_frame_grid').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }
            
            // var cond = [{name:'RS_IDS',value:rsIds}];
            var queryParamsDto ={};
            queryParamsDto["pageIdx"]=page;
            queryParamsDto["pageSize"]=rowNum;
            queryParamsDto["conditions"]=cond;
			utils.ajax('custService', 'qryCustResFRAME', queryParamsDto).done(function(ret){

                $("#cust_res_frame_grid").grid("reloadData", ret);

                // 解锁页面
                $('#cust_res_frame_grid').unblockUI().data('blockui-content', false);

            });

		},
		getBroadPortData:  function(page, cond) { //请求服务器获取数据的方法
			var rowNum = this.$("#cust_res_eqBroadPort_grid").grid("getGridParam", "rowNum");

            // 查询的时候 锁定页面
            if ($('#cust_res_eqBroadPort_grid').data('blockui-content')) {
                $('#cust_res_eqBroadPort_grid').unblockUI().data('blockui-content', false);
            } else {
                $('#cust_res_eqBroadPort_grid').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }
            
            // var cond = [{name:'RS_IDS',value:rsIds}];
            var queryParamsDto ={};
            queryParamsDto["pageIdx"]=page;
            queryParamsDto["pageSize"]=rowNum;
            queryParamsDto["conditions"]=cond;
			utils.ajax('custService', 'qryCustResBroadPort', queryParamsDto).done(function(ret){

                $("#cust_res_eqBroadPort_grid").grid("reloadData", ret);

                // 解锁页面
                $('#cust_res_eqBroadPort_grid').unblockUI().data('blockui-content', false);

            });

		},
		getIpAddrData: function(page, cond) {
			var rowNum = this.$("#cust_res_ipAddr_grid").grid("getGridParam", "rowNum");

            // 查询的时候 锁定页面
            if ($('#cust_res_ipAddr_grid').data('blockui-content')) {
                $('#cust_res_ipAddr_grid').unblockUI().data('blockui-content', false);
            } else {
                $('#cust_res_ipAddr_grid').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }
            
            // var cond = [{name:'RS_IDS',value:rsIds}];
            var queryParamsDto ={};
            queryParamsDto["pageIdx"]=page;
            queryParamsDto["pageSize"]=rowNum;
            queryParamsDto["conditions"]=cond;
			utils.ajax('custService', 'qryCustResIPAddr', queryParamsDto).done(function(ret){

                $("#cust_res_ipAddr_grid").grid("reloadData", ret);

                // 解锁页面
                $('#cust_res_ipAddr_grid').unblockUI().data('blockui-content', false);

            });
		},
		getDefaultValue:function(sourceValue,defaultValue){
			if(sourceValue==null || sourceValue == 'null' || !sourceValue || sourceValue==''){
				return defaultValue;
			}else{
				return sourceValue;
			}
		},
        
        // 查询
        equipNetQueryBtnClick: function() {
            this.getEquipData(1);
        },
	});
});