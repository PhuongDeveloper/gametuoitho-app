import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Games API Route
 * GET: List games with optional filters and pagination
 * POST: Create a new game (admin only)
 */

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  let query = supabase
    .from('games')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && ['GBA', 'JAR'].includes(category)) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data: games, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    games,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();

  const { data, error } = await supabase.from('games').insert({
    title: body.title,
    slug: body.slug,
    category: body.category,
    thumbnail_url: body.thumbnail_url || null,
    file_url: body.file_url,
    is_vip_only: body.is_vip_only || false,
    release_year: body.release_year || null,
    genre: body.genre || null,
    description: body.description || null,
    controls_info: body.controls_info || null,
    rating: body.rating || 0,
  }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ game: data }, { status: 201 });
}
