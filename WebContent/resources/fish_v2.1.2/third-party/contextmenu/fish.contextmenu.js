/**
 * 右键菜单插件
 * @class fish.desktop.widget.ContextMenu
 * @extends fish.desktop.widget
 * <pre>
 *  $(element).contextmenu(option);
 * </pre>
 */
!function(){
	'use strict';

	$.widget("ui.contextmenu", {
		options:{
			/**
             * 设置菜单淡出的速度，默认是100ms
             * @cfg {Number} fadeSpeed=100
             */
			fadeSpeed: 100,
			/**
             * 设置过滤菜单项的方法，默认是null
             * @cfg {Function} filter=null
             */
			filter: function ($obj) {
				// Modify $obj, Do not return
			},
			container:'body',
			/**
             * 如果设置成auto，当菜单下方弹出空间不够的时候，菜单会自动改成向上弹出。如果设置成true，则不会计算空间，弹出效果类似popup
             * @cfg {String|Boolean} above=auto
             */
			above: 'auto',
			/**
             * 如果设置成true，则浏览器的右键菜单将被禁用
             * @cfg {Boolean} preventDoubleContext=true
             */
			preventDoubleContext: true
		},

		_create:function(){
			this.element.addClass('dropdown-context');
			this.element.find('ul').addClass('dropdown-context');
			this.element.children().find('.dropdown-menu').addClass('dropdown-context-sub').parent().addClass('dropdown-submenu');
			$(this.options.container).append(this.element);
			this._delegateEvents();
		},
		_buildMenu:function(e){
			e.preventDefault();
			e.stopPropagation();
			$('.dropdown-context:not(.dropdown-context-sub)').hide();
			
			if(this._trigger('beforeShow',e) === false)
				return;

			if (typeof this.options.above == 'boolean' && this.options.above) {
				this.element.addClass('dropdown-context-up').css({
					top: e.pageY - this.element.height(),
					left: e.pageX - 13
				}).fadeIn(this.options.fadeSpeed);
			} else if (typeof this.options.above == 'string' && this.options.above == 'auto') {
				var autoH = this.element.height() + 12;
				var autoW = this.element.width();
				var htmlH = $('html').height();
				var htmlW = $('html').width();
				var left,top,right;
				if ((e.pageY + autoH) > htmlH) {
					top = e.pageY - autoH;
				} else {
					top = e.pageY;
				}
				if((e.pageX + autoW) > htmlW){//距离右边没有空间了
					left = 'auto';
					right = 0;
				}else{
					left = e.pageX - 13;
					right = 'auto';
				}
				this.element.css({
					top: top,
					left: left,
					right:right
				}).fadeIn(this.options.fadeSpeed);
			}

			this._trigger('show',e);
		},
		_delegateEvents:function(){
			var that = this;

			that._on($(document),{
				"contextmenu":'_buildMenu',
				'click html':function(){
					if ($('.dropdown-context').is(":visible")) {
						$('.dropdown-context').fadeOut(that.options.fadeSpeed, function(){
							$('.dropdown-context').css({display:''});
						});
						this._trigger('hide',null);
					};
				},
				'mouseenter .dropdown-submenu':function(){
					var $sub = this.element.find('.dropdown-context-sub:first'),
						subWidth = $sub.width(),
						subLeft = $sub.offset().left,
						collision = (subWidth+subLeft) > window.innerWidth;
					if(collision){
						$sub.addClass('drop-left');
					}
				}
			});
			that.options.preventDoubleContext && that._on($(document),{
				'contextmenu .dropdown-context':function(e){
					e.preventDefault();
				}
			});
		},
		_destroy:function(){
			this.element.removeClass('dropdown-context');
			this.element.find('ul').removeClass('dropdown-context');
			this.element.children().find('.dropdown-menu').removeClass('dropdown-context-sub').parent().removeClass('dropdown-submenu');
		}
		
	});

}();
/**
* 在菜单出现前触发事件
* @event  beforeshow
* @param  {Event} e 事件对象
*/
/**
* 在菜单出现时触发事件
* @event  show
* @param  {Event} e 事件对象
*/
/**
* 在菜单隐藏时触发事件
* @event  hide
*/