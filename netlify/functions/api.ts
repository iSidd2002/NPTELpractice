import { Handler } from '@netlify/functions';
import { promises as fs } from 'fs';
import { join } from 'path';

const readJsonFile = async (filePath: string) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
};

const handler: Handler = async (event) => {
  try {
    const path = event.path.replace('/.netlify/functions/api', '');
    const assignmentsDir = join(process.cwd(), 'data/assignments');

    if (path === '/assignments') {
      const files = await fs.readdir(assignmentsDir);
      const assignments = await Promise.all(
        files
          .filter(file => file.endsWith('.json'))
          .map(async file => {
            const data = await readJsonFile(join(assignmentsDir, file));
            return {
              id: data.id,
              title: data.title,
              dueDate: data.dueDate,
              submittedOn: data.submittedOn
            };
          })
      );
      return {
        statusCode: 200,
        body: JSON.stringify(assignments),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
    }

    if (path.startsWith('/assignments/') && path.endsWith('/submit')) {
      const id = path.split('/')[2];
      const { answers } = JSON.parse(event.body || '{}');
      const filePath = join(assignmentsDir, `${id}.json`);
      const assignment = await readJsonFile(filePath);
      
      const totalQuestions = assignment.questions.length;
      const correctAnswers = answers.filter((answer: any) => {
        const question = assignment.questions.find((q: any) => q.id === answer.questionId);
        return question && question.correctAnswer === answer.selectedOption;
      }).length;
      
      const scorePercent = (correctAnswers / totalQuestions) * 100;
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          totalQuestions,
          correctAnswers,
          scorePercent
        }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
    }

    if (path.startsWith('/assignments/')) {
      const id = path.split('/')[2];
      const filePath = join(assignmentsDir, `${id}.json`);
      const data = await readJsonFile(filePath);
      return {
        statusCode: 200,
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not found' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
};

export { handler }; 