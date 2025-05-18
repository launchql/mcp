import fs from 'fs';
import path from 'path';
import { inputFiles, outputFiles, OutputFile } from './configs.js';

interface Snippet {
  content: string;
  source: string;
  language: string;
}

interface ProcessingStats {
  totalProcessed: number;
  categorizedCounts: Record<string, number>;
  uncategorized: number;
  ignoredByLanguage: number;
  inputFileCounts: Record<string, number>;
}

const IGNORED_LANGUAGES = new Set(['bash', 'shell', 'sh', 'mermaid']);

async function readSnippets(filePath: string, delimiter: string): Promise<Snippet[]> {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  const snippets = content.split(delimiter).filter((s) => s.trim());

  return snippets.map((snippet) => {
    // Extract SOURCE field from the snippet
    const sourceMatch = snippet.match(/SOURCE:\s*([^\n]+)/);
    const source = sourceMatch ? sourceMatch[1].trim() : '';

    // Extract language from the LANGUAGE field
    const languageMatch = snippet.match(/LANGUAGE:\s*([^\n]+)/);
    const language = languageMatch ? languageMatch[1].trim().toLowerCase() : '';

    return {
      content: snippet.trim(),
      source,
      language,
    };
  });
}

function matchesByPath(source: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    const regex = new RegExp(pattern);
    return regex.test(source);
  });
}

async function categorizeSnippets() {
  const stats: ProcessingStats = {
    totalProcessed: 0,
    categorizedCounts: {},
    uncategorized: 0,
    ignoredByLanguage: 0,
    inputFileCounts: {},
  };

  // Initialize output map to store categorized snippets
  const categorizedSnippets: Record<string, Snippet[]> = {};
  outputFiles.forEach((file: OutputFile) => {
    categorizedSnippets[file.path] = [];
    stats.categorizedCounts[file.path] = 0;
  });

  // Process each input file
  for (const inputFile of inputFiles) {
    const snippets = await readSnippets(inputFile.path, inputFile.snippetsDelimiter);
    stats.inputFileCounts[inputFile.path] = snippets.length;
    stats.totalProcessed += snippets.length;

    // Categorize each snippet
    for (const snippet of snippets) {
      // Skip snippets with ignored languages
      if (IGNORED_LANGUAGES.has(snippet.language)) {
        stats.ignoredByLanguage++;
        continue;
      }

      let matched = false;
      for (const outputFile of outputFiles) {
        if (inputFile.matchingRule === 'path') {
          // Match by path patterns
          if (matchesByPath(snippet.source, outputFile.matchingPaths)) {
            categorizedSnippets[outputFile.path].push(snippet);
            stats.categorizedCounts[outputFile.path]++;
            matched = true;
            break; // Stop after first match
          }
        } else if (inputFile.matchingRule === 'keyword') {
          // Match by keyword
          if (snippet.source.toLowerCase() === outputFile.matchingKeyword.toLowerCase()) {
            categorizedSnippets[outputFile.path].push(snippet);
            stats.categorizedCounts[outputFile.path]++;
            matched = true;
            break; // Stop after first match
          }
        }
      }
      if (!matched) {
        stats.uncategorized++;
      }
    }
  }

  // Write categorized snippets to output files
  for (const [filePath, snippets] of Object.entries(categorizedSnippets)) {
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });

    // Write snippets to file using the same delimiter as input file
    const content = snippets.map((s) => s.content).join(inputFiles[0].snippetsDelimiter);
    await fs.promises.writeFile(filePath, content);
  }

  // Log processing statistics
  console.log('\nSnippets Categorization Completed!');
  console.log('\n----------------------------');
  console.log(`Total snippets processed: ${stats.totalProcessed}`);

  console.log('\nInput files:');
  for (const [filePath, count] of Object.entries(stats.inputFileCounts)) {
    console.log(`  ${filePath}: ${count} snippets`);
  }

  console.log('\nCategorized snippets by output file:');
  for (const [filePath, count] of Object.entries(stats.categorizedCounts)) {
    console.log(`  ${filePath}: ${count} snippets`);
  }

  console.log('\nOther snippets:');
  console.log(
    `  Skipped (${Array.from(IGNORED_LANGUAGES).join(', ')}): ${stats.ignoredByLanguage}`
  );
  console.log(`  Uncategorized: ${stats.uncategorized}`);
  console.log('----------------------------');

  return stats;
}

categorizeSnippets().catch(console.error);
