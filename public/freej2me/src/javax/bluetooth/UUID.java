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

public class UUID
{
	private long highBits;
	private long lowBits;
	private String uuidStr;

	public UUID(long uuidValue)
	{
		this.lowBits = uuidValue;
		this.highBits = 0;
		this.uuidStr = Long.toHexString(uuidValue);
	}

	public UUID(String uuidValue, boolean shortUUID)
	{
		this.uuidStr = uuidValue;
		try
		{
			this.lowBits = Long.parseLong(uuidValue, 16);
		}
		catch (Exception e)
		{
			this.lowBits = 0;
		}
	}

	public String toString()
	{
		return uuidStr != null ? uuidStr : "0";
	}

	public boolean equals(Object value)
	{
		if (value == null || !(value instanceof UUID)) return false;
		UUID other = (UUID) value;
		return this.highBits == other.highBits && this.lowBits == other.lowBits;
	}

	public int hashCode()
	{
		return (int)(lowBits ^ (lowBits >>> 32));
	}
}
