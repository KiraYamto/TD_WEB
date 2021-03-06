package com.ztesoft.terminal.common.model.base;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseOmDevChangeEntity<M extends BaseOmDevChangeEntity<M>> extends Model<M> implements IBean {

	public void setChangeId(java.math.BigDecimal changeId) {
		set("CHANGE_ID", changeId);
	}

	public java.math.BigDecimal getChangeId() {
		return get("CHANGE_ID");
	}

	public void setSn(java.lang.String sn) {
		set("SN", sn);
	}

	public java.lang.String getSn() {
		return get("SN");
	}

	public void setOldSn(java.lang.String oldSn) {
		set("OLD_SN", oldSn);
	}

	public java.lang.String getOldSn() {
		return get("OLD_SN");
	}

}
