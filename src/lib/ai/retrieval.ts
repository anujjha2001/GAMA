import { prisma } from '../prisma';
import { generateEmbedding } from './embeddings';

export async function searchKnowledgeBase(query: string, limit: number = 3) {
  try {
    const queryEmbedding = await generateEmbedding(query);
    const vectorString = `[${queryEmbedding.join(',')}]`;
    
    // In production with pgvector:
    // const results = await prisma.$queryRaw`
    //   SELECT id, title, content, 1 - (embedding <=> ${vectorString}::vector) as similarity
    //   FROM "VectorDocument"
    //   ORDER BY embedding <=> ${vectorString}::vector
    //   LIMIT ${limit};
    // `;
    
    // Mock result for now until pgvector is fully instantiated in Postgres
    const results = [
      { 
        title: "Protein Absorption", 
        content: "The body can absorb roughly 25-35g of protein per meal for muscle synthesis.",
        similarity: 0.89 
      }
    ];

    return results;
  } catch (error) {
    console.error("Vector search failed:", error);
    return [];
  }
}
