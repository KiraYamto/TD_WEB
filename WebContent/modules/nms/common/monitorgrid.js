/**
 * 告警监控表格
 */

(function($) {
	
	function setSize(target) {
		var gridWrap = $(target).parent();
		if($(gridWrap).is(":hidden")){
			return;
		}
		var opts = $.data(target, "monitorgrid").options;
		if(opts.fit == true){
			var p = gridWrap.parent();
			opts.width = p.width();
			opts.height = p.height();
		}
		gridWrap.width(opts.width);
		gridWrap.height(opts.height);
		$(target).width(opts.width);
		$(target).height(opts.height);
		$(target).find(".grid-body").height(opts.height - 28);
		gridWrap.parent().css("overflow", "hidden");
	}

	// 初始化表格
	function init(target) {
		var gridWrap = $(target).wrap('<div class="grid-wrap"></div>').parent();
		var opts = $.data(target, "monitorgrid").options;
		if(opts.fit == true){
			var p = gridWrap.parent();
			opts.width = p.width();
			opts.height = p.height();
		}
		gridWrap.width(opts.width);
		gridWrap.height(opts.height);
		$(target).width(opts.width);
		$(target).height(opts.height);		
		if(opts.border == true){
			//$(target).css("border", "1px solid #d4d4d4");
		}
		
		$(target).addClass("div-grid");
		
		var totalWidth = 0;
		var headRow = $("<div></div>").attr("class", "head-row").css("border-top", "0px solid #E6E6E6");
		
		$.each(opts.columns, function(index, element) {
			$("<div></div>").attr("class", "head-cell").text(element["title"]).width(element["width"]).appendTo(headRow);
			totalWidth += element["width"] + 5;
		})
		headRow.css("min-width", totalWidth).appendTo(target);
		$.data(target, "monitorgrid").runParams.rowWidth = totalWidth; //保存行的宽度
		$("<div></div>").attr("class", "grid-body").height(opts.height - 28).css("min-width", totalWidth).appendTo(target);
		
		(function(){
			var lock = false;
			$(window).resize(function(){
				if(!lock){
					lock = true;
					setTimeout(	function(){
						setSize(target); 
						lock = false;}, 300);
				}
			});
		})();
	}

	function insertRow(target, rows){
		if(!rows || rows.length <= 0) return;
		var opts = $.data(target, "monitorgrid").options;
		//var data = $.data(target, "monitorgrid").data;
		//data.push(rowData);
		
		var rowList = [];
		$.each(rows, function(index, rowData){
			var cellList = [];
			$.each(opts.columns, function(index, element) {
				var text = rowData[element["field"]];
				var cellContent= text; //单元格内容
				if(element.formatter){
					cellContent = element.formatter(text, rowData);
				}
				var cellDiv = $("<div>" + cellContent + "</div>").attr("class", "grid-cell").width(element["width"]).attr("title",text);
				cellList.push(cellDiv);
				//cellDiv.appendTo(row);
			})
			var cellHTMLStr = "";
			$.each(cellList, function(index, cellElement){
				cellHTMLStr += cellElement[0].outerHTML;
			});
			var row = $("<div>"+ cellHTMLStr +"</div>").attr("class", "grid-row").css("min-width", $.data(target, "monitorgrid").runParams.rowWidth).attr("row-index", -1); //索引值暂时不实现
			if(opts.idField && rowData[opts.idField]){
				row.attr("id", "data_row_" + rowData[opts.idField]);
			}			
			rowList.push(row);
		});
		
		var rowHTMLStr = "";
		$.each(rowList, function(index, rowElement){
			rowHTMLStr += rowElement[0].outerHTML;
		});
		
		$(target).find(".grid-body").prepend(rowHTMLStr);
		$.data(target,"monitorgrid").runParams.total += rowList.length;  //TODO:
		
		//增加事件
		$.each(rows, function(index, rowData){
			var row  = $(target).find("#data_row_" + rowData[opts.idField]);
			if(row && row.length == 1){
				//row.click(rowClickEvent).dblclick(rowDblclickEvent);
				
				row[0].onclick = function(){
					rowClickEvent.call(this, target, rowData);
				};
				row[0].ondblclick = function(){
					rowDblclickEvent.call(this, target, rowData);
				};
				
			/*	row.bind('click', function(){
					rowClickEvent.call(this, target, rowData);
				}).bind('dblclick', function(){
					rowDblclickEvent.call(this, target, rowData);
				});*/
			}
		});
	}
	
	function rowClickEventWrap(){
		
	}
	
	function rowDblClickEventWrap(){
		
	}
	
	
	function rowClickEvent(target, rowData){
		var opts = $.data(target, "monitorgrid").options;
		$(target).find(".grid-body > .grid-row-click").removeClass("grid-row-click");
		$(this).addClass("grid-row-click")
		if(opts.onClickRow){
			var opts = $.data(target, "monitorgrid").options;
			//var rowIndex = $(this).attr("row-index");
			var rowIndex = -1;
			opts.onClickRow.call(this, rowIndex, rowData);
		}
	}
	
	function rowDblclickEvent(target, rowData){
		var opts = $.data(target, "monitorgrid").options;
		if(opts.onDblClickRow){
			var opts = $.data(target, "monitorgrid").options;
			//var rowIndex = $(this).attr("row-index");
			var rowIndex = -1;
			opts.onDblClickRow.call(this, rowIndex, rowData);
		}
	}
	
	function deleteRow(target, idFieldValue){
		var result;
		if(idFieldValue){
			result = $(target).find(".grid-body > #data_row_%id%".replace(/%id%/, idFieldValue));
		}else{
			result = $(target).find(".grid-body > .grid-row:last");
			//var data = $.data(target, "monitorgrid").data;
			//data.shift();
		}
		//删除Dom元素
		if(result && result.length && result.length == 1){
			$.data(target,"monitorgrid").runParams.total -= 1;
			
			//result.unbind();
			result[0].onclick = null;
			result[0].ondblclick = null;
			
			result.remove();
			result.html(null);
			result.removeAttr("class").removeAttr("row-index").removeAttr("id").removeAttr("style");
			try{
				delete result[0];
				delete result.context;
				delete result.prevObject;
				delete result.length;
				delete result.selector
				delete result.__proto__;
				delete result;
				result=null;
			}catch(e){}
		
		}
	
	}
	
	function getTotal(target){
		var total = $.data(target,"monitorgrid").runParams.total;
		return total;
	}
	
	function exist(target, id){
		if(!id) return false;
			
		var exp = ".grid-body > #data_row_%id%".replace(/%id%/, id);
		var rowDiv = $(target).find(exp);
		if(rowDiv.length == 1){
			return true;
		}else{
			return	false;
		}
	}
	
	function alarmLevelFormater(value, row) {
		var bgColor = "";
		if (row.alarmLevelId == 5) {
			bgColor = 'background-color:#FF0000;';
		} else if (row.alarmLevelId == 4) {
			bgColor = 'background-color:#FFA500;';
		} else if (row.alarmLevelId == 3) {
			bgColor = 'background-color:#FFFF00;';
		} else if (row.alarmLevelId == 2) {
			bgColor = 'background-color:#00FFFF;';
		} else if (row.alarmLevelId == 1) {
			bgColor = 'background-color:#800080;';
		} else if (row.alarmLevelId == 6) {
			bgColor = 'background-color:#00FF00;';
		}
		return '<div style="width:100%;height:15px;border:1px solid #ccc">'
				+ '<div  style="width:100%;height:15px;color:#000000;'
				+ bgColor
				+ '" title='
				+ value
				+ '>'
				+ value
				+ '</div></div>';
	}
	
	$.fn.monitorgrid = function(options, param) {
		if (typeof options == 'string') {
			switch(options){
				case 'insertRow':
					return this.each(function(){
						insertRow(this, param);
					});
				case 'deleteRow':
					return this.each(function(){
						deleteRow(this, param);
					});
				case 'setSize':
					return this.each(function(){
						setSize(this);
					});	
				case 'getTotal':
					return getTotal(this[0], param);
				case 'exist':
					return exist(this[0], param);
			}
		}
		options = options || {};
		return this.each(function() {
			var state = $.data(this, 'monitorgrid');
			if (state) {
				$.extend(state.options, options);
			} else {
				state = $.data(this, 'monitorgrid', {
					options : $.extend({}, $.fn.monitorgrid.defaults, options),
					data:[],
					runParams:{total:0} //运行时参数
				});
			}
			init(this);
		});
	};

	$.fn.monitorgrid.defaults = {
		width: 'auto',
		height: 'auto',
		fit: false,
		idField:null,
		onClickRow: function(rowIndex, rowData){},
		onDblClickRow: function(rowIndex, rowData){},
		columns : [{
			title : '告警流水号',
			field : 'meAlarmNo',
			width : 100
		}, {
			title : '区域',
			field : 'areaName',
			width : 50
		}, {
			title : '告警ID',
			field : 'meAlarmId',
			width : 100
		}, {
			title : '告警标题',
			field : 'alarmTitle',
			width : 180
		}, {
			title : '告警大类',
			field : 'alarmBigTypeName',
			width : 60
		}, {
			title : '告警级别',
			field : 'alarmLevel',
			formatter:alarmLevelFormater,
			width : 80
		}, {
			title : '网元名称',
			field : 'elementName',
			width : 180
		}, {
			title : '告警对象类型',
			field : 'objectTypeName',
			width : 90
		}, {
			title : '告警对象',
			field : 'alarmObjectName',
			width : 150
		}, {
			title : '所属EMS',
			field : 'emsName',
			width : 130
		}, {
			title : '告警时间',
			field : 'createTime',
			width : 140
		} ]
	}

})(jQuery);