package com.ztesoft.terminal.common.model.base;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseOmSuppliesUse<M extends BaseOmSuppliesUse<M>> extends Model<M> implements IBean {

	public void setWorkOrderCode(java.lang.String workOrderCode) {
		set("WORK_ORDER_CODE", workOrderCode);
	}

	public java.lang.String getWorkOrderCode() {
		return get("WORK_ORDER_CODE");
	}

	public void setChangeId(java.math.BigDecimal changeId) {
		set("CHANGE_ID", changeId);
	}

	public java.math.BigDecimal getChangeId() {
		return get("CHANGE_ID");
	}

}
