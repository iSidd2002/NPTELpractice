import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Helper function to read JSON files
const readJsonFile = async (filePath: string) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
};

// GET /api/assignments
app.get('/api/assignments', async (_req, res) => {
  try {
    const assignmentsDir = join(__dirname, '../../data/assignments');
    console.log('Reading assignments from:', assignmentsDir);
    
    const files = await fs.readdir(assignmentsDir);
    console.log('Found files:', files);
    
    const assignments = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const filePath = join(assignmentsDir, file);
          console.log('Reading file:', filePath);
          const data = await readJsonFile(filePath);
          return { 
            id: data.id, 
            title: data.title
          };
        })
    );
    
    console.log('Sending assignments:', assignments);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// GET /api/assignments/:id
app.get('/api/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = join(__dirname, '../../data/assignments', `${id}.json`);
    console.log('Reading assignment:', filePath);
    
    const data = await readJsonFile(filePath);
    console.log('Sending assignment:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(404).json({ error: 'Assignment not found' });
  }
});

// POST /api/assignments/:id/submit
app.post('/api/assignments/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const filePath = join(__dirname, '../../data/assignments', `${id}.json`);
    console.log('Processing submission for:', filePath);
    
    const assignment = await readJsonFile(filePath);
    const totalQuestions = assignment.questions.length;
    let correctAnswers = 0;
    const detailedResults = answers.map((answer: any) => {
      const question = assignment.questions.find((q: any) => q.id === answer.questionId);
      const isCorrect = question && question.correctAnswer === answer.selectedOption;
      if (isCorrect) correctAnswers++;
      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
        correctAnswer: question ? question.correctAnswer : null,
        questionText: question ? question.text : '',
        options: question ? question.options : [],
      };
    });
    
    const scorePercent = (correctAnswers / totalQuestions) * 100;
    console.log('Submission results:', { totalQuestions, correctAnswers, scorePercent });
    
    res.json({
      totalQuestions,
      correctAnswers,
      scorePercent,
      detailedResults
    });
  } catch (error) {
    console.error('Error processing submission:', error);
    res.status(400).json({ error: 'Failed to process submission' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 