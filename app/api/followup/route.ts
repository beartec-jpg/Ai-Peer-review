// app/api/followup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processFollowup, estimateFollowupCost } from '@/lib/followup-service';
import type { FollowupRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { followupQuery, context } = body as FollowupRequest;

    // Validate request
    if (!followupQuery || typeof followupQuery !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid followupQuery' },
        { status: 400 }
      );
    }

    if (!context || !context.originalQuery || !context.chosenAnswer || !context.chosenModel) {
      return NextResponse.json(
        { error: 'Missing or invalid context' },
        { status: 400 }
      );
    }

    // Process the follow-up query
    const result = await processFollowup({ followupQuery, context });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Follow-up API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve cost estimate
export async function GET() {
  try {
    const estimatedCost = estimateFollowupCost();
    return NextResponse.json({ estimatedCost });
  } catch (error) {
    console.error('Follow-up cost estimation error:', error);
    return NextResponse.json(
      { error: 'Failed to estimate cost' },
      { status: 500 }
    );
  }
}
