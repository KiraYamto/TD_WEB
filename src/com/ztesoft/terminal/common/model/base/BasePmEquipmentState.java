package com.ztesoft.terminal.common.model.base;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BasePmEquipmentState<M extends BasePmEquipmentState<M>> extends Model<M> implements IBean {

	public void setStateCode(java.lang.String stateCode) {
		set("STATE_CODE", stateCode);
	}

	public java.lang.String getStateCode() {
		return get("STATE_CODE");
	}

	public void setStateName(java.lang.String stateName) {
		set("STATE_NAME", stateName);
	}

	public java.lang.String getStateName() {
		return get("STATE_NAME");
	}

}
