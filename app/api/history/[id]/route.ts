// app/api/history/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getHistoryById, deleteHistoryEntry } from '@/lib/history-service';

// GET - Fetch specific history entry by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    const { id } = params;

    const entry = await getHistoryById(id, userId);
    
    if (!entry) {
      return NextResponse.json(
        { error: 'History entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('History GET by ID error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch history entry' },
      { status: 500 }
    );
  }
}

// DELETE - Delete specific history entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    const { id } = params;

    const deleted = await deleteHistoryEntry(id, userId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'History entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'History entry deleted' });
  } catch (error) {
    console.error('History DELETE by ID error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete history entry' },
      { status: 500 }
    );
  }
}
