/**
 * @author zhang.xiaofei10@zte.com.cn
 */
fish.extend(fish.View.prototype, {
    _render: $.noop,
    _afterRender: $.noop,
    //覆盖默认的render方法
    render: function() {
        var me = this;
        //指向父视图
        me.parentView = null;
        //维护子视图的实例
        me.childViews = [];
        me._render();
        setTimeout(function() {
            me._afterRender();
        }, 0);
        return me;
    },
    _doRenderView: function(selector, viewInstance) {
        var $el = viewInstance.render().$el;
        $(selector).hide();
        $(selector).empty().html($el);
        $(selector).fadeIn('fast');
    },
    _isChildElement: function(selector) {
        var tempEls = $(this.$el).find(selector);
        if (!tempEls || !tempEls.length) {
            return false;
        }
        return true;
    },
    /**
     * 根据选择器查找子视图
     * @param  {[type]} selector [description]
     * @return {[type]}          [description]
     */
    findChildView: function(selector) {
        var childView = null;
        $.each(this.childViews, function(index, item) {
            if (item && item.key == selector) {
                childView = item.val;
                return false;
            }
        });
        return childView;
    },
    /**
     * 插入子视图
     * @param  {[type]} selector     [description]
     * @param  {[type]} viewInstance [description]
     * @return {[type]}              [description]
     */
    insertChildView: function(selector, viewInstance) {
        var flag = this._isChildElement(selector);
        if (!flag) {
            console.error("子视图必须位于当前视图的子层标签中。" + selector);
            return;
        }
        var childView = this.findChildView(selector);
        if (childView) {
            this.replaceChildView(selector, viewInstance);
        } else {
            viewInstance.parentView = this;
            this.childViews.push({
                key: selector,
                val: viewInstance
            });
            this._doRenderView(selector, viewInstance);
        }
    },
    /**
     * 插入子视图，兼容老代码
     * @param {[type]} selector     [description]
     * @param {[type]} viewInstance [description]
     */
    addView: function(selector, viewInstance) {
        this.insertChildView(selector, viewInstance);
    },
    /**
     * 删除子视图
     * @param  {[type]} selector [description]
     * @return {[type]}          [description]
     */
    removeChildView: function(selector) {
        var flag = this._isChildElement(selector);
        if (!flag) {
            console.error("子视图必须位于当前视图的子层标签中。" + selector);
            return;
        }
        var childView = this.findChildView(selector);
        if (!childView) {
            console.error("没有找到指定的子视图，此视图不是当前视图的孩子？" + selector);
            return;
        }
        childView.remove();
    },
    /**
     * 删除子视图，兼容老代码
     * @param  {[type]} selector [description]
     * @return {[type]}          [description]
     */
    removeView: function(selector) {
        this.removeChildView(selector);
    },
    /**
     * 替换内部的子视图
     * @return {[type]} [description]
     */
    replaceChildView: function(selector, viewInstance) {
        var flag = this._isChildElement(selector);
        if (!flag) {
            console.error("子视图必须位于当前视图的子层标签中。" + selector);
            return;
        }
        var childView = this.findChildView(selector);
        if (childView && fish.isFunction(childView.remove)) {
            childView.remove();
        }
        viewInstance.parentView = this;
        this.childViews.push({
            key: selector,
            val: viewInstance
        });
        this._doRenderView(selector, viewInstance);
    },
    /**
     * 替换视图自己，整体替换
     * @param  {[String]} selector     [选择器]
     * @param  {[Object]} viewInstance [视图实例]
     * @return {[Object]}              [新的视图实例]
     */
    replaceView: function(selector, viewInstance) {
        var me = this;
        if (me.parentView && me.parentView.childViews) {
            viewInstance.parentView = me.parentView;
            me.parentView.childViews.push({
                key: selector,
                val: viewInstance
            });
        }
        console.log($(selector));
        this.remove();
        console.log($(selector));
        this._doRenderView(selector, viewInstance);
        return viewInstance;
    },
    replaceMe: function(selector, viewInstance) {
        this.replaceView(selector, viewInstance);
    },
    /**
     * 覆盖Backbone.View默认的remove方法
     * @return {[Object]} [视图]
     */
    remove: function() {
        //首先递归删除子视图
        $.each(this.childViews, function(index, view) {
            if (view && fish.isFunction(view.remove)) {
                view.remove();
            }
        });
        //从父视图中删掉自己
        var me = this;
        if (me.parentView && me.parentView.childViews) {
            $.each(me.parentView.childViews, function(index, item) {
                if (item && item.val == me) {
                    me.parentView.childViews.splice(index, 1);
                    return false;
                }
            });
        }
        //然后删除自己的相关引用
        this.parentView = null;
        this.childViews = [];
        //解绑事件
        this.undelegateEvents();
        this.stopListening();
        //删除元素
        this._removeElement();
        return this;
    }
});