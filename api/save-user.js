import { promises as fs } from 'fs';
import path from 'path';

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      const filePath = path.join(process.cwd(), 'data', 'users.json');
      
      // Читаем текущие данные
      let users = [];
      try {
        const fileData = await fs.readFile(filePath, 'utf-8');
        users = JSON.parse(fileData);
      } catch (error) {
        console.log('Создаем новый файл users.json');
      }
      
      // Добавляем нового пользователя
      users.push(req.body);
      
      // Сохраняем обновленные данные
      await fs.writeFile(filePath, JSON.stringify(users, null, 2));
      
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end(); // Метод не разрешен
  }
};