define(['text!modules/idcrm/common/moduleForm/templates/PreView.html',
    'modules/idcrm/common/moduleForm/views/ModuleForm.js'],
   function(preViewHtml,moduleForm){
	  return fish.View.extend({
	    	events:{'click #common-template-preview-btn':'showPre',
	    	        'click #common-template-previewDlg-btn':'showPreDlg'},	
	       //这里用来进行dom操作
	       _render: function() {
              this.$el.append(preViewHtml);
              return this;
	       },
	       _afterRender: function() {
	            $('#common-template-action').combobox({
                  placeholder: '请选择操作',
                  dataTextField: 'name',
                  dataValueField: 'value',
                  dataSource: [{name:'新增',value:'insert'},
			                  {name:'修改',value:'modify'},
			                  {name:'查看',value:'detail'}]
               });
	       },
	       showPre:function(){
	          var me = this;
	          if(!$('#common-template-Qryform').isValid()){
                 return;
              }

              var formValues = $('#common-template-Qryform').form('value');
              $('#common-template-preview').html('');//清空
	          moduleForm.init($('#common-template-preview'),formValues.moudleCode,formValues.templateCode,formValues.action);
	       },
	       showPreDlg:function(){
	          if(!$('#common-template-Qryform').isValid()){
                 return;
              }
               var formValues = $('#common-template-Qryform').form('value');
               var contentHtml ='<div class="ui-dialog dialog-md" id="common-template-predlg">'
	                           + '<div class="modal-header">'
	                           +'	<h4 class="modal-title">弹窗预览结果</h4>'
	                           +'</div>'
	                           +'<div class="modal-body" id="common-template-predlgbody">'
	                           +'</div>'
                               +'</div>';
	           var options = {
		            height: formValues.dlgHeight || 500,
		            width:formValues.dlgWidth || 1200,
		            modal: false,
		            draggable: false,
		            content: $(contentHtml),
		            autoResizable: true
		       };
		       fish.popup(options);
              
               $('#common-template-predlgbody').html('');//清空

	           moduleForm.init($('#common-template-predlgbody'),formValues.moudleCode,formValues.templateCode,formValues.action);	          
	       }
       });
});