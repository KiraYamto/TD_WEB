define([
	'text!modules/common/fileUpload/templates/fileUploadView.html'+codeVerP,
	'i18n!modules/common/fileUpload/i18n/fileUpload.i18n',
	'modules/common/cloud-utils',
	'css!modules/common/fileUpload/styles/fileUpload.css'+codeVerP
], function(fileUploadViewTpl, i18nFileUpload,utils,css) {
	return fish.View.extend({
		uploadedFilesList: [],
		template: fish.compile(fileUploadViewTpl),
		i18nData: fish.extend({}, i18nFileUpload),
		catalogId:null,
		events: {
			'click .fileUpload-delete': 'deleteFile',
			'click .fileUpload-close-btn': 'close'
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.uploadedFilesList = this.options.uploadedFilesList || [];
			this.queryUploadedFiles();
			
			var me = this;
			this.$('.fileUpload-files').fileupload({
				url: 'fileUpload?moduleName=' + this.options.moduleName+'&fileType='
						+ this.options.fileType + '&businessCode=' + this.options.businessCode
						+ '&uploadStaffId=' + currentUser.staffId,
		        dataType: 'json',
		        singleFileUploads: false,
		        autoUpload: true,
//		        acceptFileTypes: /(\.|\/)(gif|jpe|jpeg|png)$/i,
		        add: function(e, data) {
		        	me.$('.modal-body').blockUI({message: '上传中'}).data('blockui-content', true);
		        	data.submit();
		        },
		        done: function(e, data) {
		            $.each(data.result, function (index, file) {
		                var fileName = decodeURIComponent(file.name);
		                $('<p/>').text(' ● ' + fileName + ' 上传成功, 文件大小:' + (file.size/1024).toFixed(2) + 'KB ')
		                	.append($('<a class="fileUpload-get" href="' + file.url + '">下载</a>'))
		                	.append($('<a href="javascript:void(0);" class="fileUpload-delete" file-id="' + file.file_id 
		                				+ '" delete-url="' + file.delete_url + '">删除</a>'))
		                	.appendTo('.fileUpload-results');
		                
		                //记录上传文件
		                //me.uploadedFilesList.push({fileId: file.file_id, fileName: fileName});
		                me.uploadedFilesList.push({fileId: file.file_id, fileName: fileName, url:file.url, size:file.size});
		            });
		            me.$('.modal-body').unblockUI().data('blockui-content', false);
		        },
		        progressall: function(e, data) {

		        },
		        processalways: function(e, data) {
		            var index = data.index,
		                file = data.files[index];
		            if (file.error && file.error === "File type not allowed" ) {
		                fish.error({message:"选择的文件类型不符", modal:true});
		                return;
		            }
		        },
		        fail: function(e, data) {
		        	$.each(data.files, function (index, file) {
		                var fileName = decodeURIComponent(file.name);
		                $('<p/>').text(' ● 文件上传失败: ' + fileName ).appendTo('.fileUpload-results');
		            });
		        	me.$('.modal-body').unblockUI().data('blockui-content', false);
		        }
			});
		},
		
		deleteFile: function(e) {			
			var me = this;
			var deleteUrl = e.target.getAttribute('delete-url') + '&fileId=' + e.target.getAttribute('file-id');
			if (deleteUrl) {
				me.$('.modal-body').blockUI({message: '删除中'}).data('blockui-content', true);
				$.get(deleteUrl, function() {
					e.target.parentElement.parentElement.removeChild(e.target.parentElement);
					me.uploadedFilesList = _.filter(me.uploadedFilesList, function(o){return o.fileId != e.target.getAttribute('file-id');});
					me.$('.modal-body').unblockUI().data('blockui-content', false);
				});
			}
		},
		
		close: function() {
			this.popup.close(this.uploadedFilesList);
		},
		
		queryUploadedFiles: function() {
			var me = this;
			for (var i=0; i<this.uploadedFilesList.length; i++) {
				utils.ajax('fileService','getFileInfoWithStaffId', me.uploadedFilesList[i].fileId, currentUser.staffId).done(function(ret){
					var fileId = ret.id;
					var fileSize = ret.fileSize;
					var filePath = ret.filePath;
					var fileName = ret.fileName;
					var displayFileName = fileName.substr(0, fileName.lastIndexOf('_'));
					_.filter(me.uploadedFilesList, function(o){return o.fileId == fileId;})[0].fileName = displayFileName;
					fileName = encodeURIComponent(encodeURIComponent(fileName));
					$('<p/>').text(' ● ' + displayFileName + ', 文件大小:' + (fileSize/1024).toFixed(2) + 'KB ')
                	.append($('<a class="fileUpload-get" href="fileUpload?getFile=' + filePath + fileName + '">下载</a>'))
                	.append($('<a href="javascript:void(0);" class="fileUpload-delete" file-id="' + fileId
                				+ '" delete-url="fileUpload?delFile=' + filePath + fileName + '">删除</a>'))
                	.appendTo('.fileUpload-results');
				});
			}
		}
	});
});