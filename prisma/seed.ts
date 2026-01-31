import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const themes = [
    {
      name: 'Finanças Rápidas',
      niche: 'finanças pessoais',
      promise: 'Ganhe clareza financeira em 60 segundos',
      hooks: ['Pare de perder dinheiro no banco', '3 erros que te fazem pobre'],
      ctas: ['Salve para aplicar hoje', 'Compartilhe com quem precisa'],
      voices: ['masculina_calma', 'feminina_energetica'],
      templates: ['quadros_slide', 'facecam_com_overlay'],
      forbiddenWords: ['garantia', 'enriqueça rápido'],
      rules: { tone: 'didático direto', duration: '45s' },
    },
    {
      name: 'Saúde & Lifestyle',
      niche: 'bem-estar',
      promise: 'Hábitos simples para viver melhor',
      hooks: ['1 hábito noturno muda seu dia', 'A vitamina que você esquece'],
      ctas: ['Teste por 7 dias', 'Marca um amigo que precisa'],
      voices: ['neutra_suave'],
      templates: ['broll_rapid', 'checklist_vertical'],
      forbiddenWords: ['cura', 'garantia médica'],
      rules: { tone: 'leve', duration: '40s' },
    },
  ];

  for (const theme of themes) {
    await prisma.theme.create({ data: theme });
  }

  const accounts = [
    { name: 'Conta TikTok Demo', platform: 'tiktok', status: 'active', config: {} },
  ];

  for (const acc of accounts) {
    await prisma.account.create({ data: acc });
  }

  console.log('Seed concluído: temas e conta demo inseridos.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
