define([
    	'text!modules/iom/cloudiom/task/templates/FinishWorkOrderView.html',
    	'i18n!modules/iom/cloudiom/task/i18n/task.i18n',
    	'modules/common/cloud-utils',
    	'css!modules/iom/cloudiom/task/styles/taskmanagement.css'
    ], function(FinishWorkOrderViewTpl, i18nAgency, utils, css) {
    	return fish.View.extend({
    		template: fish.compile(FinishWorkOrderViewTpl),
    		i18nData: fish.extend({}, i18nAgency,currentUser),
    		events: {
    			'click #iomTaskManagement-finishWorkOrder-submitBtn':'finishWorkOrders'
    		},
    		
    		//这里用来进行dom操作
    		_render: function() {
    			var html=$(this.template(this.i18nData));
    			
    			this.$el.html(html);

    			  this.$el.find('#iomTaskManagement-finishWorkOrder-workOrderCodes').multiselect('option',{dataTextField:'workOrderCode',dataValueField:'id',dataSource:this.options.orders});
    			  var ids = _.map(this.options.orders, function(obj){ return obj.id; });
    			  this.$el.find('#iomTaskManagement-finishWorkOrder-workOrderCodes').multiselect('value',ids);
    			  
    			  html.find('#iomTaskManagement-finishWorkOrder-executeTime').datetimepicker();
    			  html.find("#iomTaskManagement-finishWorkOrder-executeTime").datetimepicker("value", new Date());

    			  
    			  html.find('#iomTaskManagement-finishWorkOrder-form').form({
    			        validate: 1
    			   	});
    			return this;
    		},
    		
    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
    			
    			
    			
    		},
    		finishWorkOrders:function(){
    			 if(this.$el.find('#iomTaskManagement-finishWorkOrder-form').isValid()){
    				 var workOrderIds = this.$el.find('#iomTaskManagement-finishWorkOrder-workOrderCodes').multiselect('value');
    				 var fnWOs =[];
    				 for(var index=0; index<workOrderIds.length; index++ ){
    					 var dto={
    							 workOrderId:workOrderIds[index],
    							 workOrderCode: _.filter(this.options.orders, function(obj){return obj.id=workOrderIds[index];})[0].workOrderCode,
    							 operFinishDate: this.$el.find('#iomTaskManagement-finishWorkOrder-executeTime').val(),
    							 operId:currentUser.staffId,
    							 operName:currentUser.staffName,
    							 dealResult:this.$el.find('#iomTaskManagement-finishWorkOrder-form').val()
    					 };
    					 fnWOs.push(dto);
    				 }
    				 var me =this;var popup=this.popup;
    				 utils.ajax('iomService', 'finishWorkOrders', fnWOs).done(function(ret){
    					 if(ret&&ret.length){
    						 _.where(ret, {isSuccessFlag:"0"});
    						 var arrSucc = [],arrFail=[];
    						 _.each(ret, function(obj){
    							 if(obj.isSuccessFlag=="0"){
    								 arrSucc.push(obj);
    							 }
    							 else{
    								 arrFail.push(obj);
    							 }
    						 });
    						 var msgContent='';
    						 _.each(arrSucc, function(obj){
    							 var tmp = _.find(me.options.orders, function(obj1){ return obj1.id == obj.workOrderId; });
    							 if(tmp&&tmp.workOrderCode){
    								 if(msgContent==''){
    									 msgContent+='<span>工单'+tmp.workOrderCode+'回单成功</span>';
    								 }
    								 else{
    									 msgContent+='<br/><span style="margin-left:29px">工单'+tmp.workOrderCode+'回单成功</span>';
    								 }
    							 }
    						 });
    						 
    						 _.each(arrFail, function(obj){
    							 var tmp = _.find(me.options.orders, function(obj1){ return obj1.id == obj.workOrderId; });
    							 if(tmp&&tmp.workOrderCode){
    								 if(msgContent==''){
    									 msgContent+='<span>工单'+tmp.workOrderCode+'回单失败</span>';
    								 }
    								 else{
    									 msgContent+='<br/><span style="margin-left:29px">工单'+tmp.workOrderCode+'回单失败</span>';
    								 }
    							 }
    						 });
    						 
    						 
    						 fish.info({title:'回单成功：'+arrSucc.length+'条，失败：'+arrFail.length+'条',message:msgContent}).result.always(function(){
    							 popup.close(ret);
    						 });
    					 }
    					 console.log(ret);
    				 }).fail(function(){
    					 fish.error({title:'回单失败',message:'回单失败'}).result.always(function(ret){
							 popup.close(ret);
						 });
    				 });
    			 }
    		}
    	});
    });