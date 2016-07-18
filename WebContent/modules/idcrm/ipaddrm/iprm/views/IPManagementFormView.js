define([
    	'text!modules/idcrm/ipaddrm/iprm/templates/IPManagementForm.html',
    	'i18n!modules/idcrm/ipaddrm/iprm/i18n/agency.i18n',
    	'modules/common/cloud-utils',
    	'css!modules/idcrm/ipaddrm/iprm/styles/ipAddr.css'
    ], function(AgencyMenegementViewTpl, i18nAgency,utils) {
    	return fish.View.extend({
    		template: fish.compile(AgencyMenegementViewTpl),
    		i18nData: fish.extend({}, i18nAgency),
    		events: {
                "click #ipaddr-mod-btn": "ipaddrModBtnClick",
                "click #ipaddr-del-btn": "ipaddrDelBtnClick",
                "click #ipaddr-export-btn": "ipaddrExportBtnClick",
                "click #ipaddr-qry-btn":"ipaddrQryBtnClick",
                "click #ipaddr-cust-btn":"ipaddrCustBtnClick",
                "click #ipaddr-keep-btn":"ipaddrKeepBtnClick",
                "click #ipaddr-rel-btn":"ipaddrRelBtnClick"
    		},
    		//这里用来进行dom操作
    		_render: function() {
    			this.$el.html(this.template(this.i18nData));
    			return this;
    		},

    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
    			this.loadStaticData();
    			this.loadEquipRender();
    			this.getEquipData(1);
    		},
            
            loadEquipRender: function() {
    			this.$("#ipaddr-grid").grid({
    				datatype: "json",
    				height: 400,
    				colModel: [{
                        name: 'ID',
                        label: 'ID',
                        key:true,
                        hidden:true
                    },{
    					name: 'iPName',
    					label: '地址名称',
    					width: 100,
    					hidden:true
    				},
    				{
    					name: 'segmId',
    					label: '上级地址段ID',
    					width: 100,
    					hidden:true
    				},
    				{
    					name: 'areaId',
    					label: '所属区域',
    					width: 100,
    					hidden:true
    				},
    				{
    					name: 'iPMark',
    					label: '掩码',
    					width: 100,
    					hidden:true
    				},
    				{
    					name: 'subnet',
    					label: '子网',
    					width: 100,
    					hidden:true
    				},
    				{
    					name: 'gateway',
    					label: '网关',
    					width: 100,
    					hidden:true
    				},
    				{
    					name: 'serviceTypeId',
    					label: '业务类型',
    					width: 100,
    					hidden:true
    				},
    				{
    					name: 'iPTyep',
    					label: '地址性质',
    					width: 100,
    					hidden:true
    				},
    				{
    					name: 'iPUse',
    					label: '地址用途',
    					width: 100,
    					hidden:true
    				},
    				{
    					name: 'useState',
    					label: '占用状态',
    					width: 100,
    					hidden:true
    				},{
    					name: 'Version',
    					label: 'iPVersion',
    					width: 100,
    					hidden:true
    				},{
    					name: 'description',
    					label: '描述',
    					width: 100,
    					hidden:true
    				},{
    					name: 'rsTypeId',
    					label: '资源类型ID',
    					width: 100,
    					hidden:true
    				},
                    {
    					name: 'iPCode',
    					label: 'IP地址',
    					width: 100
    				}, {
    					name: 'segmCode',
    					width: 100,
    					label: '所属地址段'
    				}, 
    				/**
    				{
    					name: 'roomName',
    					label: '所属机房',
    					width: 100
    				},
    				*/
    				{
    					name: 'dcName',
    					label: '所属数据中心',
    					width: 100
    				},
    				{
    					name: 'useStateName',
    					width: 100,
    					label: '业务状态'
    				}, {
                        name: 'custName',
                        width: 100,
                        label: '关联客户'
                    }, {
                        name: 'cirCode',
                        width: 100,
                        label: '关联客户设备'
                    }, {
                        name: 'openOrderId',
                        width: 60,
                        label: '业务单号'
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
    		loadStaticData:function(){
    			var self = this;
    			$("input[attrCode]").each(function(o){
    				$this = $(this);
    				var attrCode = $this.attr("attrCode");    				
    				self.renderSelect($this,attrCode);
    			});
    		},
    		renderSelect:function(o,attrCode){
    			$.ajaxSetup({   
    	            async : false  
    	        }); 
    			
    			utils.ajax('basicDataService', 'getBasicDataListByBasicType',attrCode).done(function(ret){
    				/**
    				var html="<option value=''>--请选择--</option>";
    				if(ret){
                    	for(var key in ret ){
                    		var basicDataDto = ret[key];
                    		html+="<option value='"+basicDataDto.code+"'>"+basicDataDto.value+"</option>";
                    	}
                    }
    				o.empty();
    				o.append($(html));
    				 */
    				o.combobox({
    					placeholder: '--请选择--',
    					dataValueField:'code',
    					dataTextField: 'value',
    					dataSource: ret
    				});
                });
               
    			
    			$.ajaxSetup({   
    	            async : true  
    	        }); 
    		},
            getEquipData:  function(page, sortname, sortorder) {
            	var me = this;
    			var segmId = me.options.segmId;
    			var ret = $('#ip-addr-query-cond').form('value')||{};
    			if(typeof(segmId) == "undefined"){
    				segmId = ret.ID;
    			}
            	var rowNum = $("#ipaddr-grid").grid("getGridParam", "rowNum");
                // 查询的时候 锁定页面
                if ($('#ipaddr-grid').data('blockui-content')) {
                    $('#ipaddr-grid').unblockUI().data('blockui-content', false);
                } else {
                    $('#ipaddr-grid').blockUI({
                        message: '加载中......'
                    }).data('blockui-content', true);
                }
                var queryParamsDto ={};
                queryParamsDto["pageIdx"]=page;
                queryParamsDto["pageSize"]=rowNum;
    			utils.ajax('ipaddrservice', 'findIPAddrListByCond', queryParamsDto,segmId).done(function(ret){
                    $("#ipaddr-grid").grid("reloadData", ret);

                    // 解锁页面
                    $('#ipaddr-grid').unblockUI().data('blockui-content', false);

                });
            },
            
            // 修改
            ipaddrModBtnClick: function() {
                var reloadIpAddrData= $.proxy(this.getEquipData,this);//reloadEquipData
                var selectedIpAddrIds = $("#ipaddr-grid").grid('getGridParam', 'selarrrow');
                if (selectedIpAddrIds == null || selectedIpAddrIds.length == 0) {
                    fish.info("请选择一项数据！");
                    return;
                }
                if(selectedIpAddrIds.length > 1) {
                    fish.info("一次只能修改一条数据！");
                    return;
                }
                
                var selectedFrame = $("#ipaddr-grid").grid("getRowData", selectedIpAddrIds[0]);
                var pop =fish.popupView({url: 'modules/idcrm/ipaddrm/iprm/views/IPAddrModFormView',
                    width: "80%",
                    callback:function(popup,view){
                    	console.log(selectedFrame);
                        var selectedIPFrame = $("#ipaddr-grid").grid("getRowData", selectedIpAddrIds[0]);
                        view.$el.find("#ip-addr-info-form").form("value", selectedIPFrame);
                        popup.result.then(function (e) {
                        	reloadIpAddrData(1);
                        },function (e) {
                            console.log('关闭了',e);
                        });
                    }
                });
            },
            ipaddrQryBtnClick: function() {
                this.getIpAddrData(1);
            },
            getIpAddrData:function(page, sortname, sortorder){
            	var me = this;
    			var segmId = me.options.segmId;
    			var ret = $('#ip-addr-query-cond').form('value')||{};
    			if(typeof(segmId) == "undefined"){
    				segmId = ret.ID;
    			}
    			ret.segmId = segmId;
            	var rowNum = $("#ipaddr-grid").grid("getGridParam", "rowNum");
                // 查询的时候 锁定页面
                if ($('#ipaddr-grid').data('blockui-content')) {
                    $('#ipaddr-grid').unblockUI().data('blockui-content', false);
                } else {
                    $('#ipaddr-grid').blockUI({
                        message: '加载中......'
                    }).data('blockui-content', true);
                }
                /**
                var queryParamsDto ={};
                queryParamsDto["pageIdx"]=page;
                queryParamsDto["pageSize"]=rowNum;
                */
                ret.pageIdx=page;
                ret.pageSize=rowNum;
                ret.useState = ret.ipAddrUseState;
                if($.trim(ret.custName)==""){
                	ret.custCode = "";
                }
    			utils.ajax('ipaddrservice', 'findIPAddrList', ret).done(function(ret){
                    $("#ipaddr-grid").grid("reloadData", ret);

                    // 解锁页面
                    $('#ipaddr-grid').unblockUI().data('blockui-content', false);

                });
            },
            ipaddrCustBtnClick:function(){
            	var self = this;
            	var pop =fish.popupView({url: 'modules/idcrm/common/custchoose/views/CustView',
                    width: "80%",
                    callback:function(popup,view){
                        popup.result.then(function (e) {
                        	self.$el.find("#ip_addr_custcode").val(e.custCode);
                         	self.$el.find("#ip_addr_custname").val(e.custName);
                        },function (e) {
                            console.log('关闭了',e);
                        });
                    },
                });
            },
            ipaddrDelBtnClick:function() {
                var reloadIpAddrData = $.proxy(this.getEquipData,this);
                fish.confirm('是否删除所选记录？').result.then(function() {
                    var selectedIpIds = $("#ipaddr-grid").grid('getGridParam', 'selarrrow');
                    if (selectedIpIds == null || selectedIpIds.length == 0) {
                        fish.info("请至少选择一条记录！");
                        return;
                    }
                    for (var i=0;i<selectedIpIds.length;i++){
                		var selectedIp = $("#ipaddr-grid").grid("getRowData",selectedIpIds[i]);
                		if(selectedIp.useState != '102001'){
                			fish.info("非空闲状态的记录不能删除！");
                			return;
                		}
                	}
                    var delIpAddr = [];
                    for(var i in selectedIpIds){
                    	delIpAddr.push({"id":selectedIpIds[i]});
                    }
                    utils.ajax('ipaddrservice', 'deleteIpAddr', delIpAddr).done(function(ret){
                        if(ret>0) {
                            fish.info("操作成功！");
                            reloadIpAddrData(1);
                        } else {
                            fish.info("操作失败，请稍后再试！");
                        }
                    });
                });
            },
            ipaddrKeepBtnClick:function() {
            	var self = this;
            	var selectedIpAddrs = $("#ipaddr-grid").grid('getGridParam', 'selarrrow');
                if (selectedIpAddrs == null || selectedIpAddrs.length == 0) {
                    fish.info("请至少选择一条记录！");
                    return;
                }
                for (var i=0;i<selectedIpAddrs.length;i++){
            		var selectedFrame = $("#ipaddr-grid").grid("getRowData",selectedIpAddrs[i]);
            		if(selectedFrame.useState != '102001'){
            			fish.info("请选择空闲状态的记录进行操作！");
            			return;
            		}
            	}
                var selectedIpAddr = [];
                for(var i in selectedIpAddrs){
                	selectedIpAddr.push({"id":selectedIpAddrs[i]});
                }
            	var reloadIpSegmentData = $.proxy(this.getIpSegmentData,this);
                var pop =fish.popupView({url: 'modules/idcrm/ipaddrm/iprm/views/IPAddrKeepView',
                    width: "80%",
                    callback:function(popup,view){
                        popup.result.then(function (e) {
                        	self.getEquipData(1);
                        },function (e) {
                            console.log('关闭了',e);
                        });
                    },
                viewOption:{selectedIpAddrs:selectedIpAddr}
                });
            },
            ipaddrRelBtnClick:function() {
            	var self = this;
            	var selectedIpAddrs = $("#ipaddr-grid").grid('getGridParam', 'selarrrow');
                if (selectedIpAddrs == null || selectedIpAddrs.length == 0) {
                    fish.info("请至少选择一条记录！");
                    return;
                }
                for (var i=0;i<selectedIpAddrs.length;i++){
            		var selectedFrame = $("#ipaddr-grid").grid("getRowData",selectedIpAddrs[i]);
            		if(selectedFrame.useState == '102001'){
            			fish.info("所选记录不需要释放！");
            			return;
            		}
            		if(selectedFrame.useState != '102006'){
            			fish.info("只有保留状态的记录才能释放！");
            			return;
            		}
  	          }
                var selectedIpAddr = [];
                for(var i in selectedIpAddrs){
                	selectedIpAddr.push({"id":selectedIpAddrs[i]});
                }
                fish.confirm('是否释放所选资源？').result.then(function() {
                	utils.ajax('ipaddrservice','relIPRsCusResRelation',selectedIpAddr).done(function(){
                        fish.info('释放成功');
                        self.getEquipData(1);
                        popup.close(ret);
                	}).fail(function(e){
                        fish.error(e);
                    });
                });
            }
    	});
});
