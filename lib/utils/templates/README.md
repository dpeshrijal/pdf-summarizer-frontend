# Resume PDF Templates

This directory contains modular resume PDF templates for the Resumi application.

## File Structure

```
templates/
├── shared.ts           # Shared utilities, constants, and optimization logic
├── classicTemplate.ts  # Classic resume template (clean, minimalist)
├── fancyTemplate.ts    # Fancy resume template (borders, decorative elements)
└── README.md          # This file
```

## Architecture

### shared.ts
Contains reusable utilities and constants:
- **PAGE**: Page dimensions (210x297mm A4)
- **COLORS**: Standard color palette (black & gray)
- **MARGIN_PRESETS**: Predefined margin sizes
- **cleanUrl()**: URL formatting utility
- **estimateContentHeight()**: Content height estimation
- **removeOneBullet()**: Balanced bullet point removal
- **optimizeResumeToFit()**: Progressive optimization strategy
- **selectOptimalMargins()**: Margin selection logic
- **fitsWithMargin()**: Fit validation

### classicTemplate.ts
Clean, minimalist design:
- Centered name with bullet-separated contact info
- Single underline on section headers
- Circular bullet points
- Traditional spacing and hierarchy

### fancyTemplate.ts
Stylish, formal design:
- Decorative page border
- Header in a light gray box
- Double underlines on section headers
- Square bullet points
- Pipe separators for contact info
- Tighter spacing for compact look

## Adding New Templates

1. Create a new file: `[templateName]Template.ts`
2. Import from `shared.ts`:
   ```typescript
   import { PAGE, COLORS, cleanUrl, optimizeResumeToFit } from "./shared";
   ```
3. Define template-specific constants:
   ```typescript
   const FONT_SIZES = { ... };
   const SPACING = { ... };
   ```
4. Export the generator function:
   ```typescript
   export const generate[TemplateName]ResumePDF = async (resume, filename) => {
     // Implementation
   };
   ```
5. Update `../templatePdfGenerator.ts` to route to your template

## Optimization Strategy

All templates use the shared optimization logic:
1. **Optimal margins**: Starts with comfortable margins
2. **5% font reduction**: First optimization attempt
3. **Bullet removal + 5% reduction**: Balanced round-robin bullet removal
4. **10% font reduction**: More aggressive sizing
5. **Continue bullet removal**: Final attempt to fit content

The algorithm ensures resumes fit on a single page while maintaining readability.

## Best Practices

- Keep templates in black & white for professional appearance
- Use semantic section names appropriate to the template style
- Maintain consistent spacing ratios within each template
- Test with various resume lengths to ensure optimization works
- Document any unique features in template file comments
