define([
	'text!modules/idcrm/ipaddrm/iprm/templates/DataCenterSelectView.html',
	'i18n!modules/idcrm/ipaddrm/iprm/i18n/agency.i18n',
	'modules/common/cloud-utils'
], function(frameViewTpl, i18nEquip,utils, css) {
	return fish.View.extend({
		template: fish.compile(frameViewTpl),
		i18nData: fish.extend({}, i18nEquip),
		events: {            
		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			this._initSpaceTree();
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		
		_afterRender: function() {			
            var popup = this.popup;
            this.$el.on('click', '#save-button', function(e) {				
            	var nodes =  $("#ipaddr_room_tree").tree("getSelectedNodes");
                if (nodes.length == 0 || nodes.length > 1 ) {
                    fish.info("请先选择一个节点!");
                    return;
                }
                var node = nodes[0];
                
                if(node.tag !='dataCenter'){
                	fish.info("请选择一个数据中心!");
                    return;
                }
                var isDataCenter = (node && node.tag == "dataCenter");
                if(isDataCenter){
                	$("#ipseg_qry_dcname").val(node.name);
                	$("#ipseg_qry_dcid").val('');
                	var nodeid = node.id.split('_')[1];
                	node.id = nodeid;
                    $("#ipseg_qry_dcid").val(nodeid);
                }
				popup.close(node);
			});
		},
        _initSpaceTree: function(){
    		var me =this;
    		//滚动条
    		    me.$('#ipaddr_room_tree').height(495);
    		    me.$('#ipaddr_room_tree').niceScroll({
    			        cursorcolor: '#CE0015',
    			        cursorwidth: "7px"
    			});
                 
    		     var onNavTreeClick = $.proxy(this.onNavTreeClick,this); //函数作用域改变
                 var settings = {
                      view:{
                         dblClickExpand: false
                      },
                      data: {
                              simpleData: {
                                  enable: true,
                                  rootPId:'area_0'
                              }
                            },
                     callback: {
                                 onClick: onNavTreeClick
                               }
                 };
                 me.$("#ipaddr_room_tree").tree(settings);
                 //获取区域和数据中心
                this.$("#ipaddr_room_tree").blockUI({message:''});
                utils.ajax('commonService','getAllAreasAndDcsTree')
    		   	     .always(function(){
                         me.$("#ipaddr_room_tree").unblockUI();   
                     })
    		   	     .done(function(nodeDatas){   
    		   	          if(!nodeDatas){
    		   	             nodeDatas = [];
    			   	      }
    	                  fish.each(nodeDatas,function(element, index){
    			   	          element.icon = me.getNavtreeIcon(element.tag,element.grade);
    			   	      });             
                          me.$("#ipaddr_room_tree").tree('reloadData',nodeDatas);
                     }).fail(function(){
                            console.log("加载空间树失败");
                     }); 
    		},
    		 getNavtreeIcon: function(tag,grade){//空间资源导航树图标
       		   if(tag == "area" && grade == "C2"){
                      return "resources/images/idc/treeNode/province.png";
       		   }else if(tag == "area" && grade == "C3"){
                      return "resources/images/idc/treeNode/city.png";
       		   }else if(tag == "area" && grade == "C4"){
                      return "resources/images/idc/treeNode/county.png";
       		   }else if(tag == "dataCenter"){
       		      return "resources/images/idc/treeNode/datacenter.png";
       		   }else if(tag == "dcRoom"){
       		      return "resources/images/idc/treeNode/datacenter.png";
       		   }
       		}
	});
});