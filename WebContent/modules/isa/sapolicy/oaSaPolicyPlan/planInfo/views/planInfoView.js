define([
'text!modules/isa/sapolicy/oaSaPolicyPlan/planInfo/templates/planInfoView.html',
'i18n!modules/isa/sapolicy/oaSaPolicyPlan/i18n/oaSaPolicyPlan.i18n',
'modules/common/cloud-utils',
'css!modules/isa/sapolicy/oaSaPolicyPlan/styles/oaSaPolicyPlan.css'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		rowMap:new Object(),
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #isa_sap_oas_pla_btn": "isa_sap_oas_pla_btn"
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
            },

    		init:function(){

    			
    		},
    		
    		_afterRender: function() {
    			
    			var iniObj = this.options;
    			
    			rowMap = iniObj.rowMap;
    			rowMap.actionStr = "qryOaSaPolicyPlanByPlanIdInfo";
    			var planId = rowMap.planId;
    			var areaId = rowMap.areaId;
    			//根据区域id查到区域名称
    			document.getElementById("isa_sap_oas_pla_area_id").value=rowMap.areaId;
    			document.getElementById("isa_sap_oas_pla_area_name").value=rowMap.areaName;
    			if (typeof(planId) == "undefined") {
    				$('#isa_sap_oas_pla_tache').popedit({
    					dataTextField :'tacheNames',
    					dataValueField :'ids',
    					dialogOption: {
    						height: 400,
    						width: 500,
    						viewOptions:{
    	    					title:'选择适用环节',
    	    				},
    					},
    					url:'js!modules/isa/tache/tacheSel/views/tacheSel',
    					showClearIcon:false
    				});
    				$('#isa_sap_oas_pla_ele').popedit({
    					dataTextField :'eleNames',
    					dataValueField :'eleIds',
    					dialogOption: {
    						height: 400,
    						width: 600,
    						viewOptions:{
    							title:'选择策略元素',
    						},
    					},
    					url:'js!modules/isa/sapolicy/oaSaPolicyEleSel/views/oaSaPolicyEleSel',
    					showClearIcon:false
    				});
    			}else{
    				//查询详情
    				document.getElementById("isa_sap_oas_pla_plan_id").value=planId;
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
    		isa_sap_oas_pla_btn:function(){
    			//校验
    			if (!$('#isa_sap_oas_pla_planInfoForm').isValid()) { 
    				return;
    			}
    			var $form1 = $('#isa_sap_oas_pla_planInfoForm').form('value');
    			var map = new Object();
    			var me=this;
    			var planId = this.options.rowMap.planId;
    			map.planType = this.options.rowMap.planType;
    			map.operId = currentUser.staffId;
    			map.operMan = currentUser.staffName;
    			map.state=$form1.isa_sap_oas_pla_state;
    			map.planName=$form1.isa_sap_oas_pla_plan_name;
    			
				map.areaId=$form1.isa_sap_oas_pla_area_id;
    			map.areaName=$form1.isa_sap_oas_pla_area_name;
    			map.priority=$form1.isa_sap_oas_pla_priority;
    			map.memo=$form1.isa_sap_oas_pla_memo;
    			if (typeof(planId) == "undefined") {
    				var tache= me.$('#isa_sap_oas_pla_tache').data('uiPopedit').getValue();//环节
    				var tacheId = tache.ids;
    				var tacheIds=null;
    				var tacheName = tache.tacheNames;
    				var tacheNames=null;
    				for(var i=0;i<tacheId.length;i++){
    					if(i == 0 ){
    						tacheIds=tacheId[i]+"";
        					tacheNames=tacheName[i]+"";
    					}else{
    						tacheIds=tacheIds+","+tacheId[i]+"";
    						tacheNames=tacheNames+","+tacheName[i]+"";
    					}
    				}
    				map.tacheId = tacheIds;
    				map.tacheName = tacheNames;
    				var alleleIds = $form1.isa_sap_oas_pla_ele;
					//eleIds = alleleIds.split(',');
					
					if(alleleIds.length>=1){
						map.ele1 =  alleleIds[0] ;
					}else{
						map.ele1 = -1;
					}
					if(alleleIds.length>=2){ 
						map.ele2 =  alleleIds[1] ;
					}else{
						map.ele2 = -1;
					}
					if(alleleIds.length>=3){
						map.ele3 =  alleleIds[2] ;
					}else{
						map.ele3 = -1;
					}
					if(alleleIds.length>=4){
						map.ele4 =  alleleIds[3] ;
					}else{
						map.ele4 = -1;
					}
					if(alleleIds.length>=5){
						map.ele5 =  alleleIds[4] ;
					}else{
						map.ele5 = -1;
					}
					if(alleleIds.length>=6){
						map.ele6 =  alleleIds[5] ;
					}else{
						map.ele6 = -1;
					}
					if(alleleIds.length>=7){
						map.ele7 =  alleleIds[6] ;
					}else{
						map.ele7 = -1;
					}
					if(alleleIds.length>=8){
						map.ele8 =  alleleIds[7] ;
					}else{
						map.ele8 = -1;
					}
					if(alleleIds.length>=9){
						map.ele9 =  alleleIds[8] ;
					}else{
						map.ele9 = -1;
					}
					if(alleleIds.length>=10){
						map.ele10 =  alleleIds[9] ;
					}else{
						map.ele10 = -1;
					}
					
					utils.ajax('isaOaSapolicySercice','insertOaSaPolicyPlan',map).done(function(re){
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