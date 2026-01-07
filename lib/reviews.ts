// lib/reviews.ts
import { prisma } from './prisma';

export async function getUserReviews(userEmail: string) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) return [];

  return await prisma.review.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      codeSubmitted: true,
      criticalScore: true,
      supportiveScore: true,
      technicalScore: true,
      createdAt: true,
    },
  });
}

export async function getReviewById(reviewId: string, userEmail: string) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) return null;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review || review.userId !== user.id) {
    return null;
  }

  return {
    id: review.id,
    code: review.codeSubmitted,
    reviews: {
      critical: review.grokCriticalResponse,
      supportive: review.grokSupportiveResponse,
      technical: review.grokTechnicalResponse,
    },
    scores: {
      critical: review.criticalScore,
      supportive: review.supportiveScore,
      technical: review.technicalScore,
    },
    createdAt: review.createdAt,
  };
}
