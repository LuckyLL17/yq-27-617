import { Children } from 'react';

interface MarkdownProps {
  text: string;
  size?: 'sm' | 'base';
}

export default function Markdown({ text, size = 'base' }: MarkdownProps) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inList = false;

  const textSizeClass = size === 'sm' ? 'text-sm' : 'text-base';
  const heading3Class = size === 'sm' ? 'text-base' : 'text-lg';

  lines.forEach((line, index) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <h3 key={index} className={`font-semibold text-white mt-4 mb-2 ${heading3Class}`}>
          {line.replace(/\*\*/g, '')}
        </h3>
      );
    } else if (line.startsWith('- ')) {
      if (!inList) {
        inList = true;
        elements.push(
          <ul key={`ul-${index}`} className={`list-disc list-inside space-y-1 text-dark-300 ${textSizeClass}`}>
            <li>{line.slice(2)}</li>
          </ul>
        );
      } else {
        const lastUl = elements[elements.length - 1] as React.ReactElement;
        if (lastUl && lastUl.type === 'ul') {
          const childrenArray = Children.toArray(lastUl.props.children);
          elements[elements.length - 1] = (
            <ul key={`ul-${index}`} className={`list-disc list-inside space-y-1 text-dark-300 ${textSizeClass}`}>
              {childrenArray}
              <li>{line.slice(2)}</li>
            </ul>
          );
        }
      }
    } else if (line.startsWith('  - ')) {
      elements.push(
        <div key={index} className={`ml-6 list-disc list-inside text-dark-400 ${textSizeClass}`}>
          {line.slice(4)}
        </div>
      );
    } else if (line.startsWith('**')) {
      const parts = line.split('**');
      elements.push(
        <p key={index} className={`text-dark-300 leading-relaxed ${textSizeClass}`}>
          <strong className="text-white font-medium">{parts[1]}</strong>
          {parts.slice(2).join('**')}
        </p>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={index} className="h-2" />);
      inList = false;
    } else if (/^\d+\./.test(line)) {
      elements.push(
        <div key={index} className={`flex gap-2 text-dark-300 ${textSizeClass}`}>
          <span className="text-primary-400 font-medium flex-shrink-0">
            {line.match(/^\d+/)?.[0]}.
          </span>
          <span>{line.replace(/^\d+\.\s*/, '')}</span>
        </div>
      );
    } else {
      elements.push(
        <p key={index} className={`text-dark-300 leading-relaxed ${textSizeClass}`}>
          {line}
        </p>
      );
    }
  });

  return <div className="prose-custom">{elements}</div>;
}
