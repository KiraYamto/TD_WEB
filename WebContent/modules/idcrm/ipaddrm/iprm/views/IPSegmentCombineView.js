define([
    	'text!modules/idcrm/ipaddrm/iprm/templates/IPSegmentCombineView.html',
    	'i18n!modules/idcrm/ipaddrm/iprm/i18n/agency.i18n',
    	'modules/common/cloud-utils',
    	'css!modules/idcrm/ipaddrm/iprm/styles/ipAddr.css'
    ], function(AgencyMenegementViewTpl, i18nAgency,utils) {
    	return fish.View.extend({
    		template: fish.compile(AgencyMenegementViewTpl),
    		i18nData: fish.extend({}, i18nAgency),
    		events: {
    			//
    			 "click #ipseg-combine-btn":"ipsegCombineClick"
    		},
    		//这里用来进行dom操作
    		_render: function() {
    			this.$el.html(this.template(this.i18nData));
    			return this;
    		},
    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
//    			this.loadStaticData();
//              this.loadTreeRender();
    			this.loadIpSegmentRender();
    			this.getIpSegmentData(1);
    		},
    		loadStaticData:function(){
    			var self = this;
    			$("select[attrCode]").each(function(o){
    				$this = $(this);
    				var attrCode = $this.attr("attrCode");
    				self.renderSelect($this,attrCode);				
    			});
    		},
    		renderSelect:function(o,attrCode){
    			utils.ajax('basicDataService', 'getBasicDataListByBasicType',attrCode).done(function(ret){
    				var html="<option value=''>--请选择--</option>";
    				if(ret){
                    	for(var key in ret ){
                    		var basicDataDto = ret[key];
                    		html+="<option value='"+basicDataDto.code+"'>"+basicDataDto.value+"</option>";
                    	}
                    }	
    				o.append($(html));
                });
    		},
            loadIpSegmentRender: function() {
    			this.$("#ipseg-combine-grid").grid({
    				datatype: "json",
    				height: 400,
    				colModel: [{
                        name: 'ID',
                        label: 'ID',
                        key:true,
                        hidden:true
                    },
                    {
    					name: 'segmUse',
    					label: '用途',
    					width: 100,
    					hidden:true
    				},{
    					name: 'useState',
    					label: '占用状态',
    					width: 100,
    					hidden:true
    				},{
    					name: 'serviceTypeId',
    					label: '业务类型',
    					width: 100,
    					hidden:true
    				},{
    					name: 'segmDesc',
    					label: '描述',
    					width: 100,
    					hidden:true
    				},{
    					name: 'comments',
    					label: '备注',
    					width: 100,
    					hidden:true
    				},
    				/**
    				{
    					name: 'roomId',
    					label: '所属机房ID',
    					width: 100,
    					hidden:true
    				},
    				*/
    				{
    					name: 'dcId',
    					label: '所属数据中心ID',
    					width: 100,
    					hidden:true
    				},
    				{
    					name: 'segmName',
    					label: '地址段名称',
    					width: 100
    				}, {
    					name: 'parentCode',
    					width: 100,
    					label: '所属地址段'
    				},
    				/**
    				{
    					name: 'roomName',
    					label: '所属机房',
    					width: 100
    				}, 
    				*/
    				{
    					name: 'dcName',
    					label: '所属数据中心',
    					width: 100
    				},
    				{
    					name: 'useStateName',
    					width: 60,
    					label: '业务状态'
    				}, {
                        name: 'startIp',
                        width: 100,
                        label: '起始IP'
                    }, {
                        name: 'endIp',
                        width: 100,
                        label: '终止IP'
                    }, {
                        name: 'segmUseName',
                        width: 60,
                        label: '用途'
                    }, {
                        name: 'gateway',
                        width: 100,
                        label: '网关'
                    }, {
                        name: 'ipMark',
                        width: 120,
                        label: '子网掩码'
                    }],
                    rowNum: 10,
                    multiselect: true,
                    shrinkToFit: true,
                    rownumbers:true,
                    pager: true,
                    server: true,
                    recordtext: "当前显示 {0} - {1} 条记录 共 {2}条记录",
                    pgtext: "第 {0} 页 / 共 {1} 页",
                    emptyrecords: "没有记录",
    				pageData: this.getIpSegmentData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
    			});
    		},
    		getIpSegmentData:  function(page, sortname, sortorder) {
    			var me = this;
    			var segmId = me.options.segmId;
    			var parentId = me.options.parentId;
    			/**
    			if(parentId == 0){
    				fish.info('该IP段不能合并,请选择已拆分过的IP段进行合并！');
    				return;
    			}
    			*/
            	var rowNum = $("#ipseg-combine-grid").grid("getGridParam", "rowNum");
                // 查询的时候 锁定页面
                if ($('#ipseg-combine-grid').data('blockui-content')) {
                    $('#ipseg-combine-grid').unblockUI().data('blockui-content', false);
                } else {
                    $('#ipseg-combine-grid').blockUI({
//                        message: '加载中......'
                    }).data('blockui-content', true);
                }
                var queryParamsDto ={};
                queryParamsDto["pageIdx"]=page;
                queryParamsDto["pageSize"]=rowNum;
                if(typeof(sortname) == "undefined"){
                	utils.ajax('ipaddrservice', 'findIPSegListByParentId', queryParamsDto,parentId).done(function(ret){
                        $("#ipseg-combine-grid").grid("reloadData", ret);
                        // 解锁页面
                        $('#ipseg-combine-grid').unblockUI().data('blockui-content', false);
                    });
    			}else{
    				utils.ajax('ipaddrservice', 'findIPSegListById', queryParamsDto,parentId).done(function(ret){
                        $("#ipseg-combine-grid").grid("reloadData", ret);
                        // 解锁页面
                        $('#ipseg-combine-grid').unblockUI().data('blockui-content', false);
                    });
    			}
    			
            },
            // 查询
            ipsegQueryBtnClick: function() {
                this.getIpSegmentData(1);
            },
            //合并子网
            ipsegCombineClick:function() {
            	var me = this;
    			var parentId = me.options.parentId;
            	var selectedFrameIds = $("#ipseg-combine-grid").grid('getGridParam', 'selarrrow');
            	  if (selectedFrameIds == null || selectedFrameIds.length == 0 || selectedFrameIds.length == 1) {
                      fish.info("请选择要合并的多条数据！");
                      return;
                  }
            	  var IpAddrSegmentStr = [];
                  for(var i in selectedFrameIds){
                	  IpAddrSegmentStr.push({"id":selectedFrameIds[i]});
                  }
            	utils.ajax('ipaddrservice','checkIsCanCombine',IpAddrSegmentStr).done(function(rets){
            		if(rets==-2){
            			fish.info("所选网段已进行过拆分，需先合并后再拆分！");
            			return;
            		}
            		if(rets==-1){
            			fish.info("该IP段下已存在占用的IP地址，暂不能合并！");
            			return;
            		}
            		utils.ajax('ipaddrservice','combineIPAddrSegment',IpAddrSegmentStr,parentId).done(function(){
            			fish.info('合并成功！');
            			me.getIpSegmentData(1,parentId);
            		}).fail(function(e){
  	                  fish.error(e);
  	              	});
	              }).fail(function(e){
	                  fish.error(e);
	              });
            }
    	});
});
