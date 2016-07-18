define([
'text!modules/isa/stoppage/operation/myWorkorderList/backOrder/templates/backOrder.html',
'i18n!modules/isa/stoppage/operation/myWorkorderList/backOrder/i18n/backOrder.i18n',
'modules/common/cloud-utils',
'css!modules/isa/stoppage/operation/myWorkorderList/backOrder/styles/backOrder.css'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		iniFromObj:new Object(),
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #isa_sto_ope_myw_bac_btn": "isa_sto_ope_myw_bac_btn"
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
            },

    		init:function(){

    			//获得静态数据
    			utils.ajax('isaCommonService','selStaticData').done(function(ret){
    				//退单原因
    				var faultBackReasonList = ret.faultBackReasonList;
    				$('#isa_sto_ope_myw_bac_fault_back_reason').combobox({
    					dataTextField: 'name',
    					dataValueField: 'value',
    					dataSource: faultBackReasonList
    				});
        		});
    		},
    		
    		_afterRender: function() {
    			iniFromObj = this.options;
    			iniFromObj = iniFromObj.rowMap;
    			
    			$('#isa_sto_ope_myw_bac_is_note_type').combobox({
    	            dataSource: [
    	                {"name": "短信", "value": "01"},
    	                {"name": "邮件", "value": "02"},
    	            ],
    	            value: "01",
    	            change: function (event) {
    	                var val = $('#isa_sto_ope_myw_bac_is_note_type').combobox("value");
    	            }
    	        });
    			document.getElementById('isa_sto_ope_myw_bac_is_note_type_div').style.display="none";
				document.getElementById('isa_sto_ope_myw_bac_note_content_div').style.display="none";
    			$(document).ready(function() {
    				$(".radioItem").change(function() {
    					var $selectedvalue = $("input[name='isa_sto_ope_myw_bac_is_note']:checked").val();
    					if ($selectedvalue == 1) {
    						document.getElementById('isa_sto_ope_myw_bac_is_note_type_div').style.display="block";
    						document.getElementById('isa_sto_ope_myw_bac_note_content_div').style.display="block";
    					} else {
    						document.getElementById('isa_sto_ope_myw_bac_is_note_type_div').style.display="none";
    						document.getElementById('isa_sto_ope_myw_bac_note_content_div').style.display="none";
    					}
    				});
    			});
    		},
    		
    		//提交
    		isa_sto_ope_myw_bac_btn:function(){
    			var result = $("#isa_sto_ope_myw_bac_from").isValid();
    			if(!result){
    				console.log(result);
    				return;
    			}
    			var me=this;
    			var $form2 = $('#isa_sto_ope_myw_bac_from').form('value');
    			iniFromObj.trackContent= $form2.isa_sto_ope_myw_bac_desc;//退单描述
    			iniFromObj.faultBackReason= $form2.isa_sto_ope_myw_bac_fault_back_reason;//退单原因
    			iniFromObj.isNote= $form2.isa_sto_ope_myw_bac_is_note;//是否发送通知
    			iniFromObj.sendType= $form2.isa_sto_ope_myw_bac_is_note_type;//通知方式
    			iniFromObj.content= $form2.isa_sto_ope_myw_bac_note_content;//通知内容
    			iniFromObj.staffPhone= currentUser.mobileTel;//电话
    			iniFromObj.orgId = currentJob.orgId;
    			iniFromObj.trackOrgName = currentJob.orgName;
    			iniFromObj.jobId = currentJob.jobId;
    			iniFromObj.staffId = currentUser.staffId;
    			iniFromObj.staffName = currentUser.staffName;
    			iniFromObj.actionStr = "backOrder";
    			iniFromObj.back_order = "Y";
    			iniFromObj.YYZY_GZCL_HFQR = "Y";
    			iniFromObj.state = 1;//通知状态有效
    			iniFromObj.extState = '70';//已退单
    			iniFromObj.operType = 4;//通知状态有效
    			iniFromObj.flag="N"
    			iniFromObj.currentTacheId = 56014000;//当前环节ID
    			iniFromObj.currentTacheCode = "YYGZ_PF";//当前环节代码
    			iniFromObj.currentTacheName = "派发";//当前环节名称
    			iniFromObj.msg ="["+currentUser.staffName+"]退回故障单："+iniFromObj.orderTitle+"["+iniFromObj.orderCode+"]";
    			//暂时使用线条控制，调用回单
    			//utils.ajax('isaOperationFaultService','backOrder',iniFromObj).done(function(re){
    			utils.ajax('isaOperationFaultService','finishAutoWorkOrder',iniFromObj).done(function(re){
    				if(re.flag == '0'){
    					fish.info('退单成功').result.always(function(){me.popup.close()});
    				}else{
    					console.log(e);
    					fish.error(e);
    				}
				});
    		},
    		
    		
    	});
    });