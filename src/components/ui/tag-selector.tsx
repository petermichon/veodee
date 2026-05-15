import { memo } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTag } from '@/contexts/tag-context';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const TagSelector = memo(function TagSelector({
  selectedTags,
  onTagsChange,
  placeholder = 'Select tags...',
  className = '',
}: TagSelectorProps) {
  const { tags } = useTag();

  const handleAddTag = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const handleRemoveTag = (tagName: string) => {
    onTagsChange(selectedTags.filter((tag) => tag !== tagName));
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tagName) => {
            const tag = tags.find((t) => t.name === tagName);
            return (
              <div
                key={tagName}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-transparent"
                style={{
                  backgroundColor: tag?.color ? `${tag.color}20` : '#e2e8f0',
                  color: tag?.color || '#475569',
                }}
              >
                {tagName}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveTag(tagName)}
                  className="h-3 w-3 p-0 hover:bg-transparent"
                >
                  <X className="h-2 w-2" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Available Tags */}
      <div className="flex flex-wrap gap-2">
        {tags
          .filter((tag) => !selectedTags.includes(tag.name))
          .map((tag) => (
            <button
              key={tag.name}
              onClick={() => handleAddTag(tag.name)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-border hover:opacity-75 transition-all"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
              }}
            >
              {tag.name}
            </button>
          ))}
      </div>

      {selectedTags.length === 0 && tags.length === 0 && (
        <div className="text-sm text-muted-foreground">{placeholder}</div>
      )}
    </div>
  );
});
