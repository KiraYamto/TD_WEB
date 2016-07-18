var orderData = {};
var mydatas = [],
  page, mydata, searchType, ret, // 调用后台返回的对象数据
  mydatas1 = [],
  ret1, // 调用后台返回的对象数据
  isShowSearchTip = false,
  orderSelectRowid, cObj = null,
  hisFlag = 0,
  areaJson, privilege = "000",
  jobId, areaId;

var finish = '';
var updateAutoWorkOrder = '';

$(document).ready(function() {
	// 设置为中文
    fish.setLanguage('zh');
	 

    $("#vertical").height( $(window).height());
	$("#middle-pane").height( $(window).height()-95);

      // ur730058 by weiyz初始化隐藏 重新跑单、定单作废按钮
      $("#reDispatchOrder").hide();
      $("#orderAbolish").hide();

      // ur730058 end

      // 定单
      var options = {
        data: mydatas,
        datatype: "json",
        width: $(window).width() - 10,
        height: ($(window).height() - 155),
        rowNum: 15,
        pager: true,
        server: true,
        onPaging: function(e, page,opt) { // 检查用户输入的页数
          var currentPage = $('#orderGrid').grid('getGridParam',
            'page');
          var lastPage = $('#orderGrid').grid('getGridParam',
            'lastpage');
          var input = Math.floor($(".ui-pg-input").val());
          if (opt == 'first' && currentPage == 1) {
            return 'stop';
          } else if (opt == 'prev' && currentPage == 1) {
            return 'stop';
          } else if (opt == 'next' && currentPage == lastPage) {
            return 'stop';
          } else if (opt == 'last' && currentPage == lastPage) {
            return 'stop';
          } else if (opt == 'user' && (!$.isNumeric(input) || input < 1 || input > lastPage)) {
            fish.showWarn("无效页数，请输入正确的页数。");
            return 'stop';
          }
        },
        pageData: function(targetPage, sortColumn, sortOrder) {
          page = targetPage;
          if (sortColumn == '') {
            sortColumn = 'createdDate';
            sortOrder = 'ASC';
          }
          paging(sortColumn, sortOrder);
          // return mydatas;
        },
        recordtext: "当前显示 {0} - {1} 条记录 共 {2} 条记录",
        pgtext: "第 {0} 页 / 共 {1} 页",
        emptyrecords: "没有记录",
        multiselect: true, // 表示可以多选
        gridview: false,
        onSelectRow:function(e, rowid, state, checked) { // 表示选择哪一行
          // ur730058 by weiyz 流程未启动，并且已经超出10分钟，则显示 重新跑单 按钮
          var orderStateName = $("#orderGrid").grid('getCell',rowid, 'orderStateName');
          var createDate = $("#orderGrid").grid('getCell',rowid, 'createDate');

          var now = new Date();
          var dif = (now - Date.parse(createDate.replace(/-/g, "/"))) / 60 / 1000;

          if (("流程未启动" == orderStateName && dif > 10) 
        		  || "正常执行中" == orderStateName 
        		  || "调度异常" == orderStateName
        		  || "作废" == orderStateName) {
            $("#reDispatchOrder").show();
          } else {
            $("#reDispatchOrder").hide();
          }

          // 单子未竣工，则允许作废
          if ("已竣工" == orderStateName || "流程未启动" == orderStateName) {
            $("#orderAbolish").hide();
          } else {
            $("#orderAbolish").show();
          }
          // ur730058 end

          if (state == true) {
            orderSelectRowid = rowid;
            $("#orderGrid").grid("resetSelection");
            $("#orderGrid").grid("setSelection",orderSelectRowid, false);
              getWorkOrder();
          } else {
            $("#orderGrid").grid("resetSelection");
          }

          orderData = $("#orderGrid").grid("getRowData", rowid);
        },
        afterInsertRow: function(e, rowid, data) {
          var value = data.orderStateName;
          if(undefined !== value){
              if (value.indexOf("竣工") != -1 || value.indexOf("正常") != -1) {
                  jQuery("#orderGrid")
                    .grid(
                      'setCell',
                      rowid,
                      'orderStateName',
                      '', {
                        "background": "rgba(12, 200, 48, 0.5)"
                      }); // 绿
                } else if (value.indexOf("异常") != -1) {
                  jQuery("#orderGrid")
                    .grid(
                      'setCell',
                      rowid,
                      'orderStateName',
                      '', {
                        "background": 'rgba(238, 22, 22, 0.5)'
                      }); // 红
                } else {
                  jQuery("#orderGrid")
                    .grid(
                      'setCell',
                      rowid,
                      'orderStateName',
                      '', {
                        "background": 'rgba(245, 238, 32, 0.5)'
                      }); // 黄
                }
          }
        },
        shrinkToFit: true,
        colModel: [{
          name: 'orderCode',
          label: '定单编码',
          index: 'orderCode',
          align: 'center',
          width: 150,
          height: 100,
          formatter:function(cellval,opts,rwdat,_act){
        	  return "<span style = 'text-decoration:underline'onclick = 'openOrderDetail("+opts.rowId+")'>"+cellval+"</span>";
          },
          sortable: false
        }, {
          name: 'areaName',
          label: '区域',
          index: 'areaName',
          align: 'center',
          width: 80,
          height: 100,
          sortable: false
        }, {
          name: 'accNbr',
          label: '业务号码',
          index: 'accNbr',
          align: 'center',
          width: 100,
          height: 100,
          sortable: false
        }, {
          name: 'orderTitle',
          label: '定单标题',
          index: 'orderTitle',
          align: 'center',
          width: 150,
          height: 180,
          sortable: false
        }, {
          name: 'custOrderCode',
          label: '客户订单编码',
          index: 'custOrderCode',
          align: 'center',
          width: 140,
          height: 100,
          sortable: false
        }, {
          name: 'orderStateName',
          label: '定单状态',
          index: 'orderStateName',
          align: 'center',
          width: 100,
          height: 100,
          sortable: false
        }, {
          name: 'orderState',
          hidden: true,
          label: '定单状态',
          index: 'orderState',
          align: 'center',
          width: 100,
          height: 100,
          sortable: false
        }, {
          name: 'createDate',
          label: '定单创建时间',
          index: 'createDate',
          align: 'center',
          width: 120,
          height: 100,
          sortable: false
        }, {
          name: 'finishDate',
          label: '定单结束时间',
          index: 'finishDate',
          align: 'center',
          width: 120,
          height: 100,
          sortable: false
        }, {
          name: 'orderId',
          key: true,
          label: '定单标识',
          index: 'orderId',
          align: 'center',
          width: 120,
          height: 100,
          sortable: false
        }, {
          name: 'processInstanceCode',
          label: '流程实例标识',
          index: 'processInstanceCode',
          align: 'center',
          width: 120,
          height: 100,
          sortable: false
        }, {
          name: 'hisFlag',
          hidden: true,
          index: 'hisFlag',
          align: 'center',
          width: 100,
          height: 100,
          sortable: false
        }, {
          name: 'prodInstId',
          hidden: true,
          index: 'prodInstId',
          align: 'center',
          width: 100,
          height: 100,
          sortable: false
        }],

        jsonReader: {
          repeatitems: false
        }
      };

      // 工单
      var options1 = {
        data: mydatas1,
        datatype: "json",
        width: $(window).width() * 0.61,
        height: $(window).height() * 0.6,
        server: true,
        multiselect: true, // 表示可以多选
        gridview: false,
        onSelectRow: function(e, rowid, state, checked) { // 表示选择哪一行
          if (state == true) {
            var selectRowid = rowid;
            $("#workOrderGrid").grid("resetSelection");
            $("#workOrderGrid").grid("setSelection", selectRowid,
              false);
            clickWorkOrder(selectRowid);
          } else {
            $("#workOrderGrid").grid("resetSelection");
            if (finish == 'true') {
              $('#finishWorkOrder').attr('disabled',
                false);
              $('#finishWorkOrder')
                .attr("style",
                  "font-size:9pt; padding:1px; margin-right:3px;");
            }
            if (updateAutoWorkOrder == 'true') {
              $('#resetWorkOrder')
                .attr('disabled', false);
              $('#resetWorkOrder')
                .attr("style",
                  "font-size:9pt; padding:1px; margin-right:3px;");
            }
          }
        },
        afterInsertRow: function(e, rowid, data) {
          var value = data.workOrderStateName;
          if (value.indexOf("完成") != -1 || value.indexOf("提单") != -1) {
            jQuery("#workOrderGrid")
              .grid(
                'setCell',
                rowid,
                'workOrderStateName',
                '', {
                  "background": "rgba(12, 200, 48, 0.5"
                }); // 绿
          } else if (value.indexOf("异常") != -1) {
            jQuery("#workOrderGrid")
              .grid(
                'setCell',
                rowid,
                'workOrderStateName',
                '', {
                  "background": 'rgba(238, 22, 22, 0.5)'
                }); // 红
          } else {
            jQuery("#workOrderGrid")
              .grid(
                'setCell',
                rowid,
                'workOrderStateName',
                '', {
                  "background": 'rgba(245, 238, 32, 0.5'
                }); // 黄
          }
        },
        shrinkToFit: false,
        colModel: [{
          name: 'id',
          key: true,
          label: '工单标识',
          index: 'id',
          align: 'center',
          width: 120,
          sortable: false
        }, {
          name: 'tacheName',
          key: true,
          label: '处理环节',
          index: 'tacheName',
          align: 'center',
          width: 150,
          sortable: false
        }, {
          name: 'workOrderStateName',
          label: '工单状态',
          index: 'workOrderStateName',
          align: 'center',
          width: 120,
          sortable: false
        }, {
          name: 'workOrderTypeName',
          label: '工单类型',
          index: 'workOrderTypeName',
          align: 'center',
          width: 120,
          sortable: false
        }, {
          name: 'partyName',
          label: '执行人',
          index: 'partyName',
          align: 'center',
          width: 150,
          sortable: false
        }, {
          name: 'createDate',
          label: '派单时间',
          index: 'createDate',
          align: 'center',
          width: 120,
          sortable: false
        }, {
          name: 'finishDate',
          label: '完成时间',
          index: 'finishDate',
          align: 'center',
          width: 120,
          sortable: false
        }, {
          name: 'returnReasonCode',
          label: '退单原因',
          index: 'returnReasonId',
          align: 'center',
          width: 180,
          sortable: false
        }, {
          name: 'returnReasonDesc',
          label: '回单描述/异常原因',
          index: 'workResult',
          align: 'center',
          width: 180,
          sortable: false
        }, {
          name: 'tacheCode',
          hidden: true,
          index: 'tacheCode',
          align: 'center',
          width: 140,
          sortable: false
        }, {
          name: 'workOrderState',
          hidden: true,
          index: 'tacheCode',
          align: 'center',
          width: 180,
          sortable: false
        }],

        jsonReader: {
          repeatitems: false
        }
      };

      $("#orderGrid").grid(options);
      $("#orderGrid").grid("setGridHeight",$("#middle-pane").height());
      $("#workOrderGrid").grid(options1);

      // 隐藏表头全选按钮
      $("#cb_grid").hide(); 



      //定单列表双击--弹出工单信息
      $("#orderGrid").on('grid:ondblclickrow',function(e, rowid, iRow,iCol){
        	$('#finishWorkOrder').attr('disabled', false);
		    $('#resetWorkOrder').attr('disabled', false);
		    $("#workOrderInfoDialog").dialog({
			      autoOpen: true,
			      height: 480,
			      width: '60%'
		    });
		    getWorkOrder();
		    $("#workOrderInfoDialog").dialog("open");
        });

      //TODO 绑定选中工单详细信息记录双击事件
      $("#workOrderGrid").on('grid:ondblclickrow',function(e, rowid, iRow,iCol){
          $("#xmlDialog").dialog({
	            width: 700,
	            height: 600,
	            modal: true,
	            bgiframe: true,
	            title: "工单详细信息",
	            autoOpen : true,
	            hide: "highlight"
          }); 
          showWorkOrderDetail(rowid); 
        });

      // 重新加载页面后返回最顶
      location.href = "#";

      // 搜索栏自动完成功能
      $("#orderCode").autocomplete({
        delay: 0,
        minLength: 0,
        source: autoCompleteGetCookie("orderCode")
      });
      $("#custOrderCode").autocomplete({
        delay: 0,
        minLength: 0,
        source: autoCompleteGetCookie("custOrderCode")
      });
      $("#accNbr").autocomplete({
        delay: 0,
        minLength: 0,
        source: autoCompleteGetCookie("accNbr")
      });

      // 所属区域
      areaId = "1"; 

      // 日期显示相关
      $('#startDate').datetimepicker({
        buttonIcon: ''
      });
      $('#endDate').datetimepicker({
        buttonIcon: ''
      });
      $('#date').datetimepicker();

      // 初始化查询时间
      initQueryTime();

    });

      //初始化查询时间函数；
      var initQueryTime = function() {
        var date = new Date();
        var month = date.getMonth() + 1;
        if (month < 10) month = '0' + month;
        var date2 = date.getDate();
        if (date2 < 10) date2 = '0' + date2;
        date = date.getFullYear() + '-' + month + '-' + date2;
        // date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        $('#startDate').val(date + " 00:00:00");
        $('#endDate').val(date + " 23:59:59");
      }

    // 窗口大小自适应
     $(window).resize(function() {
      $("#orderGrid").grid("setGridWidth", $(window).width() - 10);
      $("#orderGrid").grid("setGridHeight", $(window).height() - 155);

      });

    //工单信息对话框弹窗窗口自适应
    $("#workOrderInfoDialog").resize(function() {
      $("#workOrderGrid").grid("setGridWidth", $(window).width() * 0.70);
      $("#workOrderGrid").grid("setGridHeight", ($("#workOrderInfoDialog").height() - 120) * 0.65);
    });

    // 回车键事件
    $('.searchValue').bind('keypress', function(event) {
      if (event.keyCode == "13") {
        $("#search").click();
      }
    });
    

    // 查询按钮
    $("#search").click(
      function() {
        page = 1;
        cObj = getConditionObj();

        if (validateDate(cObj) == false) {
          return;
        }

        // 查询的时候 锁定页面
        if ($('#container').data('blockui-content')) {
          $('#container').unblockUI().data('blockui-content', false);
        } else {
          $('#container').blockUI({
            message: '加载中......'
          }).data('blockui-content', true);
        }
		
		 $.ajax({  
			     url:basePath+'/orderManagerController/getOrders',// 跳转到 action  
			     data:{
			    	 map:cObj,
			    	 startIndex:page,
			    	 pageSize:15
			     },  
			     type:'POST',  
			     cache:false,  
			     dataType:'json',  
			     success:function(data) {  
			    	 var total = data.total;//总行数
			    	 var pageIndex = data.pageIndex;//当前页数
			    	 var pageSize = data.pageSize;//每页行数
			    	 var rows = data.rows;//结果集
			         mydata = JSON.stringify(rows);
			         mydatas = '{"total": ' + Math.ceil(total / 15) + ', "page": ' + pageIndex + ', "records": ' + total + ', "rows": ' + mydata + '}';
			         var data = eval('('+mydatas+')');
			         $("#orderGrid").grid("setGridParam", {
			            "server": true
			         });
			         $("#orderGrid").grid("clearGridData");
			         $("#orderGrid").grid("setGridParam", {
			            "data": data,
			            "datatype": "json"
			         });
			         $("#orderGrid").trigger("reloadGrid");
			         $("#workOrderGrid").grid("clearGridData");
			         // 解锁页面
			         $('#container').unblockUI().data('blockui-content', false);
			      },  
			      error : function() {  
			           layer.msg("查询异常！");  
			      }  
			 });
		
        
         
      });

    // 翻页按钮
    function paging(sortColumn, sortOrder) {
      // 查询的时候 锁定页面
      if ($('#container').data('blockui-content')) {
        $('#container').unblockUI().data('blockui-content', false);
      } else {
        $('#container').blockUI({
          message: '加载中......'
        }).data('blockui-content', true);
      }
      
	    $.ajax({  
		     url:basePath+'/orderManagerController/getOrders',// 跳转到 action  
		     data:{
		    	 map:cObj,
		    	 startIndex:page,
		    	 pageSize:15
		     },  
		     type:'POST',  
		     cache:false,  
		     dataType:'json',  
		     success:function(data) {
		    	 var total = data.total;//总行数
		    	 var pageIndex = data.pageIndex;//当前页数
		    	 var pageSize = data.pageSize;//每页行数
		    	 var rows = data.rows;//结果集
		         mydata = JSON.stringify(rows);
		         mydatas = '{"total": ' + Math.ceil(total / 15) + ', "page": ' + pageIndex + ', "records": ' + total + ', "rows": ' + mydata + '}';
		         var data = eval('('+mydatas+')');
		         $("#orderGrid").grid("setGridParam", {
		            "server": true
		         });
		         $("#orderGrid").grid("clearGridData");
		         $("#orderGrid").grid("setGridParam", {
		            "data": data,
		            "datatype": "json"
		         });
		         $("#orderGrid").trigger("reloadGrid");

//		         // 解锁页面
		         $('#container').unblockUI().data('blockui-content', false);
		      },  
		      error : function() {  
		           layer.msg("翻页异常！");  
		      }  
		 });
 
    };

    // 定单详情
    $("#openOrderDetail").click(
      function() {
        var selectedRowID = $("#orderGrid").grid('getGridParam','selrow'); //获取选中的行标识；
        if (selectedRowID == null || selectedRowID.length == 0) {
          fish.info(" 请选择一项定单记录  ");
          return;
        }
        //参数获取
        var processInstanceId = $("#orderGrid").grid('getCell',selectedRowID, 'processInstanceCode');
        var orderId = $("#orderGrid").grid('getCell', selectedRowID,'orderId');
        var url = 'orderDetail.html?orderId=' + orderId + '&processInstanceId=' + processInstanceId + '&hisFlag=' + hisFlag;
        // 动态加载页面内容
        $("#orderDetailFrame").attr("src", url);

        //定单详情初始化和打开窗口
        $("#openOrderDetailDialog").dialog({
	          autoOpen: false,
	          height: 550,
	          width: '60%',
	          modal: true
        });
        $("#openOrderDetailDialog").dialog("open");
      });

    // 定单详情窗口自适应
    $("#openOrderDetailDialog").resize(function() {
      height: $(window).height() * 0.8;
      width: $(window).width() * 0.50;
    });

    //单击打开工单详情
	    $("#workOrderInfo").click(function() {
	    	  var selectedRowID = $("#orderGrid").grid('getGridParam','selrow'); //获取选中的行标识；
		      if (selectedRowID == null || selectedRowID.length == 0) {
		    	  fish.info(" 请选择一项定单记录  ");
		          return;
		      }
		      $('#finishWorkOrder').attr('disabled', false);
		      $('#resetWorkOrder').attr('disabled', false);
		      $("#workOrderInfoDialog").dialog({
			        autoOpen: true,
			        height: 480,
			        width: '60%'
		      });
		      getWorkOrder();
		      $("#workOrderInfoDialog").dialog("open");
	    });

    //双击行打开定单详情
    function openOrderDetail(id) {
      var rowData = $("#orderGrid").grid("getRowData",id);
      var selectedRowID = $("#orderGrid").grid(
        'getRowid', rowData);
      var processInstanceId = $("#orderGrid").grid('getCell',
        selectedRowID, 'processInstanceCode');
      var orderId = $("#orderGrid").grid('getCell', selectedRowID,
        'orderId');
      var url = 'orderDetail.html?orderId=' + orderId + '&processInstanceId=' + processInstanceId + '&hisFlag=' + hisFlag;
      $("#orderDetailFrame").attr("src", url);
      $("#openOrderDetailDialog").dialog({
        autoOpen: false,
        height: 500,
        width: '60%',
      });
      $("#openOrderDetailDialog").dialog("open");

    };

    // 定单流程
    $("#showActivityInstance").click(
      function() {
          var selectedRowID = $("#orderGrid").grid('getGridParam','selrow');
          if (selectedRowID == null || selectedRowID.length == 0) {
            fish.info(" 请选择一项定单记录  ");
            return;
          }
          var processInstanceId = $("#orderGrid").grid('getCell',selectedRowID, 'processInstanceCode');
          var url = 'http://10.124.8.123:8080/uos-manager/flowInst.html?processInstId=' + processInstanceId;
          $("#ActivityInstanceFrame").attr("src", url);
          $("#ActivityInstanceDialog").dialog({
              autoOpen: false,
              height: 500,
              width: '50%',
          });
          $("#ActivityInstanceDialog").dialog("open");
      });

    // 重新跑单
    $("#reDispatchOrder").click(
      function() {
        var selectedRowID = $("#orderGrid").grid('getGridParam','selarrrow');

        if (selectedRowID == null || selectedRowID.length == 0) {
            fish.info(" 请至少选择一项定单记录  ");
            return;
        }
        if(selectedRowID.length > 1 ){
        	fish.info("不支持多项定单同时重新跑单，请选择一项定单记录  ");
        	return;
        }
        var hint = '';
        var processInstanceCode = $("#orderGrid").grid('getCell',selectedRowID,'processInstanceCode');
        if(processInstanceCode && (processInstanceCode.replace(/(^\s*)|(\s*$)/g,'')).length > 0){
        	hint += '此定单已进入流程，需作废当前流程，';
        }
        hint += '是否要重新跑单？';
        fish.confirm(hint).result.then(function() {
            var orderId = $("#orderGrid").grid('getCell',selectedRowID,'orderId');
    	    $.ajax({  
      		     url:basePath+'/orderManagerController/reDispatchOrder',// 跳转到 action  
      		     data:{
      		    	orderId: orderId
      		     },  
      		     type:'POST',  
      		     cache:false,  
      		     dataType:'json',  
      		     success:function(data) {
      		    	 console.log(data);
                     if (data == 'success'){
                    	 fish.info("操作成功！")
                    	 _.delay(function() {$("#search").click();},1000);
                     }else{
                         fish.info("操作失败！");
                     }
      		     },  
      		     error:function() {  
      		    	 layer.msg("重新跑单异常！");
      		     }  
      		 });
             
          });
      });

    //定单作废
    $("#orderAbolish").click(
      function() {
        var selectedRowID = $("#orderGrid").grid('getGridParam','selarrrow');
        if (selectedRowID == null || selectedRowID.length == 0){
            fish.info(" 请至少选择一项定单记录  ");
            return;
        }
        if(selectedRowID.length > 1){
        	fish.info(" 不支持多项定单同时作废，请选择一项定单记录  ");
            return;
        }
        fish.confirm('是否要定单作废？').result.then(function(){
            var orderId = $("#orderGrid").grid('getCell',selectedRowID,'orderId');
    	    $.ajax({  
   		     url:basePath+'/orderManagerController/orderAbolish',// 跳转到 action  
   		     data:{
   		    	orderId: orderId
   		     },  
   		     type:'POST',  
   		     cache:false,  
   		     dataType:'json',  
   		     success:function(data){
   		    	 console.log(data);
   		         if (data == "success"){
   		        	fish.info("操作成功！");
   		        	_.delay(function() {$("#search").click();},1000);
   		         }else{
   		        	fish.info("操作失败！");
   		         }
   		     },  
   		     error:function() {  
   		    	 layer.msg("定单作废异常！");
   		     }  
   		 });
           
        });
      });

    // 工单强制回单
    $("#finishWorkOrder").click(function() {
      var selectedRowID = $("#workOrderGrid").grid('getGridParam', 'selarrrow');
      if (selectedRowID == null || selectedRowID.length == 0) {
        fish.info(" 请至少选择一项工单记录  ");
        return;
      }
      
      fish.confirm('是否要强制回单？').result.then(function() {
  	    $.ajax({  
		     url:basePath+'/orderManagerController/finishNewWorkOrder',// 跳转到 action  
		     data:{
		    	 workOrderIds:selectedRowID.toString()
		     },  
		     type:'POST',  
		     cache:false,  
		     dataType:'json',  
		     success:function(data) {
		    	 console.log(data);
		         if (data == "1") {
		            fish.showSuccess("操作成功！");
		         } else {
		            fish.showError(data);
		         }
		     },  
		     error:function() {  
		    	 layer.msg("强制回单异常！");
		     }  
		 });
    	   
      });
    });

    // 重新执行
    $("#resetWorkOrder").click(function() {
      var selectedRowID = $("#workOrderGrid").grid('getGridParam', 'selarrrow');
      if (selectedRowID == null || selectedRowID.length == 0) {
        fish.info(" 请至少选择一项工单记录  ");
        return;
      }
      fish.confirm('是否要重新执行？').result.then(function() {
    	    $.ajax({  
   		     url:basePath+'/orderManagerController/resetNewWorkOrder',// 跳转到 action  
   		     data:{
   		    	 workOrderIds:selectedRowID.toString()
   		     },  
   		     type:'POST',  
   		     cache:false,  
   		     dataType:'json',  
   		     success:function(data) {
   		    	 console.log(data);
	   	         if (data == "1") {
	               fish.showSuccess("操作成功！");
	             } else {
	               fish.showError(data);
	             }
   		     },  
   		     error:function() {  
   		    	 layer.msg("重新执行异常！");
   		     }  
   		 }); 
      });
    });

    // 验证日期
    function validateDate(paramsObj) {
      var start = paramsObj.startDate;
      var end = paramsObj.endDate;

      // 没有输入日期，直接返回true
      if (start == "" && end == "") {
        return true;
      }

      // 有开始时间
      if (start != "" && start != null && start != undefined) {
        // 正则表达式验证
        if (start.match(new RegExp(
            /\d\d\d\d-[01]\d-[0-3]\d\s[0-2]\d:[0-5]\d:[0-5]\d/g)) == null) {
          fish.showWarn(' 无效开始时间，请输入正确的时间 ，例如：2015-01-01 01:01:01 ');
          return false;
        }

        // 日期验证
        start = newDate(start);
        if (start == 'Invalid Date') {
          fish.showWarn(' 无效开始时间，请输入正确的时间 ，例如：2015-01-01 01:01:01 ');
          return false;
        }
      }

      // 有结束时间
      if (end != "" && end != null && end != undefined) {
        if (end.match(new RegExp(
            /\d\d\d\d-[01]\d-[0-3]\d\s[0-2]\d:[0-5]\d:[0-5]\d/g)) == null) {
          fish.showWarn(' 无效结束时间，请输入正确的时间 ，例如：2015-01-01 01:01:01 ');
          return false;
        }

        end = newDate(end);
        if (end == 'Invalid Date') {
          fish.showWarn(' 无效结束时间，请输入正确的时间 ，例如：2015-01-01 01:01:01 ');
          return false;
        }
      }

      // 有开始和结束时间
      if (start != "" && start != null && start != undefined && end != "" && end != null && end != undefined) {
        if (start > end) {
          fish.showWarn(' 无效时间，请确保结束时间晚于开始时间 ');
          return false;
        }
      }

      // 通过所有验证
      return true;
    }

    // 兼容IE日期new Date()函数
    function newDate(str) {
      var year = str.split(' ')[0].split('-');
      var hour = str.split(' ')[1].split(':');
      var date = new Date();
      date.setUTCFullYear(year[0], year[1] - 1, year[2]);
      date.setUTCHours(hour[0], hour[1], hour[2], 0);
      return date;
    }
 

    // 重置按钮
    $("#reset").click(function() {
      $('#orderCode').val("");
      $('#custOrderCode').val("");
      $('#startDate').val("");
      $('#endDate').val("");
      $('#stateCombo').val("");
      $('#accNbr').val("");
      $('#areaName').val("");
      $('#areaSel').val("");
    });

    // 获取查询条件
    function getConditionObj() {
      var map = {
        orderCode: $("#orderCode").val(),
        custOrderCode: $("#custOrderCode").val(),
        startDate: $("#startDate").val() == "" ? "" : $("#startDate").val(),
        endDate: $("#endDate").val() == "" ? "" : $("#endDate").val(),
        accNbr: $("#accNbr").val(),
        areaId:  $("#areaSel").val(),
        orderState: $("#stateCombo").val() == "-1" ? "" : $("#stateCombo").val(),
        searchType: hisFlag
      };
      for (var key in map) {
        if (map[key] == "" || map[key] == undefined) {
          map[key] = null;
        } else {
          if (key == "orderCode" || key == "custOrderCode" || key == "accNbr") {
            autoCompleteSetCookie(key, map[key]);
            $("#orderCode").autocomplete({
              delay: 0,
              minLength: 0,
              source: autoCompleteGetCookie("orderCode")
            });
            $("#custOrderCode").autocomplete({
              delay: 0,
              minLength: 0,
              source: autoCompleteGetCookie("custOrderCode")
            });
            $("#accNbr").autocomplete({
              delay: 0,
              minLength: 0,
              source: autoCompleteGetCookie("accNbr")
            });
          }
        }
      }
      return map;
    };

    // 获取工单信息事件处理
    function getWorkOrder() {

      if (orderSelectRowid == null || orderSelectRowid == undefined || orderSelectRowid == '') {
        return;
      }

      // 查询的时候 锁定页面
      if ($('#container1').data('blockui-content')) {
        $('#container1').unblockUI().data('blockui-content', false);
      } else {
        $('#container1').blockUI({
          message: '加载中......'
        }).data('blockui-content', true);
      }
      var orderId = $("#orderGrid").grid('getCell', orderSelectRowid,'orderId');
      
  	 $.ajax({  
	     url:basePath+'/orderManagerController/getWorkOrders',// 跳转到 action  
	     data:{
	    	 orderId: orderId,
	    	 hisFlag: hisFlag
	     },  
	     type:'POST',  
	     cache:false,  
	     dataType:'json',  
	     success:function(data) {
	         mydatas1 = eval(data);
	    	 var _mydata = {
	    	 	total:mydatas1.length,
	    	 	page:1,
	    	 	records:mydatas1.length,
	    	 	rows:mydatas1
	    	 };
	    	 $("#workOrderGrid").grid("reloadData",_mydata);
	    	// 解锁页面
	         $('#container1').unblockUI().data('blockui-content', false);
	      },  
	      error : function() {  
	           layer.msg("工单信息异常！");  
	      }  
	 });



    // 工单信息点击事件处理
    function clickWorkOrder(selectRowid){
	      var workOrderStateName = $("#workOrderGrid").grid('getCell', selectRowid,'workOrderStateName');
	      var workOrderTypeName = $("#workOrderGrid").grid('getCell', selectRowid,'workOrderTypeName');
	      if(workOrderTypeName.indexOf("追单") != -1){
	    	  $("#finishWorkOrder").attr('disabled', true);
	    	  $("#resetWorkOrder").attr('disabled', true);
	    	  layer.msg("此工单有追单，请回追单！！！");
	      }
	      if (workOrderStateName.indexOf("完成") != -1 || workOrderStateName.indexOf("退单") != -1){
	    	  $("#finishWorkOrder").attr('disabled', true);
	    	  $("#resetWorkOrder").attr('disabled', true);
	      }else {
	          $('#finishWorkOrder').attr('disabled', false);
	          $('#resetWorkOrder').attr('disabled', false);
	      }
    }

    // 自动完成功能
    function autoCompleteSetCookie(name, value) {
      try {
        var cookies = getCookie(name);
        if (cookies == null || cookies == undefined || cookies == '') {
          setCookie(name, value);
          return;
        }

        var cookieArr = cookies.split('|');
        if (cookieArr.indexOf(value) == -1) {
          if (cookieArr.length < 5) {
            setCookie(name, value + "|" + cookies);
          } else {
            setCookie(name, value + "|" + cookies.substr(0, cookies.lastIndexOf('|')));
          }
        }
      } catch (e) {

      }
    }

    function autoCompleteGetCookie(name) {
      var cookies = getCookie(name);
      if (cookies == null || cookies == undefined || cookies == '') {
        return null;
      } else {
        var cookieArr = cookies.split('|');
        return cookieArr;
      }
    }

    // 得到派发和返回的报文
    function showWorkOrderDetail(id) {

        $("#dispatchWorkOrder").html("");
        $("#responseWorkOrder").html("");
	    $.ajax({  
		     url:basePath+'/orderManagerController/showWorkOrderMsgDetail',// 跳转到 action  
		     data:{
		    	workOrderId: id
		     },  
		     type:'POST',  
		     cache:false,  
		     dataType:'json',  
		     success:function(data){
		    	 $("#dispatchWorkOrder").show();
		    	 $("#responseWorkOrder").show();
		    	 showSendMessage(data);
		    	 receiveMessage(data);
		     },  
		     error:function(){  
		    	 layer.msg("得到派发和返回的报文异常！");
		     }  
		 });
    }

    function showSendMessage(o) {
      try {
        // json
        var req = replaceAll(o.requestStr, "&quot;", "\"");
        var requestStr = JSON.parse(req);
        var node = new PrettyJSON.view.Node({
          el: $("#dispatchWorkOrder"),
          data: requestStr,
          downloadCount: 2,
          dateFormat: "DD/MM/YYYY - HH24:MI:SS"
        });
        node.expandAll();
      } catch (e) {
    	  console.error(e)
      }
    }

    function receiveMessage(o) {
      try {
        // json
        var res = replaceAll(o.responseStr, "&quot;", "\"");
        var responseStr = JSON.parse(res);
        var node = new PrettyJSON.view.Node({
          el: $("#responseWorkOrder"),
          data: responseStr,
          downloadCount: 2,
          dateFormat: "DD/MM/YYYY - HH24:MI:SS"
        });
        node.expandAll();
      } catch (e) {
    	  console.error(e);
      }
    }

    // 将字符串中的某些字符转化为对应的字符
    function replaceAll(str, sptr, sptr1) {
      while (str.indexOf(sptr) >= 0) {
        str = str.replace(sptr, sptr1);
      }
      return str;
    }


    //区域
	$("#areaName").popedit({
		dialogOption : {
			showClearIcon : true,
			initValue : "one",
			height : 460
		},
		change : function(e, data) {// 可以绑定change事件改变初始值
			console.log("change:" + data.value);
		}
	});
	$("#areaSel").on("dialog:open",function(e){//dialog的初始值
		 $.ajax({  
		     url:basePath+'/orderManagerController/getAreas',// 跳转到 action  
		     data:{
		    	 areaId: areaId
		     },  
		     type:'POST',  
		     cache:false,  
		     dataType:'json',  
		     success:function(data) {  
		 		var options = {};
				options.fNodes = data;
				options.check = {
					enable : true,
					chkboxType : {
						"Y" : "s",
						"N" : "ps"
					}
				};// 勾选框--父子关联关系：①被勾选时:关联子&不关联父②取消勾选时：关联子&关联父
				options.data = {
					key : {
						children : "children",
						name : "areaName"
					}
				};

				$('#areaTree').tree(options);

				$("#areaSel").dialog({
					resizable : false,
					width : 420,
					height : 450,
					modal : true,
					bgiframe : true,
					title : "区域选择",
					hide : "highlight",
					beforeClose : function(event, ui) {
						$('#areaTree').tree('destroy');
					}
				});
		      },  
		      error : function() {  
		           layer.msg("区域异常！");  
		      }  
		 });

	});
    
    

    $("#submitBtn").click(function() {
      var checkObj = $("#areaTree").tree("getCheckedNodes", true); // 勾选到的项目
      if (checkObj.length > 0) {
        var areaNames = '',
          areaIds = '';
        for (var i = 0; i < checkObj.length; i++) {
          if (i > 0) {
            areaNames += ',';
            areaIds += ',';
          }
          areaNames += checkObj[i].areaName;
          areaIds += checkObj[i].areaId;
        }
        $('#areaName').val(areaNames);
        $('#areaSel').val(areaIds);
        $('#areaSel').dialog('close');
      } else {
        $('#areaName').val('');
        $('#areaSel').val('');
        $('#areaSel').dialog('close');
      }
    });

    $("#cancelBtn").click(function() {
      $('#areaSel').dialog('close');
    });
    
    //excel导出
    $("#excelReport").click(function(){
    	debugger;
    	//获取查询条件
    	var  orderCode=$("#orderCode").val()
        var  custOrderCode= $("#custOrderCode").val()
        var startDate= $("#startDate").val() 
        var endDate= $("#endDate").val() 
        var  accNbr= $("#accNbr").val()
        var   areaId=  $("#areaSel").val()
        var orderState=$("#stateCombo").val()
       // var orderState: $("#stateCombo").val() == "-1" ? "" : $("#stateCombo").val(),
        var paramData="{";
        if(orderCode!=""){
        	paramData=paramData+"orderCode:'"+orderCode+"',"
        }if(custOrderCode!=""){
        	paramData=paramData+"custOrderCode:'"+custOrderCode+"',"
        }if (startDate!="") {
        	paramData=paramData+"startDate:'"+startDate+"',"
		}if (endDate!="") {
			paramData=paramData+"endDate:'"+endDate+"',"
		}if (accNbr!="") {
			paramData=paramData+"accNbr:'"+accNbr+"',"
		}if (areaId!="") {
			paramData=paramData+"areaId:'"+areaId+"',"
		}if (orderState!="-1") {
			paramData=paramData+"orderState:'"+orderState+"',"
		}
		paramData=paramData+"searchType:'0'}";
      	url=basePath+"/OrderExcel/OrderExcelReport?paramData="+paramData;
      	window.open(url);
    });