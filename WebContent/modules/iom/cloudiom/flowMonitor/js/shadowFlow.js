var ModifyOrder = function(){
    var Panel = Ext.Panel;
	var FormPanel =Ext.form.FormPanel;
	var FieldSet = Ext.form.FieldSet;	
    var autoWrapFunction = function rendererFunction(value,cellmeta){cellmeta.attr='style="white-space:normal;"';return  value;};
   return {
	 reloadData:function(){
			//重新加载变更前和变更后的数据 
			dataMask.show();
			  Ext.defer(function(){
				var param_value = [];
				var param_obj = {};
				param_obj["queryType"]="old";
				param_obj["dispatchOrderId"] = obj_data["objData"]["dispatchOrderId"];
				param_obj["staffId"] = obj_data["staffId"];
				param_obj["jobId"] = obj_data["jobId"];
				param_obj["orgId"] = obj_data["orgId"];
				param_obj["teacheIds"] = obj_data["tacheIds"].join(",");
				param_value.push(param_obj);
				//var temp_data = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryChangOrder",false,Ext.encode(param_value));
				var temp_data;
				if(obj_data.isHisRecord && obj_data.isHisRecord!='undefined' && obj_data.isHisRecord==1){
					temp_data = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationHisManage","qryChangOrder",false,Ext.encode(param_value));
				}else{
					temp_data = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationManage","qryChangOrder",false,Ext.encode(param_value));
				}
				Ext.getCmp("changeBeforeResource").getStore().loadData(temp_data);
				param_obj["queryType"]="orgin";
				//var temp_data2 = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryChangOrder",false,Ext.encode(param_value));
				var temp_data2;
				if(obj_data.isHisRecord && obj_data.isHisRecord!='undefined' && obj_data.isHisRecord==1){
					temp_data2 = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationHisManage","qryChangOrder",false,Ext.encode(param_value));
				}else{
					temp_data2 = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationManage","qryChangOrder",false,Ext.encode(param_value));
				}
				
				Ext.getCmp("changeAfterResource").getStore().loadData(temp_data2);	
				var sendDepart = null;
				if(obj_data.isHisRecord && obj_data.isHisRecord!='undefined' && obj_data.isHisRecord==1){
					sendDepart=callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BandCopyOrderManager","getDispDepart4DispForHisTable",false,omOrderId,obdj.dispatchOrderId);
				}else{
					sendDepart=callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BandCopyOrderManager","getDispDepart4Disp",false,omOrderId,obdj.dispatchOrderId);
				}
				if((obj_data.isHisRecord && obj_data.isHisRecord!='undefined' && obj_data.isHisRecord==1)||
						temp_data2.length ==0){
					Ext.getCmp('saveChangeRoute').hide();
				}else{
					Ext.getCmp('saveChangeRoute').show();
				}
				if(sendDepart){
				   Ext.getCmp("dispatchDepart").setValue(sendDepart);
				}
				dataMask.hide();
			 },10);
	  },
     viewCircuitInfo:function(){
        var record = Ext.getCmp('changeBeforeResource').getSelectionModel().getSelected();
         if(record == null || record == 'undefined' ){
            Ext.Msg.alert('提示','请选择一条记录！');
            return;
         }
         var field_array = record.fields;
         var circuitId = null;
		 var oldCircuitId = null;
         for(var i=0;i<field_array.length;i++){
              circuitId = record.get('circuitId');
			  oldCircuitId = record.get('oldCircuitId');
         }
        var param_value = [];
        var param_obj = {};
        param_obj["queryType"]="old";
        param_obj["dispatchOrderId"] = obj_data["objData"]["dispatchOrderId"];
        param_obj["circuitId"] = oldCircuitId;
		param_obj["changeCircuitId"] = circuitId;
        param_obj["staffId"] = obj_data["staffId"];
        param_obj["jobId"] = obj_data["jobId"];
        param_obj["orgId"] = obj_data["orgId"];
        param_obj["teacheIds"] = obj_data["tacheIds"].join(",");
        param_value.push(param_obj);
        var url = "/IOMPROJ/ext/bj/band/network/viewCircuitInfo.jsp";
       //var temp_data = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryAllChangeRouteInfo",false,Ext.encode(param_value));
	    var temp_data;
		if(obj_data.isHisRecord && obj_data.isHisRecord!='undefined' && obj_data.isHisRecord==1){
			temp_data = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationHisManage","qryAllChangeRouteInfo",false,Ext.encode(param_value));
		}else{
			temp_data = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationManage","qryAllChangeRouteInfo",false,Ext.encode(param_value));
		}
	    
        var features="dialogHeight:350px;dialogWidth:1024px;";
        var returnValue = window.showModalDialog(url,temp_data,features);
	 },
	 modifyDate:function(){
		 var record = Ext.getCmp('changeBeforeResource').getSelectionModel().getSelected();
		 if(record == null || record == 'undefined'){
			Ext.Msg.alert('提示','请选择一条记录！');
			return;
		 }
         var field_array = record.fields;
         var obj_temp = {};
         for(var i=0;i<field_array.length;i++){
              obj_temp[field_array.get(i).name] = record.get(field_array.get(i).name);
         }
		 //param_obj["dispatchOrderId"] = obj_data["objData"]["dispatchOrderId"];
		 obj_temp.dispatchOrderId = obj_data["objData"]["dispatchOrderId"];
		 //add by lijianxian 变更时间是否可操作
		  var canModiifyDate = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.ControlRuleManage","canOperChgTimeBtn",false,obj_temp.dispatchOrderId,obj_temp.oldCircuitId);
		  if(canModiifyDate == false || canModiifyDate == 'false'){
			 Ext.Msg.alert('<%=getI18NResource("bandCommon.tips")%>','只有网调调单、主调单对应的变更单才能进行变更时间操作！');
			 return;
		  }
		 //end add by lijianxian
		 var url = "/IOMPROJ/ext/bj/band/network/ModifyDate.jsp";
		 var features="dialogHeight:470px;dialogWidth:1324px;";
		 obj_temp.menuType = menuType;
		 var returnValue = window.showModalDialog(url,obj_temp,features);
		//重新加载变更前和变更后的数据 
		dataMask.show();
		 Ext.defer(function(){
			 var param_value = [];
			var param_obj = {};
			param_obj["queryType"]="old";
			param_obj["dispatchOrderId"] = obj_data["objData"]["dispatchOrderId"];
			param_obj["staffId"] = obj_data["staffId"];
			param_obj["jobId"] = obj_data["jobId"];
			param_obj["orgId"] = obj_data["orgId"];
			param_obj["teacheIds"] = obj_data["tacheIds"].join(",");
			param_value.push(param_obj);
			//var temp_data = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryChangOrder",false,Ext.encode(param_value));
			var temp_data = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationManage","qryChangOrder",false,Ext.encode(param_value));
			Ext.getCmp("changeBeforeResource").getStore().loadData(temp_data);
			param_obj["queryType"]="orgin";
			//var temp_data2 = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryChangOrder",false,Ext.encode(param_value));
			var temp_data2 = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationManage","qryChangOrder",false,Ext.encode(param_value));
			Ext.getCmp("changeAfterResource").getStore().loadData(temp_data2);
			 dataMask.hide();
		 },10);
	 },
	 modifyDateBatch:function(){//add by li.guoyang
		 var obj_temp = {};
		 obj_temp.dispatchOrderId = obj_data["objData"]["dispatchOrderId"];
		 
		 var url = "/IOMPROJ/ext/bj/band/network/ModifyDateBatch.jsp";
		 var features="dialogHeight:470px;dialogWidth:1324px;";
		 obj_temp.menuType = menuType;
		 //打开批量修改时间的页面
		 var returnValue = window.showModalDialog(url,obj_temp,features);
		//重新加载变更前和变更后的数据 
		dataMask.show();
		 Ext.defer(function(){
			 var param_value = [];
			var param_obj = {};
			param_obj["queryType"]="old";
			param_obj["dispatchOrderId"] = obj_data["objData"]["dispatchOrderId"];
			param_obj["staffId"] = obj_data["staffId"];
			param_obj["jobId"] = obj_data["jobId"];
			param_obj["orgId"] = obj_data["orgId"];
			param_obj["teacheIds"] = obj_data["tacheIds"].join(",");
			param_value.push(param_obj);
			//var temp_data = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryChangOrder",false,Ext.encode(param_value));
			var temp_data = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationManage","qryChangOrder",false,Ext.encode(param_value));
			Ext.getCmp("changeBeforeResource").getStore().loadData(temp_data);
			param_obj["queryType"]="orgin";
			//var temp_data2 = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryChangOrder",false,Ext.encode(param_value));
			var temp_data2 = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationManage","qryChangOrder",false,Ext.encode(param_value));
			Ext.getCmp("changeAfterResource").getStore().loadData(temp_data2);
			 dataMask.hide();
		 },10);
	 },
	 cancelRoute:function(){
	    var gridPanel = Ext.getCmp("changeBeforeResource");        
		var selectModel = gridPanel.getSelectionModel();
		var record_array = selectModel.getSelections();
		if(record_array.length == 0){
			 Ext.Msg.alert('<%=getI18NResource("bandCommon.tips")%>','请选择电路单');
			 return false;
		 }
		var circuitId;
		var oldCircuitId;
		for (var i = 0; i < record_array.length; i++) {
			circuitId = record_array[i].get("circuitId");
			oldCircuitId = record_array[i].get("oldCircuitId");
		}
		 //add by lijianxian 变更路由按钮是否可用
		 var canCancelRoute = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.ControlRuleManage","canOperCancelBtn",false,oldCircuitId);
		 if(canCancelRoute == false || canCancelRoute == 'false'){
			Ext.Msg.alert('<%=getI18NResource("bandCommon.tips")%>','电路已经停开（注销）、全程调通，非网调调单当前电路不是追加的传输通道的均不能进行注销操作！');
			return;
		}
		 //end add by lijianxian
		 //Ext.Msg.alert('提示','注销电路业务逻辑待开发！');
		 var resInterfaceInDTO = new Object();
		 var circuitIds = new Array();
		 circuitIds[0] = circuitId;
		  resInterfaceInDTO.dispatchId = obj_data["objData"]["dispatchOrderId"];
		  resInterfaceInDTO.circuitIds = circuitIds;
		  resInterfaceInDTO.staffId =  session.staff.staffId;
		  resInterfaceInDTO.areaId = session.area.areaId;
		  var cancelRes = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationManage","cancelCircuitOrder",true,resInterfaceInDTO,'cancelCircuitOrder');
		  if(cancelRes == true || cancelRes == 'true'){
			Ext.Msg.alert('<%=getI18NResource("bandCommon.tips")%>','电路注销成功！');
		  }
	 },
	 modifyCircuitInfo:function(){
				var gridPanel = Ext.getCmp("changeBeforeResource");        
	            var selectModel = gridPanel.getSelectionModel();
				var record_array = selectModel.getSelections();
				if(record_array.length == 0){
                     Ext.Msg.alert('<%=getI18NResource("bandCommon.tips")%>','请选择电路单');
					 return false;
			     }
				var circuitId;
				var oldCircuitId;
				var bcCode;
				for (var i = 0; i < record_array.length; i++) {
					circuitId = record_array[i].get("circuitId");
					oldCircuitId = record_array[i].get("oldCircuitId");
					bcCode = record_array[i].get("bcCode");
				}

				//add by lijianxian 变更路由按钮是否可用
				var canModifyCircuitInfo = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.ControlRuleManage","canOperRouteBtn",false,win["objData"]["dispatchOrderId"] ,oldCircuitId);
				if(canModifyCircuitInfo == false || canModifyCircuitInfo == 'false'){
					Ext.Msg.alert('<%=getI18NResource("bandCommon.tips")%>','电路已经停开（注销）、全程调通、关闭电路或者没有做过资源配置均不能变更路由！');
					return;
				}
				//end add by lijianxian
				
				
				//added by zhu.zhancai   date: 2013-8-2 
				/*var flag =  callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.OrderManager","isOrShowModifyRoute",false,circuitId);
				
				if(flag == 'false')
				{
					Ext.Msg.alert('<%=getI18NResource("bandCommon.tips")%>','原单没有配置资源，不能变更路由');
					return;
				}*/
				  //del by feng.zhanbing date:20130603 ur:104479 变更路由
//              //alert(circuitId);
//              var url = "/IOMPROJ/ext/bj/band/network/resRouteList.jsp";
//              temp_data = callRemoteFunction("com.ztesoft.oss.bj.res.bl.ResRouteService","configCircuit",false,circuitId);
//              temp_data[0].operateType = '异常变更';
//              temp_data[0].circuitId = circuitId;
//              temp_data[0].circuiId = circuitId;
//              var features="dialogHeight:450px;dialogWidth:750px;";
//              var returnValue = window.showModalDialog(url,temp_data[0],features);
                
                //add by feng.zhanbing date:20130603 ur:104479 变更路由 begin
                var features="dialogHeight:"+450+"px;dialogWidth:"+750+"px;";
             var staffId =  win["staffId"];
             //var specType = win.specType;
			 var specType = win["objData"]["specType"] ;
             var areaId = session.area.areaId;
             var menuType = win.menuType;
             var dispatchOrderId = win["objData"]["dispatchOrderId"] ;
             //查询产品编码
             //var proType=callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryProType",false, dispatchOrderId,menuType);
			 var circuitData =  callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.InnerOrderManager","getCircuitInfoByBcCode",false,bcCode);
             var reqMsg = new Object();
             reqMsg.circuitId = circuitId;
			 reqMsg.bcId = circuitData[0].bcId;
             reqMsg.OrderId = null;//这个功能确认传空
             reqMsg.dispatchOrderId = dispatchOrderId;
             reqMsg.jobId = session.job.jobId;
             reqMsg.orgId = session.org.orgId;
             reqMsg.staffId = session.staff.staffId;
             var oldDispatchOrderId = null;
             try {
                oldDispatchOrderId = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.OrderManager","qryOldCircuitId",false,circuitId);  
             } catch(e){
             }
             if(oldDispatchOrderId != null){
                 reqMsg.oldDispatchOrderId = oldDispatchOrderId;
                 OpenShowDlg('/IOMPROJ/ext/bj/band/jumpBcConfigMain_New.jsp', 450,750,reqMsg); 
                //重新加载变更前和变更后的数据 
                var param_value = [];
                var param_obj = {};
                param_obj["queryType"]="old";
                param_obj["dispatchOrderId"] = obj_data["objData"]["dispatchOrderId"];
                param_obj["staffId"] = obj_data["staffId"];
                param_obj["jobId"] = obj_data["jobId"];
                param_obj["orgId"] = obj_data["orgId"];
                param_obj["teacheIds"] = obj_data["tacheIds"].join(",");
                param_value.push(param_obj);
                //var temp_data = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryChangOrder",false,Ext.encode(param_value));
				var temp_data = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationManage","qryChangOrder",false,Ext.encode(param_value));
                Ext.getCmp("changeBeforeResource").getStore().loadData(temp_data);
                param_obj["queryType"]="orgin";
                //var temp_data2 = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryChangOrder",false,Ext.encode(param_value));
				var temp_data2 = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationManage","qryChangOrder",false,Ext.encode(param_value));
                Ext.getCmp("changeAfterResource").getStore().loadData(temp_data2);
                
             }else{
                Ext.Msg.alert('<%=getI18NResource("bandCommon.tips")%>','该电路没有旧电路');
             }
             ModifyOrder.refreshButtons();
             //add by feng.zhanbing date:20130603 ur:104479 变更路由 end 
	 },
	 refreshButtons:function(){
	 	var toolbar = Ext.getCmp('pagingToolbar');
	 	if(toolbar){
	 		//Add by seniorliu 2013.10.14 start
	 		if(win && win.web && win.web == 'exceptionMonitor'){
	 			toolbar.add({
					text : '导出Excel',
					style : 'btn_toolbar',
					inputType : 'button',
					click : daoexcel
				});
	 		}else{
	 			toolbar.removeAll();
	 			var buttons = ModifyOrder.getButtons();
	 			toolbar.add(buttons);

	 		for (var i = 0; i < buttons.length; i++) {

				if (buttons[i].querySql != null
						&& ("" + buttons[i].querySql) == "true") {// 根据配置的sql过滤按钮或者修改按钮状态

	
					var obj = callRemoteFunction(
							"com.ztesoft.oss.bj.local.band.bl.BaseNetManager",
							"exeSqlCheckBtn", false, buttons[i].id,
							buttons[i].tacheId, buttons[i].workOrderId);
					if (obj[0].state != null) {
						if (obj[0].state.replace(/(^\s*)|(\s*$)/g, "")
								.toLowerCase().indexOf("disable") > -1) {
							toolbar.setDisabled("" + buttons[i].id, true);
						}
						if (obj[0].state.replace(/(^\s*)|(\s*$)/g, "")
								.toLowerCase().indexOf("hide") > -1) {
							toolbar.remove(buttons[i].id);
						}
						if (obj[0].state.replace(/(^\s*)|(\s*$)/g, "")
								.toLowerCase().indexOf("tips") > -1) {
							if (obj[0].tips != null) {
								Ext.getCmp('tipsLabel').el.dom.innerHTML = obj[0].tips;
								Ext.getCmp('tipsLabel').show();
							} else {
								Ext.getCmp('tipsLabel').hide();
							}
						}
					}
				}
			}
			}//Add by seniorliu 2013.10.14 end
	 	}
	 	
	 },
	 callback:function(){
				var temp = {};
				var param = {};
				var obj_value = [];
				var obj = new Object();
				var dispatchId=""+obj_data["objData"]["dispatchOrderId"];
				var objData;
				if(obj_data.isHisRecord && obj_data.isHisRecord!='undefined' && obj_data.isHisRecord==1){
					objData=callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","queryWorkOrderInfoForHisTable",false,dispatchId);
				}else{
					objData=callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","queryWorkOrderInfo",false,dispatchId);
				}
				
				var obj_dae=eval(objData)[0];
				var isSHowOldDis = false;
				for(var id in obj_dae){
					  if("dispatchOrderNO"==id || "dispatchOrderNo"==id){
						  temp.id = "dispatchOrderNo";
						  temp.value = obj_dae["dispatchOrderNO"];
					  }else{
						  temp.id = id;
						  temp.value = obj_dae[id];
					  }
					  if(obj_dae["oldDispatchNo"] && obj_dae["oldDispatchNo"] != ''){
					  	isSHowOldDis = true;
					  }
					   obj_value.push(temp);
					   temp = {};
				}
				if(isSHowOldDis && Ext.getCmp('oldDispatchNo')){
					Ext.getCmp('oldDispatchNo').show();
				}
				
				//temp = {};
				//temp.id = 'remark';
				//temp.value = obj_dae.body;
				//obj_value.push(temp);
        	    obj.data = obj_value;
				Ext.getCmp("resourceFormPanel").getForm().loadRecord(obj); 
				
				var param_value = [];
				var param_obj = {};
				param_obj["queryType"]="old";
				param_obj["dispatchOrderId"] = obj_data["objData"]["dispatchOrderId"];
				param_obj["staffId"] = obj_data["staffId"];
				param_obj["jobId"] = obj_data["jobId"];
				param_obj["orgId"] = obj_data["orgId"];
				param_obj["teacheIds"] = obj_data["tacheIds"].join(",");
				param_value.push(param_obj);
				//var temp_data = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryChangOrder",false,Ext.encode(param_value));
				var temp_data;
				if(obj_data.isHisRecord && obj_data.isHisRecord!='undefined' && obj_data.isHisRecord==1){
					temp_data = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationHisManage","qryChangOrder",false,Ext.encode(param_value));
				}else{
					temp_data = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationManage","qryChangOrder",false,Ext.encode(param_value));
				}
				
				Ext.getCmp("changeBeforeResource").getStore().loadData(temp_data);
                param_obj["queryType"]="orgin";
				//var temp_data2 = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryChangOrder",false,Ext.encode(param_value));
				var temp_data2;
				if(obj_data.isHisRecord && obj_data.isHisRecord!='undefined' && obj_data.isHisRecord==1){
					
					temp_data2 = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationHisManage","qryChangOrder",false,Ext.encode(param_value));
				}else{
					
					temp_data2 = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationManage","qryChangOrder",false,Ext.encode(param_value));
				}
				if((obj_data.isHisRecord && obj_data.isHisRecord!='undefined' && obj_data.isHisRecord==1)||
						temp_data2.length ==0){
					Ext.getCmp('saveChangeRoute').hide();
				}else{
					Ext.getCmp('saveChangeRoute').show();
				}
				Ext.getCmp("changeAfterResource").getStore().loadData(temp_data2);
	 },
	 initBeforeGridPanel:function(){
            
        
            //add by feng.zhanbing date:20130622 ur:108342 begin
            var dispatchId=obj_data["objData"]["dispatchOrderId"];
            //var isDisplay = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","isDisplayRouteChangeButton",false,dispatchId,null,null,null);
            //add by feng.zhanbing date:20130622 ur:108342 end
            
			var cm = new Ext.grid.RadioboxSelectionModel ({singleSelect :true});
			var fields = [{name:'circuitId'},{name:'oldCircuitId'},{name:'bcCode'},{name:'oldSimpleRoute'},{name:'custOrderNo'},{name:'remark'},{name:'speed'},{name:'businessType'},{name:'changetype'},{name:'constructAddressa'},{name:'constructAddressz'},{name:'nodeEquipmentA'},{name:'nodeEquipmentZ'},{name:'nodePortLocalA'},{name:'nodePortLocalZ'},{name:'speed'},{name:'custServGrade'},{name:'maintenanceGrade'},{name:'circuitnetGrade'},{name:'reqFinishDate'},{name:'reqRoprtDate'},{name:'graftingTime'},{name:'wholeTestPlan'},{name:'custName'}]
			var	columns = [
				            cm,
			                {name:'circuitId',dataIndex:'circuitId',width:100,sortable:true,hidden:true,align:"center"},
							{name:'oldCircuitId',dataIndex:'oldCircuitId',width:100,sortable:true,hidden:true,align:"center"},
							{name:'bcCode',dataIndex:'bcCode',width:150,sortable:true,header:'资源代号',align:"center",renderer:toCopyModel},
					       
							{name:'oldSimpleRoute',dataIndex:'oldSimpleRoute',width:300,sortable:true,header:'群次路由',align:"center",renderer:toCopyModel},
							
							{name:'changetype',dataIndex:'changetype',width:150,sortable:true,header:'变更内容',align:"center",renderer:toCopyModel},
                            {name:'custOrderNo',dataIndex:'custOrderNo',width:150,sortable:true,header:'流水号',align:"center",hidden:true,isAutoExpand:true,renderer:toCopyModel},
							{name:'businessType',dataIndex:'businessType',width:100,sortable:true,header:'业务类型',align:"center",renderer:toCopyModel},
							{name:'speed',dataIndex:'speed',width:100,sortable:true,header:'速率',align:"center",renderer:toCopyModel},
							{name:'constructaddressa',dataIndex:'constructAddressa',width:200,sortable:true,header:'终端点A',align:"center",renderer:toCopyModel},
							{name:'constructaddressz',dataIndex:'constructAddressz',width:200,sortable:true,header:'终端点Z',align:"center",renderer:toCopyModel},
							{name:'nodeEquipmentA',dataIndex:'nodeEquipmentA',width:200,sortable:true,header:'节点机/交换机A',align:"center",hidden:canSeeNodeOrPort,renderer:toCopyModel},
							{name:'nodeEquipmentZ',dataIndex:'nodeEquipmentZ',width:200,sortable:true,header:'节点机/交换机Z',align:"center",hidden:canSeeNodeOrPort,renderer:toCopyModel},
							{name:'nodePortLocalA',dataIndex:'nodePortLocalA',width:200,sortable:true,header:'端口A',align:"center",hidden:canSeeNodeOrPort,renderer:toCopyModel},
							{name:'nodePortLocalZ',dataIndex:'nodePortLocalZ',width:200,sortable:true,header:'端口Z',align:"center",hidden:canSeeNodeOrPort,renderer:toCopyModel},
					        {name:'reqFinishDate',dataIndex:'reqFinishDate',width:200,sortable:true,header:'要求完成时间',align:"center",renderer:toCopyModel},
					        {name:'reqRoprtDate',dataIndex:'reqRoprtDate',width:200,sortable:true,header:'要求反馈时间',align:"center",renderer:toCopyModel},
							{name:'graftingTime',dataIndex:'graftingTime',width:200,sortable:true,header:'割接影响时间',align:"center",hidden:canSeeGraftingTime,renderer:toCopyModel},
							{name:'wholeTestPlan',dataIndex:'wholeTestPlan',width:100,sortable:true,header:'传输全程调测时间',align:"center",hidden:canSeeWholeTestTime,renderer:toCopyModel},
					        {name:'custservgrade',dataIndex:'custServGrade',width:100,sortable:true,header:'客户服务等级',align:"center",hidden:canSeeLevelMsg,renderer:toCopyModel},
					        {name:'maintenancegrade',dataIndex:'maintenanceGrade',width:100,sortable:true,header:'电路维护等级',align:"center",hidden:canSeeLevelMsg,renderer:toCopyModel},
					        {name:'circuitnetgrade',dataIndex:'circuitnetGrade',width:100,sortable:true,header:'网络等级',align:"center",hidden:canSeeLevelMsg,renderer:toCopyModel},
					        {name:'custname',dataIndex:'custName',width:100,sortable:true,header:'客户',align:"center",renderer:toCopyModel},
					        {name:'remark',dataIndex:'remark',width:300,sortable:true,header:'备注',align:"center",renderer:toCopyModel}
			]
		    var store_ =  temp_obj = new Ext.data.JsonStore({
						url:'/IOMPROJ/iomextservlet',
						idProperty: "circuitId",
						fields:fields
		     });
			var btnsArray = [];
			btnsArray[btnsArray.length] = {xtype:'button',text:'查看路由',listeners:{click:ModifyOrder.viewCircuitInfo}};
			/*btnsArray[btnsArray.length] = {xtype:'button',text:'变更路由',hidden:isDisplay=='true'?false:true,listeners:{click:ModifyOrder.modifyCircuitInfo}};
			var staff_id = obj_data["staffId"];
            var inputParamArr = [staff_id,obj_data["objData"]["custOrderId"]];
            var outputParamArr = ["flag"];
            var jsonStr = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.StaticInfoManager","executeProcedureNoException",false,"is_display_route_change_date",inputParamArr,outputParamArr);
            
            if(jsonStr != null){
                var json = Ext.decode(jsonStr);
                if ( json.flag=='false') {
                    btnsArray[btnsArray.length] = {xtype:'button',text:'变更时间',listeners:{click:ModifyOrder.modifyDate}};
                }
            }*/

			//按钮的显示隐藏新逻辑,add by lijianxian
			//var btnDisplayInfo = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.ControlRuleManage","getBtnDisplayInfo",false,dispatchId);
			//if(btnDisplayInfo[0].routeBtnFlag == true || btnDisplayInfo[0].routeBtnFlag == 'true'){
				btnsArray[btnsArray.length] = {id:'chgRouteBtn',xtype:'button',text:'变更路由',listeners:{click:ModifyOrder.modifyCircuitInfo},hidden:true};
			//}

			//if(btnDisplayInfo[1].timeBtnFlag == true || btnDisplayInfo[1].timeBtnFlag == 'true'){
				btnsArray[btnsArray.length] = {id:'chgTimeBtn',xtype:'button',text:'变更时间',listeners:{click:ModifyOrder.modifyDate},hidden:true};
			//}

			//if(btnDisplayInfo[2].cancelBtnFlag == true || btnDisplayInfo[2].cancelBtnFlag == 'true'){
				btnsArray[btnsArray.length] = {id:'cancelBtn',xtype:'button',text:'注销',listeners:{click:ModifyOrder.cancelRoute},hidden:true};
			//}
			btnsArray[btnsArray.length] = {xtype:'button',text:'刷新变更前后资源',listeners:{click:ModifyOrder.reloadData}};
			//end add by lijianxian
			//add by li.guoyang
			var isShow=false;
			isShow=callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.ControlRuleManage","canSeeChgTimeBatchBtn",false,obj_data["objData"]["dispatchOrderId"]);
			if(isShow=="true"||isShow==true){
				btnsArray[btnsArray.length] = {id:'chgTimeBatchBtn',xtype:'button',text:'批量变更时间',listeners:{click:ModifyOrder.modifyDateBatch},hidden:false};
			}
			//end by li.guoyang
			var gridPanel =  new Ext.grid.GridPanel({
		    	title:'变更前的资源(业务变更)', 
				store :store_,
				id:"changeBeforeResource",
				 selModel :cm,
				 columns:columns,
				 viewConfig: {
					sortAscText:'升序',
					sortDescText : '降序',
                    columnsText : '所有列'
				 },
				 border:false,
				 autoScroll :true,
				 tbar:new Ext.Toolbar({items:btnsArray}),
				 loadMask: new Ext.LoadMask(Ext.getBody(),{msg:'数据正在加载...请稍后...'}),
				 width:document.body.clientWidth * 0.98,
				 height:document.body.clientHeight*0.55,
				 frame:false,
				 listeners:{
					 rowclick:function(grid,index,e){
						 Ext.getCmp('chgRouteBtn').hide();
						 Ext.getCmp('chgTimeBtn').hide();
						 Ext.getCmp('cancelBtn').hide();
						 
						 if(obj_data.isHisRecord && obj_data.isHisRecord!='undefined' && obj_data.isHisRecord==1){
					
						}else{
							var temp_ = grid.getStore();
							var record = temp_.getAt(index);
							var chgRoute = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.ControlRuleManage","canSeeRouteBtn",false,obj_data["objData"]["dispatchOrderId"],record.data.circuitId);
							var chgTime = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.ControlRuleManage","canSeeChgTimeBtn",false,obj_data["objData"]["dispatchOrderId"],record.data.circuitId);
							var cancelCircuit = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.ControlRuleManage","canSeeCancelBtn",false,obj_data["objData"]["dispatchOrderId"],record.data.circuitId);

							if((chgRoute == true || chgRoute == 'true' ) && obj_data.web != 'exceptionMonitor'){
								chgRoute = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.ControlRuleManage","isCsDispatchOrder",false,obj_data["objData"]["dispatchOrderId"],session.staff.staffId,session.job.jobId,session.org.orgId);
								if(chgRoute != true && chgRoute != 'true'){
									Ext.getCmp('chgRouteBtn').show();
								}	
							}
							if(chgTime == true || chgTime == 'true'){
								Ext.getCmp('chgTimeBtn').show();
								
							}
							if(cancelCircuit == true || cancelCircuit == 'true'){
								Ext.getCmp('cancelBtn').show();
							}
						}		
					}
				 }
			});
			return gridPanel;
	 }, 
	 
	 saveChangeRoute:function(){
		 var grid = Ext.getCmp('changeAfterResource');
		 var temp = grid.getStore();
		 var params = new Array();
		 var tempObj = new Object();
		 for (var i =0;i<temp.getCount();i++){
			 var objData = temp.getAt(i).data;
			 tempObj.circuitId = objData.circuitId;
			 tempObj.changeRoute = objData.changeRoute;
			 params.push(tempObj);
		 }
		var result = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationManage","updateChangeRoute",true,params,obj_data["objData"]["dispatchOrderId"]);
		var param_value = [];
		var param_obj = {};
		param_obj["queryType"]="orgin";
		param_obj["dispatchOrderId"] = obj_data["objData"]["dispatchOrderId"];
		param_obj["staffId"] = obj_data["staffId"];
		param_obj["jobId"] = obj_data["jobId"];
		param_obj["orgId"] = obj_data["orgId"];
		param_obj["teacheIds"] = obj_data["tacheIds"].join(",");
		param_value.push(param_obj);
		var temp_data;
		if(result == "SUCCESS"){
			if(obj_data.isHisRecord && obj_data.isHisRecord!='undefined' && obj_data.isHisRecord==1){
				Ext.getCmp('saveChangeRoute').hide();
				temp_data = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationHisManage","qryChangOrder",false,Ext.encode(param_value));
			}else{
				Ext.getCmp('saveChangeRoute').show();
				temp_data = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.CorrectOperationManage","qryChangOrder",false,Ext.encode(param_value));
			}
			Ext.getCmp("changeAfterResource").getStore().loadData(temp_data);
		}
	 },
	  initAfterGridPanel:function(){
			var cm = new Ext.grid.RowSelectionModel ({});
			var fields = [{name:'circuitId'},{name:'oldCircuitId'},{name:'changeRoute'},{name:'bcCode'},{name:'custOrderNo'},{name:'remark'},{name:'graftingTime'},{name:'businessType'},{name:'changetype'},{name:'constructAddressa'},{name:'constructAddressz'},{name:'nodeEquipmentA'},{name:'nodeEquipmentZ'},{name:'nodePortLocalA'},{name:'nodePortLocalZ'},{name:'speed'},{name:'custServGrade'},{name:'maintenanceGrade'},{name:'circuitnetGrade'},{name:'reqFinishDate'},{name:'reqRoprtDate'},{name:'wholeTestPlan'},{name:'custName'},{name:'fullRoute'},{name:'simpleRoute'},{name:'carryRoute'}]
			var	columns = [
				            {name:'circuitId',dataIndex:'circuitId',width:100,sortable:true,hidden:true,align:"center"},
							{name:'oldCircuitId',dataIndex:'oldCircuitId',width:100,sortable:true,hidden:true,align:"center"},
							{name:'bcCode',dataIndex:'bcCode',width:150,sortable:true,header:'资源代号',align:"center",renderer:toCopyModel},
							{name:'fullRoute',dataIndex:'fullRoute',width:300,sortable:true,header:'全程路由',align:"center",renderer:toCopyModel},
				            {name:'simpleRoute',dataIndex:'simpleRoute',width:300,sortable:true,header:'群次路由',align:"center",renderer:toCopyModel},
							{name:'carryRoute',dataIndex:'carryRoute',width:300,sortable:true,header:'承载路由',hidden:canSeeCarryRoute,align:"center",renderer:toCopyModel},
                           
							{name:'changeRoute',dataIndex:'changeRoute',width:300,sortable:true,header:'变更路由段',align:"center",renderer:getColor,editor:new Ext.form.TextArea({allowBlank: true ,grow:true})},
							
							{name:'custOrderNo',dataIndex:'custOrderNo',width:150,sortable:true,header:'流水号',align:"center",isAutoExpand:true,hidden:true,renderer:toCopyModel},
							{name:'businessType',dataIndex:'businessType',width:100,sortable:true,header:'业务类型',align:"center",renderer:toCopyModel},
							{name:'speed',dataIndex:'speed',width:100,sortable:true,header:'速率',align:"center",renderer:toCopyModel},
							{name:'constructaddressa',dataIndex:'constructAddressa',width:200,sortable:true,header:'终端点A',align:"center",renderer:toCopyModel},
							{name:'constructaddressz',dataIndex:'constructAddressz',width:200,sortable:true,header:'终端点Z',align:"center",renderer:toCopyModel},
							{name:'nodeEquipmentA',dataIndex:'nodeEquipmentA',width:200,sortable:true,header:'节点机/交换机A',align:"center",hidden:canSeeNodeOrPort,renderer:toCopyModel},
							{name:'nodeEquipmentZ',dataIndex:'nodeEquipmentZ',width:200,sortable:true,header:'节点机/交换机Z',align:"center",hidden:canSeeNodeOrPort,renderer:toCopyModel},
							{name:'nodePortLocalA',dataIndex:'nodePortLocalA',width:200,sortable:true,header:'端口A',align:"center",hidden:canSeeNodeOrPort,renderer:toCopyModel},
							{name:'nodePortLocalZ',dataIndex:'nodePortLocalZ',width:200,sortable:true,header:'端口Z',align:"center",hidden:canSeeNodeOrPort,renderer:toCopyModel},
					        {name:'reqFinishDate',dataIndex:'reqFinishDate',width:200,sortable:true,header:'要求完成时间',align:"center",renderer:toCopyModel},
					        {name:'reqRoprtDate',dataIndex:'reqRoprtDate',width:200,sortable:true,header:'要求反馈时间',align:"center",renderer:toCopyModel},
							{name:'graftingTime',dataIndex:'graftingTime',width:200,sortable:true,header:'割接影响时间',align:"center",hidden:canSeeGraftingTime,renderer:toCopyModel},
			            	{name:'wholeTestPlan',dataIndex:'wholeTestPlan',width:100,sortable:true,header:'传输全程调测时间',align:"center",hidden:canSeeWholeTestTime,renderer:toCopyModel},
					        {name:'custservgrade',dataIndex:'custServGrade',width:100,sortable:true,header:'客户服务等级',align:"center",hidden:canSeeLevelMsg,renderer:toCopyModel},
					        {name:'maintenancegrade',dataIndex:'maintenanceGrade',width:100,sortable:true,header:'电路维护等级',align:"center",hidden:canSeeLevelMsg,renderer:toCopyModel},
					        {name:'circuitnetgrade',dataIndex:'circuitnetGrade',width:100,sortable:true,header:'网络等级',align:"center",hidden:canSeeLevelMsg,renderer:toCopyModel},
					        {name:'custname',dataIndex:'custName',width:100,sortable:true,header:'客户',align:"center",renderer:toCopyModel},
					        {name:'remark',dataIndex:'remark',width:300,sortable:true,header:'备注',align:"center",renderer:toCopyModel}
				]
		    var store_ =  temp_obj = new Ext.data.JsonStore({
						url:'/IOMPROJ/iomextservlet',
						idProperty: "circuitId",
						fields:fields
		     });
			var btnsArray1 = [];
			btnsArray1[btnsArray1.length] = {xtype:'button',id:'saveChangeRoute',text:'<font size=3>保存</font>',listeners:{click:ModifyOrder.saveChangeRoute},hidden:true};
			
			var gridPanel =  new Ext.grid.EditorGridPanel({
		    	title:'变更后的资源(变更后电路)', 
				store :store_,
				id:"changeAfterResource",
				 selModel :cm,
				 columns:columns,
				 viewConfig: {
					sortAscText:'升序',
					sortDescText : '降序',
                    columnsText : '所有列'
				 },
				 border:false,
				 autoScroll :true,
				 tbar:new Ext.Toolbar({items:btnsArray1}),
				 loadMask: new Ext.LoadMask(Ext.getBody(),{msg:'数据正在加载...请稍后...'}),
				 width:document.body.clientWidth * 0.98,
				 height:document.body.clientHeight*0.50,
				 frame:false
			});
			return gridPanel;
	 }, 
	 getButtons:function(){	   
		   if(obj_data.tacheIds != null && obj_data.tacheIds.length>0){
				var obj = new Object();
				var arr = obj_data.tacheIds;		
				obj.teacheId = arr;
				obj.teacheIds=arr;				
				obj.staffId = obj_data.staffId;
				obj.jobId = obj_data.jobId;
				obj.orgId = obj_data.orgId;
				obj.menuType = obj_data.menuType;
				if(obj_data.menuType=='007'){
					obj.dispatchOrderId = obj_data["objData"]["dispatchOrderId"];
					var resultArr=callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","isCatchOldOrder",false,obj);
					var tacheDefineIds = resultArr[1];	
					if(tacheDefineIds!=''&&tacheDefineIds!=null){
						var oldOrderIds = resultArr[0];
						delete obj.dispatchOrderId;
						var count=callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryChangeOrderIsCatch",false,oldOrderIds,tacheDefineIds);
						if(count>0){
							var buttons=callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryBtnConfirm",false,obj_data["objData"]["dispatchOrderId"],tacheDefineIds);
						}else{
							delete obj.teacheIds;
							obj.dispatchId = obj_data["objData"]["dispatchOrderId"];
							var buttons = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryBtnByDisIdAndTacheIds",false,obj);
						}
					}else{
						var resultdata=callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryOldOrderIdTacheId",false,obj);
						var oldOrderIds = resultdata[0];
						var tacheDefineIds = resultdata[1];	
											var ss = null;
					ss.toString();
						delete obj.dispatchOrderId;
						var count=callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryNewChangeOrderIsCatch",false,oldOrderIds,tacheDefineIds);
						if(count>0){
							var buttons=callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryBtnConfirm",false,obj_data["objData"]["dispatchOrderId"],tacheDefineIds);
						}else{
							delete obj.teacheIds;
							obj.dispatchId = obj_data["objData"]["dispatchOrderId"];
							var buttons = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryBtnByDisIdAndTacheIds",false,obj);
						}
					}
				}else{
					delete obj.teacheIds;
					obj.dispatchId = obj_data["objData"]["dispatchOrderId"];
					var buttons = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryBtnByDisIdAndTacheIds",false,obj); 
				}	
				if(buttons.length == 0){  //add by ur:185768
					var refreshBtnTxt = '<%=getI18NResource("common.refreshButton")%>';
					var refreshBtn = "[{id:'addVlan',inputType:'button',text:'" + refreshBtnTxt + "',style:'btn_toolbar',width:200,height:200,click:'ModifyOrder.reloadButton'}]"
					buttons.unshift(Ext.decode(refreshBtn));
				}
				
				//end
				return buttons;
		   }
		   if(obj_data.menuType=='010'){
			   var buttons=callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryBtnConfirm",false);
			   return buttons;
		   }
	  },
	  reloadButton:function(){
		  var items = ExceptionReport.getButtons();
		  var toolbar = Ext.getCmp("pagingToolbar");
		  toolbar.removeAll();
		  toolbar.add(items);
		  for (var i = 0; i < items.length; i++) {
				if (items[i].querySql != null
						&& ("" + items[i].querySql) == "true") {// 根据配置的sql过滤按钮或者修改按钮状态
					var obj = callRemoteFunction(
							"com.ztesoft.oss.bj.local.band.bl.BaseNetManager",
							"exeSqlCheckBtn", false, items[i].id,
							items[i].tacheId, items[i].workOrderId);
					if (obj[0].state != null) {
						if (obj[0].state.replace(/(^\s*)|(\s*$)/g, "")
								.toLowerCase().indexOf("disable") > -1) {
							toolbar.setDisabled("" + items[i].id, true);
						}
						if (obj[0].state.replace(/(^\s*)|(\s*$)/g, "")
								.toLowerCase().indexOf("hide") > -1) {
							toolbar.remove(items[i].id);
						}
						if (obj[0].state.replace(/(^\s*)|(\s*$)/g, "")
								.toLowerCase().indexOf("tips") > -1) {
							if (obj[0].tips != null) {
								Ext.getCmp('tipsLabel').el.dom.innerHTML = obj[0].tips;
								Ext.getCmp('tipsLabel').show();
							} else {
								Ext.getCmp('tipsLabel').hide();
							}
						}
					}
				}
			}
	  },
	  initToolbar:function(){
			 var toolbar = new Ext.ToolBar_Ext({
				id:'pagingToolbar',
				resizeTabs:true, 
				minTabWidth: 115,
				tabWidth:135,
				enableTabScroll:true,
				width:document.body.clientWidth,
				defaults: {autoScroll:false}
			 });
			  if(win.lockDispatchOrder=='Y'){
	 			toolbar.add({
					text : '查看调单',
					style : 'btn_toolbar',
					inputType : 'button',
					click : showDispDetailInfo
				});
	 		}
			//Add by seniorliu 2013.10.14 start
	 		if(win && win.web && win.web == 'exceptionMonitor'){
				toolbar.add({
					text : '导出Excel',
					style : 'btn_toolbar',
					inputType : 'button',
					click : daoexcel
				});
			} else {
				var buttons = ModifyOrder.getButtons();
				toolbar.add(buttons);
				for (var i = 0; i < buttons.length; i++) {
					if (buttons[i].querySql != null
							&& ("" + buttons[i].querySql) == "true") {// 根据配置的sql过滤按钮或者修改按钮状态
						var obj = callRemoteFunction(
								"com.ztesoft.oss.bj.local.band.bl.BaseNetManager",
								"exeSqlCheckBtn", false, buttons[i].id,
								buttons[i].tacheId, buttons[i].workOrderId);
						if (obj[0].state != null) {
							if (obj[0].state.replace(/(^\s*)|(\s*$)/g, "")
									.toLowerCase().indexOf("disable") > -1) {
								toolbar.setDisabled("" + buttons[i].id, true);
							}
							if (obj[0].state.replace(/(^\s*)|(\s*$)/g, "")
									.toLowerCase().indexOf("hide") > -1) {
								toolbar.remove(buttons[i].id);
							}
							if (obj[0].state.replace(/(^\s*)|(\s*$)/g, "")
									.toLowerCase().indexOf("tips") > -1) {
								if (obj[0].tips != null) {
									Ext.getCmp('tipsLabel').el.dom.innerHTML = obj[0].tips;
									Ext.getCmp('tipsLabel').show();
								} else {
									Ext.getCmp('tipsLabel').hide();
								}
							}
						}
					}
				}
				
			}//Add by seniorliu 2013.10.14 end 
			
			return toolbar;
	  },
	  initForm:function(){
			      var filedSet = new FormPanel({
			      		 title:'变更单的基本内容',
						 id:'resourceFormPanel',
						 width:document.body.clientWidth*0.99,
						 height:document.body.clientHeight*0.6,
						 autoScroll :true,
						 frame:false,
						 border:false,
						 reader:new Ext.data.JsonReader({
						 },[{name:'citya'},{name:'cityz'},{name:'count'},{name:'bandWidth'},{name:'aportType'},{name:'cuiritType'},{name:'transferMedium'},{name:'protectType'},{name:'reqFinishTime'},{name:'reqAcceptTime'},{name:'buinsessType'},{name:'endRequ'},{name:'isAuto'},{name:'reqReplyTime'}]),
						 items:[
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'textfield',id:'dispatchOrderNo',fieldLabel:'文号',width:550,labelStyle :'width:120px;',readOnly:true}]},{columnWidth:.3,layout:'form'}]},
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'textfield',id:'specType',fieldLabel:'调度专业',width:550,labelStyle :'width:120px;',readOnly:true}]},{columnWidth:.3,layout:'form'}]},
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'textfield',id:'dispatchDepart',fieldLabel:'发往单位',width:550,labelStyle :'width:120px;',readOnly:true}]},{columnWidth:.3,layout:'form'}]},
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'textfield',id:'sendDate',fieldLabel:'下发时间',width:550,labelStyle :'width:120px;',readOnly:true}]},{columnWidth:.3,layout:'form'}]},
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'combo',id:'priority',notnull:true,fieldLabel:'优先级别',width:550,labelStyle :'width:120px;',editable :false,displayField:'text',valueField:'value',mode: 'local',typeAhead: true,forceSelection: true,triggerAction: 'all',selectOnFocus:true,isLocal:false,store:new Ext.data.JsonStore({url:'/IOMPROJ/iomextservlet',fields:['text','value'],data:[{'text':'普通','value':'2008061001'},{'text':'加急','value':'2008061002'},{'text':'特急','value':'2008061003'},{'text':'特殊','value':'2008061004'}]})}]},{columnWidth:.3,layout:'form'}]},
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'textfield',id:'dispatchTitle',fieldLabel:'标题',width:550,labelStyle :'width:120px;'}]},{columnWidth:.3,layout:'form'}]},
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'textarea',id:'remark',fieldLabel:'内容',height:125,width:550,labelStyle :'width:120px;'}]},{columnWidth:.3,layout:'form'}]},
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'textfield',id:'staffName',fieldLabel:'拟稿人姓名',width:550,labelStyle :'width:120px;',readOnly:true}]},{columnWidth:.3,layout:'form'}]},
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'textfield',id:'drafterTel',fieldLabel:'拟稿人电话',width:550,labelStyle :'width:120px;',readOnly:true}]},{columnWidth:.3,layout:'form'}]},
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'textfield',id:'oldDispatchNo',fieldLabel:'上级变更文号',width:550,labelStyle :'width:120px;',readOnly:true,hidden:true}]},{columnWidth:.3,layout:'form'}]},
						   { columnWidth:1,items:[ModifyOrder.initbefore()]},
						   { columnWidth:1,items:[ModifyOrder.initafter()]}
			            ]
		           });
		       return filedSet;
	  },
	  initbefore:function(){
           var filedSet = new FieldSet({
		     title:'变更前的资源',
			 id:'beforeResource',
			 width:document.body.clientWidth,
		     height:document.body.clientHeight*0.6,
		     autoScroll :false,
			 items:[
			    ModifyOrder.initBeforeGridPanel()
			 ]
		  });
		  return filedSet;
	   },
	   initafter:function(){
           var filedSet = new FieldSet({
		     title:'变更后的资源',
			 id:'afterResource',
			 width:document.body.clientWidth,
		     height:document.body.clientHeight*0.6,
		     autoScroll :false,
			 items:[
			    ModifyOrder.initAfterGridPanel()
			 ]
		  });
		  return filedSet;
	   },
	  initFieldSet:function(){
			var filedSet = new FormPanel({
						 title:'变更单的基本内容',
						 id:'resourceFormPanel',
						 width:document.body.clientWidth,
						 height:document.body.clientHeight*0.85,
						 autoScroll :true,
						 frame:false,
						 border:false,
						 reader:new Ext.data.JsonReader({
						 },[{name:'citya'},{name:'cityz'},{name:'count'},{name:'bandWidth'},{name:'aportType'},{name:'cuiritType'},{name:'transferMedium'},{name:'protectType'},{name:'reqFinishTime'},{name:'reqAcceptTime'},{name:'buinsessType'},{name:'endRequ'},{name:'isAuto'},{name:'reqReplyTime'}]),
						 items:[
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'textfield',id:'dispatchOrderNo',fieldLabel:'文号',width:550,labelStyle :'width:120px;',readOnly:true}]},{columnWidth:.3,layout:'form'}]},
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'textfield',id:'specType',fieldLabel:'调度专业',width:550,labelStyle :'width:120px;',readOnly:true}]},{columnWidth:.3,layout:'form'}]},
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'textfield',id:'dispatchDepart',fieldLabel:'发往单位',width:550,labelStyle :'width:120px;',readOnly:true}]},{columnWidth:.3,layout:'form'}]},
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'textfield',id:'sendDate',fieldLabel:'下发时间',width:550,labelStyle :'width:120px;',readOnly:true}]},{columnWidth:.3,layout:'form'}]},
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'combo',id:'priority',notnull:true,fieldLabel:'优先级别',width:550,labelStyle :'width:120px;',editable :false,displayField:'text',valueField:'value',mode: 'local',typeAhead: true,forceSelection: true,triggerAction: 'all',selectOnFocus:true,isLocal:false,store:new Ext.data.JsonStore({url:'/IOMPROJ/iomextservlet',fields:['text','value'],data:[{'text':'普通','value':'2008061001'},{'text':'加急','value':'2008061002'},{'text':'特急','value':'2008061003'},{'text':'特殊','value':'2008061004'}]})}]},{columnWidth:.3,layout:'form'}]},
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'textfield',id:'dispatchTitle',fieldLabel:'标题',width:550,labelStyle :'width:120px;'}]},{columnWidth:.3,layout:'form'}]},
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'textarea',id:'remark',fieldLabel:'内容',height:125,width:550,labelStyle :'width:120px;'}]},{columnWidth:.3,layout:'form'}]},
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'textfield',id:'staffName',fieldLabel:'拟稿人姓名',width:550,labelStyle :'width:120px;',readOnly:true}]},{columnWidth:.3,layout:'form'}]},
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'textfield',id:'drafterTel',fieldLabel:'拟稿人电话',width:550,labelStyle :'width:120px;',readOnly:true}]},{columnWidth:.3,layout:'form'}]},
						   {columnWidth:1,border:false,layout:'column',items:[{columnWidth:.1,layout:'form'},{columnWidth:.6,layout:'form',labelAlign:'right',items:[{xtype:'textfield',id:'oldDispatchNo',fieldLabel:'上级变更文号',width:550,labelStyle :'width:120px;',readOnly:true,hidden:true}]},{columnWidth:.3,layout:'form'}]},
						   { columnWidth:1,items:[ModifyOrder.initbefore()]},
						   { columnWidth:1,items:[ModifyOrder.initafter()]}
			            ]
		           });
		       return filedSet;
			
			
	  },
	  initTabPanel:function(){
			     var tabPanel = new Ext.TabPanel({
					  activeTab: 0,
					  width:document.body.clientWidth,
					  height:document.body.clientHeight,
					  id:'ModifyOrderTab',
					  border:false,
					  frame:false,
					  defaults:{autoScroll: false},
					  items:[
						 {title: '变更内容',id:'baseInfo',border:false,frame:true,items:[
						         {columnWidth:1,border:false,autoScroll :false,items:[ModifyOrder.initFieldSet()]}
					     ]},                                                                           
					   {title:'附件',id:'affix',border:false,frame:true,items:[{html:'<iframe id="affix" src="/IOMPROJ/ext/bj/band/file.jsp" align="center" scrolling="auto" frameborder="0" width="100%" HEIGHT="490"></iframe>'}]},
					   {title:'留言',id:'leaveMessage',border:false,frame:true,items:[{html:'<iframe id="leaveMessage" src="/IOMPROJ/ext/bj/band/LeaveMessage.jsp" align="center" scrolling="auto" frameborder="0" width="100%" HEIGHT="490"></iframe>'}]}
					  ]
			     });
			    return tabPanel;
	  },
	  init:function(){
	       var ModifyOrderPanel = new Ext.Viewport({
		             id:'modifyOrderPanel',

					 layout: 'border',
					 autoScroll :false,
					 frame:false,
					 items:[
					   {
				            	region: 'north', 
				            	xtype: 'panel', 
				                split: false,
				                margins: '0 0 0 0',
								minWidth: 400,
				                minHeight: 400,
								layout: 'fit',
						height:35,
				            	items:[ModifyOrder.initToolbar()]
				            },
					    {
				            	region: 'center', 
				            	xtype: 'panel', 
				                split: false,
				                margins: '0 0 0 0',
								minWidth: 400,
				                minHeight: 400,
								layout: 'fit',
				            	items:[ModifyOrder.initTabPanel()]
				            }
					 ]
		   });
          
		   // add by ur:96965
			var obdj = new Object();
			obdj.dispatchOrderId=obj_data["objData"]["dispatchOrderId"];
			obdj.staffId = obj_data["staffId"];
			obdj.orgId = obj_data["orgId"];
			obdj.jobId= obj_data["jobId"];
			var resultId=callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","qryOmOrderId",false,obdj);
			var omOrderId=new Array();
			if(resultId!=null && resultId[0]!= null && resultId[0].base_order_id != null){
				for(var i=0;i<resultId.length;i++){
					omOrderId.push(resultId[i].base_order_id);
				}
			}
			if(omOrderId.length==0){
				omOrderId.push(0);
			}
			var sendDepart = null;
			/*
			var rule = callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BandCopyOrderManager","qryC2C3Rule",false,omOrderId[0],obdj.dispatchOrderId);
			if(rule){
				if(rule.split(",")[0] == "C2"){
					 sendDepart=callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","getNodesOfC2ForTran",false,""+omOrderId[0]);
				}else{
					 sendDepart=callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BuzNetWorkManager","getNodesOfC3ForTran",false,""+omOrderId[0],rule.split(",")[1]);
				}
			}*/
			//ADD BY LI.GUOYANG
			sendDepart=callRemoteFunction("com.ztesoft.oss.bj.local.band.bl.BandCopyOrderManager","getDispDepart4Disp",false,omOrderId,obdj.dispatchOrderId);
			if(sendDepart){
			   Ext.getCmp("dispatchDepart").setValue(sendDepart);
			}
	  }
   }
}();
function getColor(value,cellmeta,record,rowIndex,columnIndex,store){
	 if(value == 'undefined' || value == undefined){
		value = '';
	}
	 return '<span style="color:red;" id = "input' + record.get('circuitId') + '" >' + value + '</span>';  
}
