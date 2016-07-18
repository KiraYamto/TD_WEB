define([ 'text!modules/idcrm/common/popeditviews/dataCenterRoom/templates/TestView.html',
		'modules/common/cloud-utils' ], function(TestView,utils) {

	return fish.View.extend({
		template : fish.compile(TestView),
		events : {
			'click #idcrm-dcOrRoomtest-getbtn' : 'showDcOrRoomOk',
			'click #idcrm-dcOrRoomtest-popbtn' : 'popBtn'
		},
		_render : function() {// 这里用来进行dom操作
			var html = $(this.template({}));
			this.$el.html(html);
		},
		
		_afterRender : function() {
           var me =this;
			this.$('#idcrm-dcOrRoomtest-selectAll').popedit({
				dataTextField :'roomName',
				dataValueField :'roomId',
				dialogOption: {
					height: 400,
					width: 500
				},
				url:'js!modules/idcrm/common/popeditviews/dataCenterRoom/views/SelectDCOrRoomView'
			});

			this.$('#idcrm-dcOrRoomtest-selectByArea').popedit({
				dataTextField :'dataCenterName',
				dataValueField :'dataCenterId',
				dialogOption: {
					height: 400,
					width: 500,
					viewOptions:{selType:'dataCenterOrRoom'},
				},
				url:'js!modules/idcrm/common/popeditviews/dataCenterRoom/views/SelectDCOrRoomView'
			});
			
		},
		showDcOrRoomOk : function(event, treeNode) {
			var dcOrRoomValue1 = $('#idcrm-dcOrRoomtest-selectAll').popedit('getValue');
			$('#idcrm-dcOrRoomtest-resultAll').html(JSON.stringify(dcOrRoomValue1));

	
			var dcOrRoomValue2 = $('#idcrm-dcOrRoomtest-selectByArea').popedit('getValue');
			$('#idcrm-dcOrRoomtest-resultSelByArea').html(JSON.stringify(dcOrRoomValue2));

		},
		popBtn: function(){
		   fish.popupView({ 
		       url: 'modules/idcrm/common/popeditviews/dataCenterRoom/views/SelectDCOrRoomView',
			   width: "70%",
               height:500,
			   viewOption:{areaId:1},	
			   callback:function(popup,view){
			   	   popup.result.then(function (ret) {			   	       
	                   console.info(JSON.stringify(ret));
			   	   },function (e) {
			   	   	   console.log('关闭了',e);
			   	   });
			   }
		  });
		}
	});
});