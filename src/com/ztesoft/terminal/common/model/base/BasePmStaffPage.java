package com.ztesoft.terminal.common.model.base;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BasePmStaffPage<M extends BasePmStaffPage<M>> extends Model<M> implements IBean {

	public void setStaffId(java.math.BigDecimal staffId) {
		set("STAFF_ID", staffId);
	}

	public java.math.BigDecimal getStaffId() {
		return get("STAFF_ID");
	}

	public void setPageCode(java.lang.String pageCode) {
		set("PAGE_CODE", pageCode);
	}

	public java.lang.String getPageCode() {
		return get("PAGE_CODE");
	}

}
