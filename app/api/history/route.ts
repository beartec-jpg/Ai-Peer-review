// app/api/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  getUserHistory,
  clearUserHistory,
  getHistoryStats,
} from '@/lib/history-service';
import type { HistoryFilter } from '@/lib/types';

// GET - Fetch user's query history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    
    // Parse filter parameters
    const filter: HistoryFilter = {};
    
    const startDate = searchParams.get('startDate');
    if (startDate) filter.startDate = parseInt(startDate, 10);
    
    const endDate = searchParams.get('endDate');
    if (endDate) filter.endDate = parseInt(endDate, 10);
    
    const minScore = searchParams.get('minScore');
    if (minScore) filter.minScore = parseFloat(minScore);
    
    const maxScore = searchParams.get('maxScore');
    if (maxScore) filter.maxScore = parseFloat(maxScore);
    
    const searchQuery = searchParams.get('search');
    if (searchQuery) filter.searchQuery = searchQuery;

    const history = await getUserHistory(userId, filter);
    const stats = await getHistoryStats(userId);

    return NextResponse.json({
      history,
      stats,
      count: history.length,
    });
  } catch (error) {
    console.error('History GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

// DELETE - Clear user's history
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';

    await clearUserHistory(userId);
    
    return NextResponse.json({ success: true, message: 'History cleared' });
  } catch (error) {
    console.error('History DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clear history' },
      { status: 500 }
    );
  }
}
