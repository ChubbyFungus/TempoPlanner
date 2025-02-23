import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface DependencyNode {
    filePath: string;
    imports: Set<string>;
    functionCalls: Map<string, Set<string>>; // key: function name, value: called functions
}

function sanitizeId(id: string): string {
    // Create a unique but safe identifier
    return id.replace(/[^a-zA-Z0-9]/g, '_');
}

function sanitizeLabel(label: string): string {
    // Remove newlines, escape quotes, and shorten if needed
    label = label.replace(/\s+/g, ' ').trim();
    label = label.replace(/"/g, '\\"');
    if (label.length > 40) {
        return label.slice(0, 37) + '...';
    }
    return label;
}

class DependencyGraph {
    private nodes: Map<string, DependencyNode> = new Map();
    private features: Map<string, Set<string>> = new Map();
    private nodeIds = new Map<string, string>();
    private nextId = 0;

    private getUniqueId(key: string): string {
        if (!this.nodeIds.has(key)) {
            this.nodeIds.set(key, `n${this.nextId++}`);
        }
        return this.nodeIds.get(key)!;
    }

    constructor() {
        const FEATURE_PATTERNS = {
            floorplanner: /floorplanner|room|wall|cabinet|geometry/i,
            materials: /material|shader|texture|pbr|three/i,
            ui: /ui\/|dialog|button|input|select/i,
            core: /lib\/(?!material)|utils|types|config/i,
            stories: /stories|test/i
        };

        Object.keys(FEATURE_PATTERNS).forEach(feature => {
            this.features.set(feature, new Set());
        });
    }

    private getFeature(filePath: string): string {
        for (const [feature, pattern] of Object.entries({
            floorplanner: /floorplanner|room|wall|cabinet|geometry/i,
            materials: /material|shader|texture|pbr|three/i,
            ui: /ui\/|dialog|button|input|select/i,
            core: /lib\/(?!material)|utils|types|config/i,
            stories: /stories|test/i
        })) {
            if (pattern.test(filePath)) {
                return feature;
            }
        }
        return 'core';
    }

    addNode(filePath: string): DependencyNode {
        if (!this.nodes.has(filePath)) {
            this.nodes.set(filePath, {
                filePath,
                imports: new Set(),
                functionCalls: new Map()
            });
        }
        const feature = this.getFeature(filePath);
        this.features.get(feature)?.add(filePath);
        return this.nodes.get(filePath)!;
    }

    addImport(fromFile: string, toFile: string) {
        const node = this.addNode(fromFile);
        node.imports.add(toFile);
    }

    addFunctionCall(fromFile: string, fromFunction: string, toFunction: string) {
        const node = this.addNode(fromFile);
        if (!node.functionCalls.has(fromFunction)) {
            node.functionCalls.set(fromFunction, new Set());
        }
        node.functionCalls.get(fromFunction)!.add(toFunction);
    }

    toDOTByFeature(): Map<string, string> {
        const graphs = new Map<string, string>();
        
        for (const [feature, files] of this.features) {
            if (files.size === 0) continue;

            let dot = `digraph ${sanitizeId(feature)}Dependencies {\n`;
            dot += '  rankdir=TB;\n';
            dot += '  compound=true;\n';
            dot += '  node [shape=box, style=filled, fillcolor=lightgrey];\n';
            dot += '  edge [color=navy, penwidth=1];\n\n';
            
            const dirGroups = new Map<string, Set<string>>();
            
            files.forEach(filePath => {
                const relPath = filePath.split('src/').pop() || filePath;
                const dir = path.dirname(relPath);
                if (!dirGroups.has(dir)) {
                    dirGroups.set(dir, new Set());
                }
                dirGroups.get(dir)!.add(filePath);
            });

            let clusterCount = 0;
            dirGroups.forEach((dirFiles, dir) => {
                if (dir !== '.') {
                    const clusterName = sanitizeId(`cluster_${clusterCount++}`);
                    dot += `  subgraph "${clusterName}" {\n`;
                    dot += `    label="${dir}";\n`;
                    dot += '    style=filled;\n';
                    dot += '    color=lightblue;\n';
                    dot += '    node [style=filled, fillcolor=white];\n\n';
                    
                    dirFiles.forEach(filePath => {
                        const fileName = path.basename(filePath);
                        const nodeId = this.getUniqueId(fileName);
                        const relPath = filePath.split('src/').pop() || filePath;
                        dot += `    ${nodeId} [label="${path.basename(fileName, path.extname(fileName))}", tooltip="${relPath}"];\n`;
                    });
                    
                    dot += '  }\n\n';
                }
            });

            files.forEach(source => {
                const sourceId = this.getUniqueId(path.basename(source));
                const deps = this.nodes.get(source)?.imports || [];
                deps.forEach(target => {
                    if (files.has(target)) {
                        const targetId = this.getUniqueId(path.basename(target));
                        dot += `  ${sourceId} -> ${targetId};\n`;
                    } else {
                        const pkgName = sanitizeId(target.split('/')[0]);
                        const pkgId = this.getUniqueId(pkgName);
                        if (!dot.includes(`${pkgId} [`)) {
                            dot += `  ${pkgId} [shape=ellipse, style=filled, fillcolor=lightyellow, label="${pkgName}"];\n`;
                        }
                        dot += `  ${sourceId} -> ${pkgId};\n`;
                    }
                });
            });

            dot += '}\n';
            graphs.set(feature, dot);
        }
        
        return graphs;
    }

    toCallGraphByFeature(): Map<string, string> {
        const graphs = new Map<string, string>();
        
        for (const [feature, files] of this.features) {
            if (files.size === 0) continue;

            let dot = `digraph ${sanitizeId(feature)}Calls {\n`;
            dot += '  rankdir=LR;\n';
            dot += '  node [shape=box, style=filled, fillcolor=lightblue];\n';
            dot += '  edge [color=darkblue];\n\n';
            
            files.forEach(filePath => {
                const fileName = path.basename(filePath);
                const fileNodes = this.nodes.get(filePath)?.functionCalls;
                
                if (fileNodes) {
                    const clusterName = sanitizeId(`cluster_${fileName}`);
                    dot += `  subgraph "${clusterName}" {\n`;
                    dot += `    label="${fileName}";\n`;
                    dot += '    style=filled;\n';
                    dot += '    color=lightgrey;\n\n';
                    
                    fileNodes.forEach((targets, source) => {
                        const sourceId = this.getUniqueId(`${fileName}:${source}`);
                        dot += `    ${sourceId} [label="${sanitizeLabel(source)}"];\n`;
                        
                        targets.forEach(target => {
                            const targetId = this.getUniqueId(`${fileName}:${target}`);
                            dot += `    ${targetId} [label="${sanitizeLabel(target)}"];\n`;
                            dot += `    ${sourceId} -> ${targetId};\n`;
                        });
                    });
                    
                    dot += '  }\n\n';
                }
            });

            dot += '}\n';
            graphs.set(feature, dot);
        }
        
        return graphs;
    }
}

function analyzeSourceFile(
    sourceFile: ts.SourceFile,
    graph: DependencyGraph,
    typeChecker: ts.TypeChecker
) {
    const currentFile = sourceFile.fileName;
    let currentClass = '';
    let currentFunction = '';

    function getFullFunctionName(node: ts.Node): string | undefined {
        if (ts.isIdentifier(node)) {
            return node.getText();
        } else if (ts.isPropertyAccessExpression(node)) {
            const obj = node.expression;
            const method = node.name.getText();
            
            // Get type information
            const objType = typeChecker.getTypeAtLocation(obj);
            const symbol = objType.getSymbol();
            
            if (symbol?.declarations?.[0]) {
                const decl = symbol.declarations[0];
                if (ts.isClassDeclaration(decl) && decl.name) {
                    return `${decl.name.getText()}.${method}`;
                } else if (ts.isVariableDeclaration(decl) && ts.isIdentifier(decl.name)) {
                    return `${decl.name.getText()}.${method}`;
                }
            }
            
            // Fallback to raw text
            return `${obj.getText()}.${method}`;
        }
        return undefined;
    }

    function visit(node: ts.Node) {
        if (ts.isImportDeclaration(node)) {
            const importPath = (node.moduleSpecifier as ts.StringLiteral).text;
            
            // Handle relative imports
            if (importPath.startsWith('.')) {
                const resolvedPath = path.resolve(path.dirname(currentFile), importPath);
                let fullPath = resolvedPath;
                
                // Try to find the actual file
                if (!path.extname(resolvedPath)) {
                    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
                    for (const ext of extensions) {
                        if (fs.existsSync(resolvedPath + ext)) {
                            fullPath = resolvedPath + ext;
                            break;
                        }
                    }
                }
                
                graph.addImport(currentFile, fullPath);
            } else {
                // External package import
                graph.addImport(currentFile, importPath);
            }
        }
        
        // Track class context
        if (ts.isClassDeclaration(node)) {
            const prevClass = currentClass;
            currentClass = node.name?.getText() || 'anonymous';
            ts.forEachChild(node, visit);
            currentClass = prevClass;
            return;
        }
        
        // Handle function declarations
        if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
            const prevFunction = currentFunction;
            let functionName = node.name?.getText() || 'anonymous';
            
            // Handle class methods
            if (currentClass && ts.isMethodDeclaration(node)) {
                functionName = `${currentClass}.${functionName}`;
            }
            
            currentFunction = functionName;
            ts.forEachChild(node, visit);
            currentFunction = prevFunction;
            return;
        }

        // Analyze function calls
        if (ts.isCallExpression(node)) {
            const calledFunction = getFullFunctionName(node.expression);
            if (calledFunction && currentFunction) {
                graph.addFunctionCall(currentFile, currentFunction, calledFunction);
            }
        }

        // Handle hook calls and other React patterns
        if (ts.isVariableDeclaration(node) && node.initializer) {
            if (ts.isCallExpression(node.initializer) && ts.isIdentifier(node.initializer.expression)) {
                const hookName = node.initializer.expression.getText();
                if (hookName.startsWith('use')) {
                    const callerName = node.name.getText();
                    graph.addFunctionCall(currentFile, callerName, hookName);
                }
            }
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);
}

function createGraph(basePath: string): DependencyGraph {
    const graph = new DependencyGraph();

    // Create program
    const configPath = ts.findConfigFile(
        basePath,
        ts.sys.fileExists,
        "tsconfig.json"
    );

    if (!configPath) {
        throw new Error("Could not find a valid 'tsconfig.json'.");
    }

    const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
    const { options, fileNames } = ts.parseJsonConfigFileContent(
        config,
        ts.sys,
        path.dirname(configPath)
    );

    const program = ts.createProgram(fileNames, options);
    const typeChecker = program.getTypeChecker();

    // Analyze each source file
    program.getSourceFiles().forEach(sourceFile => {
        if (!sourceFile.isDeclarationFile) {
            console.log(`Analyzing ${sourceFile.fileName}...`);
            analyzeSourceFile(sourceFile, graph, typeChecker);
        }
    });

    return graph;
}

const args = process.argv.slice(2);
const basePath = args[0] || process.cwd();
const outputPath = args[1] || 'dependency-graph.dot';

console.log('Generating dependency graph...');
const graph = createGraph(basePath);
const depGraphs = graph.toDOTByFeature();
const callGraphs = graph.toCallGraphByFeature();

for (const [feature, dot] of depGraphs) {
    fs.writeFileSync(`dependency-graph-${feature}.dot`, dot);
    console.log(`Dependency graph for ${feature} written to dependency-graph-${feature}.dot`);
}

for (const [feature, dot] of callGraphs) {
    fs.writeFileSync(`call-graph-${feature}.dot`, dot);
    console.log(`Call graph for ${feature} written to call-graph-${feature}.dot`);
}
console.log('To visualize the graphs, install Graphviz and run:');
console.log('dot -Tpng dependency-graph-<feature>.dot -o dependency-graph-<feature>.png');
console.log('dot -Tpng call-graph-<feature>.dot -o call-graph-<feature>.png');
