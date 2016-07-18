define([
	'text!modules/idcrm/ipaddrm/iprm/templates/CustView.html',
	'i18n!modules/idcrm/ipaddrm/iprm/i18n/agency.i18n',
	'modules/common/cloud-utils',
	'css!modules/idcrm/ipaddrm/iprm/styles/ipAddr.css'
], function(frameViewTpl, i18nEquip,utils, css) {
	return fish.View.extend({
		template: fish.compile(frameViewTpl),
		i18nData: fish.extend({}, i18nEquip),
		events: {
            "click #ipmage-cust-more-btn": "custMoreBtnClick",
            "click #ipmage-cust-query-btn": "custQueryBtnClick",
            "click #ipmage-cust-save-button": "custSaveBtnClick"
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
			this.getCustData(1);
		},
		loadStaticData:function(){
			var self = this;
			$("input[attrCode]").each(function(o){
				$this = $(this);
				var attrCode = $this.attr("attrCode");
				self.renderSelect($this,attrCode);				
			})
		},
		renderSelect:function(o,attrCode){
			utils.ajax('basicDataService', 'getBasicDataListByBasicType',attrCode).done(function(ret){				
				//if(ret){
                	//for(var key in ret ){
                	//	var basicDataDto = ret[key];
                	//	html+="<option value='"+basicDataDto.code+"'>"+basicDataDto.value+"</option>";
                	//}
					o.combobox({
    					placeholder: '--请选择--',
    					dataValueField:'code',
    					dataTextField: 'value',
    					dataSource: ret
    				});    			
                //}	
				//o.append($(html));
            });
		},
		loadEquipRender: function() {
			var self =this;
			this.$("#ipmage_cust-grid").grid({
				datatype: "json",
				width:'100%',
				height: 450,
				colModel: [{
                    name: 'id',
                    label: 'ID',
                    key:true,
                    width: 80,
                    hidden:false
                },{
                	name: 'custType',
                    label: '客户类型id',
                    width: 100,
                    hidden:true
                },{
                	name: 'custGradeId',
                    label: '客户等级id',
                    width: 100,
                    hidden:true
                },{
                	name: 'custName',
                    label: '客户名称',
                    width: 100,
                    hidden:false
                },{
                	name: 'custCode',
                    label: '客户编码',
                    width: 150,
                    hidden:false
                },{
                	name: 'custTypeName',
                    label: '客户类型',
                    width: 100,
                    hidden:false
                },{
                	name: 'custGradeName',
                    label: '客户等级',
                    width: 100,
                    hidden:false
                },{
					name: 'lindName',
					label: '联系人',
					width: 100
				}, {
					name: 'lindMobile',
					width: 100,
					label: '联系方式'
				} ],
				rowNum: 10,
                multiselect: true,
                shrinkToFit: true,
                rownumbers:true,
                pager: true,
				server: true,
                recordtext: "当前显示 {0} - {1} 条记录 共 {2} 条记录",
                pgtext: "第 {0} 页 / 共 {1} 页",
                emptyrecords: "没有记录",
				pageData: this.getCustData, //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
				gridComplete:function(){
					
				}
			});
			
			
		},
		getCustData:  function(page, sortname, sortorder) { //请求服务器获取数据的方法
			var rowNum = this.$("#ipmage_cust-grid").grid("getGridParam", "rowNum");

            // 查询的时候 锁定页面
            if ($('#ipmage_cust-grid').data('blockui-content')) {
                $('#ipmage_cust-grid').unblockUI().data('blockui-content', false);
            } else {
                $('#ipmage_cust-grid').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }           
            var custName = $("#ipmage_cust_name").val();
            var custCode = $("#ipmage_cust_code").val();
            var custType = $("#ipmage_cust_type").val();
            var custGradeId = $("#ipmage_cust_grade_id").val();
            var cond = [];
            cond.push({op:"LIKE",name:"custName",value:custName});
            cond.push({op:"LIKE",name:"custCode",value:custCode});
            cond.push({op:"EQUALS",name:"custType",value:custType});
            cond.push({op:"EQUALS",name:"custGradeId",value:custGradeId});
            var queryParamsDto ={};
            queryParamsDto["pageIdx"]=page;
            queryParamsDto["pageSize"]=rowNum;
            queryParamsDto["conditions"]=cond;
			utils.ajax('custService', 'findCustListByCond', queryParamsDto).done(function(ret){

                $("#ipmage_cust-grid").grid("reloadData", ret);

                // 解锁页面
                $('#ipmage_cust-grid').unblockUI().data('blockui-content', false);

            });

		}, 
        //资源详情
		custResoureBtnClick: function() {
			
			var selectedFrameIds = $("#ipmage_cust-grid").grid('getGridParam', 'selarrrow');
            if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                fish.info("请选择一项数据！");
                return;
            }

            if(selectedFrameIds.length > 1) {
                fish.info("一次只能查询一个客户占用资源信息！");
                return;
            }
            var selectedFrame = $("#ipmage_cust-grid").grid("getRowData", selectedFrameIds[0])
			
            var pop =fish.popupView({url: 'modules/idcrm/cust/views/CustResDetail',
                width: "80%",
                height: "90%",
                callback:function(popup,view){
                    popup.result.then(function (e) {
                        alert("e=" + e);
                    },function (e) {
                        console.log('关闭了',e);
                    });
                },
            	viewOption:{custDto:selectedFrame}
            });
        },
        // 查询
        custQueryBtnClick: function() {
            this.getCustData(1);
        },        
        custMoreBtnClick: function() {
        	$("#cust_more_div").toggle();
        	if($("#cust-more-btn").html()=='更多查询'){
        		$("#cust-more-btn").html("收起查询条件");
        	}else{
        		$("#cust-more-btn").html("更多查询");
        	}
        },
        //选择客户
        custSaveBtnClick: function() {
        	var selectedFrameIds = $("#ipmage_cust-grid").grid('getGridParam', 'selarrrow');
            if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                fish.info("请选择一项数据！");
                return;
            }

            if(selectedFrameIds.length > 1) {
                fish.info("一次只能选择一条数据！");
                return;
            }
            var selectedFrame = $("#ipmage_cust-grid").grid("getRowData", selectedFrameIds[0]);
            var popup = this.popup;
            popup.close(selectedFrame);
        }
	});
});