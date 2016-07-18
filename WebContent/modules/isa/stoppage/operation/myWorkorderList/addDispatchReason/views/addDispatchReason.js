define([
'text!modules/isa/stoppage/operation/myWorkorderList/addDispatchReason/templates/addDispatchReason.html',
'i18n!modules/isa/stoppage/operation/myWorkorderList/addDispatchReason/i18n/addDispatchReason.i18n',
'modules/common/cloud-utils',
'css!modules/isa/stoppage/operation/myWorkorderList/addDispatchReason/styles/addDispatchReason.css'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		iniFromObj:new Object(),
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #isa_sto_ope_myw_add_btn": "isa_sto_ope_myw_add_btn"
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
            },

    		init:function(){

    			
    			//处理人员
    			$('#isa_sto_ope_myw_add_party_id').popedit({
    				dataTextField :'text',
    				dataValueField :'id',
    				dialogOption: {
    					height: 400,
    					width: 500,
//    					width: '45%',
    					viewOptions:{
        					title:'选择处理人',
        					orgId:currentJob.orgPathCode.split('.')[0]
        				},
    				},
    				
					url:'js!modules/common/popeditviews/stafforg/views/OrgJobStaffsByOrgMuti',
    				showClearIcon:false
    			});
    			
    			


    			//获得静态数据
    			utils.ajax('isaCommonService','selStaticData').done(function(ret){
    				
    				//加派原因
    				var faultAddDispatchReasonList = ret.faultAddDispatchReasonList;
    				
    				//加派原因
    				$('#isa_sto_ope_myw_add_reason').combobox({
    					dataTextField: 'name',
    					dataValueField: 'value',
    					dataSource: faultAddDispatchReasonList
    				});
        		});
    			
    			$('#isa_sto_ope_myw_add_is_note_type').combobox({
    	            dataSource: [
    	                {"name": "短信", "value": "01"},
    	                {"name": "邮件", "value": "02"},
    	            ],
    	            value: "01",
    	            change: function (event) {
    	                var val = $('#isa_sto_ope_myw_add_is_note_type').combobox("value");
    	            }
    	        });
    			
    			
    		},
    		
    		_afterRender: function() {
    			iniFromObj = this.options;
    			iniFromObj = iniFromObj.rowMap;
    			
    			$(document).ready(function() {
    				$(".radioItem").change(function() {
    					var $selectedvalue = $("input[name='isa_sto_ope_myw_add_is_note']:checked").val();
    					if ($selectedvalue == 1) {
    						document.getElementById('isa_sto_ope_myw_add_is_note_type_div').style.display="block";
    						document.getElementById('isa_sto_ope_myw_add_note_content_div').style.display="block";
    					} else {
    						document.getElementById('isa_sto_ope_myw_add_is_note_type_div').style.display="none";
    						document.getElementById('isa_sto_ope_myw_add_note_content_div').style.display="none";
    					}
    				});
    			});
    			
    			
    		},
    		//提交
    		isa_sto_ope_myw_add_btn:function(){
    			var result = $("#isa_sto_ope_myw_add_from").isValid();
    			if(!result){
    				console.log(result);
    				return;
    			}
    			var me=this;
    			var $form2 = $('#isa_sto_ope_myw_add_from').form('value');
				//加派信息
    			var partyData= $('#isa_sto_ope_myw_add_party_id').data('uiPopedit').getValue();//处理人
    			var id=partyData.id;
    			var partyIds=new Array();
    			var partyNames=new Array();
    			var partyTypes=new Array();
    			for(var i=0;i<id.length;i++){
    				if(partyData.type[i] == 2){    //2为人员
    					partyTypes[i] = 'STA';
    					partyIds[i]= id[i]+"";
    				}else if(partyData.type[i] == 1){  //1为职位
    					partyTypes[i]= 'JOB';
    					partyIds[i]= id[i].split('_')[1];
    				}else {
    					partyTypes[i] = 'ORG';    //0为组织
    					partyIds[i]= id[i];
    				}
    				partyNames[i]= partyData.text[i];
    			}
    			iniFromObj.partyTypes=partyTypes;
    			iniFromObj.partyIds=partyIds;
    			iniFromObj.partyNames=partyNames;

				
				
    			iniFromObj.transReasonId= $form2.isa_sto_ope_myw_add_reason;//转派原因
    			iniFromObj.addDispatchReasonId= $form2.isa_sto_ope_myw_add_reason;//加派原因
    			iniFromObj.transDesc= $form2.isa_sto_ope_myw_add_desc;//描述
    			iniFromObj.trackContent= $form2.isa_sto_ope_myw_add_desc;//描述
    			iniFromObj.staffPhone= currentUser.mobileTel;//电话
    			iniFromObj.orgId = currentJob.orgId;
    			iniFromObj.orgName = currentJob.orgName;
    			iniFromObj.trackOrgName = currentJob.orgName;
    			iniFromObj.jobId = currentJob.jobId;
    			iniFromObj.staffId = currentUser.staffId;
    			iniFromObj.staffName = currentUser.staffName;
    			var isNote= $("input[name='isa_sto_ope_myw_add_is_note']:checked").val();//发送通知
    			if (typeof(isNote) == "undefined"||isNote =='undefined')
    			{
    				isNote = 0;
    			}
    			iniFromObj.isNote =isNote;
    			iniFromObj.noteContent= $form2.isa_sto_ope_myw_add_note_content;//发送通知内容
    			iniFromObj.actionStr = "addDispatchReason";
    			iniFromObj.faultIsRecover = 0;//障碍是否恢复,0:未恢复 1:已恢复
    			iniFromObj.operType = 1;//派发
    			iniFromObj.extState = "10";//定单扩展状态
    			iniFromObj.operType = "7";//操作类型
    			iniFromObj.msg ="["+currentUser.staffName+"]加派故障单："+iniFromObj.orderTitle+"["+iniFromObj.orderCode+"]";
    			utils.ajax('isaOperationFaultService','addDispatchReason',iniFromObj).done(function(re){
    				if(re.flag == '0'){
    					fish.info('派发成功').result.always(function(){me.popup.close()});
    				}else{
    					console.log(e);
    					fish.error(e);
    				}
				}).fail(function(e){
					console.log(e);
					fish.error(e);
				});
    		},
    		
    		
    	});
    });