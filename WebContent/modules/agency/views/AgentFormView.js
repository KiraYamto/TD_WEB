define([
    	'text!modules/agency/templates/AgentFormView.html',
    	'i18n!modules/agency/i18n/agency.i18n',
    	'modules/common/cloud-utils'
    ], function(AgencyMenegementViewTpl, i18nAgency,utils) {
    	return fish.View.extend({
    		template: fish.compile(AgencyMenegementViewTpl),
    		i18nData: fish.extend({}, i18nAgency),
    		events: {

    		},
    		
    		//这里用来进行dom操作
    		_render: function() {
    			var html=$(this.template(this.i18nData));
    			html.find('#agent-starttime').datetimepicker({
    				endDate: fish.dateutil.addDays(new Date(), 10)
    			});

    			html.find('#agent-endtime').datetimepicker({
    				endDate: fish.dateutil.addDays(new Date(), 10)
    			});
    			this.popeditControl= html.find('#agent').popedit({
    				dataTextField :'text',
    				dataValueField :'id',
    				dialogOption: {
    					height: 400,
    					width: 500,
    					viewOptions:{
    						orgId:101,
    						orgPathName:'啦啦啦'
    					}
    				},
    				url:"js!modules/common/popeditviews/areas/views/SelectAreaByAreaIdView",//'js!modules/common/popeditviews/stafforg/views/JobStaffsbyOrgView',//'js!modules/common/popeditviews/stafforg/views/JobStaffsbyParentOrgView',
    				showClearIcon:false
    			});

    			var options = {
        				data: {
        					key:{name:'text'},
        					simpleData: {
        						enable: true,
        						pIdKey:'parentId'
        					}, keep: {
        						parent: true, leaf: true
        						}
        				},
        				callback: {
        					/*beforeClick: beforeClick,
        					beforeCollapse: beforeCollapse,
        					beforeExpand: beforeExpand,*/
        					onCollapse: $.proxy(this.onCollapse, this),
        					onExpand: $.proxy(this.onExpand, this)
        				},
        				fNodes : [
        				]
        			};
        			var $tree = html.find("#agency-agent-tree").tree(options);
        			
    			utils.ajax('staffService','qryStaffTreeByParentId',currentJob.orgId).done(function(ret){
    				var root=[];
    				root.push({
    					id:currentJob.orgId,
    					text:currentJob.orgPathName,
    					leaf:0,
    					parentId:0,
    					isParent :true,
    					isLoad:true
    				});
    				if(ret)
    				$.each(ret,function(i,n){
    					if(n.leaf==1){
    						n.isParent =false;
    					}
    					else{
    						n.isParent =true;
    					}
    					root.push(n);
    				});
    				
    				$tree.tree('reloadData', root);
    			});

    			

    			html.find('#agent-form').form();
    			this.$el.html(html);

    			return this;
    		},
    		onCollapse:function(event, treeNode){
    			
    		},
    		onExpand:function(event, treeNode){
    			if(!treeNode.isLoad){
    				treeNode.isLoad=true;
    				
    				utils.ajax('staffService','qryStaffTreeByParentId',treeNode.id).done(function(ret){
    					var treeInstance = $("#agency-agent-tree").tree("instance");
    					
    					
        				if(ret)
        				$.each(ret,function(i,n){
        					if(n.leaf==1){
        						n.isParent =false;
        					}
        					else{
        						n.isParent =true;
        					}
        					
        				});
        				treeInstance.addNodes(treeNode,ret);
        			});
    			}
    			
    			
    		},
    		
    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
    			var popup=this.popup;
    			var me=this;
    			this.$el.on('click','#agency-agent-choose',function(e){
    				 var treeInstance = me.$("#agency-agent-tree").tree("instance");
    				 var nodes = treeInstance.getSelectedNodes();
    			        var treeNode =null;
    				 if(nodes&&nodes.length>0){
    					 treeNode= nodes[0];
    				 }
    				 if((!treeNode)||treeNode.isParent){
    					 fish.info("请选择一个人员");
    				 }
    				 else{
    					 console.log(treeNode);
    					 me.$("#agency-demodialog").dialog("setReturnValue",treeNode);
    					 me.$("#agency-demodialog").dialog("close");
    					
    				 }
    			});
    			
    	this.$el.on('click','#agency-agent-Close',function(e){
    		me.$("#agency-demodialog").dialog("setReturnValue",null);
    		me.$("#agency-demodialog").dialog("close");
    	});
    			this.$el.on('click', '#save-button', function(e) {
    				var ret = me.$('#agent-form').form('value')||{};
    				ret.agent=me.$('#agent').data('uiPopedit').getValue();
    				popup.close(ret);
    			});
    			
    			
    		}
    	});
    });