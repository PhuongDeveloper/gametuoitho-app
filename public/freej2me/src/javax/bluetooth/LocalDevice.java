/*
	This file is part of FreeJ2ME.

	FreeJ2ME is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	FreeJ2ME is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with FreeJ2ME.  If not, see http://www.gnu.org/licenses/
*/
package javax.bluetooth;

import javax.microedition.io.Connection;

public class LocalDevice
{
	private static LocalDevice instance = new LocalDevice();

	private LocalDevice() { }

	public static LocalDevice getLocalDevice() throws BluetoothStateException
	{
		return instance;
	}

	public DiscoveryAgent getDiscoveryAgent()
	{
		return new DiscoveryAgent();
	}

	public String getFriendlyName()
	{
		return "FreeJ2ME Device";
	}

	public DeviceClass getDeviceClass()
	{
		return new DeviceClass(0);
	}

	public boolean setDiscoverable(int mode) throws BluetoothStateException
	{
		return true;
	}

	public int getDiscoverable()
	{
		return DiscoveryAgent.NOT_DISCOVERABLE;
	}

	public String getBluetoothAddress()
	{
		return "000000000000";
	}

	public ServiceRecord getRecord(Connection notifier)
	{
		return null;
	}

	public void updateRecord(ServiceRecord srvRecord) throws ServiceRegistrationException
	{
	}

	public static boolean isPowerOn()
	{
		return true;
	}

	public static String getProperty(String property)
	{
		if ("bluetooth.api.version".equals(property)) return "1.1";
		if ("bluetooth.master.switch".equals(property)) return "false";
		if ("bluetooth.sd.attr.retrievable.max".equals(property)) return "256";
		if ("bluetooth.connected.devices.max".equals(property)) return "7";
		if ("bluetooth.l2cap.receiveMTU.max".equals(property)) return "672";
		if ("bluetooth.sd.trans.max".equals(property)) return "1";
		if ("bluetooth.connected.inquiry.scan".equals(property)) return "true";
		if ("bluetooth.connected.page.scan".equals(property)) return "true";
		if ("bluetooth.connected.inquiry".equals(property)) return "true";
		if ("bluetooth.connected.page".equals(property)) return "true";
		return null;
	}
}
