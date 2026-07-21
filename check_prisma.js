const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log(Object.keys(prisma).filter(k => k.toLowerCase().includes('log') || k.toLowerCase().includes('audit')));
