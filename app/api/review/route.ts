// app/api/review/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runPeerReviewSequence } from '@/lib/peer-review';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid query' }, { status: 400 });
    }

    const result = await runPeerReviewSequence(query.trim());
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
