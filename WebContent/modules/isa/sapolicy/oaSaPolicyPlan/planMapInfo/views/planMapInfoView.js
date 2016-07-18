define([
        
'text!modules/isa/sapolicy/oaSaPolicyPlan/planMapInfo/templates/planMapInfoView.html',
'i18n!modules/isa/sapolicy/oaSaPolicyPlan/planMapInfo/i18n/planMapInfo.i18n',
'modules/common/cloud-utils',
'css!modules/isa/sapolicy/oaSaPolicyPlan/planMapInfo/styles/planMapInfo.css'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		rowMap:new Object(),
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #isa_sap_oas_pla_pla_btn": "isa_sap_oas_pla_pla_btn"
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
            },

    		init:function(){
    			
    		},
    		
    		_afterRender: function() {
    			
    			var iniObj = this.options;
    			
    			rowMap = iniObj.rowMap;
    			var planType = rowMap.planType;
    			if(planType=="100"){
    				document.getElementById('isa_sap_oas_pla_pla_alert_value_div').style.display="none";//告警时限值
    				document.getElementById('isa_sap_oas_pla_pla_limit_value_div').style.display="none";//完成时限值
    				document.getElementById('isa_sap_oas_pla_pla_party_type_div').style.display="block";//执行人类型
    				document.getElementById('isa_sap_oas_pla_pla_party_div').style.display="block";//执行人
    			}else if(planType=="101"){
    				document.getElementById('isa_sap_oas_pla_pla_alert_value_div').style.display="block";//告警时限值
    				document.getElementById('isa_sap_oas_pla_pla_limit_value_div').style.display="block";//完成时限值
    				document.getElementById('isa_sap_oas_pla_pla_party_type_div').style.display="none";//执行人类型
    				document.getElementById('isa_sap_oas_pla_pla_party_div').style.display="none";//执行人
    			}else if(planType=="102"){
    				document.getElementById('isa_sap_oas_pla_pla_alert_value_div').style.display="block";//告警时限值
    				document.getElementById('isa_sap_oas_pla_pla_limit_value_div').style.display="block";//完成时限值
    				document.getElementById('isa_sap_oas_pla_pla_party_type_div').style.display="none";//执行人类型
    				document.getElementById('isa_sap_oas_pla_pla_party_div').style.display="none";//执行人
    			}
    			
    			document.getElementById("isa_sap_oas_pla_pla_plan_id").value=rowMap.planId;
    			utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanByPlanIdInfo',rowMap).done(function(ret){
    				//策略元素
    				var s;
    				var htmlStr = "";
    				for(var i=1;i<=10;i++){
    					var s =  'ele=ret.ele'+i+'Name';
    					var eleName = 'ele'+i+'Name'
    					var eledEv =  'eleId=ret.eled'+i;
    					var inputTypeEv =  'inputType=ret.inputType'+i;
						eval(eledEv);
						eval(inputTypeEv);
    					eval(s);
    					if (typeof(ele) != "undefined") {
    						htmlStr = htmlStr + "  <div class='col-md-12' >" +
								"<div class='form-group'>" +
									"<label class='col-md-2 control-label'><b>"+ele+"</b></label>" +
    								"<div class='col-md-8 input-group'>" +
    									"<input class='form-control' type='text' id='isa_sap_oas_pla_planMapInfoView_"+eleName+"' " +
    											"  name='isa_sap_oas_pla_planMapInfoView_"+eleName+"' />" +
    									"<input class='form-control' type='hidden' id='isa_sap_oas_pla_planMapInfoView_"+i+"' " +
    											"  name='isa_sap_oas_pla_planMapInfoView_"+i+"' value="+eleId+"  />" +
    									"<input class='form-control' type='hidden' id='isa_sap_oas_pla_planMapInfoView_inputType_"+i+"' " +
    											"  name='isa_sap_oas_pla_planMapInfoView_inputType_"+i+"' value="+inputType+"  />" +
    								"</div>" +
    								"<div class='col-md-2'></div>" +
								"</div>" +
							"</div>";
    					}
				    }
    				document.all["isa_sap_oas_pla_planMapInfoView_div"].innerHTML=htmlStr;
    				var eleNumber = 0;
    				for(var i=1;i<=10;i++){
    					var s =  'ele=ret.ele'+i+'Name';
    					var eleName = 'ele'+i+'Name'
    					eval(s);
    					if (typeof(ele) != "undefined") {
    						eleNumber++;
    						var inputTypeEv =  'inputType=ret.inputType'+i;
    						var eledEv =  'eleId=ret.eled'+i;
    						eval(inputTypeEv);
    						eval(eledEv);
    						
    						if(inputType == 2){
    							//获得下拉框数据
    							var eleMap = new Object();
    							eleMap.eleId = eleId;
    							if(eleName == "ele1Name"){
    								utils.ajax('isaOaSapolicySercice','selOaSaPolicyEleStaticData',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele1Name').combobox({
    										dataTextField: 'name',dataValueField: 'id',dataSource: ret
    									});
    								});
    							}else if(eleName == "ele2Name"){
    								utils.ajax('isaOaSapolicySercice','selOaSaPolicyEleStaticData',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele2Name').combobox({
    										dataTextField: 'name',dataValueField: 'id',dataSource: ret
    									});
    								});
    							}else if(eleName == "ele3Name"){
    								utils.ajax('isaOaSapolicySercice','selOaSaPolicyEleStaticData',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele3Name').combobox({
    										dataTextField: 'name',dataValueField: 'id',dataSource: ret
    									});
    								});
    							}else if(eleName == "ele4Name"){
    								utils.ajax('isaOaSapolicySercice','selOaSaPolicyEleStaticData',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele4Name').combobox({
    										dataTextField: 'name',dataValueField: 'id',dataSource: ret
    									});
    								});
    							}else if(eleName == "ele5Name"){
    								utils.ajax('isaOaSapolicySercice','selOaSaPolicyEleStaticData',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele5Name').combobox({
    										dataTextField: 'name',dataValueField: 'id',dataSource: ret
    									});
    								});
    							}else if(eleName == "ele6Name"){
    								utils.ajax('isaOaSapolicySercice','selOaSaPolicyEleStaticData',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele6Name').combobox({
    										dataTextField: 'name',dataValueField: 'id',dataSource: ret
    									});
    								});
    							}else if(eleName == "ele7Name"){
    								utils.ajax('isaOaSapolicySercice','selOaSaPolicyEleStaticData',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele7Name').combobox({
    										dataTextField: 'name',dataValueField: 'id',dataSource: ret
    									});
    								});
    							}else if(eleName == "ele8Name"){
    								utils.ajax('isaOaSapolicySercice','selOaSaPolicyEleStaticData',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele8Name').combobox({
    										dataTextField: 'name',dataValueField: 'id',dataSource: ret
    									});
    								});
    							}else if(eleName == "ele9Name"){
    								utils.ajax('isaOaSapolicySercice','selOaSaPolicyEleStaticData',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele9Name').combobox({
    										dataTextField: 'name',dataValueField: 'id',dataSource: ret
    									});
    								});
    							}else if(eleName == "ele10Name"){
    								utils.ajax('isaOaSapolicySercice','selOaSaPolicyEleStaticData',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele10Name').combobox({
    										dataTextField: 'name',dataValueField: 'id',dataSource: ret
    									});
    								});
    							}
    						}else if(inputTypeEv == 3){
    							var eleMap = new Object();
    							eleMap.eleId = eleId;
    							if(eleName == "ele1Name"){
    								utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanEleInfo',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele1Name').popedit({
    				    					dataTextField :'name',dataValueField :'id',
    				    					dialogOption: {
    				    						height: 400,width: 500,viewOptions:{title:ret.eleName,},
    				    					},
    				    					url:'js!'+ret.urlString,
    				    					showClearIcon:false
    				    				});
    								});
    							}else if(eleName == "ele2Name"){
    								utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanEleInfo',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele2Name').popedit({
    				    					dataTextField :'name',dataValueField :'id',
    				    					dialogOption: {
    				    						height: 400,width: 500,viewOptions:{title:ret.eleName,},
    				    					},
    				    					url:'js!'+ret.urlString,
    				    					showClearIcon:false
    				    				});
    								});
    							}else if(eleName == "ele3Name"){
    								utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanEleInfo',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele3Name').popedit({
    				    					dataTextField :'name',dataValueField :'id',
    				    					dialogOption: {
    				    						height: 400,width: 500,viewOptions:{title:ret.eleName,},
    				    					},
    				    					url:'js!'+ret.urlString,
    				    					showClearIcon:false
    				    				});
    								});
    							}else if(eleName == "ele4Name"){
    								utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanEleInfo',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele4Name').popedit({
    				    					dataTextField :'name',dataValueField :'id',
    				    					dialogOption: {
    				    						height: 400,width: 500,viewOptions:{title:ret.eleName,},
    				    					},
    				    					url:'js!'+ret.urlString,
    				    					showClearIcon:false
    				    				});
    								});
    							}else if(eleName == "ele5Name"){
    								utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanEleInfo',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele5Name').popedit({
    				    					dataTextField :'name',dataValueField :'id',
    				    					dialogOption: {
    				    						height: 400,width: 500,viewOptions:{title:ret.eleName,},
    				    					},
    				    					url:'js!'+ret.urlString,
    				    					showClearIcon:false
    				    				});
    								});
    							}else if(eleName == "ele6Name"){
    								utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanEleInfo',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele6Name').popedit({
    				    					dataTextField :'name',dataValueField :'id',
    				    					dialogOption: {
    				    						height: 400,width: 500,viewOptions:{title:ret.eleName,},
    				    					},
    				    					url:'js!'+ret.urlString,
    				    					showClearIcon:false
    				    				});
    								});
    							}else if(eleName == "ele7Name"){
    								utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanEleInfo',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele7Name').popedit({
    				    					dataTextField :'name',dataValueField :'id',
    				    					dialogOption: {
    				    						height: 400,width: 500,viewOptions:{title:ret.eleName,},
    				    					},
    				    					url:'js!'+ret.urlString,
    				    					showClearIcon:false
    				    				});
    								});
    							}else if(eleName == "ele8Name"){
    								utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanEleInfo',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele8Name').popedit({
    				    					dataTextField :'name',dataValueField :'id',
    				    					dialogOption: {
    				    						height: 400,width: 500,viewOptions:{title:ret.eleName,},
    				    					},
    				    					url:'js!'+ret.urlString,
    				    					showClearIcon:false
    				    				});
    								});
    							}else if(eleName == "ele9Name"){
    								utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanEleInfo',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele9Name').popedit({
    				    					dataTextField :'name',dataValueField :'id',
    				    					dialogOption: {
    				    						height: 400,width: 500,viewOptions:{title:ret.eleName,},
    				    					},
    				    					url:'js!'+ret.urlString,
    				    					showClearIcon:false
    				    				});
    								});
    							}else if(eleName == "ele10Name"){
    								utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanEleInfo',eleMap).done(function(ret){
    									$('#isa_sap_oas_pla_planMapInfoView_ele10Name').popedit({
    				    					dataTextField :'name',dataValueField :'id',
    				    					dialogOption: {
    				    						height: 400,width: 500,viewOptions:{title:ret.eleName,},
    				    					},
    				    					url:'js!'+ret.urlString,
    				    					showClearIcon:false
    				    				});
    								});
    							}
    						}
    					}
				    }
    				document.getElementById("isa_sap_oas_pla_pla_eleNumber").value=eleNumber;
    			});
    			
    			
    			$('#isa_sap_oas_pla_pla_party_type').combobox({
    	            dataSource: [
    	                {"name": "人员/职位/区域", "value": "STA"}
    	            ],
    	            value: "STA",
    	            change: function (event) {
    	                var val = $('#isa_sap_oas_pla_pla_party_type').combobox("value");
    	            }
    	        });
    			
    			//执行人
    			$('#isa_sap_oas_pla_pla_party').popedit({
    				dataTextField :'text',
    				dataValueField :'id',
    				dialogOption: {
    					height: 400,
    					width: 500,
    					viewOptions:{
        					title:'选择执行人',
        					orgId:currentJob.orgPathCode.split('.')[0],
        				},
    				},
    				url:'js!modules/common/popeditviews/stafforg/views/OrgJobStaffsByOrg',
    				showClearIcon:false
    			});
    			
    			
    			
    			rowMap.actionStr = "qryOaSaPolicyPlanByPlanIdInfo";
    			var planId = rowMap.planId;
    			var mapId = rowMap.mapId;
    			var areaId = rowMap.areaId;
    			document.getElementById("isa_sap_oas_pla_pla_area_id").value=rowMap.areaId;
    			document.getElementById("isa_sap_oas_pla_pla_area_name").value=rowMap.areaName;
    			//根据区域id查到区域名称
    			if (typeof(mapId) == "undefined") {
    				 
    			}else{
    				//查询详情
    				document.getElementById("isa_sap_oas_pla_pla_mapId").value=mapId;
        			utils.ajax('isaOaSapolicySercice','qryOaSaPolicyPlanByPlanIdInfo',rowMap).done(function(ret){
        				if (typeof(ret.tacheName) == "undefined") {
        					document.getElementById("isa_sap_oas_pla_tache").value="";
        				}else{
        					document.getElementById("isa_sap_oas_pla_tache").value=ret.tacheName;
        				}
        				
        				if (typeof(ret.planName) == "undefined") {
        					document.getElementById("isa_sap_oas_pla_plan_name").value="";
        				}else{
        					document.getElementById("isa_sap_oas_pla_plan_name").value=ret.planName;
        				}
        				
        				if (typeof(ret.priority) == "undefined") {
        					document.getElementById("isa_sap_oas_pla_priority").value="";
        				}else{
        					document.getElementById("isa_sap_oas_pla_priority").value=ret.priority;
        				}
        				//策略元素
        				var s;
        				var eles="[";
        				for(var i=1;i<=10;i++){
        					var s =  'ele=ret.ele'+i+'Name';
        					eval(s);
        					if (typeof(ele) != "undefined") {
        						if(i==1){
        							eles = eles+ele;
        						}else{
        							eles = eles+"+"+ele;
        						}
        					}
    				    }
        				eles = eles+"]";
        				if (eles == "[]") {
        					document.getElementById("isa_sap_oas_pla_ele").value="";
        				}else{
        					document.getElementById("isa_sap_oas_pla_ele").value=eles;
        				}
        				
        				$('#isa_sap_oas_pla_state').combobox('value',
            					typeof(ret.state) == 'undefined'? null:ret.state.toString());
        				
        				if (typeof(ret.memo) == "undefined") {
        					document.getElementById("isa_sap_oas_pla_memo").value="";
        				}else{
        					document.getElementById("isa_sap_oas_pla_memo").value=ret.memo;
        				}
            			
        			});
        			 document.getElementById("isa_sap_oas_pla_tache").setAttribute("readOnly",'true');
        			 document.getElementById("isa_sap_oas_pla_ele").setAttribute("readOnly",'true');
    			}
    		
    		},
    		isa_sap_oas_pla_pla_btn:function(){
    			var $form1 = $('#isa_sap_oas_pla_pla_plan_planMapInfoForm').form('value');
    			var map = new Object();
    			var me=this;
    			var planId = this.options.rowMap.planId;
    			var mapId = this.options.rowMap.mapId;
    			map.operId = currentUser.staffId;
    			map.operMan = currentUser.staffName;
    			map.planId=planId;
    			
    			map.memo=$form1.isa_sap_oas_pla_pla_memo;
    			map.alertValue=$form1.isa_sap_oas_pla_pla_alert_value;
    			map.limitValue=$form1.isa_sap_oas_pla_pla_limit_value;
    			if (typeof(mapId) == "undefined") {
    				var planType = rowMap.planType;
        			if(planType=="100"){
        				var party= me.$('#isa_sap_oas_pla_pla_party').data('uiPopedit').getValue();//处理人
            			if(party.type == 2){    //2为人员
            				map.partyType = 'STA';
            				map.partyId = party.id;
        				}else if(party.type == 1){  //1为职位
        					map.partyType = 'JOB';
        					map.partyId = party.id.split('_')[1];
        				}else {
        					map.partyType = 'ORG';    //0为组织
        					map.partyId = party.orgId;
        				}
            			map.partyName = party.text;
        			}else {
        				map.partyType = '';
        				map.partyName = '';
        				map.partyId ='-1'
        			}
        			map.state ="1";
    				
        			
        			var eleNumber = document.getElementById("isa_sap_oas_pla_pla_eleNumber").value;
        			if(eleNumber>0){
        				var inputType = document.getElementById("isa_sap_oas_pla_planMapInfoView_inputType_1").value;
        				if(inputType == 1){
        					map.eleVale1 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele1Name").value;
            				map.eleValeName1 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele1Name").value;
        				}else if(inputType == 2){
        					map.eleVale1 = $('#isa_sap_oas_pla_planMapInfoView_ele1Name').combobox('value');
        					map.eleValeName1 = $('#isa_sap_oas_pla_planMapInfoView_ele1Name').combobox('text');
        				}else if(inputType == 3){
        					var eleName= $('#isa_sap_oas_pla_planMapInfoView_ele1Name').data('uiPopedit').getValue();
        					map.eleVale1 = eleName.id;
        	    			map.eleValeName1 = eleName.name;
        				}
        			}
        			if(eleNumber>1){
        				var inputType = document.getElementById("isa_sap_oas_pla_planMapInfoView_inputType_2").value;
        				if(inputType == 1){
        					map.eleVale2 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele2Name").value;
            				map.eleValeName2 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele2Name").value;
        				}else if(inputType == 2){
        					map.eleVale2 = $('#isa_sap_oas_pla_planMapInfoView_ele2Name').combobox('value');
            				map.eleValeName2 = $('#isa_sap_oas_pla_planMapInfoView_ele2Name').combobox('text');
        				}else if(inputType == 3){
        					var eleName= $('#isa_sap_oas_pla_planMapInfoView_ele2Name').data('uiPopedit').getValue();
        					map.eleVale2 = eleName.id;
        	    			map.eleValeName2 = eleName.name;
        				}
        				
        			}
        			if(eleNumber>2){
        				var inputType = document.getElementById("isa_sap_oas_pla_planMapInfoView_inputType_3").value;
        				if(inputType == 1){
        					map.eleVale3 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele3Name").value;
            				map.eleValeName3 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele3Name").value;
        				}else if(inputType == 2){
        					map.eleVale3 = $('#isa_sap_oas_pla_planMapInfoView_ele3Name').combobox('value');
            				map.eleValeName3 = $('#isa_sap_oas_pla_planMapInfoView_ele3Name').combobox('text');
        				}else if(inputType == 3){
        					var eleName= $('#isa_sap_oas_pla_planMapInfoView_ele3Name').data('uiPopedit').getValue();
        					map.eleVale3 = eleName.id;
        	    			map.eleValeName3 = eleName.name;
        				}
        				
        			}
        			if(eleNumber>3){
        				var inputType = document.getElementById("isa_sap_oas_pla_planMapInfoView_inputType_4").value;
        				if(inputType == 1){
        					map.eleVale4 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele4Name").value;
            				map.eleValeName4 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele4Name").value;
        				}else if(inputType == 2){
        					map.eleVale4 = $('#isa_sap_oas_pla_planMapInfoView_ele4Name').combobox('value');
            				map.eleValeName4 = $('#isa_sap_oas_pla_planMapInfoView_ele4Name').combobox('text');
        				}else if(inputType == 3){
        					var eleName= $('#isa_sap_oas_pla_planMapInfoView_ele4Name').data('uiPopedit').getValue();
        					map.eleVale4 = eleName.id;
        	    			map.eleValeName4 = eleName.name;
        				}
        				
        			}
        			if(eleNumber>4){
        				var inputType = document.getElementById("isa_sap_oas_pla_planMapInfoView_inputType_5").value;
        				if(inputType == 1){
        					map.eleVale5 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele5Name").value;
            				map.eleValeName5 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele5Name").value;
        				}else if(inputType == 2){
        					map.eleVale5 = $('#isa_sap_oas_pla_planMapInfoView_ele5Name').combobox('value');
            				map.eleValeName5 = $('#isa_sap_oas_pla_planMapInfoView_ele5Name').combobox('text');
        				}else if(inputType == 3){
        					var eleName= $('#isa_sap_oas_pla_planMapInfoView_ele5Name').data('uiPopedit').getValue();
        					map.eleVale5 = eleName.id;
        	    			map.eleValeName5 = eleName.name;
        				}
        				
        			}
        			if(eleNumber>5){
        				var inputType = document.getElementById("isa_sap_oas_pla_planMapInfoView_inputType_6").value;
        				if(inputType == 1){
        					map.eleVale6 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele6Name").value;
            				map.eleValeName6 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele6Name").value;
        				}else if(inputType == 2){
        					map.eleVale6 = $('#isa_sap_oas_pla_planMapInfoView_ele6Name').combobox('value');
            				map.eleValeName6 = $('#isa_sap_oas_pla_planMapInfoView_ele6Name').combobox('text');
        				}else if(inputType == 3){
        					var eleName= $('#isa_sap_oas_pla_planMapInfoView_ele6Name').data('uiPopedit').getValue();
        					map.eleVale6 = eleName.id;
        	    			map.eleValeName6 = eleName.name;
        				}
        				
        			}
        			if(eleNumber>6){
        				var inputType = document.getElementById("isa_sap_oas_pla_planMapInfoView_inputType_7").value;
        				if(inputType == 1){
        					map.eleVale7 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele7Name").value;
            				map.eleValeName7 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele7Name").value;
        				}else if(inputType == 2){
        					map.eleVale7 = $('#isa_sap_oas_pla_planMapInfoView_ele7Name').combobox('value');
            				map.eleValeName7 = $('#isa_sap_oas_pla_planMapInfoView_ele7Name').combobox('text');
        				}else if(inputType == 3){
        					var eleName= $('#isa_sap_oas_pla_planMapInfoView_ele7Name').data('uiPopedit').getValue();
        					map.eleVale7 = eleName.id;
        	    			map.eleValeName7 = eleName.name;
        				}
        				
        			}
        			if(eleNumber>7){
        				var inputType = document.getElementById("isa_sap_oas_pla_planMapInfoView_inputType_8").value;
        				if(inputType == 1){
        					map.eleVale8 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele8Name").value;
            				map.eleValeName8 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele8Name").value;
        				}else if(inputType == 2){
        					map.eleVale8 = $('#isa_sap_oas_pla_planMapInfoView_ele8Name').combobox('value');
            				map.eleValeName8 = $('#isa_sap_oas_pla_planMapInfoView_ele8Name').combobox('text');
        				}else if(inputType == 3){
        					var eleName= $('#isa_sap_oas_pla_planMapInfoView_ele8Name').data('uiPopedit').getValue();
        					map.eleVale8 = eleName.id;
        	    			map.eleValeName8 = eleName.name;
        				}
        				
        			}
        			if(eleNumber>8){
        				var inputType = document.getElementById("isa_sap_oas_pla_planMapInfoView_inputType_9").value;
        				if(inputType == 1){
        					map.eleVale9 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele9Name").value;
            				map.eleValeName9 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele9Name").value;
        				}else if(inputType == 2){
        					map.eleVale9 = $('#isa_sap_oas_pla_planMapInfoView_ele9Name').combobox('value');
            				map.eleValeName9 = $('#isa_sap_oas_pla_planMapInfoView_ele9Name').combobox('text');
        				}else if(inputType == 3){
        					var eleName= $('#isa_sap_oas_pla_planMapInfoView_ele9Name').data('uiPopedit').getValue();
        					map.eleVale9 = eleName.id;
        	    			map.eleValeName9 = eleName.name;
        				}
        				
        			}
        			if(eleNumber>9){
        				var inputType = document.getElementById("isa_sap_oas_pla_planMapInfoView_inputType_10").value;
        				if(inputType == 1){
        					map.eleVale10 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele10Name").value;
            				map.eleValeName10 = document.getElementById("isa_sap_oas_pla_planMapInfoView_ele10Name").value;
        				}else if(inputType == 2){
        					map.eleVale10 = $('#isa_sap_oas_pla_planMapInfoView_ele10Name').combobox('value');
            				map.eleValeName10 = $('#isa_sap_oas_pla_planMapInfoView_ele10Name').combobox('text');
        				}else if(inputType == 3){
        					var eleName= $('#isa_sap_oas_pla_planMapInfoView_ele10Name').data('uiPopedit').getValue();
        					map.eleVale10 = eleName.id;
        	    			map.eleValeName10 = eleName.name;
        				}
        				
        			}
        			
					
					utils.ajax('isaOaSapolicySercice','insertOaSaPolicyPlanMap',map).done(function(re){
	    				if(re.flag > 0){
	    					fish.info('添加成功').result.always(function(){me.popup.close()});
	    				}else{
	    					console.log("添加失败");
	    					fish.error("添加失败");
	    				}
					});
					
    			}else{
    				map.planId =planId;
    				utils.ajax('isaOaSapolicySercice','updateOaSaPolicyPlanByPlanId',map).done(function(re){
	    				if(re.flag > 0){
	    					fish.info('保存编辑成功').result.always(function(){me.popup.close()});
	    				}else{
	    					console.log("保存编辑失败");
	    					fish.error("保存编辑失败");
	    				}
					});
    			}
    		},
    	});
    });