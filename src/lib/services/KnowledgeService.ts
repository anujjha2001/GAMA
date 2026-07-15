import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export class KnowledgeService {
  /**
   * Search for medical/health knowledge.
   * Note: This is an MVP text-based search. In a full production setup with pgvector, 
   * this would use cosine similarity over the embeddings.
   */
  static async searchVectorKnowledge(query: string, category?: string) {
    // For MVP, we do a basic keyword search
    const docs = await prisma.vectorDocument.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } }
        ],
        ...(category ? { category } : {})
      },
      take: 3
    });
    
    return docs.map(d => ({
      title: d.title,
      insight: d.content
    }));
  }
}
