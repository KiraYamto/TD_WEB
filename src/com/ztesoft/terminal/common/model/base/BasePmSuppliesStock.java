package com.ztesoft.terminal.common.model.base;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BasePmSuppliesStock<M extends BasePmSuppliesStock<M>> extends Model<M> implements IBean {

	public void setDepotCode(java.lang.String depotCode) {
		set("DEPOT_CODE", depotCode);
	}

	public java.lang.String getDepotCode() {
		return get("DEPOT_CODE");
	}

	public void setSuppliesClass(java.lang.String suppliesClass) {
		set("SUPPLIES_CLASS", suppliesClass);
	}

	public java.lang.String getSuppliesClass() {
		return get("SUPPLIES_CLASS");
	}

	public void setNum(java.math.BigDecimal num) {
		set("NUM", num);
	}

	public java.math.BigDecimal getNum() {
		return get("NUM");
	}

}
