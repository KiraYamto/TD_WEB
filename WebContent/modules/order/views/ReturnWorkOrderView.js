define([
    	'text!modules/order/templates/ReturnWorkOrderView.html',
    	'i18n!modules/order/i18n/order.i18n',
    	'modules/common/cloud-utils'
    ], function(ReturnWorkOrderViewTpl, i18nAgency,utils) {
    	return fish.View.extend({
    		template: fish.compile(ReturnWorkOrderViewTpl),
    		i18nData: fish.extend({}, i18nAgency,currentUser),
    		events: {
    			'click .save-button':'_finWorkOrders'
    		},
    		
    		//这里用来进行dom操作
    		_render: function() {
    			var html=$(this.template(this.i18nData));
    			
    			this.$el.html(html);

    			this.$el.find('#workorder-returnorder-workordercodes').text(this.options.order.workOrderCode);
    			  //this.$el.find('#workorder-returnorder-workordercodes').multiselect('option',{dataTextField:'workOrderCode',dataValueField:'id',dataSource:this.options.orders});
    			  //var ids = _.map(this.options.orders, function(obj){ return obj.id; });
    			  
    			  //this.$el.find('#workorder-returnorder-workordercodes').multiselect('value',ids);
    			  //html.find('#workorder-returnorder-executetime').datetimepicker();
    			  utils.ajax('iomService','qryFlowExceptionByCond',this.options.order.id).done(function(ret){
    				  if(ret&&ret.length){
    					  html.find('#workorder-returnorder-reason').combobox({
  	    			        placeholder: '请选择退单原因',
  	    			        dataTextField: 'returnReasonName',
  	    			        dataValueField: 'reasonId',
  	    			        dataSource: ret
  	    			    });
    				  }
    				  else{
    					  html.find('#workorder-returnorder-reason').combobox({
    	    			        placeholder: '请选择退单原因',
    	    			        dataTextField: 'returnReasonName',
    	    			        dataValueField: 'reasonId',
    	    			        dataSource: [
    	    			            //{reasonId: '42052000', returnReasonName: '施工失败',reasonCode: 'sgsb'}
    	    			        ]
    	    			    });
    				  }
    				  
    				  console.log('异常原因：',ret);
    				  
    			  }).fail(function(){
    				  html.find('#workorder-returnorder-reason').combobox({
      			        placeholder: '请选择退单原因',
      			        dataTextField: 'returnReasonName',
      			        dataValueField: 'reasonId',
      			        dataSource: [
      			            //{reasonId: '42052000', returnReasonName: '施工失败',reasonCode: 'sgsb'}
      			        ]
      			    });
    			  });
    			  
    			  
    			  html.find('#workorder-returnorder-form').form({
    			        validate: 1
    			    });
    			return this;
    		},
    		
    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
    			
    			
    			
    		},
    		_finWorkOrders:function(){
    			 if(this.$el.find('#workorder-returnorder-form').isValid()){
    				 
    				 
    				 var roReasonVal=this.$el.find('#workorder-returnorder-reason').combobox('value');
    				 var roDS = this.$el.find('#workorder-returnorder-reason').data('uiCombobox').options.dataSource;
    				 var choseRS = _.find(roDS, function(obj1){ return obj1.reasonId == roReasonVal; }); 
    				 var choseRSC=choseRS?choseRS.reasonCode:'';
    				 
    				 var fnWOs ={
							 workOrderId: this.options.order.id,
							 returnReasonId: roReasonVal,//this.$el.find('#workorder-returnorder-executetime').val(),
							 returnReasonCode:choseRSC,
							 operId:currentUser.staffId,
							 operName:currentUser.staffName,
							 returnComments:this.$el.find('#workorder-returnorder-reasondesc').val()
					 };
    				 
    				 var me =this;var popup=this.popup;
    				 utils.ajax('iomService','returnWorkOrder',fnWOs).done(function(ret){
    					 if(ret){
    						
    						 if(ret.isSuccessFlag=="0"){
    							 fish.info({title:'退单成功',message:'退单成功'}).result.always(function(){
        							 popup.close(ret);
        						 });
							 }
							 else{
								 fish.info({title:'退单失败',message:'退单失败'}).result.always(function(){
        							 popup.close(ret);
        						 });
							 }
    						 
    					 }
    					 console.log(ret);
    				 }).fail(function(){
    					 fish.error({title:'退单失败',message:'退单失败'}).result.always(function(ret){
							 popup.close(ret);
						 });
    				 });
    			 }
    		}
    	});
    });