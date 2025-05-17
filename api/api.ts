import { VercelRequest, VercelResponse } from '@vercel/node';
import { promises as fs } from 'fs';
import { join } from 'path';

const readJsonFile = async (filePath: string) => {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url, method } = req;
  const path = url?.replace(/^\/api/, '') || '';
  const assignmentsDir = join(process.cwd(), 'data/assignments');

  if (path === '/assignments' && method === 'GET') {
    const files = await fs.readdir(assignmentsDir);
    const assignments = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const data = await readJsonFile(join(assignmentsDir, file));
          return { id: data.id, title: data.title };
        })
    );
    return res.status(200).json(assignments);
  }

  if (path?.startsWith('/assignments/') && method === 'GET') {
    const id = path.split('/')[2];
    const filePath = join(assignmentsDir, `${id}.json`);
    const data = await readJsonFile(filePath);
    return res.status(200).json(data);
  }

  if (path?.startsWith('/assignments/') && path.endsWith('/submit') && method === 'POST') {
    const id = path.split('/')[2];
    const { answers } = req.body;
    const filePath = join(assignmentsDir, `${id}.json`);
    const assignment = await readJsonFile(filePath);

    const totalQuestions = assignment.questions.length;
    const correctAnswers = answers.filter((answer: any) => {
      const question = assignment.questions.find((q: any) => q.id === answer.questionId);
      return question && question.correctAnswer === answer.selectedOption;
    }).length;

    const scorePercent = (correctAnswers / totalQuestions) * 100;

    return res.status(200).json({
      totalQuestions,
      correctAnswers,
      scorePercent,
    });
  }

  return res.status(404).json({ error: 'Not found' });
} 