import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

export function getFileContent(dir: string, fileName: string) {
    const filePath = path.join(contentDirectory, dir, fileName);
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        if (fileName.endsWith('.json')) {
            return JSON.parse(fileContents);
        }
        const { data, content } = matter(fileContents);
        return { ...data, content };
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return null;
    }
}

export function getAllContent(dir: string) {
    const dirPath = path.join(contentDirectory, dir);
    try {
        const fileNames = fs.readdirSync(dirPath);
        return fileNames
            .filter((fileName) => fileName.endsWith('.md'))
            .map((fileName) => {
                const fullPath = path.join(dirPath, fileName);
                const fileContents = fs.readFileSync(fullPath, 'utf8');
                const { data, content } = matter(fileContents);
                return {
                    slug: fileName.replace(/\.md$/, ''),
                    ...data,
                    content,
                };
            });
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
        return [];
    }
}

export async function getGeneralSettings() {
    return getFileContent('settings', 'general.json');
}
