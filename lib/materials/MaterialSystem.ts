class MaterialSystem {
    private presetManager: MaterialPresetManager;
    private pbrManager: PBRManager;
    
    constructor() {
        this.presetManager = new MaterialPresetManager();
        this.pbrManager = new PBRManager();
    }

    // Combine all material-related functionality here
    applyMaterial(params: MaterialParams) {
        // Single entry point for material application
    }

    loadPreset(presetName: string) {
        // Handle all preset loading here
    }
}
```

2. **Create a UI Component HOC**:
<augment_code_snippet path="components/ui/withBaseStyles.tsx" mode="EDIT">
```typescript
function withBaseStyles<T extends object>(
    Component: React.ComponentType<T>,
    baseClassName: string
) {
    return function StyledComponent(props: T) {
        const className = cn(baseClassName, props.className);
        return <Component {...props} className={className} />;
    };
}
```

3. **Story Template System**:
<augment_code_snippet path="stories/templates/ComponentStory.tsx" mode="EDIT">
```typescript
function createComponentStory<T extends React.ComponentType>(
    Component: T,
    variants: Record<string, Props>
) {
    const Template: Story<T> = (args) => <Component {...args} />;
    
    return Object.entries(variants).reduce((acc, [name, props]) => {
        acc[name] = Template.bind({});
        acc[name].args = props;
        return acc;
    }, {});
}
```

4. **Feature Detection Refactor**:
<augment_code_snippet path="tools/dependencyGraph.cts" mode="EDIT">
```typescript
class FeatureDetector {
    private static PATTERNS = {
        floorplanner: /floorplanner|room|wall|cabinet|geometry/i,
        materials: /material|shader|texture|pbr|three/i,
        ui: /ui\/|dialog|button|input|select/i,
        core: /lib\/(?!material)|utils|types|config/i,
        stories: /stories|test/i
    };

    static detectFeature(filePath: string): string {
        for (const [feature, pattern] of Object.entries(this.PATTERNS)) {
            if (pattern.test(filePath)) return feature;
        }
        return 'core';
    }
}
```

These changes would:
- Reduce code duplication
- Make the codebase more maintainable
- Create clearer responsibility boundaries
- Make it easier to modify functionality in one place
- Improve testing capabilities

Would you like me to elaborate on any of these specific areas?