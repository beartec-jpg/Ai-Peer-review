// app/api/review/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runPeerReviewSequence } from '@/lib/peer-review';
import { getCachedResult, setCachedResult } from '@/lib/cache-service';
import { addToHistory } from '@/lib/history-service';

export async function POST(request: NextRequest) {
  try {
    const { query, userId = 'default' } = await request.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid query' }, { status: 400 });
    }

    const trimmedQuery = query.trim();

    // Check cache first
    const cachedResult = await getCachedResult(trimmedQuery);
    if (cachedResult) {
      console.log('Cache hit for query:', trimmedQuery);
      // Add to history with cache hit flag
      await addToHistory(trimmedQuery, cachedResult, userId, true);
      return NextResponse.json({ ...cachedResult, fromCache: true });
    }

    // Cache miss - run the full peer review sequence
    console.log('Cache miss, running full sequence for:', trimmedQuery);
    const result = await runPeerReviewSequence(trimmedQuery);
    
    // Store in cache
    await setCachedResult(trimmedQuery, result);
    
    // Add to history
    await addToHistory(trimmedQuery, result, userId, false);

    return NextResponse.json({ ...result, fromCache: false });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
