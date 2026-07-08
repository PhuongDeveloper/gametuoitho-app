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

public class DiscoveryAgent
{
	public static final int NOT_DISCOVERABLE = 0x00;
	public static final int GIAC = 0x9E8B33;
	public static final int LIAC = 0x9E8B00;
	public static final int CACHED = 0x00;
	public static final int PREKNOWN = 0x01;

	public DiscoveryAgent() { }

	public RemoteDevice[] retrieveDevices(int option)
	{
		return null;
	}

	public boolean startInquiry(int accessCode, DiscoveryListener listener) throws BluetoothStateException
	{
		if (listener != null)
		{
			listener.inquiryCompleted(DiscoveryListener.INQUIRY_COMPLETED);
		}
		return true;
	}

	public boolean cancelInquiry(DiscoveryListener listener)
	{
		return true;
	}

	public int searchServices(int[] attrSet, UUID[] uuidSet, RemoteDevice btDev, DiscoveryListener discListener) throws BluetoothStateException
	{
		if (discListener != null)
		{
			discListener.serviceSearchCompleted(0, DiscoveryListener.SERVICE_SEARCH_NO_RECORDS);
		}
		return 0;
	}

	public boolean cancelServiceSearch(int transID)
	{
		return true;
	}

	public String selectService(UUID uuid, int security, boolean master) throws BluetoothStateException
	{
		return null;
	}
}
