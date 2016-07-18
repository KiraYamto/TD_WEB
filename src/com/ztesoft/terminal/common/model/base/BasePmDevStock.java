package com.ztesoft.terminal.common.model.base;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BasePmDevStock<M extends BasePmDevStock<M>> extends Model<M> implements IBean {

	public void setDepotCode(java.lang.String depotCode) {
		set("DEPOT_CODE", depotCode);
	}

	public java.lang.String getDepotCode() {
		return get("DEPOT_CODE");
	}

	public void setEquipmentClass(java.lang.String equipmentClass) {
		set("EQUIPMENT_CLASS", equipmentClass);
	}

	public java.lang.String getEquipmentClass() {
		return get("EQUIPMENT_CLASS");
	}

	public void setManufacturerCode(java.lang.String manufacturerCode) {
		set("MANUFACTURER_CODE", manufacturerCode);
	}

	public java.lang.String getManufacturerCode() {
		return get("MANUFACTURER_CODE");
	}

	public void setEquipmentType(java.lang.String equipmentType) {
		set("EQUIPMENT_TYPE", equipmentType);
	}

	public java.lang.String getEquipmentType() {
		return get("EQUIPMENT_TYPE");
	}

	public void setEquipmentState(java.lang.String equipmentState) {
		set("EQUIPMENT_STATE", equipmentState);
	}

	public java.lang.String getEquipmentState() {
		return get("EQUIPMENT_STATE");
	}

	public void setNum(java.math.BigDecimal num) {
		set("NUM", num);
	}

	public java.math.BigDecimal getNum() {
		return get("NUM");
	}

	public void setId(java.math.BigDecimal id) {
		set("ID", id);
	}

	public java.math.BigDecimal getId() {
		return get("ID");
	}

}
