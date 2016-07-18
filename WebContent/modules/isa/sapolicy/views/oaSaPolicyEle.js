define([
	'text!modules/isa/sapolicy/templates/oaSaPolicyEle.html',
	'i18n!modules/isa/sapolicy/i18n/oaSaPolicyEle.i18n',
	'modules/common/cloud-utils',
	'css!modules/isa/sapolicy/styles/sapolicymanagement.css'
], function(oaSaPolicyEleViewTpl, i18nSapolicy,utils,css) {
	return fish.View.extend({
		rowMap:{},
		template: fish.compile(oaSaPolicyEleViewTpl),
		i18nData: fish.extend({}, i18nSapolicy),
		events: {
			'click #operation-sel-btn':'getOaSaPolicyEleData',
			'click #operation_adde_btn':'addSaPolicy',
			'click #operation_edit_btn':'editSaPolicy', 
			'click #operation-delelte-btn':'delSaPolicy',
			'click #submit-btn':'submit'
		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},
		
		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.rowMap.acType = 0;
			this.loadOaSaPolicyEleRender();
			
			//获得所有的策略元素数据
			var map = new Object();
			var me = this;
			utils.ajax('isaOaSapolicySercice','qryOaSaPolicyEle',map).done(function(ret){
				//输入类型
				$('#isa_inputType').combobox({
					placeholder: '请选择',
					dataTextField: 'name',
					dataValueField: 'value',
					dataSource:  [
					              {name: '文本框', value: '1'},
					              {name: '下拉选择', value: '2'},
					              {name: '弹出页面', value: '3'}			             
					          ]

				});
				//依赖元素
				$('#isa_dependName').combobox({
					placeholder: '请选择',
					dataTextField: 'name',
					dataValueField: 'value',
					dataSource: ret
				});
			});
		},
		
		
		//策略元素列表
		loadOaSaPolicyEleRender: function() {
			this.$("#oaSaPolicyEleGrid").grid({
				datatype: "json",
				height: 370,
				colModel: [{
					name: 'eleId',
					label: '元素标识',
					key:true,
					width: 200
				},{
					name: 'eleName',
					label: '元素名称',
					width: 200
				},{
					name: 'objSql',
					label: '组件SQL',
					width: 200
				},{
					name: 'staticDataSql',
					label: '静态数据sql',
					width: 200
				},{
					name: 'urlString',
					label: '选择页面url',
					width: 200
				},{
					name: 'dependName',
					label: '依赖元素',
					width: 200
				},{
					name: 'memo',
					label: '备注',
					width: 200
				},{
					name: 'createDate',
					label: '创建时间',
					width: 200
				},{
					name: 'stateDate',
					label: '状态时间',
					width: 200
				},{
					name: 'inputType',
					label: '输入类型',
					hidden: true
				}],
				multiselect: true,
				rowNum: 10,
				recordtext: "当前显示 {0} - {1} 条记录 共 {2} 条记录",
		        pgtext: "第 {0} 页 / 共 {1} 页",
		        emptyrecords: "没有记录",
		        gridview:false,
		        onPaging: function (pgButton){ //检查用户输入的页数
		            var currentPage = $('#oaSaPolicyEleGrid').jqGrid('getGridParam','page');
		            var lastPage = $('#oaSaPolicyEleGrid').jqGrid('getGridParam','lastpage');
		            var input = Math.floor($(".ui-pg-input").val());
		            if (pgButton == 'first' && currentPage==1){
		                return 'stop';
		            }
		            else if (pgButton == 'prev' && currentPage==1){
		                return 'stop';
		            }
		            else if (pgButton == 'next' && currentPage==lastPage){
		                return 'stop';
		            }
		            else if (pgButton == 'last' && currentPage==lastPage){
		                return 'stop';
		            }
		            else if (pgButton == 'user' && (!$.isNumeric(input) || input<1 || input>lastPage)){
		                fish.showWarn("无效页数，请输入正确的页数。");
		                return 'stop';
		            }
		        },
				pager: true,
				server: true,
				pageData: this.getOaSaPolicyEleData,
				onSelectRow:$.proxy(function(e, rowid, state, checked){
					var c = e;
					//this.showSaPolicy(e, rowid, state, checked);
				},this),
				onCellSelect: $.proxy(function (e, rowid, iCol, cellcontent) {//选中单元格的事件
					var c = e;
					$("#oaSaPolicyEleGrid").jqGrid("setSelection",rowid,false);
					this.showSaPolicy(e, rowid, iCol, cellcontent);
			    },this)
			});
		},
		
		
		
		//根据查询条件查询策略元素 分页
		getOaSaPolicyEleData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#oaSaPolicyEleGrid").grid("getGridParam", "rowNum");
			if(null == page || (typeof page)=="object" ){
				page = 1;
			}
			var $form1 = $('#form-pending').form('value');
			var map = new Object();
			map.actionStr = "queryOaSaPolicyEle";	
			map.pageIndex = (page-1)*10+1+"";
			map.pageSize = 10+"";
			map.eleName= $form1.eleName;
			map.objSql= $form1.objSql;
			map.staticDataSql= $form1.staticDataSql;
			map.urlString= $form1.urlString;
			map.memo= $form1.memo;
			var me =this;
			utils.ajax('isaOaSapolicySercice','queryOaSaPolicyEle',map).done(function(ret){
				if(ret!=null){
					var records = ret.total;
					var total =Math.ceil(ret.rows.length/10);					
					var result = {
							"rows": ret.rows,
							"page": page,
							"total":total,
							"records":records,
							"eleId": "eleId"
						};
					$("#oaSaPolicyEleGrid").grid("reloadData", result);
				}
			});
		},
		
		showSaPolicy:function(e, rowid, state, checked){
			var getRowDataTemp = this.$("#oaSaPolicyEleGrid").grid("getSelection");//返回所有被选中的行
			if(null == getRowDataTemp){
				console.log('请选择行！');
			}
			var $form1 = $('#form-policy').form('value');
			if(undefined!=getRowDataTemp.eleName){
				document.getElementById("isa_eleName").value=getRowDataTemp.eleName;
			}else{
				document.getElementById("isa_eleName").value='';
			}
			
			if(undefined!=getRowDataTemp.inputType){
				$('#isa_inputType').combobox('value', getRowDataTemp.inputType+"");
			}else{
				$('#isa_inputType').combobox('value', '');
			}
			if(undefined!=getRowDataTemp.dependName){
				$('#isa_dependName').combobox('text', getRowDataTemp.dependName);
			}else{
				$('#isa_dependName').combobox('text', '请选择');
			}
			if(undefined!=getRowDataTemp.urlString){
				document.getElementById("isa_url").value=getRowDataTemp.urlString;
			}else{
				document.getElementById("isa_url").value='';
			}
			if(undefined!=getRowDataTemp.objSql){
				document.getElementById("isa_objSql").value=getRowDataTemp.objSql;
			}else{
				document.getElementById("isa_objSql").value='';
			}
			if(undefined!=getRowDataTemp.staticDataSql){
				document.getElementById("isa_staticDataSql").value=getRowDataTemp.staticDataSql;
			}else{
				document.getElementById("isa_staticDataSql").value='';
			}
			if(undefined!=getRowDataTemp.memo){
				document.getElementById("isa_memo").value=getRowDataTemp.memo;
			}else{
				document.getElementById("isa_memo").value='';
			}
		},
		
		//新增
		addSaPolicy:function(){
		    $('#form-policy').form('clear');
		    this.rowMap.acType = 1;//新增
		},
		
		//编辑
		editSaPolicy:function(){
			this.rowMap.acType = 2;//编辑
		},
		
		submit:function(){
			var map = new Object();
			var $form1 = $('#form-policy').form('value');
			var me =this;
			if(me.rowMap.acType==1){
				map.eleName = $form1.eleName;
				map.objSql = $form1.objSql;
				map.staticDataSql = $form1.staticDataSql;
				map.urlString = $form1.url;
				map.memo = $form1.memo;
				map.inputType = $form1.inputType;
				map.dependEleId = $form1.dependName;
				map.state = 1+"";
				map.operId = currentUser.staffId+"";
				map.operMan = currentUser.staffName;
				utils.ajax('isaOaSapolicySercice', 'addOaSaPolicyEle', map).done(function(ret){
		            	if(ret){
		            		if(ret == "SUCCESS"){
		            			me.getOaSaPolicyEleData();
		            			fish.success('新增成功');
		            		}else{
		            			fish.error('新增失败');
		            		}
		            	}else{
		        			fish.info('消息未返回');
		        		}
		            });
			}else if(me.rowMap.acType==2){	
				var getRowDataTemp = this.$("#oaSaPolicyEleGrid").grid("getSelection");//返回所有被选中的行
				if(null == getRowDataTemp){
					console.log('请选择行！');
				}
				map.eleId = getRowDataTemp.eleId;
				map.eleName = $form1.eleName;
				map.objSql = $form1.objSql;
				map.staticDataSql = $form1.staticDataSql;
				map.urlString = $form1.url;
				map.memo = $form1.memo;
				map.inputType = $form1.inputType;
				map.dependEleId = $form1.dependName;
				map.state = 1+"";
				map.operId = currentUser.staffId+"";
				map.operMan = currentUser.staffName;
				utils.ajax('isaOaSapolicySercice', 'updateOaSaPolicyEle', map).done(function(ret){
		            	if(ret){
		            		if(ret == "SUCCESS"){
		            			me.getOaSaPolicyEleData();
		            			fish.success('修改成功');
		            		}else{
		            			fish.error('修改失败');
		            		}
		            	}else{
		        			fish.info('消息未返回');
		        		}
		            });
			}
		},
		
		//删除
		delSaPolicy:function(){
			var getRowDataTemp = this.$("#oaSaPolicyEleGrid").grid("getCheckRows");//返回所有被选中的行
			if(null == getRowDataTemp){
				console.log('请选择行！');
			}
			var map = new Object();
			if(getRowDataTemp!=null&&getRowDataTemp.length>0){
				map.eleId = getRowDataTemp[0].eleId+"";
				for(var i=1;i<getRowDataTemp.length;i++){
					map.eleId+=","+getRowDataTemp[i].eleId
				}
			}
			
			//map.eleId = getRowDataTemp.eleId+"";
			map.state = 0+"";
			var me =this;
			fish.confirm('你确定要删除吗？').result.then(function() {
	            utils.ajax('isaOaSapolicySercice', 'delOaSaPolicyEle', map).done(function(ret){
	            	if(ret){
	            		if(ret == "SUCCESS"){
	            			me.getOaSaPolicyEleData();
	            			fish.success('删除成功');
	            		}else{
	            			fish.error('删除失败');
	            		}
	            	}else{
	        			fish.info('消息未返回');
	        		}
	            });
            });
		}
	});	
});