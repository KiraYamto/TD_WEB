define([
'text!modules/isa/stoppage/operation/myWorkorderList/finishAutoWorkOrder/templates/knowledgeFromView.html',
'i18n!modules/isa/stoppage/operation/myWorkorderList/finishAutoWorkOrder/i18n/finishAutoWorkOrder.i18n',
'modules/common/cloud-utils',
'css!modules/isa/stoppage/operation/myWorkorderList/finishAutoWorkOrder/styles/finishAutoWorkOrder.css'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		iniFromObj:new Object(),
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #isa_sto_ope_myw_fin_from_btn": "isa_sto_ope_myw_fin_from_btn"
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
            },

    		init:function(){

    			//审核人
    			$('#isa_sto_ope_myw_fin_from_partyName').popedit({
    				dataTextField :'text',
    				dataValueField :'id',
    				dialogOption: {
    					height: 400,
    					width: 500,
    					viewOptions:{
        					title:'选择审核人',
        					orgId:currentJob.orgPathCode.split('.')[0]
        				},
    				},
    				//url:'js!modules/isa/stoppage/operation/myWorkorderList/views/StaffsbyOrgView',
    				url:'js!modules/common/popeditviews/stafforg/views/OrgJobStaffsByOrg',
    				showClearIcon:false
    			});
    		},
    		
    		_afterRender: function() {
    			iniFromObj = this.options;
    			iniFromObj = iniFromObj.map;
    			document.getElementById("isa_sto_ope_myw_fin_from_staffName").value=currentUser.staffName;
    			//获得静态数据
    			utils.ajax('isaCommonService','selStaticData').done(function(ret){
    				
    				//故障分类
    				var faultPhenomenaDtoList = ret.faultPhenomenaDtoList;
    				//产品分类
    				var faultKindDtoList = ret.faultKindDtoList;
    				//目录
    				var knowledgeDocCatalogList = ret.knowledgeDocCatalogList;
    				
    				
    				//故障分类
    				$('#isa_sto_ope_myw_fee_from_phenomena').combobox({
    			        dataTextField: 'name',
    			        dataValueField: 'value',
    			        dataSource: faultPhenomenaDtoList,
    			    });
    				
    				//查询产品类型
    				$('#isa_sto_ope_myw_fee_from_kind').combobox({
    			        dataTextField: 'name',
    			        dataValueField: 'value',
    			        dataSource: faultKindDtoList,
    			    });
    				
    				//目录
    				$('#isa_sto_ope_myw_fee_from_doc_catalog').combobox({
    					dataTextField: 'name',
    					dataValueField: 'value',
    					editable : 'false',
    					dataSource: knowledgeDocCatalogList,
    				});
    				$('#isa_sto_ope_myw_fee_from_doc_catalog').combobox('value', '1');
        		});
    			
    		},
    		//提交
    		isa_sto_ope_myw_fin_from_btn:function(){
    			var result = $("#isa_sto_ope_myw_fin_from_knowledgeForm").isValid();
    			if(!result){
    				console.log(result);
    				return;
    			}
    			var me=this;
    			var $form2 = $('#isa_sto_ope_myw_fin_from_knowledgeForm').form('value');
    			iniFromObj.partyName= me.$('#isa_sto_ope_myw_fin_from_partyName').data('uiPopedit').getValue().text;//审核人
    			iniFromObj.partyId= $form2.isa_sto_ope_myw_fin_from_partyName;//审核人
    			iniFromObj.partyType= "STA";//接单人类型，ORG-组织 JOB-职位 DTY -班次STA-人员,定义见OA_PARTY_TYPE
    			
    			iniFromObj.faultKindId= $form2.isa_sto_ope_myw_fee_from_kind;//产品分类：
    			iniFromObj.faultPhenomenaId= $form2.isa_sto_ope_myw_fee_from_phenomena;//故障分类
    			iniFromObj.title= $form2.isa_sto_ope_myw_fee_from_title;//文档标题
    			iniFromObj.docCatalog= $form2.isa_sto_ope_myw_fee_from_doc_catalog;//目录
    			iniFromObj.keyCode= $form2.isa_sto_ope_myw_fee_from_keyCode;//摘要
    			iniFromObj.knowledgeContent= $form2.isa_sto_ope_myw_fee_from_knowledgeContent;//经验
    			iniFromObj.actionStr = "finishAutoWorkOrder";
    			utils.ajax('isaOperationFaultService','finishAutoWorkOrder',iniFromObj).done(function(re){
					 if(re.flag == '0'){
						 fish.info('回单成功').result.always(function(){me.popup.close()});
					 }else{
						 console.log(re);
						 fish.error("操作失败").result.always(function(){me.popup.close()});
					 }
				 });
    		},
    		
    		
    	});
    });