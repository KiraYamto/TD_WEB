define([
'text!modules/isa/stoppage/operation/myWorkorderList/transpond/templates/transpond.html',
'i18n!modules/isa/stoppage/operation/myWorkorderList/transpond/i18n/transpond.i18n',
'modules/common/cloud-utils',
'css!modules/isa/stoppage/operation/myWorkorderList/transpond/styles/transpond.css'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		iniFromObj:new Object(),
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #isa_sto_ope_myw_tra_btn": "isa_sto_ope_myw_tra_btn"
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
            },

    		init:function(){

    			//转派人
    			$('#isa_sto_ope_myw_tra_party_id').popedit({
    				dataTextField :'text',
    				dataValueField :'id',
    				dialogOption: {
    					height: 400,
    					width: 500,
    					viewOptions:{
        					title:'选择转派人',
        					orgId:currentJob.orgPathCode.split('.')[0]
        				},
    				},
    				//url:'js!modules/isa/stoppage/operation/myWorkorderList/views/StaffsbyOrgView',
    				url:'js!modules/common/popeditviews/stafforg/views/OrgJobStaffsByOrg',
    				showClearIcon:false
    			});
    			


    			//获得静态数据
    			utils.ajax('isaCommonService','selStaticData').done(function(ret){
    				//转派原因
    				var faultTransPondList = ret.faultTransPondList;
    				//转派原因
    				$('#isa_sto_ope_myw_tra_reason').combobox({
    					dataTextField: 'name',
    					dataValueField: 'value',
    					dataSource: faultTransPondList
    				});
        		});
    			
    			$('#isa_sto_ope_myw_tra_is_note_type').combobox({
    	            dataSource: [
    	                {"name": "短信", "value": "01"},
    	                {"name": "邮件", "value": "02"},
    	            ],
    	            value: "01",
    	            change: function (event) {
    	                var val = $('#isa_sto_ope_myw_tra_is_note_type').combobox("value");
    	            }
    	        });
    			
    		},
    		
    		_afterRender: function() {
    			iniFromObj = this.options;
    			iniFromObj = iniFromObj.rowMap;
    			
    			$(document).ready(function() {
    				$(".radioItem").change(function() {
    					var $selectedvalue = $("input[name='isa_sto_ope_myw_tra_is_note']:checked").val();
    					if ($selectedvalue == 1) {
    						document.getElementById('isa_sto_ope_myw_tra_is_note_type_div').style.display="block";
    						document.getElementById('isa_sto_ope_myw_tra_note_content_div').style.display="block";
    					} else {
    						document.getElementById('isa_sto_ope_myw_tra_is_note_type_div').style.display="none";
    						document.getElementById('isa_sto_ope_myw_tra_note_content_div').style.display="none";
    					}
    				});
    			});
    			
    		},
    		//提交
    		isa_sto_ope_myw_tra_btn:function(){
    			var result = $("#isa_sto_ope_myw_tra_from").isValid();
    			if(!result){
    				console.log(result);
    				return;
    			}
    			var me=this;
    			var $form2 = $('#isa_sto_ope_myw_tra_from').form('value');
    			var party= me.$('#isa_sto_ope_myw_tra_party_id').data('uiPopedit').getValue();//处理人
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
    			/*var partyId= $form2.isa_sto_ope_myw_tra_party_id;//处理人
    			iniFromObj.partyId= partyId;//处理人
    			iniFromObj.partyType= "STA";//接单人类型，ORG-组织 JOB-职位 DTY -班次STA-人员,定义见OA_PARTY_TYPE
*/    			
    			iniFromObj.transReasonId= $form2.isa_sto_ope_myw_tra_reason;//转派原因
    			iniFromObj.transDesc= $form2.isa_sto_ope_myw_tra_desc;//描述
    			iniFromObj.staffPhone= currentUser.mobileTel;//电话
    			iniFromObj.orgId = currentJob.orgId;
    			iniFromObj.orgName = currentJob.orgName;
    			iniFromObj.trackOrgName = currentJob.orgName;
    			iniFromObj.jobId = currentJob.jobId;
    			iniFromObj.staffId = currentUser.staffId;
    			iniFromObj.staffName = currentUser.staffName;
    			//var isNote= $form2.isa_sto_ope_myw_tra_is_note;//发送通知
    			var isNote= $("input[name='isa_sto_ope_myw_tra_is_note']:checked").val();//发送通知
    			if (typeof(isNote) == "undefined"||isNote =='undefined')
    			{
    				isNote = 0;
    			}
    			iniFromObj.isNote =isNote;
    			iniFromObj.noteContent= $form2.isa_sto_ope_myw_tra_note_content;//发送通知内容
    			iniFromObj.actionStr = "transpondWorkOrder";
    			iniFromObj.faultIsRecover = 0;//障碍是否恢复,0:未恢复 1:已恢复
    			iniFromObj.operType = "7";//操作类型
    			iniFromObj.msg ="["+currentUser.staffName+"]转派故障单："+iniFromObj.orderTitle+"["+iniFromObj.orderCode+"]";
    			//iniFromObj.extState = "10";//定单扩展状态
    			utils.ajax('isaOperationFaultService','transpondWorkOrder',iniFromObj).done(function(re){
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