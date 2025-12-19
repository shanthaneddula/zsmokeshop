'use client';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

export default function RichTextRenderer({ content, className = '' }: RichTextRendererProps) {
  if (!content) return null;

  // Process the content to handle formatting
  const processContent = (text: string) => {
    // Split by double line breaks to create paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    
    return paragraphs.map((paragraph, paragraphIndex) => {
      // Check if this paragraph contains bullet points
      const lines = paragraph.split('\n').filter(line => line.trim());
      
      // If all lines start with bullet characters, render as a list
      const isBulletList = lines.length > 1 && lines.every(line => 
        /^[\s]*[•\-\*]\s/.test(line.trim())
      );
      
      if (isBulletList) {
        return (
          <ul key={paragraphIndex} className="list-disc list-inside space-y-1 ml-4">
            {lines.map((line, lineIndex) => {
              // Remove bullet character and trim
              const cleanLine = line.replace(/^[\s]*[•\-\*]\s/, '').trim();
              return (
                <li key={lineIndex} className="text-gray-700 dark:text-gray-300">
                  {cleanLine}
                </li>
              );
            })}
          </ul>
        );
      }
      
      // If it's a single line or doesn't have bullets, render as paragraph
      return (
        <div key={paragraphIndex} className="space-y-2">
          {lines.map((line, lineIndex) => (
            <p key={lineIndex} className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {line.trim()}
            </p>
          ))}
        </div>
      );
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {processContent(content)}
    </div>
  );
}

// Example usage and formatting guide for admins:
/*
FORMATTING GUIDE FOR ADMINS:

1. PARAGRAPHS: Separate paragraphs with double line breaks

This is paragraph one.

This is paragraph two.

2. BULLET POINTS: Start lines with •, -, or * followed by a space

• First bullet point
• Second bullet point  
• Third bullet point

3. MIXED CONTENT:

This is an introduction paragraph.

• Feature one
• Feature two
• Feature three

This is a conclusion paragraph.

4. SINGLE LINE BREAKS: Use for related content

Line one
Line two (related to line one)

Line three (new thought)
*/
