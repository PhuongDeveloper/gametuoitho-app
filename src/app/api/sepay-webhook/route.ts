import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * SePay Webhook Handler
 * Receives POST from SePay when a bank transaction occurs.
 * If amount >= 50000 and content contains user_id pattern,
 * auto-upgrade user to VIP.
 *
 * Expected payload from SePay:
 * {
 *   id: number,
 *   gateway: string,
 *   transactionDate: string,
 *   accountNumber: string,
 *   transferType: string,
 *   transferAmount: number,
 *   accumulated: number,
 *   code: string,
 *   content: string,
 *   referenceCode: string,
 *   description: string
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const {
      transferAmount,
      content,
      code,
      gateway,
      transactionDate,
    } = payload;

    // Validate amount
    if (!transferAmount || transferAmount < 50000) {
      return NextResponse.json(
        { success: false, message: 'Amount too low' },
        { status: 200 } // Return 200 so SePay doesn't retry
      );
    }

    // Parse user_id from transfer content
    // Expected format: "VIP xxxxxxxx" or "VIP_xxxxxxxx"
    const contentStr = (content || '').toUpperCase();
    const match = contentStr.match(/VIP[_\s]?([A-Z0-9]{8})/i);

    if (!match) {
      return NextResponse.json(
        { success: false, message: 'No user ID found in content' },
        { status: 200 }
      );
    }

    const userIdPrefix = match[1].toLowerCase();

    // Use admin client to bypass RLS
    const supabase = createAdminClient();

    // Find user by ID prefix
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .limit(100);

    const matchedProfile = (profiles || []).find((p: any) =>
      p.id.startsWith(userIdPrefix)
    );

    if (!matchedProfile) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 200 }
      );
    }

    // Insert transaction record
    await supabase.from('transactions').insert({
      user_id: matchedProfile.id,
      amount: transferAmount,
      code: code || null,
      status: 'completed',
      gateway: gateway || null,
      transaction_date: transactionDate || new Date().toISOString(),
      content: content || null,
    });

    // Upgrade user to VIP
    await supabase
      .from('profiles')
      .update({ is_vip: true })
      .eq('id', matchedProfile.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('SePay webhook error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 200 } // Return 200 to prevent retries
    );
  }
}
