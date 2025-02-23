import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diagram definitions
const diagrams = {
  'command-class': `
classDiagram
    class Command {
        +render()
        +displayName: string
        -className: string
    }
    class CommandDialog {
        +render()
        +children: ReactNode
        -DialogProps
    }
    class CommandInput {
        +render()
        +placeholder: string
        -className: string
    }
    class CommandList {
        +render()
        +children: ReactNode
        -className: string
    }
    class CommandEmpty {
        +render()
        +children: ReactNode
    }
    class CommandGroup {
        +render()
        +heading: string
        +children: ReactNode
    }
    class CommandItem {
        +render()
        +children: ReactNode
        -className: string
    }
    class CommandShortcut {
        +render()
        +children: ReactNode
        -className: string
    }
    Command --> CommandDialog
    Command --> CommandInput
    Command --> CommandList
    CommandList --> CommandEmpty
    CommandList --> CommandGroup
    CommandGroup --> CommandItem
    CommandItem --> CommandShortcut
  `,
  'command-flow': `
flowchart TB
    A[User Input] --> B[CommandInput]
    B --> C[CommandList]
    C --> D[Filter Results]
    D --> E{Results Found?}
    E -->|Yes| F[Show CommandItems]
    E -->|No| G[Show CommandEmpty]
    F --> H[User Selection]
    H --> I[Execute Command]
  `,
  'button-class': `
classDiagram
    class Button {
        +variant: string
        +size: string
        +asChild: boolean
        +className: string
        +disabled: boolean
        +render()
    }
    class ButtonVariants {
        +default
        +destructive
        +outline
        +secondary
        +ghost
        +link
    }
    class ButtonSizes {
        +default
        +sm
        +lg
        +icon
    }
    Button --> ButtonVariants
    Button --> ButtonSizes
  `,
  'tabs-class': `
classDiagram
    class Tabs {
        +defaultValue: string
        +value: string
        +onValueChange: function
        +render()
    }
    class TabsList {
        +className: string
        +render()
    }
    class TabsTrigger {
        +value: string
        +disabled: boolean
        +render()
    }
    class TabsContent {
        +value: string
        +render()
    }
    Tabs --> TabsList
    Tabs --> TabsTrigger
    Tabs --> TabsContent
  `,
  'hovercard-flow': `
flowchart TB
    A[HoverCard] --> B[HoverCardTrigger]
    A --> C[HoverCardContent]
    B --> D[User Hovers]
    D --> E{Show Content}
    E --> F[Render HoverCardContent]
    E --> G[Animation]
  `,
  'collapsible-class': `
classDiagram
    class Collapsible {
        +open: boolean
        +defaultOpen: boolean
        +onOpenChange: function
        +render()
    }
    class CollapsibleTrigger {
        +asChild: boolean
        +render()
    }
    class CollapsibleContent {
        +forceMount: boolean
        +render()
    }
    Collapsible --> CollapsibleTrigger
    Collapsible --> CollapsibleContent
  `,
  'accordion-flow': `
flowchart TB
    A[Accordion] --> B[AccordionItem]
    B --> C[AccordionTrigger]
    B --> D[AccordionContent]
    C --> E{Toggle}
    E -->|Open| F[Expand Content]
    E -->|Close| G[Collapse Content]
  `,
  'accordion-class': `
classDiagram
    class Accordion {
        +type: single|multiple
        +defaultValue: string
        +value: string
        +onValueChange: function
    }
    class AccordionItem {
        +value: string
        +disabled: boolean
    }
    class AccordionTrigger {
        +children: ReactNode
    }
    class AccordionContent {
        +children: ReactNode
        +forceMount: boolean
    }
    Accordion --> AccordionItem
    AccordionItem --> AccordionTrigger
    AccordionItem --> AccordionContent
  `,
  'card-class': `
classDiagram
    class Card {
        +className: string
        +render()
    }
    class CardHeader {
        +className: string
        +render()
    }
    class CardTitle {
        +className: string
        +render()
    }
    class CardDescription {
        +className: string
        +render()
    }
    class CardContent {
        +className: string
        +render()
    }
    class CardFooter {
        +className: string
        +render()
    }
    Card --> CardHeader
    Card --> CardContent
    Card --> CardFooter
    CardHeader --> CardTitle
    CardHeader --> CardDescription
  `,
  'component-interaction': `
flowchart TB
    A[User Interface] --> B[Primary Components]
    B --> C[Command]
    B --> D[Button]
    B --> E[Tabs]
    B --> F[Card]
    B --> G[Accordion]
    
    H[Interactive Elements] --> I[HoverCard]
    H --> J[Collapsible]
    
    K[Component States] --> L[Open/Closed]
    K --> M[Hover/Focus]
    K --> N[Active/Inactive]
    K --> O[Disabled]
  `
};

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../docs/diagrams');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate SVGs for each diagram
async function generateDiagrams() {
  for (const [name, definition] of Object.entries(diagrams)) {
    try {
      const tempFile = path.join(outputDir, `${name}.mmd`);
      const outputFile = path.join(outputDir, `${name}.svg`);
      
      // Write the diagram definition to a temporary file
      fs.writeFileSync(tempFile, definition);
      
      // Use mmdc (Mermaid CLI) to generate the SVG
      await execAsync(`npx mmdc -i ${tempFile} -o ${outputFile}`);
      
      // Clean up the temporary file
      fs.unlinkSync(tempFile);
      
      console.log(`Generated ${outputFile}`);
    } catch (error) {
      console.error(`Error generating diagram ${name}:`, error);
    }
  }
}

generateDiagrams();
