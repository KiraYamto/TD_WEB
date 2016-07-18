define([
    	'text!modules/iom/idciom/order/templates/FinishWorkOrderView.html',
    	'i18n!modules/iom/idciom/order/i18n/order.i18n',
    	'modules/common/cloud-utils'
    ], function(FinishWorkOrderViewTpl, i18nAgency,utils) {
    	return fish.View.extend({
    		template: fish.compile(FinishWorkOrderViewTpl),
    		i18nData: fish.extend({}, i18nAgency,currentUser),
    		events: {
    			'click .save-button':'_finWorkOrders'
    		},
    		
    		//这里用来进行dom操作
    		_render: function() {
    			var html=$(this.template(this.i18nData));
    			
    			this.$el.html(html);

    			  this.$el.find('#workorder-finishorder-workordercodes').multiselect('option',{dataTextField:'workOrderCode',dataValueField:'id',dataSource:this.options.orders});
    			  var ids = _.map(this.options.orders, function(obj){ return obj.id; });
    			  
    			  this.$el.find('#workorder-finishorder-workordercodes').multiselect('value',ids);
    			  html.find('#workorder-finishorder-executetime').datetimepicker();
    			  
    			  html.find('#workorder-finishorder-form').form({
    			        validate: 1
    			    });
    			return this;
    		},
    		
    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
    			
    			
    			
    		},
    		_finWorkOrders:function(){
    			 if(this.$el.find('#workorder-finishorder-form').isValid()){
    				 var workOrderIds = this.$el.find('#workorder-finishorder-workordercodes').multiselect('value');
    				 var fnWOs =[];
    				 for(var index=0;index<workOrderIds.length;index++ ){
    					 var dto={
    							 workOrderId:workOrderIds[index],
    							 operFinishDate: this.$el.find('#workorder-finishorder-executetime').val(),
    							 operId:currentUser.staffId,
    							 operName:currentUser.staffName,
    							 dealResult:this.$el.find('#workorder-finishorder-result').val()
    					 };
    					 fnWOs.push(dto);
    				 }
    				 var me =this;var popup=this.popup;
    				 utils.ajax('iomService','finishWorkOrders',fnWOs).done(function(ret){
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