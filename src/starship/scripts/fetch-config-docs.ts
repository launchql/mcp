import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://raw.githubusercontent.com/hyperweb-io/starship/main/docs/config';
const OUTPUT_DIR = path.join(__dirname, '..', 'prompts');
const OUTPUT_FILE = 'starship-config.md';
const DELIMITER = '\n\n----------------------------------------\n\n';

// Define files to fetch in desired order (index.mdx first)
const FILES_TO_FETCH = ['index.mdx', 'chains.mdx', 'relayers.mdx', 'features.mdx', 'ethereum.mdx'];

async function fetchContent(fileName: string): Promise<string> {
  const url = `${BASE_URL}/${fileName}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${fileName}: ${response.statusText}`);
  }

  return response.text();
}

async function fetchAndSaveDocs() {
  try {
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    console.log('Fetching documentation files...');

    // Fetch all files
    const contents = await Promise.all(
      FILES_TO_FETCH.map(async (fileName) => {
        const content = await fetchContent(fileName);
        console.log(`Successfully fetched ${fileName}`);
        return content.trim();
      })
    );

    const combinedContent = contents.join(DELIMITER);

    // Save to output file
    const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILE);
    await fs.writeFile(outputPath, combinedContent, 'utf-8');

    console.log(`Successfully saved combined documentation to ${outputPath}`);
  } catch (error) {
    console.error('Error processing documentation:', error);
    process.exit(1);
  }
}

fetchAndSaveDocs();
