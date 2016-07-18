define([
'text!modules/isa/stoppage/operation/myWorkorderList/distribute/templates/distributeFromView.html',
'i18n!modules/isa/stoppage/operation/myWorkorderList/distribute/i18n/distribute.i18n',
'modules/common/cloud-utils',
'css!modules/isa/stoppage/operation/myWorkorderList/distribute/styles/distributemanagement.css'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		iniFromObj:new Object(),
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #isa_sto_ope_myw_dis_payout_from__btn": "isa_sto_ope_myw_dis_payout_from__btn",
    			"click #sumbitBtn": "test"
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
            },

    		init:function(){

    			//抄送人
    			$('#isa_sto_ope_myw_dis_copy_staff_id,#isa_sto_ope_myw_dis_from_party_id').popedit({
    				dataTextField :'text',
    				dataValueField :'id',
    				dialogOption: {
    					height: 400,
    					width: 500,
    					viewOptions:{
        					title:'选择处理人',
        					orgId:currentJob.orgPathCode.split('.')[0]
        				},
    				},
    				//url:'js!modules/isa/stoppage/operation/myWorkorderList/views/StaffsbyOrgView',
    				url:'js!modules/common/popeditviews/stafforg/views/OrgJobStaffsByOrg',
    				showClearIcon:false
    			});
    			$('#isa_sto_ope_myw_dis_note_type').combobox({
    	            dataSource: [
    	                {"name": "短信", "value": "01"},
    	                {"name": "邮件", "value": "02"},
    	            ],
    	            value: "01",
    	            change: function (event) {
    	                var val = $('#isa_sto_ope_myw_dis_note_type').combobox("value");
    	            }
    	        });
    			
    			$("#isa_sto_ope_myw_dis_acceptDate").datetimepicker("disable");
    			
    			
    		},
    		
    		_afterRender: function() {
    			iniFromObj = this.options;
    			iniFromObj = iniFromObj.map;
    			$("#isa_sto_ope_myw_dis_limit_finish_time").datetimepicker({
    	            format: 'yyyy/mm/dd hh:ii:ss'
    	        });
    			
    			
    			$(document).ready(function() {
    				$(".radioItem").change(function() {
    					var $selectedvalue = $("input[name='isa_sto_ope_myw_dis_is_note']:checked").val();
    					if ($selectedvalue == 1) {
    						document.getElementById('isa_sto_ope_myw_dis_note_type_div').style.display="block";
    						document.getElementById('isa_sto_ope_myw_dis_note_content_div').style.display="block";
    					} else {
    						document.getElementById('isa_sto_ope_myw_dis_note_type_div').style.display="none";
    						document.getElementById('isa_sto_ope_myw_dis_note_content_div').style.display="none";
    					}
    				});
    			});
    			document.getElementById('isa_sto_ope_myw_dis_note_type_div').style.display="none";
    			document.getElementById('isa_sto_ope_myw_dis_note_content_div').style.display="none";
    		},
    		//提交
    		isa_sto_ope_myw_dis_payout_from__btn:function(){
    			var result = $("#isa_sto_ope_myw_dis_from_distributeForm").isValid();
    			if(!result){
    				console.log(result);
    				return;
    			}
    			var me=this;
    			var $form2 = $('#isa_sto_ope_myw_dis_from_distributeForm').form('value');
    			var party= me.$('#isa_sto_ope_myw_dis_from_party_id').data('uiPopedit').getValue();//接单人
    			
    			if(party.type == 2){    //2为人员
					iniFromObj.partyType = 'STA';
					iniFromObj.partyId = party.id;
				}else if(party.type == 1){  //1为职位
					iniFromObj.partyType = 'JOB';
					iniFromObj.partyId = party.id.split('_')[1];
				}else {
					iniFromObj.partyType = 'ORG';    //0为组织
					iniFromObj.partyId = party.orgId;
				}
				iniFromObj.partyName = party.text;
				
    			
				var copyStaff= me.$('#isa_sto_ope_myw_dis_copy_staff_id').data('uiPopedit').getValue();//抄送人
				if (typeof(copyStaff) != "undefined") {
					if(copyStaff.type == 2){    //2为人员
						iniFromObj.copyStaffType = 'STA';
						iniFromObj.copyStaffId = copyStaff.id;
					}else if(copyStaff.type == 1){  //1为职位
						iniFromObj.copyStaffType = 'JOB';
						iniFromObj.copyStaffId = copyStaff.id.split('_')[1];
					}else {
						iniFromObj.copyStaffType = 'ORG';    //0为组织
						iniFromObj.copyStaffId = copyStaff.orgId;
					}
					iniFromObj.copyStaffName = copyStaff.text;
				}else{
					iniFromObj.copyStaffType = '';
					iniFromObj.copyStaffId = 0;
				}
    			iniFromObj.limitFinishTime= $form2.isa_sto_ope_myw_dis_limit_finish_time;//要求完成时间
    			var isNote= $form2.isa_sto_ope_myw_dis_is_note;//发送通知
    			if (typeof(isNote) == "undefined"||isNote =='undefined')
    			{
    				isNote = 0;
    			}
    			iniFromObj.isNote =isNote;
    			iniFromObj.sendType= $form2.isa_sto_ope_myw_dis_note_type;//通知方式
    			iniFromObj.noteContent= $form2.isa_sto_ope_myw_dis_note_content;//发送通知内容
    			iniFromObj.actionStr = "distributeWorkOrder";
    			iniFromObj.faultIsRecover = 0;//障碍是否恢复,0:未恢复 1:已恢复
    			iniFromObj.operType = 1;//派发
    			iniFromObj.currentTacheId = 56014001;//当前环节ID
    			iniFromObj.currentTacheCode = "YYGZ_CL";//当前环节代码
    			iniFromObj.currentTacheName = "障碍处理";//当前环节名称
    		
    			iniFromObj.extState = "10";//定单扩展状态
    			utils.ajax('isaOperationFaultService','distributeWorkOrder',iniFromObj).done(function(re){
    				if(re.flag == '0'){
    					fish.info('派发成功').result.always(function(){me.popup.close()});
    				}else{
    					console.log(e);
    					fish.error(e);
    				}
				});
    		},
    		
    		
    	});
    });