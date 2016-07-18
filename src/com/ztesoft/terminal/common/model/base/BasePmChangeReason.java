package com.ztesoft.terminal.common.model.base;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BasePmChangeReason<M extends BasePmChangeReason<M>> extends Model<M> implements IBean {

	public void setReasonCode(java.lang.String reasonCode) {
		set("REASON_CODE", reasonCode);
	}

	public java.lang.String getReasonCode() {
		return get("REASON_CODE");
	}

	public void setReason(java.lang.String reason) {
		set("REASON", reason);
	}

	public java.lang.String getReason() {
		return get("REASON");
	}

	public void setState(java.lang.String state) {
		set("STATE", state);
	}

	public java.lang.String getState() {
		return get("STATE");
	}

}