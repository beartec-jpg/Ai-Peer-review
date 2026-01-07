// app/api/cache/stats/route.ts
import { NextResponse } from 'next/server';
import { getCacheStats, clearAllCache } from '@/lib/cache-service';

// GET - Fetch cache statistics
export async function GET() {
  try {
    const stats = await getCacheStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Cache stats GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch cache stats' },
      { status: 500 }
    );
  }
}

// DELETE - Clear all cache
export async function DELETE() {
  try {
    await clearAllCache();
    return NextResponse.json({ success: true, message: 'Cache cleared' });
  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
