import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Recursively prints the AST nodes.
 * @param node A ts.Node instance.
 * @param depth The current indentation depth.
 */
export function printAST(node: ts.Node, depth = 0): void {
    const indent = ' '.repeat(depth * 2);
    console.log(`${indent}${ts.SyntaxKind[node.kind]}`);
    node.forEachChild((child: ts.Node) => printAST(child, depth + 1));
}

const args = process.argv.slice(2);
const isRecursive = args.includes("--recursive");
const targets = args.filter(arg => arg !== "--recursive");

if (isRecursive) {
    const basePath = targets[0] || process.cwd();
    console.log(`\nSearching for TypeScript/JavaScript files in: ${basePath}\n`);
    let fileCount = 0;

    const getFiles = (dir: string): string[] => {
        let files: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                files = files.concat(getFiles(fullPath));
            } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
                files.push(fullPath);
            }
        }
        return files;
    }

    const fileList = getFiles(basePath);
    console.log(`Found ${fileList.length} files to process.\n`);

    for (const filePath of fileList) {
        fileCount++;
        console.log(`\n[${fileCount}/${fileList.length}] Processing: ${filePath}`);
        const code = fs.readFileSync(filePath, 'utf8');
        const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true);
        console.log(`=== AST for file: ${filePath} ===`);
        printAST(sourceFile);
        console.log("=== End of AST ===\n");
    }

    console.log(`\nProcessing complete. Analyzed ${fileCount} files.`);
} else {
    const filePath = targets[0];
    if (!filePath) {
        console.error('Usage: node astConverter.js [--recursive] <path-to-typescript-file or directory>');
        process.exit(1);
    }
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
        console.error(`File not found: ${fullPath}`);
        process.exit(1);
    }
    const code = fs.readFileSync(fullPath, 'utf8');
    const sourceFile = ts.createSourceFile(fullPath, code, ts.ScriptTarget.Latest, true);
    console.log(`\n=== AST for file: ${fullPath} ===`);
    printAST(sourceFile);
    console.log("=== End of AST ===\n");
}