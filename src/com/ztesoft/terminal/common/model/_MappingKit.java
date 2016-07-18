package com.ztesoft.terminal.common.model;

import com.jfinal.plugin.activerecord.ActiveRecordPlugin;

/**
 * Generated by JFinal, do not modify this file.
 * <pre>
 * Example:
 * public void configPlugin(Plugins me) {
 *     ActiveRecordPlugin arp = new ActiveRecordPlugin(...);
 *     _MappingKit.mapping(arp);
 *     me.add(arp);
 * }
 * </pre>
 */
public class _MappingKit {

	public static void mapping(ActiveRecordPlugin arp) {
		arp.addMapping("OM_DEV_CHANGE", "CHANGE_ID", OmDevChange.class);
		arp.addMapping("OM_DEV_CHANGE_ENTITY", "SN", OmDevChangeEntity.class);
		arp.addMapping("OM_DEV_TRANSFER_DETAIL", "TRANSFER_DETAIL_ID", OmDevTransferDetail.class);
		arp.addMapping("OM_DEV_TRANSFER_ENTITY", "SN_NO", OmDevTransferEntity.class);
		arp.addMapping("OM_DEV_TRANSFER_ORDER", "TRANSFER_CODE", OmDevTransferOrder.class);
		arp.addMapping("OM_DEV_USE", "WORK_ORDER_CODE", OmDevUse.class);
		arp.addMapping("OM_SUPPLIES_CHANGE", "CHANGE_ID", OmSuppliesChange.class);
		arp.addMapping("OM_SUPPLIES_USE", "WORK_ORDER_CODE", OmSuppliesUse.class);
		arp.addMapping("PM_CHANGE_EVENT", "EVENT_CODE", PmChangeEvent.class);
		arp.addMapping("PM_CHANGE_EVENT_REASON", "ID", PmChangeEventReason.class);
		arp.addMapping("PM_CHANGE_REASON", "REASON_CODE", PmChangeReason.class);
		//arp.addMapping("PM_DEPOT", "DEPOT_CODE", PmDepot.class);
		arp.addMapping("PM_DEV_BUTTON", "BUTTON_CODE", PmDevButton.class);
		arp.addMapping("PM_DEV_PAGE", "PAGE_CODE", PmDevPage.class);
		arp.addMapping("PM_DEV_STOCK", "ID", PmDevStock.class);
		arp.addMapping("PM_EQUIPMENT_CLASS", "CLASS_CODE", PmEquipmentClass.class);
		arp.addMapping("PM_EQUIPMENT_STATE", "STATE_CODE", PmEquipmentState.class);
		arp.addMapping("PM_EQUIPMENT_STOCK_WARN", "ID", PmEquipmentStockWarn.class);
		arp.addMapping("PM_EQUIPMENT_TYPE", "TYPE_CODE", PmEquipmentType.class);
		arp.addMapping("PM_MANUFACTURER", "MANUFACTURER_CODE", PmManufacturer.class);
		arp.addMapping("PM_MOBOX", "SN", PmMobox.class);
		arp.addMapping("PM_MODEM", "SN", PmModem.class);
		arp.addMapping("PM_MODEM_CLASS", "CLASS_CODE", PmModemClass.class);
		// Composite Primary Key order: BUTTON_CODE,STAFF_ID
		arp.addMapping("PM_STAFF_BUTTON", "BUTTON_CODE,STAFF_ID", PmStaffButton.class);
		arp.addMapping("PM_STAFF_DEPOT", "STAFF_ID", PmStaffDepot.class);
		// Composite Primary Key order: PAGE_CODE,STAFF_ID
		arp.addMapping("PM_STAFF_PAGE", "PAGE_CODE,STAFF_ID", PmStaffPage.class);
		arp.addMapping("PM_SUPPLIES_CLASS", "CLASS_CODE", PmSuppliesClass.class);
		arp.addMapping("PM_SUPPLIES_STOCK", "ID", PmSuppliesStock.class);
		arp.addMapping("PM_SUPPLIES_STOCK_WARN", "ID", PmSuppliesStockWarn.class);
		arp.addMapping("PM_SUPPLIES_UNIT", "UNIT_CODE", PmSuppliesUnit.class);
	}
}

